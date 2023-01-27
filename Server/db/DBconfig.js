const mysql = require('mysql2');

const pool = mysql.createPool({
    connectionLimit: 10,
    user: process.env.DB_USER_NAME || 'Flak',
    password: process.env.DB_PASSWORD || 'BadLuck',
    database: process.env.DB_NAME || 'InventoryManagementSystem', 
    port: process.env.DB_PORT || '3306'
});

module.exports = pool;