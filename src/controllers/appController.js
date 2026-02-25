const db = require("../config/db");

exports.getAllApps = async (req, res) => {
  try {
    const result = await db.query("SELECT * FROM apps ORDER BY id DESC");
    res.json(result.rows);
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
