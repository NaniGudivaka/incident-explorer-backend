const express = require("express");
const { driver } = require("../config/database.js");

const router = express.Router();

router.get("/", async (req, res) => {
  const session = driver.session();

  try {
    const result = await session.run(`
      MATCH (s:Service)
      RETURN s.status AS status, count(s) AS count
    `);

    const data = {
      healthy: 0,
      warning: 0,
      critical: 0,
      unknown: 0,
      totalServices: 0,
    };

    result.records.forEach((record) => {
      const status = record.get("status");
      const count = record.get("count").toNumber();

      if (status === "Healthy") {
        data.healthy = count;
      } else if (status === "Warning") {
        data.warning = count;
      } else if (status === "Critical") {
        data.critical = count;
      } else {
        data.unknown += count;
      }

      data.totalServices += count;
    });

    res.json({
      success: true,
      data,
    });

  } catch (error) {

    console.error("System health error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch system health",
    });

  } finally {
    await session.close();
  }
});

module.exports = router;