const mysql = require("mysql");

const connection = mysql.createConnection({
    host:process.env.DB_HOST,
    user:process.env.DB_USER,
    password:process.env.DB_PASSWORD,
    database:process.env.DATABASE
});

console.log(process.env.DB_USER);

connection.connect();

module.exports = {
    db:connection
}