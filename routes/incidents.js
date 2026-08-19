const express = require("express");
const { driver } = require("../config/database");

const router = express.Router();

router.get("/", async (req, res) => {
  const session = driver.session();

  try {
    const result = await session.run(`
      MATCH (i:Incident)-[:AFFECTS]->(s:Service)
      MATCH (i)-[:ASSIGNED_TO]->(t:Team)
      RETURN
        i.id AS id,
        i.title AS title,
        i.severity AS severity,
        i.status AS status,
        s.name AS service,
        t.name AS team
      ORDER BY i.id DESC
    `);

    const incidents = result.records.map((record) => ({
      id: record.get("id"),
      title: record.get("title"),
      severity: record.get("severity"),
      status: record.get("status"),
      service: record.get("service"),
      team: record.get("team"),
    }));

    res.json({
      success: true,
      count: incidents.length,
      data: incidents,
    });
  } catch (error) {
    console.error("Failed to fetch incidents:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch incidents",
    });
  } finally {
    await session.close();
  }
});

module.exports = router;