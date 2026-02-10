const db = require("../config/db");

exports.createApp = async (req, res) => {
  try {
    const { name, description, version, size, developer } = req.body;
    const icon = req.files?.icon?.[0];
    const screenshots = req.files?.screenshots || [];

    if (!name || !icon) {
      return res.status(400).json({ error: "Name and icon are required" });
    }

    const iconUrl = `/uploads/icons/${icon.filename}`;

    const appResult = await db.query(
      "INSERT INTO apps (name, description, icon_url, version, size, developer) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *",
      [name, description, iconUrl, version, size, developer],
    );

    const appId = appResult.rows[0].id;

    for (let i = 0; i < screenshots.length; i++) {
      const img = screenshots[i];
      const imageUrl = `/uploads/screenshots/${img.filename}`;
      await db.query(
        "INSERT INTO app_images (app_id, image_url, display_order) VALUES ($1, $2, $3)",
        [appId, imageUrl, i],
      );
    }

    res.status(201).json(appResult.rows[0]);
  } catch (err) {
    console.error("CREATE APP ERROR:", err);
    res.status(500).json({ error: err.message });
  }
};

exports.deleteApp = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await db.query(
      "DELETE FROM apps WHERE id = $1 RETURNING *",
      [id],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "App not found" });
    }

    res.json({ message: "App deleted successfully" });
  } catch (err) {
    console.error("DELETE APP ERROR:", err);
    res.status(500).json({ error: err.message });
  }
};
