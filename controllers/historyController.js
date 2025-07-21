//const History =require('../models/History')
const History=require('../models/PromptHistory');
const mongoose = require("mongoose");

// Add new prompt
exports.addPrompt = async (req, res) => {
  try {
    const { promptText } = req.body;
    const prompt = await History.create({ promptText });
    res.status(201).json(prompt);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// Get all prompts
// exports.getHistory = async (req, res) => {
//   try {
//     const history = await History.find().sort({ createdAt: -1 });
//     res.json(history);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };

//Get particular user history
exports.getHistory = async (req, res) => {
  try {
    const userId = req.query.userId;
     const sessionId = req.sessionID;
    

    if (!userId) {
   const history = await History.find({ session_id: sessionId }).sort({ createdAt: -1 });
      return res.status(200).json(history);
    }

    const history = await History.find({
      user_id: { $in: [new mongoose.Types.ObjectId(userId)] }
    }).sort({ createdAt: -1 });

    res.json(history);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get a specific prompt by ID
exports.getPromptById = async (req, res) => {
  try {
    const { id } = req.params;
    const prompt = await History.findById(id);
    if (!prompt) return res.status(404).json({ message: "Prompt not found" });
    res.json(prompt);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update prompt
exports.updatePrompt = async (req, res) => {
  try {
    const { id } = req.params;
    const { promptText } = req.body;

    const updatedPrompt = await History.findByIdAndUpdate(
      id,
      { promptText },
      { new: true } // return updated document
    );

    if (!updatedPrompt) {
      return res.status(404).json({ message: "Prompt not found" });
    }

    res.json(updatedPrompt);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// Delete prompt
exports.deletePrompt = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedPrompt = await History.findByIdAndDelete(id);

    if (!deletedPrompt) {
      return res.status(404).json({ message: "Prompt not found" });
    }

    res.json({ message: "Prompt deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};