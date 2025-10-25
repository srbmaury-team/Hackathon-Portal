// controllers/__tests__/ideaController.test.js

import { describe, it, beforeAll, afterAll, beforeEach, expect } from "vitest";
import request from "supertest";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();
process.env.NODE_ENV = "test";
process.env.JWT_SECRET = process.env.JWT_SECRET || "testsecret";
const JWT_SECRET = process.env.JWT_SECRET;

// Import app
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const app = require("../../app");

import { connectTestDb, clearDb, closeTestDb } from "../../setup/testDb.js";
import User from "../../models/User.js";
import Organization from "../../models/Organization.js";
import Idea from "../../models/Idea.js";

describe("IdeaController", () => {
  let org, user, userToken;

  beforeAll(async () => {
    await connectTestDb();

    // Create org
    org = await Organization.create({
      name: "TestOrg",
      domain: "test.com",
    });

    // Create user
    user = await User.create({
      name: "Test User",
      email: "user@test.com",
      role: "participant",
      organization: org._id,
      googleId: "test-google-id",
    });

    userToken = jwt.sign({ id: user._id.toString() }, JWT_SECRET);
  });

  beforeEach(async () => {
    await clearDb([Idea]);
  });

  afterAll(async () => {
    await closeTestDb();
  });

  it("should submit a new idea", async () => {
    const res = await request(app)
      .post("/api/ideas/submit")
      .set("Authorization", `Bearer ${userToken}`)
      .send({
        title: "New Idea",
        description: "This is an idea",
        isPublic: true,
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.idea.title).toBe("New Idea");

    const dbIdea = await Idea.findOne({ title: "New Idea" });
    expect(dbIdea).toBeTruthy();
    expect(dbIdea.submitter.toString()).toBe(user._id.toString());
  });

  it("should get all public ideas", async () => {
    // Create public and private ideas
    await Idea.create({
      title: "Public Idea",
      description: "Visible to all",
      isPublic: true,
      submitter: user._id,
      organization: org._id,
    });
    await Idea.create({
      title: "Private Idea",
      description: "Not public",
      isPublic: false,
      submitter: user._id,
      organization: org._id,
    });

    const res = await request(app)
      .get("/api/ideas/public-ideas")
      .set("Authorization", `Bearer ${userToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.ideas).toHaveLength(1);
    expect(res.body.ideas[0].title).toBe("Public Idea");
  });

  it("should get user's own ideas", async () => {
    await Idea.create({
      title: "My Idea",
      description: "Mine only",
      isPublic: false,
      submitter: user._id,
      organization: org._id,
    });

    const res = await request(app)
      .get("/api/ideas/my")
      .set("Authorization", `Bearer ${userToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.ideas).toHaveLength(1);
    expect(res.body.ideas[0].title).toBe("My Idea");
  });

  it("should edit user's own idea", async () => {
    const idea = await Idea.create({
      title: "Old Idea",
      description: "Old desc",
      isPublic: true,
      submitter: user._id,
      organization: org._id,
    });

    const res = await request(app)
      .put(`/api/ideas/${idea._id}`)
      .set("Authorization", `Bearer ${userToken}`)
      .send({ title: "Updated Idea", description: "Updated desc", isPublic: false });

    expect(res.statusCode).toBe(200);
    expect(res.body.idea.title).toBe("Updated Idea");
  });

  it("should not edit another user's idea", async () => {
    const otherUser = await User.create({
      name: "Other User",
      email: "other@test.com",
      role: "participant",
      organization: org._id,
      googleId: "other-google-id",
    });
    const idea = await Idea.create({
      title: "Other Idea",
      description: "Other desc",
      isPublic: true,
      submitter: otherUser._id,
      organization: org._id,
    });

    const res = await request(app)
      .put(`/api/ideas/${idea._id}`)
      .set("Authorization", `Bearer ${userToken}`)
      .send({ title: "Hack", description: "Try", isPublic: false });

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe("Unauthorized");
  });

  it("should delete user's own idea", async () => {
    const idea = await Idea.create({
      title: "Delete Me",
      description: "To delete",
      isPublic: true,
      submitter: user._id,
      organization: org._id,
    });

    const res = await request(app)
      .delete(`/api/ideas/${idea._id}`)
      .set("Authorization", `Bearer ${userToken}`);

    expect(res.statusCode).toBe(200);
    expect(await Idea.findById(idea._id)).toBeNull();
  });

  it("should not delete another user's idea", async () => {
    const otherUser = await User.create({
      name: "Other User",
      email: "other2@test.com",
      role: "participant",
      organization: org._id,
      googleId: "other2-google-id",
    });

    const idea = await Idea.create({
      title: "Other Idea",
      description: "Cannot delete",
      isPublic: true,
      submitter: otherUser._id,
      organization: org._id,
    });

    const res = await request(app)
      .delete(`/api/ideas/${idea._id}`)
      .set("Authorization", `Bearer ${userToken}`);

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe("Unauthorized");
  });
});
