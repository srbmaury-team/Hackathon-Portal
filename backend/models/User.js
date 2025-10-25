const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
    {
        name: { type: String, required: true },
        email: { type: String, required: true, unique: true },
        role: {
            type: String,
            enum: ["participant", "organizer", "judge", "mentor", "admin"],
            default: "participant",
        },
        expertise: String,
        googleId: { type: String, required: true, unique: true }, // store Google ID
        organization: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Organization",
            required: true,
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
