const mongoose = require("mongoose");

const organizationSchema = new mongoose.Schema(
    {
        name: { type: String, required: true },
        domain: { type: String, required: true, unique: true }, // e.g. "company.com"
        admin: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        members: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    },
    { timestamps: true }
);

module.exports = mongoose.models.Organization || mongoose.model("Organization", organizationSchema);
