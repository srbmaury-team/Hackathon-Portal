const mongoose = require("mongoose");

const hackathonSchema = new mongoose.Schema(
    {
        title: { type: String, required: true },
        description: { type: String, required: true },
        isActive: { type: Boolean, default: true },
        organization: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Organization",
            required: true,
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
        teams: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: "Team",
        }],
        rounds: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: "Round",
        }],
    },
    { timestamps: true }
);

module.exports = mongoose.models.Hackathon || mongoose.model("Hackathon", hackathonSchema);
