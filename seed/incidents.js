const express = require('express');
require('dotenv').config();

const { driver } = require("../config/database");

const incidents = [
  {
    id: "INC-142",
    title: "Database connection failure",
    severity: "Critical",
    status: "Open",
    service: "Payment Service",
    team: "Payments Team",
  },
  {
    id: "INC-141",
    title: "High latency in auth service",
    severity: "High",
    status: "Open",
    service: "Auth Service",
    team: "Identity Team",
  },
  {
    id: "INC-140",
    title: "Error rate spike in checkout",
    severity: "High",
    status: "Open",
    service: "Checkout Service",
    team: "Commerce Team",
  },
  {
    id: "INC-139",
    title: "Cache miss rate high",
    severity: "Medium",
    status: "Open",
    service: "User Service",
    team: "Platform Team",
  },
  {
    id: "INC-138",
    title: "Email service slow",
    severity: "Low",
    status: "Resolved",
    service: "Notification Service",
    team: "Messaging Team",
  },
  {
    id: "INC-137",
    title: "Payment timeout",
    severity: "Critical",
    status: "Resolved",
    service: "Payment Service",
    team: "Payments Team",
  },
  {
    id: "INC-136",
    title: "Authentication failures",
    severity: "High",
    status: "Resolved",
    service: "Auth Service",
    team: "Identity Team",
  },
  {
    id: "INC-135",
    title: "Checkout service unavailable",
    severity: "Critical",
    status: "Open",
    service: "Checkout Service",
    team: "Commerce Team",
  },
  {
    id: "INC-134",
    title: "User profile API errors",
    severity: "Medium",
    status: "Resolved",
    service: "User Service",
    team: "Platform Team",
  },
  {
    id: "INC-133",
    title: "Notification delivery delay",
    severity: "Low",
    status: "Resolved",
    service: "Notification Service",
    team: "Messaging Team",
  },
];

const services = [
  {
    name: "Payment Service",
    status: "Critical",
  },
  {
    name: "Auth Service",
    status: "Warning",
  },
  {
    name: "Checkout Service",
    status: "Critical",
  },
  {
    name: "User Service",
    status: "Warning",
  },
  {
    name: "Notification Service",
    status: "Healthy",
  },
  {
    name: "Database",
    status: "Healthy",
  },
];

const teams = [
  "Payments Team",
  "Identity Team",
  "Commerce Team",
  "Platform Team",
  "Messaging Team",
];

async function seedDatabase() {
  const session = driver.session();

  try {
    console.log("Starting database seed...");

    // Create services
    for (const service of services) {
      await session.run(
        `
        MERGE (s:Service {name: $name})
        SET s.status = $status
        `,
        service
      );
    }

    // Create teams
    for (const team of teams) {
      await session.run(
        `
        MERGE (t:Team {name: $name})
        `,
        { name: team }
      );
    }

    // Create incidents and relationships
    for (const incident of incidents) {
      await session.run(
        `
        MERGE (i:Incident {id: $id})
        SET
          i.title = $title,
          i.severity = $severity,
          i.status = $status

        WITH i

        MATCH (s:Service {name: $service})
        MERGE (i)-[:AFFECTS]->(s)

        WITH i

        MATCH (t:Team {name: $team})
        MERGE (i)-[:ASSIGNED_TO]->(t)
        `,
        incident
      );
    }

    // Service dependencies
    const dependencies = [
      ["Payment Service", "Database"],
      ["Checkout Service", "Payment Service"],
      ["Checkout Service", "User Service"],
      ["Auth Service", "Database"],
      ["User Service", "Database"],
      ["Notification Service", "Database"],
    ];

    for (const [service, dependency] of dependencies) {
      await session.run(
        `
        MATCH (s:Service {name: $service})
        MATCH (d:Service {name: $dependency})
        MERGE (s)-[:DEPENDS_ON]->(d)
        `,
        {
          service,
          dependency,
        }
      );
    }

    console.log("Database seed completed successfully.");
  } catch (error) {
    console.error("Database seed failed:", error);
  } finally {
    await session.close();
    await driver.close();
  }
}

seedDatabase();