const mongoose=require('mongoose');
const AutoIncrement=require('mongoose-sequence')(mongoose);

const PromptSchema=new mongoose.Schema({
     prompt_desc:String,
     whyTreasure:String,
    score:String,
    worthbuilding:String,
    target_audience:String,
    mvp_features:String,
    earning_potential:String,
    tech_stack:{
        frontend:String,
        mobile_app:String,
        backend:String,
        database:String,
        ai:String,
        auth:String
    },
    usp:String,
    problem_it_solves:String,
    timeline_to_first_revenue: [
        {
            phase: String,
            duration: String
        }
    ],
    monetization_model:String,
    roadmap: [
  {
    phase: String,
    goal: String,
    duration: String,
    steps: [String],
    platforms: [String]
  }
]
,
    user_id:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:'user'
    }],
     createdAt:{type:Date,default:Date.now}
});
PromptSchema.plugin(AutoIncrement,{inc_field:'id',id:'pid'});
const promptModel=mongoose.model('prompt',PromptSchema);
module.exports=promptModel;