const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const { protect } = require("../middleware/auth");
const roleCheck = require("../middleware/roleCheck");

router.get("/", protect, userController.getAll);
router.put("/:id/role", protect, roleCheck("organizer", "admin"), (req, res) => userController.updateRole(req, res));

module.exports = router;
