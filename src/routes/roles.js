const express = require('express');
const router = express.Router();

const mysqlConnection = require('../database');

router.get('/', (req, res) => {
    sql = 'SELECT * FROM roles WHERE deleted_at IS NULL';
    mysqlConnection.query(sql, (err, rows, fields) => {
        if(!err){
            res.json(rows);
        } else {
            res.json({'error': err.sqlMessage})
        }
    });
});

router.get('/all', (req, res) => {
    sql = 'SELECT * FROM roles';
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
    sql = 'SELECT * FROM roles WHERE id = ?';
    mysqlConnection.query(sql, [id], (err, row, fields) => {        
        if(!err){
            if(row.length == 1){
                res.json(row);
            } else {
                res.json({'message': 'Role not found!'});
            }
        } else {
            res.json({'error': err.sqlMessage});
        }
    });
});

router.post('/', (req, res) => {
    const { name, description } = req.body;
    const currentDate = new Date(Date.now());
    
    const sql = 'INSERT INTO roles (name, description, created_at) VALUES (?, ?, ?)';
    if(name != undefined  && description != undefined){
        mysqlConnection.query(sql, [name, description, currentDate], (err, row, fields) => {
            if(!err){
                res.json({'message': 'Role added successfull!'});
            } else {
                res.json({'error': err.sqlMessage});
            }
        });
    } else {
        res.json({'message': 'Role not added!'});
    }
});

router.put('/:id', (req, res) => {
    const id = req.params.id;
    const { name, description } = req.body;
    const currentDate = new Date(Date.now());

    const sql = 'UPDATE roles SET name = ?, description = ?, updated_at = ? WHERE id = ?';

    if(name != undefined && description != undefined){
        mysqlConnection.query(sql, [name, description, currentDate, id], (err, row, fields) => {
            if(!err){
                if(row.changedRows == 1){
                    res.json({'message': 'Role updated successfull!'});
                } else {
                    res.json({'message': 'Role not found!'});
                }
            } else {
                res.json({'error': err.sqlMessage});
            }
        });
    } else {
        res.json({'message': 'Role not updated!'});
    }
});

router.delete('/:id', (req, res) => {
    const { id } = req.params;
    const currentDate = new Date(Date.now());
    sql = 'SELECT * FROM roles WHERE id = ?';
    mysqlConnection.query(sql, [id], (err, row, fields) => {
        if(!err){
            if(row.length == 1){
                if(row[0].deleted_at == null){
                    mysqlConnection.query('UPDATE roles SET deleted_at = ? WHERE id = ?', [currentDate, id], (err, row, fields) => {                     
                        if(!err){
                            res.json({'message': 'Role deleted successfull!'});
                        } else {
                            res.json({'error-2': err.sqlMessage});
                        }
                    });
                } else {
                    res.json({'message': 'The role is already deleted!'});
                }
            } else {
                res.json({'message': 'Role not found!'});
            }
        } else {
            res.json({'error-1': err.sqlMessage});
        }
    });
});

module.exports = router;