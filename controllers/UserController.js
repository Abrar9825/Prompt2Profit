const userModel = require("../models/UserModel");
//const {all}=require('../routes/UserRoute');
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const axios = require("axios");

// need to change id to _id
const signup = async (req, res) => {
  try {
    const { name, email, password, confirm_password, role } = req.body;
    const existingUser = await userModel.findOne({ name });
    // const isMatch=await bcrypt.compare(confirm_password,password);
    if (!name || !password || !email || !confirm_password) {
      return res.status(400).json({ message: "All fields are required" });
    } else if (existingUser) {
      return res.status(409).json({ message: "User already exists" });
    }

    // else if(!isMatch){
    //      return res.status(409).json({ message: 'password and confirm password doesnt match' });
    // }
    else {
      const hashedPassword = await bcrypt.hash(password, 10);
      const newUser = await userModel.create({
        name,
        email,
        password: hashedPassword,
        role,
      });
      const token = jwt.sign(
        {
          id: newUser.id,
          email: newUser.email,
          name: newUser.name,
          role: newUser.role,
        },
        process.env.JWT_SECRET,
        { expiresIn: "1d" }
      );
      res.status(200).json({
        message: "signup successful",
        token,
        user: {
          id: newUser.id,
          email: newUser.email,
          name: newUser.name,
          role: newUser.role,
        },
      });
    }
  } catch (err) {
    return res
      .status(500)
      .json({ message: "signup failed", error: err.message });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json("email & password are required");
    }
    const user = await userModel
      .findOne({ email: email })
      .select("_id email name role password ");
    if (!user) {
      return res.status(404).json(`user doesnt exists ${user}`);
    }
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json("password is incorrect");
    }

    const token = jwt.sign(
      {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );
    return res.status(200).json({ message: "login successful", token: token });
  } catch (err) {
    return res
      .status(500)
      .json({ message: "Login failed", error: err.message });
  }
};

const githubCallback = async (req, res) => {
  const { code } = req.query;
  try {
    const tokenResponse = await axios.post(
      `https://github.com/login/oauth/access_token`,
      {
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code,
      },
      { headers: { accept: "application/json" } }
    );

    const accessToken = tokenResponse.data.access_token;

    const profileRes = await axios.get(`https://api.github.com/user`, {
      headers: { Authorization: `token ${accessToken}` },
    });

    const emailRes = await axios.get(`https://api.github.com/user/emails`, {
      headers: { Authorization: `token ${accessToken}` },
    });

    const { id, name, login } = profileRes.data;
    const email = emailRes.data.find((e) => e.primary)?.email || "no-email";

    let user = await userModel.findOne({ providerId: id });
    if (!user) {
      user = await userModel.create({
        providerId: id,
        name: name || login,
        email,
        provider: "github",
      });
    }
    const token = jwt.sign(
      {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );
    res.redirect(`http://localhost:3000?token=${token}`);
  } catch (err) {
    console.log(err);
    res.status(500).send("server error");
  }
};

const googleCallback = async (req, res) => {
  const { code } = req.query;
  try {
    const tokenResponse = await axios.post(
      `https://oauth2.googleapis.com/token`,
      {
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        code,
        grant_type: "authorization_code",
        redirect_uri: "http://localhost:3000/auth/google/callback",
      }
    );

    const accessToken = tokenResponse.data.access_token;

    const profileRes = await axios.get(
      `https://www.googleapis.com/oauth2/v2/userinfo`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );

    const { id, name, email } = profileRes.data;

    let user = await userModel.findOne({ providerId: id });
    if (!user) {
      user = await userModel.create({
        providerId: id,
        name: name,
        email,
        provider: "google",
      });
    }
    const token = jwt.sign(
      {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );
    res.redirect(`http://localhost:3000?token=${token}`);
  } catch (err) {
    console.log(err);
    res.status(500).send("server error");
  }
};

module.exports = { login, signup, githubCallback, googleCallback };
