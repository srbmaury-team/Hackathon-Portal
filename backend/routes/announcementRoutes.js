const express = require("express");
const router = express.Router();
const { protect } = require('../middleware/auth'); // JWT auth middleware
const roleCheck = require("../middleware/roleCheck");
const AnnouncementController = require("../controllers/announcementController");

router.get("/", protect, (req, res) => AnnouncementController.get(req, res));
router.post("/", protect, roleCheck("organizer", "admin"), (req, res) => AnnouncementController.create(req, res));
router.put("/:id", protect, roleCheck("organizer", "admin"), (req, res) => AnnouncementController.update(req, res));
router.delete("/:id", protect, roleCheck("organizer", "admin"), (req, res) => AnnouncementController.delete(req, res));

module.exports = router;
