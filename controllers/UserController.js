const userModel=require('../models/UserModel');
//const {all}=require('../routes/UserRoute');
const bcrypt=require('bcrypt');
const jwt=require('jsonwebtoken');

// need to change id to _id 
const signup=async(req,res)=>{

    try{
        const {name,email,password,confirm_password,role}=req.body;
         const existingUser=await userModel.findOne({name});
          // const isMatch=await bcrypt.compare(confirm_password,password);
        if(!name || !password || !email ||!confirm_password){
            return res.status(400).json({ message: 'All fields are required' });
        }
       
        else if(existingUser){
              return res.status(409).json({ message: 'User already exists' });
        }
      
        // else if(!isMatch){
        //      return res.status(409).json({ message: 'password and confirm password doesnt match' });
        // }
        else{
            const hashedPassword=await bcrypt.hash(password,10);
            const newUser=await userModel.create({
                name,
                email,
                password:hashedPassword,
                role
            });
            const token=jwt.sign(
                {
                     id: newUser.id, email:newUser.email,name: newUser.name, role: newUser.role
                },
                process.env.JWT_SECRET,
                {expiresIn:'1d'}
            );
             res.status(200).json({
      message: 'signup successful',
      token,
      user: {
        id: newUser.id,
        email:newUser.email,
        name: newUser.name,
        role: newUser.role
      }
    });
        }
    }
    catch(err){
        return  res.status(500).json({ message: "signup failed", error: err.message });
    }
};

const login=async(req,res)=>{
    try{
        const {email,password}=req.body;
          
    if(!email || !password){
        return res.status(400).json("email & password are required");
    }
    const user=await userModel.findOne({email:email}).select('_id email name role password ');
     if(!user){
        return res.status(404).json(`user doesnt exists ${user}`);
    }
  const isMatch=await bcrypt.compare(password,user.password);
   
     if(!isMatch){
        return res.status(401).json("password is incorrect");
    }
   
        const token=jwt.sign(
            {
                    id: user._id, email: user.email,name:user.name , role: user.role
            },
            process.env.JWT_SECRET,
            {expiresIn:'1d'}
        );
        return res.status(200).json({message:"login successful",token:token});
    }
    
    catch(err){
         return  res.status(500).json({ message: "Login failed", error: err.message });
    }
};
module.exports={login,signup};