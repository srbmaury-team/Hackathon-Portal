const mongoose = require("mongoose");

const ideaSchema = new mongoose.Schema(
    {
        title: { type: String, required: true },
        description: { type: String, required: true },
        submitter: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // logged-in user
        isPublic: { type: Boolean, default: true }, // true → public idea, false → hackathon-specific
        organization: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Organization",
            required: true,
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model("Idea", ideaSchema);
