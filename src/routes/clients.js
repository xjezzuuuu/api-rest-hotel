const express = require('express');
const jwt = require('jsonwebtoken');

const config = require('../configs/config');
const verifyToken = require('../controller/verifyToken');
const mysqlConnection = require('../database');

const router = express.Router();

router.get('/', (req, res) => {
    sql = 'SELECT * FROM clients WHERE deleted_at IS NULL';
    mysqlConnection.query(sql, (err, rows, fields) => {
        if(!err){
            res.json(rows);
        } else {
            res.json({'error': err.sqlMessage})
        }
    });
});

router.get('/all', (req, res) => {
    sql = 'SELECT * FROM clients';
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
    sql = 'SELECT * FROM clients WHERE id = ?';
    mysqlConnection.query(sql, [id], (err, row, fields) => {        
        if(!err){
            if(row.length == 1){
                res.json(row);
            } else {
                res.json({'message': 'Client not found!'});
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
    const { rooms_id, rut, first_name, last_name, email, city, region, nationality } = req.body;
    const currentDate = new Date(Date.now());    
    
    const sql = 'INSERT INTO clients (rooms_id, rut, first_name, last_name, email, address, city, region, nationality, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
    if(rooms_id != undefined && rut != undefined && first_name != undefined && last_name != undefined && email != undefined && address != undefined  && city != undefined && region != undefined && undefined != undefined){
        mysqlConnection.query(sql, [rooms_id, rut, first_name, last_name, email, addess, city, region, nationality, currentDate], (err, row, fields) => {
            if(!err){
                res.json({'message': 'Client added successfull!'});
            } else {
                res.json({'error': err.sqlMessage});
            }
        });
    } else {
        res.json({'message': 'Client not added!'});
    }
});

router.put('/:id', (req, res) => {
    const id = req.params.id;
    const { rooms_id, rut, first_name, last_name, email, city, region, nationality } = req.body;
    const currentDate = new Date(Date.now());

    const sql = 'UPDATE users SET rooms_id = ?, rut = ?, first_name = ?, last_name = ?, email = ?, address = ?, city = ?, region = ?, nationality = ?, updated_at = ? WHERE id = ?';

    if(rooms_id != undefined && rut != undefined && first_name != undefined && last_name != undefined && email != undefined && address != undefined  && city != undefined && region != undefined && undefined != undefined){
        mysqlConnection.query(sql, [rooms_id, rut, first_name, last_name, email, addess, city, region, nationality, currentDate, id], (err, row, fields) => {
            if(!err){
                if(row.changedRows == 1){
                    res.json({'message': 'Client updated successfull!'});
                } else {
                    res.json({'message': 'Client not found!'});
                }
            } else {
                res.json({'error': err.sqlMessage});
            }
        });
    } else {
        res.json({'message': 'Client not updated!'});
    }
});

router.delete('/:id', (req, res) => {
    const { id } = req.params;
    const currentDate = new Date(Date.now());
    sql = 'SELECT * FROM clients WHERE id = ?';
    mysqlConnection.query(sql, [id], (err, row, fields) => {
        if(!err){
            if(row.length == 1){
                if(row[0].deleted_at == null){
                    mysqlConnection.query('UPDATE clients SET deleted_at = ? WHERE id = ?', [currentDate, id], (err, row, fields) => {                     
                        if(!err){
                            res.json({'message': 'Client deleted successfull!'});
                        } else {
                            res.json({'error-2': err.sqlMessage});
                        }
                    });
                } else {
                    res.json({'message': 'The client is already deleted!'});
                }
            } else {
                res.json({'message': 'Client not found!'});
            }
        } else {
            res.json({'error-1': err.sqlMessage});
        }
    });
});

module.exports = router;