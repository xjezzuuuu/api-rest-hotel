const express = require('express');
const jwt = require('jsonwebtoken');

const config = require('../configs/config');
const verifyToken = require('../controller/verifyToken');
const mysqlConnection = require('../database');

const router = express.Router();

router.get('/', (req, res) => {
    sql = 'SELECT * FROM users WHERE deleted_at IS NULL';
    mysqlConnection.query(sql, (err, rows, fields) => {
        if(!err){
            res.json(rows);
        } else {
            res.json({'error': err.sqlMessage})
        }
    });
});

router.get('/all', (req, res) => {
    sql = 'SELECT * FROM users';
    mysqlConnection.query(sql, (err, rows, fields) => {
        if(!err){
            res.json(rows);
        } else {
            res.json({'error': err.sqlMessage})
        }
    });
});

router.get('/:id', (req, res) => {
    const { id } = req.params;
    sql = 'SELECT * FROM users WHERE id = ?';
    mysqlConnection.query(sql, [id], (err, row, fields) => {        
        if(!err){
            if(row.length == 1){
                res.json(row);
            } else {
                res.json({'message': 'User not found!'});
            }
        } else {
            res.json({'error': err.sqlMessage});
        }
    });
});

router.get('/all/join', (req, res) => {
    sql = 'SELECT users.id, roles.name AS roles_name, users.rut, users.first_name, users.last_name, users.email, users.password FROM users INNER JOIN roles ON users.roles_id = roles.id WHERE users.deleted_at IS NULL';
    mysqlConnection.query(sql, (err, rows, fields) => {
        if(!err){
            res.json(rows);
        } else {
            res.json({'error': err.sqlMessage})
        }
    });
});

router.post('/', (req, res) => {
    const { rut, first_name, last_name, email, password, roles_id } = req.body;
    const getDate = new Date(Date.now()).getDate();
    const getMonth = new Date(Date.now()).getMonth();
    const getYear = new Date(Date.now()).getFullYear();
    const getHours = new Date(Date.now()).getHours();
    const getMin = new Date(Date.now()).getMinutes();
    const getSeconds = new Date(Date.now()).getSeconds();

    const currentDate = `${getYear}-0${getMonth+1}-${getDate} ${getHours}:${getMin}:${getSeconds}`;
    
    console.log(`${rut} ${first_name} ${last_name} ${email} ${password} ${roles_id} ${currentDate}`);
    
    
    const sql = 'INSERT INTO users (rut, first_name, last_name, email, password, roles_id, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)';
    if(rut != undefined && first_name != undefined && last_name != undefined && email != undefined && password != undefined  && roles_id != undefined ){
        mysqlConnection.query(sql, [rut, first_name, last_name, email, password, roles_id, currentDate], (err, row, fields) => {
            if(!err){
                res.json({'message': 'User added successfull!'});
            } else {
                res.json({'error': err.sqlMessage});
            }
        });
    } else {
        res.json({'message': 'User not added!'});
    }
});

router.put('/:id', (req, res) => {
    const id = req.params.id;
    const { rut, first_name, last_name, email, password, role } = req.body;
    const currentDate = new Date(Date.now());

    const sql = 'UPDATE users SET rut = ?, first_name = ?, last_name = ?, email = ?, password = ?, roles_id = ?, updated_at = ? WHERE id = ?';

    if(rut != undefined && first_name != undefined && last_name != undefined && email != undefined && password != undefined  && role != undefined ){
        mysqlConnection.query(sql, [rut, first_name, last_name, email, password, role, currentDate, id], (err, row, fields) => {
            if(!err){
                if(row.changedRows == 1){
                    res.json({'message': 'User updated successfull!'});
                } else {
                    res.json({'message': 'User not found!'});
                }
            } else {
                res.json({'error': err.sqlMessage});
            }
        });
    } else {
        res.json({'message': 'User not updated!'});
    }
});

router.delete('/:id', (req, res) => {
    const { id } = req.params;
    const currentDate = new Date(Date.now());
    sql = 'SELECT * FROM users WHERE id = ?';
    mysqlConnection.query(sql, [id], (err, row, fields) => {
        if(!err){
            if(row.length == 1){
                if(row[0].deleted_at == null){
                    mysqlConnection.query('UPDATE users SET deleted_at = ? WHERE id = ?', [currentDate, id], (err, row, fields) => {                     
                        if(!err){
                            res.json({'message': 'User deleted successfull!'});
                        } else {
                            res.json({'error-2': err.sqlMessage});
                        }
                    });
                } else {
                    res.json({'message': 'The user is already deleted!'});
                }
            } else {
                res.json({'message': 'User not found!'});
            }
        } else {
            res.json({'error-1': err.sqlMessage});
        }
    });
});

module.exports = router;