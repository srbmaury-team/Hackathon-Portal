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
  let org, adminUser, normalUser, adminToken, userToken;

  beforeAll(async () => {
    await connectTestDb();

    // Create organization
    org = await Organization.create({
      name: "Test Org",
      domain: "testorg.com",
    });

    // Create admin user
    adminUser = await User.create({
      name: "Admin User",
      email: "admin@example.com",
      role: "admin",
      organization: org._id,
      googleId: "test-google-id-admin",
    });

    // Create normal participant user
    normalUser = await User.create({
      name: "Member User",
      email: "member@example.com",
      role: "participant",
      organization: org._id,
      googleId: "test-google-id-member",
    });

    // 🔥 FIX: Use "id" not "_id" - auth middleware expects decoded.id
    adminToken = jwt.sign(
      { id: adminUser._id.toString(), role: "admin", organization: org._id.toString() },
      JWT_SECRET
    );
    userToken = jwt.sign(
      { id: normalUser._id.toString(), role: "participant", organization: org._id.toString() },
      JWT_SECRET
    );
  });

  beforeEach(async () => {
    // Clear only announcements before each test
    await clearDb([Announcement]);
  });

  afterAll(async () => {
    await closeTestDb();
  });

  it("should create an announcement (admin)", async () => {
    const res = await request(app)
      .post("/api/announcements")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        title: "Server Update",
        message: "Maintenance scheduled for tomorrow.",
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.announcement.title).toBe("Server Update");

    const dbEntry = await Announcement.findOne({ title: "Server Update" });
    expect(dbEntry).toBeTruthy();
  });

  it("should fail to create an announcement without role permission", async () => {
    const res = await request(app)
      .post("/api/announcements")
      .set("Authorization", `Bearer ${userToken}`)
      .send({
        title: "Unauthorized attempt",
        message: "This should fail",
      });

    expect(res.statusCode).toBe(403);
  });

  it("should get announcements scoped to organization", async () => {
    await Announcement.create({
      title: "Test A",
      message: "Message A",
      createdBy: adminUser._id,
      organization: org._id,
    });

    const res = await request(app)
      .get("/api/announcements?page=1&limit=5")
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.announcements).toHaveLength(1);
    expect(res.body.announcements[0].title).toBe("Test A");
  });

  it("should update announcement by creator", async () => {
    const ann = await Announcement.create({
      title: "Old Title",
      message: "Old message",
      createdBy: adminUser._id,
      organization: org._id,
    });

    const res = await request(app)
      .put(`/api/announcements/${ann._id}`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ title: "New Title" });

    expect(res.statusCode).toBe(200);
    expect(res.body.announcement.title).toBe("New Title");
  });

  it("should forbid update if not creator or admin", async () => {
    const ann = await Announcement.create({
      title: "Uneditable Title",
      message: "No edit rights",
      createdBy: adminUser._id,
      organization: org._id,
    });

    const res = await request(app)
      .put(`/api/announcements/${ann._id}`)
      .set("Authorization", `Bearer ${userToken}`)
      .send({ title: "Try Change" });

    expect(res.statusCode).toBe(403);
  });

  it("should delete announcement by admin", async () => {
    const ann = await Announcement.create({
      title: "Delete Me",
      message: "Admin will delete this",
      createdBy: adminUser._id,
      organization: org._id,
    });

    const res = await request(app)
      .delete(`/api/announcements/${ann._id}`)
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(200);
    expect(await Announcement.findById(ann._id)).toBeNull();
  });

  it("should return 404 if announcement not found on delete", async () => {
    const fakeId = new mongoose.Types.ObjectId();

    const res = await request(app)
      .delete(`/api/announcements/${fakeId}`)
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(404);
  });
});

