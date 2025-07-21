const mongoose = require("mongoose");

const promptSchema = new mongoose.Schema({
  prompt_desc: String,
  score: String,
  worthbuilding: String,
  target_audience: String,
  mvp_features: String,
  earning_potential: String,
  tech_stack: Object,
  problem_it_solves: String,
  timeline_to_first_revenue: String,
  monetization_model: String,
  roadmap: String,
  user_id: Array,
  session_id: String,
  createdAt: {
    type: Date,
    default: Date.now,
  }
});

module.exports = mongoose.model("Prompt", promptSchema);