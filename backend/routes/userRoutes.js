const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const { protect } = require("../middleware/auth");

// Accessible only to admin/organizer
router.get("/", protect, userController.getAll);
router.put("/:id/role", protect, userController.updateRole);

module.exports = router;
