const express = require("express");
const { driver } = require("../config/database");

const router = express.Router();

router.get("/", async (req, res) => {
  const session = driver.session();

  try {
    const result = await session.run(`
      MATCH (i:Incident)
      OPTIONAL MATCH (i)-[:AFFECTS]->(s:Service)

      RETURN
        count(DISTINCT i) AS totalIncidents,
        count(DISTINCT CASE WHEN i.status = "Open" THEN i END) AS openIncidents,
        count(DISTINCT CASE WHEN i.status = "Resolved" THEN i END) AS resolvedIncidents,
        count(DISTINCT CASE WHEN i.severity = "Critical" THEN i END) AS criticalIncidents,
        count(DISTINCT s) AS affectedServices
    `);

    const record = result.records[0];

    const data = {
      totalIncidents: record.get("totalIncidents").toNumber(),
      openIncidents: record.get("openIncidents").toNumber(),
      resolvedIncidents: record.get("resolvedIncidents").toNumber(),
      criticalIncidents: record.get("criticalIncidents").toNumber(),
      affectedServices: record.get("affectedServices").toNumber(),

      // We don't have incident resolution timestamps yet.
      mttr: "N/A",
    };

    res.json({
      success: true,
      data,
    });

  } catch (error) {
    console.error("Failed to fetch dashboard statistics:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch dashboard statistics",
    });

  } finally {
    await session.close();
  }
});

module.exports = router;