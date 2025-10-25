const Announcement = require("../models/Announcement");

class AnnouncementController {
    async get(req, res) {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const skip = (page - 1) * limit;

            // Only announcements of the user's organization
            const orgFilter = { organization: req.user.organization };

            const total = await Announcement.countDocuments(orgFilter);
            const totalPages = Math.ceil(total / limit);

            const announcements = await Announcement.find(orgFilter)
                .skip(skip)
                .limit(limit)
                .sort({ createdAt: -1 })
                .populate("createdBy", "name email") || [];

            res.json({ announcements, totalPages });
        } catch (err) {
            console.error(err);
            res.status(500).json({ message: req.__("announcement.get_failed"), error: err.message });
        }
    }

    async create(req, res) {
        try {
            const { title, message } = req.body;

            const announcement = await Announcement.create({
                title,
                message,
                createdBy: req.user._id,
                organization: req.user.organization,
            });

            res.status(201).json({
                message: req.__("announcement.created_successfully"),
                announcement,
            });
        } catch (err) {
            console.error(err);
            res.status(500).json({
                message: req.__("announcement.creation_failed"),
            });
        }
    }

    async update(req, res) {
        try {
            const { id } = req.params;
            const { title, message } = req.body;

            const announcement = await Announcement.findById(id);
            if (!announcement) {
                return res
                    .status(404)
                    .json({ message: req.__("announcement.not_found") });
            }

            // Only creator or admin can edit
            if (
                !announcement.createdBy.equals(req.user._id) &&
                req.user.role !== "admin"
            ) {
                return res
                    .status(403)
                    .json({ message: req.__("auth.forbidden") });
            }

            announcement.title = title || announcement.title;
            announcement.message = message || announcement.message;
            await announcement.save();

            res.json({
                message: req.__("announcement.updated_successfully"),
                announcement,
            });
        } catch (err) {
            console.error(err);
            res.status(500).json({
                message: req.__("announcement.update_failed"),
            });
        }
    }

    async delete(req, res) {
        try {
            const { id } = req.params;
            const announcement = await Announcement.findById(id);

            if (!announcement) {
                return res
                    .status(404)
                    .json({ message: req.__("announcement.not_found") });
            }

            if (
                !announcement.createdBy.equals(req.user._id) &&
                req.user.role !== "admin"
            ) {
                return res
                    .status(403)
                    .json({ message: req.__("auth.forbidden") });
            }

            await Announcement.findByIdAndDelete(id);
            res.json({ message: req.__("announcement.deleted_successfully") });
        } catch (err) {
            console.error(err);
            res.status(500).json({
                message: req.__("announcement.delete_failed"),
            });
        }
    }
}

module.exports = new AnnouncementController();
