const User = require("../models/User");
const Organization = require("../models/Organization");

class UserController {
    // Get all users grouped by role
    async getAll(req, res) {
        try {
            // get user from the organization of the user
            const user = await User.findById(req.user.id);
            if (!user) {
                return res.status(404).json({ message: req.__("user.not_found") });
            }

            const organization = await Organization.findById(user.organization);
            if (!organization) {
                return res.status(404).json({ message: req.__("organization.not_found") });
            }
            const users = await User.find({ organization: organization.id }).populate("organization", "name").lean();

            // Group users by roles
            const groupedUsers = users.reduce((groups, user) => {
                if (!groups[user.role]) groups[user.role] = [];
                groups[user.role].push(user);
                return groups;
            }, {});

            res.json({ groupedUsers, message: req.__("user.fetch_success") });
        } catch (err) {
            console.error(err);
            res.status(500).json({
                message: req.__("user.fetch_failed"),
                error: err.message,
            });
        }
    }

    // Update user role (admin and organizer only)
    async updateRole(req, res) {
        try {
            const requesterRole = req.user.role;
            const { id } = req.params;
            const { role } = req.body;

            // Protect admin from modification
            const targetUser = await User.findById(id);
            if (!targetUser) {
                return res.status(404).json({ message: req.__("user.not_found") });
            }

            if (targetUser.role === "admin") {
                return res.status(403).json({ message: req.__("user.cannot_modify_admin") });
            }

            // Update the role
            targetUser.role = role;
            await targetUser.save();

            res.json({
                message: req.__("user.role_updated_successfully"),
                user: targetUser,
            });
        } catch (err) {
            console.error(err);
            res.status(500).json({
                message: req.__("user.role_update_failed"),
                error: err.message,
            });
        }
    }
}

module.exports = new UserController();
