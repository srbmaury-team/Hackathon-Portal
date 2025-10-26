const Hackathon = require("../models/Hackathon");
const Team = require("../models/Team");
const Round = require("../models/Round");

class HackathonController {
    /**
     * Create a new hackathon
     * @route POST /api/hackathons
     * @access Private (Admin/Organizer only via roleCheck middleware)
     */
    async create(req, res) {
        try {
            const { title, description, isActive, rounds } = req.body;

            // Validate required fields
            if (!title || !description) {
                return res.status(400).json({
                    message: req.__("hackathon.validation_failed"),
                    error: "Title and description are required",
                });
            }

            // Create rounds if provided
            let roundIds = [];
            if (Array.isArray(rounds) && rounds.length > 0) {
                const createdRounds = await Round.insertMany(
                    rounds.map(r => ({
                        name: r.name,
                        description: r.description || "",
                        startDate: r.startDate,
                        endDate: r.endDate,
                        isActive: r.isActive !== undefined ? r.isActive : true,
                        submissions: [],
                    }))
                );
                roundIds = createdRounds.map(r => r._id);
            }

            // Create hackathon
            const hackathon = await Hackathon.create({
                title,
                description,
                isActive: isActive !== undefined ? isActive : true,
                organization: req.user.organization._id,
                createdBy: req.user._id,
                teams: [],
                rounds: roundIds,
            });

            // Populate created hackathon
            const populatedHackathon = await Hackathon.findById(hackathon._id)
                .populate("createdBy", "name email")
                .populate("organization", "name")
                .populate("rounds", "name description startDate endDate isActive");

            res.status(201).json({
                message: req.__("hackathon.created_successfully"),
                hackathon: populatedHackathon,
            });
        } catch (err) {
            console.error("Create Hackathon Error:", err);
            res.status(500).json({
                message: req.__("hackathon.creation_failed"),
                error: err.message,
            });
        }
    }

    /**
     * Get all hackathons for the user's organization
     * @route GET /api/hackathons
     * @access Private
     */
    async getAll(req, res) {
        try {
            // Build filter based on user's organization
            const filter = { organization: req.user.organization._id };

            // If not organizer/admin, only show active hackathons
            if (!["organizer", "admin"].includes(req.user.role)) {
                filter.isActive = true;
            }

            // Fetch hackathons with populated fields
            const hackathons = await Hackathon.find(filter)
                .populate("createdBy", "name email")
                .populate("teams", "name members")
                .populate("rounds", "name description startDate endDate isActive")
                .sort({ createdAt: -1 });

            res.json({
                hackathons,
                total: hackathons.length,
                message: req.__("hackathon.fetch_success"),
            });
        } catch (err) {
            console.error("Get All Hackathons Error:", err);
            res.status(500).json({
                message: req.__("hackathon.fetch_failed"),
                error: err.message,
            });
        }
    }

    /**
     * Get a single hackathon by ID
     * @route GET /api/hackathons/:id
     * @access Private
     */
    async getById(req, res) {
        try {
            const { id } = req.params;

            // Validate ID format
            if (!id.match(/^[0-9a-fA-F]{24}$/)) {
                return res.status(400).json({
                    message: req.__("hackathon.invalid_id"),
                });
            }

            // Fetch hackathon with populated fields
            const hackathon = await Hackathon.findById(id)
                .populate("createdBy", "name email")
                .populate("organization", "name domain")
                .populate("teams", "name members")
                .populate("rounds", "name description startDate endDate isActive");

            if (!hackathon) {
                return res.status(404).json({
                    message: req.__("hackathon.not_found"),
                });
            }

            // Check organization access
            if (String(hackathon.organization._id) !== String(req.user.organization._id)) {
                return res.status(403).json({
                    message: req.__("hackathon.access_denied"),
                });
            }

            // Check visibility for non-admin/organizer users
            if (!hackathon.isActive && !["organizer", "admin"].includes(req.user.role)) {
                return res.status(403).json({
                    message: req.__("hackathon.access_denied_inactive"),
                });
            }

            res.json({
                hackathon,
                message: req.__("hackathon.fetch_success"),
            });
        } catch (err) {
            console.error("Get Hackathon By ID Error:", err);
            res.status(500).json({
                message: req.__("hackathon.fetch_failed"),
                error: err.message,
            });
        }
    }

    /**
     * Update a hackathon
     * @route PUT /api/hackathons/:id
     * @access Private (Admin/Organizer only via roleCheck middleware)
     */
    async update(req, res) {
        try {
            const { id } = req.params;
            const { title, description, isActive, rounds } = req.body;

            // Validate ID format
            if (!id.match(/^[0-9a-fA-F]{24}$/)) {
                return res.status(400).json({
                    message: req.__("hackathon.invalid_id"),
                });
            }

            // Find hackathon
            const hackathon = await Hackathon.findById(id);

            if (!hackathon) {
                return res.status(404).json({
                    message: req.__("hackathon.not_found"),
                });
            }

            // Check organization access
            if (String(hackathon.organization) !== String(req.user.organization._id)) {
                return res.status(403).json({
                    message: req.__("hackathon.access_denied"),
                });
            }

            // Update only provided fields
            if (title !== undefined) hackathon.title = title;
            if (description !== undefined) hackathon.description = description;
            if (isActive !== undefined) hackathon.isActive = isActive;

            // Handle rounds update if provided
            if (Array.isArray(rounds)) {
                // Get old round IDs
                const oldRoundIds = hackathon.rounds.map(r => r.toString());
                
                // Separate rounds into: existing (with _id) and new (without _id)
                const existingRounds = rounds.filter(r => r._id);
                const newRounds = rounds.filter(r => !r._id);
                
                // Find rounds to delete (old rounds not in the new list)
                const incomingRoundIds = existingRounds.map(r => r._id.toString());
                const roundsToDelete = oldRoundIds.filter(rId => !incomingRoundIds.includes(rId));
                
                // Delete removed rounds
                if (roundsToDelete.length > 0) {
                    await Round.deleteMany({ _id: { $in: roundsToDelete } });
                }
                
                // Update existing rounds
                for (const r of existingRounds) {
                    await Round.findByIdAndUpdate(r._id, {
                        name: r.name,
                        description: r.description || "",
                        startDate: r.startDate,
                        endDate: r.endDate,
                        isActive: r.isActive !== undefined ? r.isActive : true,
                    });
                }
                
                // Create new rounds
                let newRoundIds = [];
                if (newRounds.length > 0) {
                    const createdRounds = await Round.insertMany(
                        newRounds.map(r => ({
                            name: r.name,
                            description: r.description || "",
                            startDate: r.startDate,
                            endDate: r.endDate,
                            isActive: r.isActive !== undefined ? r.isActive : true,
                            submissions: [],
                        }))
                    );
                    newRoundIds = createdRounds.map(r => r._id);
                }
                
                // Update hackathon rounds array
                hackathon.rounds = [...incomingRoundIds, ...newRoundIds];
            }

            // Save changes
            await hackathon.save();

            // Return updated hackathon with populated fields
            const updatedHackathon = await Hackathon.findById(hackathon._id)
                .populate("createdBy", "name email")
                .populate("organization", "name domain")
                .populate("teams", "name members")
                .populate("rounds", "name description startDate endDate isActive");

            res.json({
                message: req.__("hackathon.updated_successfully"),
                hackathon: updatedHackathon,
            });
        } catch (err) {
            console.error("Update Hackathon Error:", err);
            res.status(500).json({
                message: req.__("hackathon.update_failed"),
                error: err.message,
            });
        }
    }

    /**
     * Delete a hackathon
     * @route DELETE /api/hackathons/:id
     * @access Private (Admin/Organizer only via roleCheck middleware)
     */
    async delete(req, res) {
        try {
            const { id } = req.params;

            // Validate ID format
            if (!id.match(/^[0-9a-fA-F]{24}$/)) {
                return res.status(400).json({
                    message: req.__("hackathon.invalid_id"),
                });
            }

            // Find hackathon
            const hackathon = await Hackathon.findById(id);

            if (!hackathon) {
                return res.status(404).json({
                    message: req.__("hackathon.not_found"),
                });
            }

            // Check organization access
            if (String(hackathon.organization) !== String(req.user.organization._id)) {
                return res.status(403).json({
                    message: req.__("hackathon.access_denied"),
                });
            }

            // Delete associated rounds
            if (hackathon.rounds && hackathon.rounds.length > 0) {
                await Round.deleteMany({ _id: { $in: hackathon.rounds } });
            }

            // Delete the hackathon
            await Hackathon.findByIdAndDelete(id);

            res.json({
                message: req.__("hackathon.deleted_successfully"),
            });
        } catch (err) {
            console.error("Delete Hackathon Error:", err);
            res.status(500).json({
                message: req.__("hackathon.delete_failed"),
                error: err.message,
            });
        }
    }
}

module.exports = new HackathonController();
