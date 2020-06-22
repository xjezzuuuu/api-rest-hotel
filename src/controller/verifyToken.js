const jwt = require('jsonwebtoken');
const config = require('../configs/config');

function verifyToken(req, res, next){
    const token = req.headers['access-token'];

    if(typeof token !== 'undefined'){
        jwt.verify(token, config.secretKey, (err, decoded) => {      
            if (err) {
                res.json({ message: 'Token invalid' });    
            } else {
                req.decoded = decoded;    
                next();
            }
        });
    } else {
        res.json({ message: 'Token not found!' });  
    }
};

module.exports = verifyToken;