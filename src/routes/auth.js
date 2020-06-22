const express = require('express');
const jwt = require('jsonwebtoken');

const verifyToken = require('../controller/verifyToken');
const config = require('../configs/config');
const mysqlConnection = require('../database');

const router = express.Router();

router.post('/login', (req, res) => {
    const { email, password } = req.body;
    const sql = "SELECT * FROM users WHERE email = ?";    
    
    if(email == undefined || password == undefined){
        if(email == undefined){
            res.json({
                auth: false,
                message: "Email not found in body!"
            });
        } else if (password == undefined){
            res.json({
                auth: false,
                message: "Password not found in body!"
            });
        }   
    } else {
        mysqlConnection.query(sql, email, (err, row, fields) => {
            if(!err){
                if(row.length == 1){
                    if(password == row[0].password){
                        const user = {id: row[0].id};
                        const token = jwt.sign({user}, config.secretKey);
                        res.json({
                            auth: true,
                            token
                        });
                    } else {
                        res.json({
                            auth: false,
                            message: "Password incorrect!"
                        })
                    }
                } else {
                    res.json({'message': 'User not found!'});
                }
            } else {
                res.json({'error': err.sqlMessage});
            }
        });
    }    
});

module.exports = router;