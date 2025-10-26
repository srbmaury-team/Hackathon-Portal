const express = require("express");
const router = express.Router();
const hackathonController = require("../controllers/hackathonController");
const { protect } = require("../middleware/auth");
const roleCheck = require("../middleware/roleCheck");

// Create new hackathon (organizer/admin only)
router.post("/", protect, roleCheck("organizer", "admin"), (req, res) =>
    hackathonController.create(req, res)
);

// Get all hackathons (active visible to all, inactive visible to organizer/admin)
router.get("/", protect, (req, res) => hackathonController.getAll(req, res));

// Get specific hackathon by ID (respect visibility rule)
router.get("/:id", protect, (req, res) => hackathonController.getById(req, res));

// Update hackathon (organizer/admin only)
router.put("/:id", protect, roleCheck("organizer", "admin"), (req, res) =>
    hackathonController.update(req, res)
);

// Delete hackathon (organizer/admin only)
router.delete("/:id", protect, roleCheck("organizer", "admin"), (req, res) =>
    hackathonController.delete(req, res)
);

module.exports = router;
