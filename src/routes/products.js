const express = require('express');
const jwt = require('jsonwebtoken');

const config = require('../configs/config');
const verifyToken = require('../controller/verifyToken');
const mysqlConnection = require('../database');

const router = express.Router();

router.get('/', (req, res) => {
    sql = 'SELECT * FROM products WHERE deleted_at IS NULL';
    mysqlConnection.query(sql, (err, rows, fields) => {
        if(!err){
            res.json(rows);
        } else {
            res.json({'error': err.sqlMessage})
        }
    });
});

router.get('/all', (req, res) => {
    sql = 'SELECT * FROM products';
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
    sql = 'SELECT * FROM products WHERE id = ?';
    mysqlConnection.query(sql, [id], (err, row, fields) => {        
        if(!err){
            if(row.length == 1){
                res.json(row);
            } else {
                res.json({'message': 'Product not found!'});
            }
        } else {
            res.json({'error': err.sqlMessage});
        }
    });
});

router.post('/', (req, res) => {
    const { clients_id, name, description, price } = req.body;
    const currentDate = new Date(Date.now()).toString();
    
    const sql = 'INSERT INTO products (clients_id, name, description, price, created_at) VALUES (?, ?, ?, ?, ?)';
    if(clients_id != undefined && name != undefined && description != undefined && price != undefined){
        mysqlConnection.query(sql, [clients_id, name, description, price, currentDate], (err, row, fields) => {
            if(!err){
                res.json({'message': 'Product added successfull!'});
            } else {
                res.json({'error': err.sqlMessage});
            }
        });
    } else {
        res.json({'message': 'Product not added!'});
    }
});

router.put('/:id', (req, res) => {
    const id = req.params.id;
    const { clients_id, name, description, price } = req.body;
    const currentDate = new Date(Date.now());

    const sql = 'UPDATE products SET clients_id = ?, name = ?, description = ?, price = ?, updated_at = ? WHERE id = ?';

    if(clients_id != undefined && name != undefined && description != undefined && price != undefined){
        mysqlConnection.query(sql, [clients_id, name, description, price, currentDate, id], (err, row, fields) => {
            if(!err){
                if(row.changedRows == 1){
                    res.json({'message': 'Product updated successfull!'});
                } else {
                    res.json({'message': 'Product not found!'});
                }
            } else {
                res.json({'error': err.sqlMessage});
            }
        });
    } else {
        res.json({'message': 'Product not updated!'});
    }
});

router.delete('/:id', (req, res) => {
    const { id } = req.params;
    const currentDate = new Date(Date.now());
    sql = 'SELECT * FROM products WHERE id = ?';
    mysqlConnection.query(sql, [id], (err, row, fields) => {
        if(!err){
            if(row.length == 1){
                if(row[0].deleted_at == null){
                    mysqlConnection.query('UPDATE products SET deleted_at = ? WHERE id = ?', [currentDate, id], (err, row, fields) => {                     
                        if(!err){
                            res.json({'message': 'Product deleted successfull!'});
                        } else {
                            res.json({'error-2': err.sqlMessage});
                        }
                    });
                } else {
                    res.json({'message': 'The product is already deleted!'});
                }
            } else {
                res.json({'message': 'Product not found!'});
            }
        } else {
            res.json({'error-1': err.sqlMessage});
        }
    });
});

module.exports = router;