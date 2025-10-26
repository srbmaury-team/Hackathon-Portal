const Hackathon = require("../models/Hackathon");
const Team = require("../models/Team");
const Round = require("../models/Round");

class HackathonController {
    // ➕ Create Hackathon
    async create(req, res) {
        try {
            const { title, description, startDate, endDate, isActive } = req.body;

            const hackathon = await Hackathon.create({
                title,
                description,
                startDate,
                endDate,
                isActive: isActive !== undefined ? isActive : true,
                organization: req.user.organization._id,
                createdBy: req.user._id,
                teams: [],
                rounds: [],
            });

            res.status(201).json({
                message: req.__("hackathon.created_successfully"),
                hackathon,
            });
        } catch (err) {
            console.error(err);
            res.status(500).json({
                message: req.__("hackathon.creation_failed"),
                error: err.message,
            });
        }
    }

    // 📋 Get all Hackathons
    async getAll(req, res) {
        try {
            const filter = { organization: req.user.organization._id };

            // If not organizer/admin, only show active hackathons
            if (!["organizer", "admin"].includes(req.user.role)) {
                filter.isActive = true;
            }

            const hackathons = await Hackathon.find(filter)
                .populate("createdBy", "name email")
                .populate("teams")
                .populate("rounds")
                .sort({ createdAt: -1 });

            res.json({
                hackathons,
                message: req.__("hackathon.fetch_success"),
            });
        } catch (err) {
            console.error(err);
            res.status(500).json({
                message: req.__("hackathon.fetch_failed"),
                error: err.message,
            });
        }
    }

    // 🔍 Get single Hackathon by ID
    async getById(req, res) {
        try {
            const hackathon = await Hackathon.findById(req.params.id)
                .populate("createdBy", "name email")
                .populate("organization", "name")
                .populate("teams")
                .populate("rounds");

            if (!hackathon) {
                return res.status(404).json({
                    message: req.__("hackathon.not_found"),
                });
            }

            // Visibility check
            if (
                !hackathon.isActive &&
                !["organizer", "admin"].includes(req.user.role)
            ) {
                return res.status(403).json({
                    message: req.__("hackathon.access_denied_inactive"),
                });
            }

            // Ensure same organization
            if (
                String(hackathon.organization._id) !==
                String(req.user.organization._id)
            ) {
                return res.status(403).json({
                    message: req.__("hackathon.access_denied"),
                });
            }

            res.json({
                hackathon,
                message: req.__("hackathon.fetch_success"),
            });
        } catch (err) {
            console.error(err);
            res.status(500).json({
                message: req.__("hackathon.fetch_failed"),
                error: err.message,
            });
        }
    }

    // ✏️ Update Hackathon (organizer/admin only)
    async update(req, res) {
        try {
            const { title, description, startDate, endDate, isActive } = req.body;

            const hackathon = await Hackathon.findById(req.params.id);

            if (!hackathon) {
                return res.status(404).json({
                    message: req.__("hackathon.not_found"),
                });
            }

            // Ensure same organization
            if (
                String(hackathon.organization) !== String(req.user.organization._id)
            ) {
                return res.status(403).json({
                    message: req.__("hackathon.access_denied"),
                });
            }

            // Update fields if provided
            if (title !== undefined) hackathon.title = title;
            if (description !== undefined) hackathon.description = description;
            if (startDate !== undefined) hackathon.startDate = startDate;
            if (endDate !== undefined) hackathon.endDate = endDate;
            if (isActive !== undefined) hackathon.isActive = isActive;

            await hackathon.save();

            const updatedHackathon = await Hackathon.findById(hackathon._id)
                .populate("createdBy", "name email")
                .populate("teams")
                .populate("rounds");

            res.json({
                hackathon: updatedHackathon,
                message: req.__("hackathon.updated_successfully"),
            });
        } catch (err) {
            console.error(err);
            res.status(500).json({
                message: req.__("hackathon.update_failed"),
                error: err.message,
            });
        }
    }

    // ❌ Delete Hackathon (organizer/admin only)
    async delete(req, res) {
        try {
            const hackathon = await Hackathon.findById(req.params.id);

            if (!hackathon) {
                return res.status(404).json({
                    message: req.__("hackathon.not_found"),
                });
            }

            if (
                String(hackathon.organization) !== String(req.user.organization._id)
            ) {
                return res.status(403).json({
                    message: req.__("hackathon.access_denied"),
                });
            }

            await Hackathon.findByIdAndDelete(req.params.id);
            
            res.json({
                message: req.__("hackathon.deleted_successfully"),
            });
        } catch (err) {
            console.error(err);
            res.status(500).json({
                message: req.__("hackathon.delete_failed"),
                error: err.message,
            });
        }
    }
}

module.exports = new HackathonController();
