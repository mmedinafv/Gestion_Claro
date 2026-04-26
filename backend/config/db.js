const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME || 'gestion_instalaciones',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

console.log('✅ Pool MySQL listo - Claro Honduras');

module.exports = pool;