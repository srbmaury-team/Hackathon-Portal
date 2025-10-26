const mongoose = require("mongoose");

const roundSchema = new mongoose.Schema(
    {
        name: { type: String, required: true },
        description: String,
        startDate: Date,
        endDate: Date,
        submissions: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Submission",
            },
        ],
        isActive: { type: Boolean, default: true },
    },
    { timestamps: true }
);

module.exports = mongoose.models.Round || mongoose.model("Round", roundSchema);