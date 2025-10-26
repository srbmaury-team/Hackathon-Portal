// controllers/__tests__/announcementController.test.js

// 1️⃣ Load dotenv and set env variables BEFORE anything else
import dotenv from "dotenv";
dotenv.config();
process.env.NODE_ENV = "test";
process.env.JWT_SECRET = process.env.JWT_SECRET || "testsecret";
const JWT_SECRET = process.env.JWT_SECRET;

// 2️⃣ Imports after env setup
import { describe, it, beforeAll, afterAll, beforeEach, expect } from "vitest";
import request from "supertest";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";

// Import app (CommonJS module)
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const app = require("../../app");

import { connectTestDb, clearDb, closeTestDb } from "../../setup/testDb.js";
import User from "../../models/User.js";
import Organization from "../../models/Organization.js";
import Announcement from "../../models/Announcement.js";

describe("AnnouncementController", () => {
  let org, adminUser, participantUser, adminToken, participantToken;

  beforeAll(async () => {
    await connectTestDb();

    // 🏢 Create test organization
    org = await Organization.create({
      name: "Test Org",
      domain: "testorg.com",
    });

    // 👑 Create admin user
    adminUser = await User.create({
      name: "Admin User",
      email: "admin@testorg.com",
      role: "admin",
      organization: org._id,
      googleId: "google-id-admin",
    });

    // 🙋 Create participant user
    participantUser = await User.create({
      name: "Participant User",
      email: "participant@testorg.com",
      role: "participant",
      organization: org._id,
      googleId: "google-id-participant",
    });

    // 🔑 Generate JWT tokens
    adminToken = jwt.sign(
      {
        id: adminUser._id.toString(),
        role: "admin",
        organization: org._id.toString(),
      },
      JWT_SECRET
    );

    participantToken = jwt.sign(
      {
        id: participantUser._id.toString(),
        role: "participant",
        organization: org._id.toString(),
      },
      JWT_SECRET
    );
  });

  beforeEach(async () => {
    await clearDb([Announcement]);
  });

  afterAll(async () => {
    await closeTestDb();
  });

  // ✅ CREATE ANNOUNCEMENT
  it("should create an announcement (admin only)", async () => {
    const res = await request(app)
      .post("/api/announcements")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        title: "System Maintenance",
        message: "The system will be down tonight.",
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.announcement.title).toBe("System Maintenance");

    const inDb = await Announcement.findOne({ title: "System Maintenance" });
    expect(inDb).toBeTruthy();
  });

  // ❌ CREATE ANNOUNCEMENT - PERMISSION DENIED
  it("should deny creation for participant role", async () => {
    const res = await request(app)
      .post("/api/announcements")
      .set("Authorization", `Bearer ${participantToken}`)
      .send({
        title: "Unauthorized Post",
        message: "Should not be allowed",
      });

    expect(res.statusCode).toBe(403);
  });

  // 📜 GET ANNOUNCEMENTS
  it("should fetch announcements scoped to organization", async () => {
    await Announcement.create({
      title: "Event Reminder",
      message: "Hackathon starts tomorrow!",
      createdBy: adminUser._id,
      organization: org._id,
    });

    const res = await request(app)
      .get("/api/announcements?page=1&limit=5")
      .set("Authorization", `Bearer ${participantToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.announcements).toHaveLength(1);
    expect(res.body.announcements[0].title).toBe("Event Reminder");
  });

  // ✏️ UPDATE ANNOUNCEMENT
  it("should allow creator (admin) to update announcement", async () => {
    const ann = await Announcement.create({
      title: "Old Announcement",
      message: "Before update",
      createdBy: adminUser._id,
      organization: org._id,
    });

    const res = await request(app)
      .put(`/api/announcements/${ann._id}`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ title: "Updated Announcement" });

    expect(res.statusCode).toBe(200);
    expect(res.body.announcement.title).toBe("Updated Announcement");
  });

  // ❌ UPDATE - NOT ALLOWED
  it("should forbid participant from updating announcement", async () => {
    const ann = await Announcement.create({
      title: "Immutable Post",
      message: "You shall not edit!",
      createdBy: adminUser._id,
      organization: org._id,
    });

    const res = await request(app)
      .put(`/api/announcements/${ann._id}`)
      .set("Authorization", `Bearer ${participantToken}`)
      .send({ title: "Hacked Title" });

    expect(res.statusCode).toBe(403);
  });

  // 🗑️ DELETE ANNOUNCEMENT
  it("should allow admin to delete announcement", async () => {
    const ann = await Announcement.create({
      title: "Delete This",
      message: "Testing delete functionality",
      createdBy: adminUser._id,
      organization: org._id,
    });

    const res = await request(app)
      .delete(`/api/announcements/${ann._id}`)
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(200);
    expect(await Announcement.findById(ann._id)).toBeNull();
  });

  // ❌ DELETE - NOT FOUND
  it("should return 404 when deleting a non-existent announcement", async () => {
    const fakeId = new mongoose.Types.ObjectId();

    const res = await request(app)
      .delete(`/api/announcements/${fakeId}`)
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(404);
  });
});
