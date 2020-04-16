const express = require('express');
const router = express.Router();

const mysqlConnection = require('../database');

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
                res.json({'error': 'Error'});
            }
        } else {
            res.json({'error': err.sqlMessage});
        }
    });
});

router.post('/', (req, res) => {
    const { rut, first_name, last_name, email, password, role } = req.body;
    const currentDate = new Date(Date.now());
    
    const sql = 'INSERT INTO users (rut, first_name, last_name, email, password, role_id, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)';
    if(rut != undefined && first_name != undefined && last_name != undefined && email != undefined && password != undefined  && role != undefined ){
        mysqlConnection.query(sql, [rut, first_name, last_name, email, password, role, currentDate], (err, row, fields) => {
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

    const sql = 'UPDATE users SET rut = ?, first_name = ?, last_name = ?, email = ?, password = ?, role_id = ?, updated_at = ? WHERE id = ?';

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