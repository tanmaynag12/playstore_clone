const db = require("../config/db");

exports.getAllApps = async (req, res) => {
  try {
    const result = await db.query(`
      SELECT 
        a.*,
        ROUND(AVG(r.rating)::NUMERIC, 2) AS average_rating,
        COUNT(r.id)::INTEGER             AS total_reviews
      FROM apps a
      LEFT JOIN ratings r ON r.app_id = a.id
      GROUP BY a.id
      ORDER BY a.id DESC
    `);

    const apps = result.rows.map((app) => ({
      ...app,
      average_rating: app.average_rating
        ? parseFloat(app.average_rating)
        : null,
      total_reviews: app.total_reviews || 0,
    }));

    res.json(apps);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

exports.getAppById = async (req, res) => {
  try {
    const { id } = req.params;

    const appResult = await db.query(
      `
      SELECT 
        a.*,
        ROUND(AVG(r.rating)::NUMERIC, 2) AS average_rating,
        COUNT(r.id)::INTEGER             AS total_reviews
      FROM apps a
      LEFT JOIN ratings r ON r.app_id = a.id
      WHERE a.id = $1
      GROUP BY a.id
      `,
      [id],
    );

    if (appResult.rows.length === 0) {
      return res.status(404).json({ error: "App not found" });
    }

    const imagesResult = await db.query(
      "SELECT image_url FROM app_images WHERE app_id = $1",
      [id],
    );

    res.json({
      ...appResult.rows[0],
      average_rating: appResult.rows[0].average_rating
        ? parseFloat(appResult.rows[0].average_rating)
        : null,
      total_reviews: appResult.rows[0].total_reviews || 0,
      screenshots: imagesResult.rows.map((r) => r.image_url),
    });
  } catch (err) {
    console.error("GET APP ERROR:", err);
    res.status(500).json({ error: "Server error" });
  }
};
const path = require("path");

exports.downloadApp = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await db.query("SELECT apk_url FROM apps WHERE id = $1", [
      id,
    ]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "App not found" });
    }

    const apkUrl = result.rows[0].apk_url;

    if (!apkUrl) {
      return res.status(404).json({ error: "APK not available" });
    }

    await db.query(
      "UPDATE apps SET download_count = download_count + 1 WHERE id = $1",
      [id],
    );

    const filePath = path.join(__dirname, "../../", apkUrl);

    res.download(filePath);
  } catch (err) {
    console.error("DOWNLOAD ERROR:", err);
    res.status(500).json({ error: "Download failed" });
  }
};
