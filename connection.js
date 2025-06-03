require('dotenv').config();

const { json } = require('express');
const mysql = require('mysql2');

const connection = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE
})

connection.connect((err) => {
    if (err) {
        console.log('There was an error connecting to the database!', err);
        return;
    }
    console.log('Connection to the database established!');
});

module.exports = connection;