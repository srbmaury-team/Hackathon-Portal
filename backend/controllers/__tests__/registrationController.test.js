// controllers/__tests__/registrationController.test.js

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
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const app = require("../../app");

import { connectTestDb, clearDb, closeTestDb } from "../../setup/testDb.js";
import User from "../../models/User.js";
import Organization from "../../models/Organization.js";
import Hackathon from "../../models/Hackathon.js";
import Idea from "../../models/Idea.js";
import Team from "../../models/Team.js";

describe("RegistrationController", () => {
    let org, participant1, participant2, organizer, hackathon, idea;
    let participantToken, organizerToken;

    beforeAll(async () => {
        await connectTestDb();

        // Create organization
        org = await Organization.create({
            name: "Test Org",
            domain: "testorg.com",
        });

        // Users
        organizer = await User.create({
            name: "Organizer User",
            email: "organizer@test.com",
            role: "organizer",
            organization: org._id,
            googleId: "google-org",
        });

        participant1 = await User.create({
            name: "Participant 1",
            email: "p1@test.com",
            role: "participant",
            organization: org._id,
            googleId: "google-p1",
        });

        participant2 = await User.create({
            name: "Participant 2",
            email: "p2@test.com",
            role: "participant",
            organization: org._id,
            googleId: "google-p2",
        });

        // Hackathon
        hackathon = await Hackathon.create({
            title: "AI Hack 2025",
            description: "AI-based challenge",
            organization: org._id,
            isActive: true,
            mnimumTeamSize: 1,
            maximumTeamSize: 5,
        });

        // Idea
        idea = await Idea.create({
            title: "Smart Chatbot",
            description: "AI-powered chatbot system",
            createdBy: participant1._id,
            organization: org._id,
        });

        // Tokens
        participantToken = jwt.sign(
            { id: participant1._id.toString(), role: "participant", organization: org._id.toString() },
            JWT_SECRET
        );
        organizerToken = jwt.sign(
            { id: organizer._id.toString(), role: "organizer", organization: org._id.toString() },
            JWT_SECRET
        );
    });

    beforeEach(async () => {
        await clearDb([Team]);
    });

    afterAll(async () => {
        await closeTestDb();
    });

    // 1️⃣ Register a team successfully
    it("should register a team successfully", async () => {
        const res = await request(app)
            .post(`/api/register/${hackathon._id}/register`)
            .set("Authorization", `Bearer ${participantToken}`)
            .send({
                teamName: "AI Masters",
                ideaId: idea._id,
                memberIds: [participant1._id, participant2._id],
            });

        expect(res.statusCode).toBe(201);
        expect(res.body.team.name).toBe("AI Masters");

        const teamInDb = await Team.findOne({ name: "AI Masters" });
        expect(teamInDb).toBeTruthy();
    });

    // 2️⃣ Fail if required fields are missing
    it("should fail if required fields are missing", async () => {
        const res = await request(app)
            .post(`/api/register/${hackathon._id}/register`)
            .set("Authorization", `Bearer ${participantToken}`)
            .send({
                ideaId: idea._id,
                memberIds: [participant1._id],
            });

        expect(res.statusCode).toBe(400);
    });

    // 3️⃣ Fail if hackathon not found
    it("should return 404 if hackathon not found", async () => {
        const fakeHackathonId = new mongoose.Types.ObjectId();
        const res = await request(app)
            .post(`/api/register/${fakeHackathonId}/register`)
            .set("Authorization", `Bearer ${participantToken}`)
            .send({
                teamName: "Ghost Team",
                ideaId: idea._id,
                memberIds: [participant1._id],
            });

        expect(res.statusCode).toBe(404);
    });

    // 4️⃣ Fail if team size invalid
    it("should fail if team size exceeds max limit", async () => {
        const bigTeam = Array(6).fill(participant1._id);
        const res = await request(app)
            .post(`/api/register/${hackathon._id}/register`)
            .set("Authorization", `Bearer ${participantToken}`)
            .send({
                teamName: "Big Team",
                ideaId: idea._id,
                memberIds: bigTeam,
            });

        expect(res.statusCode).toBe(400);
    });

    // 5️⃣ Fail if idea not found
    it("should fail if idea not found", async () => {
        const fakeIdeaId = new mongoose.Types.ObjectId();
        const res = await request(app)
            .post(`/api/register/${hackathon._id}/register`)
            .set("Authorization", `Bearer ${participantToken}`)
            .send({
                teamName: "IdeaLess Team",
                ideaId: fakeIdeaId,
                memberIds: [participant1._id],
            });

        expect(res.statusCode).toBe(404);
    });

    // 6️⃣ Prevent duplicate registration
    it("should prevent duplicate registration for same member", async () => {
        await Team.create({
            name: "Existing Team",
            idea: idea._id,
            members: [participant1._id],
            organization: org._id,
            hackathon: hackathon._id,
        });

        const res = await request(app)
            .post(`/api/register/${hackathon._id}/register`)
            .set("Authorization", `Bearer ${participantToken}`)
            .send({
                teamName: "Duplicate Team",
                ideaId: idea._id,
                memberIds: [participant1._id],
            });

        expect(res.statusCode).toBe(400);
    });

    // 7️⃣ Get all teams for hackathon (organizer)
    it("should get all teams for hackathon", async () => {
        await Team.create({
            name: "Test Team",
            idea: idea._id,
            members: [participant1._id],
            organization: org._id,
            hackathon: hackathon._id,
        });

        const res = await request(app)
            .get(`/api/register/${hackathon._id}/teams`)
            .set("Authorization", `Bearer ${organizerToken}`);

        expect(res.statusCode).toBe(200);
        expect(res.body.teams.length).toBe(1);
    });

    // 8️⃣ Withdraw team (by member)
    it("should withdraw team successfully by member", async () => {
        const team = await Team.create({
            name: "Withdraw Team",
            idea: idea._id,
            members: [participant1._id],
            organization: org._id,
            hackathon: hackathon._id,
        });

        const res = await request(app)
            .delete(`/api/register/${hackathon._id}/teams/${team._id}`)
            .set("Authorization", `Bearer ${participantToken}`);

        expect(res.statusCode).toBe(200);
        expect(await Team.findById(team._id)).toBeNull();
    });

    // 9️⃣ Withdraw fails if team not found
    it("should return 404 if withdrawing non-existent team", async () => {
        const fakeTeamId = new mongoose.Types.ObjectId();
        const res = await request(app)
            .delete(`/api/register/${hackathon._id}/teams/${fakeTeamId}`)
            .set("Authorization", `Bearer ${participantToken}`);

        expect(res.statusCode).toBe(404);
    });

    // 🔟 Withdraw fails if not authorized
    it("should forbid withdraw if not a member or organizer", async () => {
        const otherParticipant = await User.create({
            name: "Stranger",
            email: "stranger@test.com",
            role: "participant",
            organization: org._id,
            googleId: "google-stranger",
        });
        const strangerToken = jwt.sign(
            { id: otherParticipant._id.toString(), role: "participant", organization: org._id.toString() },
            JWT_SECRET
        );

        const team = await Team.create({
            name: "Protected Team",
            idea: idea._id,
            members: [participant1._id],
            organization: org._id,
            hackathon: hackathon._id,
        });

        const res = await request(app)
            .delete(`/api/register/${hackathon._id}/teams/${team._id}`)
            .set("Authorization", `Bearer ${strangerToken}`);

        expect(res.statusCode).toBe(403);
    });
});
