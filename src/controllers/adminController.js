const db = require("../config/db");

exports.createApp = async (req, res) => {
  try {
    const {
      name,
      description,
      version,
      size,
      developer,
      rated_for,
      package_name,
      version_code,
    } = req.body;

    const icon = req.files?.icon?.[0];
    const screenshots = req.files?.screenshots || [];
    const apk = req.files?.apk?.[0];

    if (!name || !icon || !package_name || !version_code) {
      return res.status(400).json({
        error: "Name, icon, package_name and version_code are required",
      });
    }

    const iconUrl = `/uploads/icons/${icon.filename}`;
    let apkUrl = null;

    if (apk) {
      apkUrl = `/uploads/apks/${apk.filename}`;
    }

    const appResult = await db.query(
      `INSERT INTO apps 
       (name, description, icon_url, version, size, developer, rated_for, apk_url, package_name, version_code) 
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) 
       RETURNING *`,
      [
        name,
        description,
        iconUrl,
        version,
        size,
        developer,
        rated_for,
        apkUrl,
        package_name,
        version_code,
      ],
    );

    const appId = appResult.rows[0].id;

    for (let i = 0; i < screenshots.length; i++) {
      const img = screenshots[i];
      const imageUrl = `/uploads/screenshots/${img.filename}`;

      await db.query(
        "INSERT INTO app_images (app_id, image_url, display_order) VALUES ($1,$2,$3)",
        [appId, imageUrl, i],
      );
    }

    res.status(201).json(appResult.rows[0]);
  } catch (err) {
    if (err.code === "23505") {
      return res.status(400).json({
        error: "Package name already exists",
      });
    }

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

exports.updateApp = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      name,
      description,
      version,
      size,
      developer,
      rated_for,
      package_name,
      version_code,
    } = req.body;

    const icon = req.files?.icon?.[0];
    const screenshots = req.files?.screenshots || [];
    const apk = req.files?.apk?.[0];

    const existing = await db.query("SELECT * FROM apps WHERE id = $1", [id]);

    if (existing.rows.length === 0) {
      return res.status(404).json({ error: "App not found" });
    }

    let iconUrl = existing.rows[0].icon_url;
    if (icon) {
      iconUrl = `/uploads/icons/${icon.filename}`;
    }

    let apkUrl = existing.rows[0].apk_url;
    if (apk) {
      apkUrl = `/uploads/apks/${apk.filename}`;
    }

    const updated = await db.query(
      `UPDATE apps
       SET name = COALESCE($1, name),
           description = COALESCE($2, description),
           icon_url = $3,
           version = COALESCE($4, version),
           size = COALESCE($5, size),
           developer = COALESCE($6, developer),
           rated_for = COALESCE($7, rated_for),
           apk_url = $8,
           package_name = COALESCE($9, package_name),
           version_code = COALESCE($10, version_code)
       WHERE id = $11
       RETURNING *`,
      [
        name,
        description,
        iconUrl,
        version,
        size,
        developer,
        rated_for,
        apkUrl,
        package_name,
        version_code,
        id,
      ],
    );

    if (screenshots.length > 0) {
      const existingImages = await db.query(
        "SELECT COUNT(*) FROM app_images WHERE app_id = $1",
        [id],
      );

      const currentCount = parseInt(existingImages.rows[0].count);

      for (let i = 0; i < screenshots.length; i++) {
        const img = screenshots[i];
        const imageUrl = `/uploads/screenshots/${img.filename}`;

        await db.query(
          "INSERT INTO app_images (app_id, image_url, display_order) VALUES ($1,$2,$3)",
          [id, imageUrl, currentCount + i],
        );
      }
    }

    res.json(updated.rows[0]);
  } catch (err) {
    console.error("UPDATE APP ERROR:", err);
    res.status(500).json({ error: err.message });
  }
};
