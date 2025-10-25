const mongoose = require("mongoose");

const hackathonSchema = new mongoose.Schema(
    {
        title: String,
        description: String,
        startDate: Date,
        endDate: Date,
        organization: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Organization",
            required: true,
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model("Hackathon", hackathonSchema);
