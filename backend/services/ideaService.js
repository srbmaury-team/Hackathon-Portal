const Idea = require("../models/Idea");

class IdeaService {
  async getPublicIdeas() {
    return Idea.find({ isPublic: true }).populate("submitter", "_id name").sort({ createdAt: -1 }) || [];
  }

  async createIdea({ title, description, submitterId, isPublic }) {
    if (!title || !description || typeof isPublic !== "boolean") {
      throw new Error("Title, description, and isPublic are required");
    }
    const idea = new Idea({ title, description, submitter: submitterId, isPublic });
    return idea.save();
  }

  async getIdeasByUser(userId) {
    return Idea.find({ submitter: userId }).sort({ createdAt: -1 }) || [];
  }

  async updateIdea(userId, ideaId, updateData) {
    const idea = await Idea.findById(ideaId);
    if (!idea) throw new Error("Idea not found");
    if (idea.submitter.toString() !== userId) throw new Error("Unauthorized");

    const { title, description, isPublic } = updateData;
    if (!title || !description || typeof isPublic !== "boolean") {
      throw new Error("Title, description, and isPublic are required");
    }

    idea.title = title;
    idea.description = description;
    idea.isPublic = isPublic;

    return idea.save();
  }

  async deleteIdea(userId, ideaId) {
    const idea = await Idea.findById(ideaId);
    if (!idea) throw new Error("Idea not found");
    if (idea.submitter.toString() !== userId) throw new Error("Unauthorized");

    return Idea.deleteOne({ _id: ideaId });
  }
}

module.exports = new IdeaService();
