const express = require('express');
const jwt = require('jsonwebtoken');

const config = require('../configs/config');
const verifyToken = require('../controller/verifyToken');
const mysqlConnection = require('../database');

const router = express.Router();

router.get('/', (req, res) => {
    sql = 'SELECT * FROM voucher WHERE deleted_at IS NULL';
    mysqlConnection.query(sql, (err, rows, fields) => {
        if(!err){
            res.json(rows);
        } else {
            res.json({'error': err.sqlMessage})
        }
    });
});

router.get('/all', (req, res) => {
    sql = 'SELECT * FROM voucher';
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
    sql = 'SELECT * FROM voucher WHERE id = ?';
    mysqlConnection.query(sql, [id], (err, row, fields) => {        
        if(!err){
            if(row.length == 1){
                res.json(row);
            } else {
                res.json({'message': 'Voucher not found!'});
            }
        } else {
            res.json({'error': err.sqlMessage});
        }
    });
});

router.post('/', (req, res) => {
    const { rooms_id, clients_id, products_id } = req.body;
    const currentDate = new Date(Date.now()).toString();
    
    const sql = 'INSERT INTO room (rooms_id, clients_id, products_id, created_at) VALUES (?, ?, ?, ?)';
    if(rooms_id != undefined && clients_id != undefined && products_id != undefined){
        mysqlConnection.query(sql, [rooms_id, clients_id, products_id, currentDate], (err, row, fields) => {
            if(!err){
                res.json({'message': 'Voucher added successfull!'});
            } else {
                res.json({'error': err.sqlMessage});
            }
        });
    } else {
        res.json({'message': 'Voucher not added!'});
    }
});

router.put('/:id', (req, res) => {
    const id = req.params.id;
    const { rooms_id, clients_id, products_id } = req.body;
    const currentDate = new Date(Date.now());

    const sql = 'UPDATE voucher SET rooms_id = ?, clients_id = ?, products_id = ?, updated_at = ? WHERE id = ?';

    if(rooms_id != undefined && clients_id != undefined && products_id != undefined){
        mysqlConnection.query(sql, [rooms_id, clients_id, products_id, currentDate, id], (err, row, fields) => {
            if(!err){
                if(row.changedRows == 1){
                    res.json({'message': 'Voucher updated successfull!'});
                } else {
                    res.json({'message': 'Voucher not found!'});
                }
            } else {
                res.json({'error': err.sqlMessage});
            }
        });
    } else {
        res.json({'message': 'Voucher not updated!'});
    }
});

router.delete('/:id', (req, res) => {
    const { id } = req.params;
    const currentDate = new Date(Date.now());

   const sql = 'SELECT * FROM voucher WHERE id = ?';

    mysqlConnection.query(sql, [id], (err, row, fields) => {
        if(!err){
            if(row.length == 1){
                if(row[0].deleted_at == null){
                    mysqlConnection.query('UPDATE voucher SET deleted_at = ? WHERE id = ?', [currentDate, id], (err, row, fields) => {                     
                        if(!err){
                            res.json({'message': 'Voucher deleted successfull!'});
                        } else {
                            res.json({'error-2': err.sqlMessage});
                        }
                    });
                } else {
                    res.json({'message': 'The voucher is already deleted!'});
                }
            } else {
                res.json({'message': 'Voucher not found!'});
            }
        } else {
            res.json({'error-1': err.sqlMessage});
        }
    });
});

module.exports = router;