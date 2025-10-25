const ideaService = require("../services/ideaService");

class IdeaController {
    async getPublicIdeas(req, res) {
        try {
            const ideas = await ideaService.getPublicIdeas();
            res.json({ ideas });
        } catch (err) {
            res.status(500).json({ message: err.message });
        }
    }

    async submitIdea(req, res) {
        try {
            const { title, description, isPublic } = req.body;
            const submitterId = req.user.id; // From JWT
            const idea = await ideaService.createIdea({
                title,
                description,
                submitterId,
                isPublic,
            });
            res.status(201).json({ message: "Idea submitted", idea });
        } catch (err) {
            res.status(400).json({ message: err.message });
        }
    }

    async getMyIdeas(req, res) {
        try {
            const ideas = await ideaService.getIdeasByUser(req.user.id);
            res.json({ ideas });
        } catch (err) {
            res.status(500).json({ message: err.message });
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
            res.json({ message: "Idea updated", idea: updatedIdea });
        } catch (err) {
            res.status(400).json({ message: err.message });
        }
    }

    async deleteIdea(req, res) {
        try {
            const ideaId = req.params.id;
            await ideaService.deleteIdea(req.user.id, ideaId);
            res.json({ message: "Idea deleted" });
        } catch (err) {
            res.status(400).json({ message: err.message });
        }
    }
}

module.exports = new IdeaController();
