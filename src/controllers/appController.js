const db = require("../config/db");

exports.getAllApps = async (req, res) => {
  try {
    const { search } = req.query;

    const userId = req.user?.id || null;

    let query = `
  SELECT 
    a.*,
    user_apps.installed_version_code,
    ROUND(AVG(r.rating)::NUMERIC, 2) AS average_rating,
    COUNT(r.id)::INTEGER             AS total_reviews
  FROM apps a
  LEFT JOIN ratings r ON r.app_id = a.id
  LEFT JOIN user_apps 
    ON user_apps.app_id = a.id 
    AND user_apps.user_id = $1
`;

    let values = [userId];

    if (search) {
      query += `
    WHERE a.name ILIKE $2
    OR a.developer ILIKE $2
  `;
      values.push(`%${search}%`);
    }

    query += `
  GROUP BY a.id, user_apps.installed_version_code
  ORDER BY a.id DESC
`;

    const result = await db.query(query, values);

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
    const ratingDist = await db.query(
      `
      SELECT rating, COUNT(*)::INTEGER as count
      FROM ratings
      WHERE app_id = $1
      GROUP BY rating
      `,
      [id],
    );

    res.json({
      ...appResult.rows[0],
      average_rating: appResult.rows[0].average_rating
        ? parseFloat(appResult.rows[0].average_rating)
        : null,
      total_reviews: appResult.rows[0].total_reviews || 0,
      screenshots: imagesResult.rows.map((r) => r.image_url),
      rating_distribution: ratingDist.rows,
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

    const result = await db.query(
      "SELECT apk_url, version_code FROM apps WHERE id = $1",
      [id],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "App not found" });
    }

    const { apk_url, version_code } = result.rows[0];

    if (!apk_url) {
      return res.status(404).json({ error: "APK not available" });
    }

    await db.query(
      "UPDATE apps SET download_count = download_count + 1 WHERE id = $1",
      [id],
    );

    if (req.user) {
      await db.query(
        `INSERT INTO user_apps (user_id, app_id, installed_version_code)
         VALUES ($1,$2,$3)
         ON CONFLICT (user_id, app_id)
         DO UPDATE SET installed_version_code = $3`,
        [req.user.id, id, version_code],
      );
    }

    return res.json({
      download_url: `${process.env.BASE_URL}${apk_url}`,
    });
  } catch (err) {
    console.error("DOWNLOAD ERROR:", err);
    res.status(500).json({ error: "Download failed" });
  }
};
async function getMyApps(req, res) {
  const userId = req.user.id;

  try {
    const { rows } = await db.query(
      `
      SELECT apps.*
      FROM user_apps
      JOIN apps ON apps.id = user_apps.app_id
      WHERE user_apps.user_id = $1
      ORDER BY installed_at DESC
      `,
      [userId],
    );

    res.json(rows);
  } catch (err) {
    console.error("GET MY APPS ERROR:", err);
    res.status(500).json({ error: "Server error" });
  }
}
exports.getUserActivity = async (req, res) => {
  try {
    const result = await db.query(`
      SELECT 
        apps.name AS app_name,
        app_logs.action,
        app_logs.version,
        app_logs.created_at
      FROM app_logs
      JOIN apps ON apps.id = app_logs.app_id
      WHERE app_logs.action IN ('apk_updated', 'uploaded')
      ORDER BY app_logs.created_at DESC
      LIMIT 20
    `);

    res.json(result.rows);
  } catch (err) {
    console.error("USER ACTIVITY ERROR:", err);
    res.status(500).json({ error: "Server error" });
  }
};
exports.getMyApps = getMyApps;
