const mysql = require("mysql");

const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "user_db"
});

db.connect(err => {
    if (err) {
        console.error("❌ MySQL Connection Error:", err);
        return;
    }
    console.log("MySQL Connected...");
});

module.exports = db;
