const mysql = require('promise-mysql');
//var connection;

module.exports = {
    "connection": mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: 'password', // Obviously not in production
        database: 'zoo_species'
    })
};
