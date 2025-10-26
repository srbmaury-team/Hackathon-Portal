const ideaService = require("../services/ideaService");
const User = require("../models/User");

class IdeaController {
    async getPublicIdeas(req, res) {
        try {
            const ideas = await ideaService.getPublicIdeas();
            res.json({ ideas });
        } catch (err) {
            res.status(500).json({ message: req.__("idea.get_failed"), error: err.message });
        }
    }

    async submitIdea(req, res) {
        try {
            const { title, description, isPublic } = req.body;
            const submitterId = req.user.id; // From JWT
            
            // Fetch user's organization
            const user = await User.findById(submitterId);
            if (!user || !user.organization) {
                return res.status(400).json({ message: req.__("idea.organization_not_found") });
            }
            
            const idea = await ideaService.createIdea({
                title,
                description,
                submitterId,
                isPublic,
                organization: user.organization,
            });
            res.status(201).json({ message: req.__("idea.submitted_successfully"), idea });
        } catch (err) {
            res.status(400).json({ message: req.__("idea.submission_failed"), error: err.message });
        }
    }

    async getMyIdeas(req, res) {
        try {
            const ideas = await ideaService.getIdeasByUser(req.user.id);
            res.json({ ideas });
        } catch (err) {
            res.status(500).json({ message: req.__("idea.get_my_failed"), error: err.message });
        }
    }

    async editIdea(req, res) {
        try {
            const ideaId = req.params.id;
            const { title, description, isPublic } = req.body;
            const updatedIdea = await ideaService.updateIdea(
                req.user.id,
                ideaId,
                { title, description, isPublic }
            );
            res.json({ message: req.__("idea.updated_successfully"), idea: updatedIdea });
        } catch (err) {
            res.status(400).json({ message: req.__("idea.update_failed"), error: err.message });
        }
    }

    async deleteIdea(req, res) {
        try {
            const ideaId = req.params.id;
            await ideaService.deleteIdea(req.user.id, ideaId);
            res.json({ message: req.__("idea.deleted_successfully") });
        } catch (err) {
            res.status(400).json({ message: req.__("idea.delete_failed"), error: err.message });
        }
    }
}

module.exports = new IdeaController();
