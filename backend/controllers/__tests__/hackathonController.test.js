// controllers/__tests__/hackathonController.test.js

import dotenv from "dotenv";
dotenv.config();
process.env.NODE_ENV = "test";
process.env.JWT_SECRET = process.env.JWT_SECRET || "testsecret";
const JWT_SECRET = process.env.JWT_SECRET;

import { describe, it, beforeAll, afterAll, beforeEach, expect } from "vitest";
import request from "supertest";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";

import { createRequire } from "module";
const require = createRequire(import.meta.url);
const app = require("../../app");

import { connectTestDb, clearDb, closeTestDb } from "../../setup/testDb.js";
import User from "../../models/User.js";
import Organization from "../../models/Organization.js";
import Hackathon from "../../models/Hackathon.js";

describe("HackathonController", () => {
  let org, adminUser, normalUser, adminToken, userToken;

  beforeAll(async () => {
    await connectTestDb();

    org = await Organization.create({
      name: "Test Org",
      domain: "testorg.com",
    });

    adminUser = await User.create({
      name: "Admin User",
      email: "admin@example.com",
      role: "admin",
      organization: org._id,
      googleId: "test-google-id-admin",
    });

    normalUser = await User.create({
      name: "Member User",
      email: "member@example.com",
      role: "participant",
      organization: org._id,
      googleId: "test-google-id-member",
    });

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
    await clearDb([Hackathon]);
  });

  afterAll(async () => {
    await closeTestDb();
  });

  it("should create a hackathon (admin)", async () => {
    const res = await request(app)
      .post("/api/hackathons")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        title: "Hackathon 1",
        description: "Description 1",
        startDate: "2025-11-01",
        endDate: "2025-11-03",
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.hackathon.title).toBe("Hackathon 1");

    const dbEntry = await Hackathon.findOne({ title: "Hackathon 1" });
    expect(dbEntry).toBeTruthy();
  });

  it("should forbid hackathon creation without organizer/admin role", async () => {
    const res = await request(app)
      .post("/api/hackathons")
      .set("Authorization", `Bearer ${userToken}`)
      .send({
        title: "Hackathon Unauthorized",
        description: "Should fail",
      });

    expect(res.statusCode).toBe(403);
  });

  it("should fetch all hackathons visible to participant", async () => {
    await Hackathon.create([
      { 
        title: "Active Hackathon", 
        description: "Active description", 
        isActive: true, 
        organization: org._id, 
        createdBy: adminUser._id 
      },
      { 
        title: "Inactive Hackathon", 
        description: "Inactive description", 
        isActive: false, 
        organization: org._id, 
        createdBy: adminUser._id 
      },
    ]);

    const res = await request(app)
      .get("/api/hackathons")
      .set("Authorization", `Bearer ${userToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.hackathons).toHaveLength(1);
    expect(res.body.hackathons[0].title).toBe("Active Hackathon");
  });

  it("should fetch all hackathons visible to admin", async () => {
    await Hackathon.create([
      { 
        title: "Active Hackathon", 
        description: "Active description", 
        isActive: true, 
        organization: org._id, 
        createdBy: adminUser._id 
      },
      { 
        title: "Inactive Hackathon", 
        description: "Inactive description", 
        isActive: false, 
        organization: org._id, 
        createdBy: adminUser._id 
      },
    ]);

    const res = await request(app)
      .get("/api/hackathons")
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.hackathons).toHaveLength(2);
  });

  it("should fetch single hackathon by ID if visible", async () => {
    const hack = await Hackathon.create({
      title: "Single Hack",
      description: "Single hack description",
      isActive: true,
      organization: org._id,
      createdBy: adminUser._id,
    });

    const res = await request(app)
      .get(`/api/hackathons/${hack._id}`)
      .set("Authorization", `Bearer ${userToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.hackathon.title).toBe("Single Hack");
  });

  it("should forbid fetching inactive hackathon for participant", async () => {
    const hack = await Hackathon.create({
      title: "Inactive Hack",
      description: "Inactive hack description",
      isActive: false,
      organization: org._id,
      createdBy: adminUser._id,
    });

    const res = await request(app)
      .get(`/api/hackathons/${hack._id}`)
      .set("Authorization", `Bearer ${userToken}`);

    expect(res.statusCode).toBe(403);
  });

  it("should update hackathon (admin)", async () => {
    const hack = await Hackathon.create({
      title: "Old Title",
      description: "Old description",
      isActive: true,
      organization: org._id,
      createdBy: adminUser._id,
    });

    const res = await request(app)
      .put(`/api/hackathons/${hack._id}`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ title: "New Title" });

    expect(res.statusCode).toBe(200);
    expect(res.body.hackathon.title).toBe("New Title");
  });

  it("should forbid update hackathon without organizer/admin role", async () => {
    const hack = await Hackathon.create({
      title: "Old Title",
      description: "Old description",
      isActive: true,
      organization: org._id,
      createdBy: adminUser._id,
    });

    const res = await request(app)
      .put(`/api/hackathons/${hack._id}`)
      .set("Authorization", `Bearer ${userToken}`)
      .send({ title: "Try Update" });

    expect(res.statusCode).toBe(403);
  });

  it("should delete hackathon (admin)", async () => {
    const hack = await Hackathon.create({
      title: "To Delete",
      description: "To be deleted",
      isActive: true,
      organization: org._id,
      createdBy: adminUser._id,
    });

    const res = await request(app)
      .delete(`/api/hackathons/${hack._id}`)
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(200);
    expect(await Hackathon.findById(hack._id)).toBeNull();
  });

  it("should return 404 if hackathon not found on delete", async () => {
    const fakeId = new mongoose.Types.ObjectId();

    const res = await request(app)
      .delete(`/api/hackathons/${fakeId}`)
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(404);
  });
});
