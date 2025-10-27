const mongoose = require("mongoose");

const teamSchema = new mongoose.Schema(
    {
        name: { type: String, required: true },
        idea: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Idea",
            required: true,
        },
        members: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
        organization: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Organization",
            required: true,
        },
        hackathon: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Hackathon",
            required: true,
        },
    },
    { timestamps: true }
);

teamSchema.index({ members: 1, hackathon: 1 }, { unique: true });

module.exports = mongoose.models.Team || mongoose.model("Team", teamSchema);
