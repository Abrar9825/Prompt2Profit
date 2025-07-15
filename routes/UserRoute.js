const express=require('express');

const router=express.Router();

const {login, signup, googleCallback, githubCallback}=require('../controllers/UserController');

router.post('/login',login);
router.post('/signup',signup);


//Github Routes
router.get('/github', (req, res) => {
  const clientId = process.env.GITHUB_CLIENT_ID;
  const callback = 'http://localhost:3000/auth/github/callback';

  const uri = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${callback}&scope=user:email`;
  res.redirect(uri);
});
router.get('/auth/github/callback', githubCallback);

//Google Routes
router.get('/google', (req, res) => {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const callback = 'http://localhost:3000/auth/google/callback';

  const uri = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(callback)}&response_type=code&scope=profile%20email&access_type=offline&prompt=consent`;
  res.redirect(uri);
});
router.get('/auth/google/callback', googleCallback);

module.exports=router;