const express = require('express');
const jwt = require('jsonwebtoken');

const config = require('../configs/config');
const verifyToken = require('../controller/verifyToken');
const mysqlConnection = require('../database');

const router = express.Router();

router.get('/', (req, res) => {
    sql = 'SELECT * FROM rooms WHERE deleted_at IS NULL';
    mysqlConnection.query(sql, (err, rows, fields) => {
        if(!err){
            res.json(rows);
        } else {
            res.json({'error': err.sqlMessage})
        }
    });
});

router.get('/all', (req, res) => {
    sql = 'SELECT * FROM rooms';
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
    sql = 'SELECT * FROM rooms WHERE id = ?';
    mysqlConnection.query(sql, [id], (err, row, fields) => {        
        if(!err){
            if(row.length == 1){
                res.json(row);
            } else {
                res.json({'message': 'Room not found!'});
            }
        } else {
            res.json({'error': err.sqlMessage});
        }
    });
});

router.get('/all/join', (req, res) => {
    sql = 'SELECT rooms.id, rooms.name AS rooms_name, rooms.description, status.name AS status_name, status.description AS status_description FROM rooms INNER JOIN status ON rooms.status_id = status.id WHERE rooms.deleted_at IS NULL';
    mysqlConnection.query(sql, (err, rows, fields) => {
        if(!err){
            res.json(rows);
        } else {
            res.json({'error': err.sqlMessage})
        }
    });
});

router.post('/', (req, res) => {
    const { status_id, name, description } = req.body;
    const currentDate = new Date(Date.now()).toString();
    
    console.log(`${currentDate}`);
    
    const sql = 'INSERT INTO room (status_id, name, description, created_at) VALUES (?, ?, ?, ?)';
    if(status_id != undefined && name != undefined && description != undefined){
        mysqlConnection.query(sql, [status_id, name, description, currentDate], (err, row, fields) => {
            if(!err){
                res.json({'message': 'Room added successfull!'});
            } else {
                res.json({'error': err.sqlMessage});
            }
        });
    } else {
        res.json({'message': 'Room not added!'});
    }
});

router.put('/:id', (req, res) => {
    const id = req.params.id;
    const { status_id, name, description } = req.body;
    const currentDate = new Date(Date.now());

    const sql = 'UPDATE rooms SET status_id = ?, name = ?, description = ?, updated_at = ? WHERE id = ?';

    if(status_id != undefined && name != undefined && description != undefined){
        mysqlConnection.query(sql, [status_id, name, description, currentDate, id], (err, row, fields) => {
            if(!err){
                if(row.changedRows == 1){
                    res.json({'message': 'Room updated successfull!'});
                } else {
                    res.json({'message': 'Room not found!'});
                }
            } else {
                res.json({'error': err.sqlMessage});
            }
        });
    } else {
        res.json({'message': 'Room not updated!'});
    }
});

router.delete('/:id', (req, res) => {
    const { id } = req.params;
    const currentDate = new Date(Date.now());
    sql = 'SELECT * FROM rooms WHERE id = ?';
    mysqlConnection.query(sql, [id], (err, row, fields) => {
        if(!err){
            if(row.length == 1){
                if(row[0].deleted_at == null){
                    mysqlConnection.query('UPDATE rooms SET deleted_at = ? WHERE id = ?', [currentDate, id], (err, row, fields) => {                     
                        if(!err){
                            res.json({'message': 'Room deleted successfull!'});
                        } else {
                            res.json({'error-2': err.sqlMessage});
                        }
                    });
                } else {
                    res.json({'message': 'The room is already deleted!'});
                }
            } else {
                res.json({'message': 'Room not found!'});
            }
        } else {
            res.json({'error-1': err.sqlMessage});
        }
    });
});

module.exports = router;