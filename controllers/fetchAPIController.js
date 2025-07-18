// install npm install @google/generative-ai
const { GoogleGenerativeAI } = require("@google/generative-ai");     //generative ai library imported
// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);


// const axios = require('axios'); 

const promptModel=require('../models/PromptModel');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');


//fetchAPI Func
const fetchAPI=async (req,res)=>{
const userQuery = req.body.user_query;


if (!userQuery) {
    return res.status(400).json({ error: 'user_query is required in the request body' });
  }

const prompt = `
You're a startup business analyst. Evaluate the following startup idea:
"${userQuery}"

Return the result in JSON format:

{
  "topic": "<topic>",
  "verdict": "Treasure" or "Trash",

  // The keys below appear ONLY when "verdict" is "Treasure".
  "audience": "<audience age group and category>",
  "monthlyEarning": "<in INR, e.g. ₹5,00,000 monthly> ",

  // New field explaining why it's treasure
  "whyTreasure": "<reason why this idea is a treasure, e.g. strong market demand, innovative solution, etc>",

  "realWorldProblem": "<what specific pain does it solve?>",
  "USP": ["<primary usp>"],
  "monetizationStrategy": "<how the business will make money>",
  "mvpFeatureList": ["<feature 1>", "<feature 2>", "<feature 3>", "<feature 4>", "<feature 5>", "<feature 6>"],
  "TechStack": ["<frontend>", "<backend>", "<mobileApp>", "<database>", "<ai>", "<auth>"],

  // More detailed timeline with month-wise phases
  "Timeline_to_first_revenue": [
  { "phase": "MVP Development", "duration": "3-4 months" },
  { "phase": "Testing and Validation", "duration": "1-2 months" },
  { "phase": "Marketing and Launch", "duration": "1 month" }
],

  "Score": "<score out of 100>",
  "roadmap": [
    {
      "week": "week 1",
      "goal": "<Highly detailed overall objective for this week, explained in simple, non-technical terms. Describe the specific, measurable milestone that will be achieved by the end of this week, focusing on its impact and benefit for the business or user. Example: By the end of Week 1, we will have validated the core problem with 20 potential users and gathered their initial feedback on our proposed solution, ensuring we're building something people actually need.>",
      "steps": [
        "<Step 1: Extremely detailed action item.>",
        "<Step 2: Extremely detailed action item.>",
        "<Step 3: Extremely detailed action item.>",
        "<Step 4 (Optional)>"
      ],
      "platforms": ["<Web>", "<Mobile>", "<AI>", "<Other>"]
    },
    {
      "week": "week 2",
      "goal": "<Highly detailed overall objective for this week, explained in simple, non-technical terms. Describe the specific, measurable milestone that will be achieved by the end of this week, focusing on its impact and benefit for the business or user.>",
      "steps": [
        "<Step 1: Extremely detailed action item.>",
        "<Step 2: Extremely detailed action item.>",
        "<Step 3: Extremely detailed action item.>",
        "<Step 4 (Optional)>"
      ],
      "platforms": ["<Web>", "<Mobile>"]
    }
    // Add up to 8 weeks if needed
  ]
}
`;


    try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
       
       // const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

       // below generates result
       const result = await model.generateContent(prompt);
    
       // below fetches the result in long one line string
       const rawText = result.response.text();


 // below remove json
   const cleaned = rawText.replace(/```(json)?/g, '').trim();
console.log("Raw AI output:", cleaned);
const jsonResponse = JSON.parse(cleaned);

    const verdict=jsonResponse.verdict;
   
if(verdict=="Trash"){
  res.json({verdict:verdict});
}
else{
  const whyTreasure=jsonResponse.whyTreasure;
  const topic=jsonResponse.topic;
  const Score=jsonResponse.Score;
   const audience=jsonResponse.audience;
    const mvpFeatureList=jsonResponse.mvpFeatureList.join(",");
    const monthlyEarning=jsonResponse.monthlyEarning;
    const realWorldProblem=jsonResponse.realWorldProblem;
     const frontend=jsonResponse.TechStack[0];
      const backend=jsonResponse.TechStack[1];
       const mobileApp=jsonResponse.TechStack[2];
        const database=jsonResponse.TechStack[3];
         const ai=jsonResponse.TechStack[4];
          const auth=jsonResponse.TechStack[5];
           const roadmap=jsonResponse.roadmap;
          const tech=`
          Frontend : ${frontend},
          Backend : ${backend},
          mobile App : ${mobileApp},
          database : ${database},
          ai : ${ai},
          auth : ${auth},
          `;
    const USP=jsonResponse.USP[0];
    const monetizationStrategy=jsonResponse.monetizationStrategy;
   const Timeline_to_first_revenue=jsonResponse.Timeline_to_first_revenue;
   const mvpPhase = Timeline_to_first_revenue[0];       // { phase: "MVP Development", duration: "3-4 months" }
const testingPhase = Timeline_to_first_revenue[1];   // { phase: "Testing and Validation", duration: "1-2 months" }
const marketingPhase = Timeline_to_first_revenue[2]; // { phase: "Marketing and Launch", duration: "1 month" }

const timelineText = `
  ${mvpPhase.phase} : ${mvpPhase.duration},
  ${testingPhase.phase} : ${testingPhase.duration},
  ${marketingPhase.phase} : ${marketingPhase.duration},
`;

    // checks if user is logged in
    // here if we would require to only work with logged in users then we would provide req.user.id here and would pass verifytoken variable in middleware  
    if (req.headers.authorization) {

      // below would fetch token from authorization:bearer <token>  ie bearer-> token->1 position
       const token = req.headers.authorization.split(' ')[1];

       // localstorage doesnt work in backend
       //compare token & jwt secret and return id,name,email,etc to decoded
    const decoded = jwt.verify(token, process.env.JWT_SECRET);


      // below Store in DB
 const newPrompt=await promptModel.create({
                prompt_desc:topic,
                  score:Score,
                  whyTreasure:whyTreasure,
                  worthbuilding:verdict,
                  target_audience:audience,
                  mvp_features:mvpFeatureList,
                  earning_potential:monthlyEarning,
                  timeline_to_first_revenue:timelineText,
                  tech_stack:{
                      frontend:frontend,
                      mobile_app:mobileApp,
                      backend:backend,
                      database:database,
                      ai:ai,
                      auth:auth
                  },
                  usp:USP,
                  problem_it_solves:realWorldProblem,
                  
                  monetization_model:monetizationStrategy,
                  roadmap:roadmap,
                user_id: decoded.id         // this fetches user token _id which is stored in id:_id

            });
            console.log(newPrompt);
          }

  res.json({ topic:topic,verdict: verdict, audience:audience,monthlyEarning:monthlyEarning
      , realWorldProblem:realWorldProblem,USP:USP,monetizationStrategy:monetizationStrategy
      ,mvpFeatureList:mvpFeatureList,TechStack:tech,Timeline_to_first_revenue:timelineText,
      Score:Score,roadmap:roadmap,whyTreasure:whyTreasure
    });
} 
    
  } catch (err) {
    console.error(err.response?.data || err.message);
    res.status(500).json({ error: 'Failed to fetch response from Gemini API' });
  }

};

module.exports={fetchAPI};