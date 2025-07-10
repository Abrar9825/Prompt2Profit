// we are using middleware to verify jwt token
const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1]; // here it fetches token from -> authorization : <token>
    if (!token) {
       // window.location.href = "/index.html";
       return res.status(401).json({ message: 'No token provided' });
    }

jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) return res.status(403).json({ message: 'Invalid token' });
        req.user = decoded;     // decoded would have info that we provided in jwt.sign ie id,name,email,role etc
        next();
    });
};

module.exports = verifyToken;