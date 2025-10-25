const mongoose = require("mongoose");

const submissionSchema = new mongoose.Schema(
    {
        team: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Team",
            required: true,
        },
        organization: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Organization",
            required: true,
        },
        ppt: String,
        recording: String,
        score: { type: Number, default: 0 },
        feedback: String,
    },
    { timestamps: true }
);

module.exports = mongoose.model("Submission", submissionSchema);
