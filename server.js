// for program run server: node server.js

const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const bcrypt = require("bcryptjs");
const session = require("express-session");  // ✅ Import session
const db = require("./db");
const path = require("path");
const moment = require("moment-timezone");
const mysql = require("mysql");

const app = express(); // ✅ Define `app` FIRST

// ✅ Now configure `express-session`
app.use(session({
    secret: "secretkey",
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }  // Set to true if using HTTPS
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(bodyParser.json());
app.use(express.static("public"));
// 🏠 Default Page (Homepage)
app.get("/", (req, res) => {
    res.sendFile(__dirname + "/public/home.html");
});
app.get("/payment", (req, res) => {
    res.sendFile(__dirname + "/public/payment.html");
});

// 📝 Registration Page
app.get("/register", (req, res) => {
    res.sendFile(__dirname + "/public/register.html");
});

// 🔑 Login Page
app.get("/login", (req, res) => {
    res.sendFile(__dirname + "/public/index.html");
});

// 🛠 Admin Panel (Only for Admins)
app.get("/admin", (req, res) => {
    if (!req.session.adminId) {
        return res.redirect("/login");  // Redirect to login if not logged in
    }
    res.sendFile(__dirname + "/public/admin_login.html");
});



app.post("/register", async (req, res) => {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        return res.json({ message: "All fields are required!" });
    }

    // Check if email already exists
    const checkEmailQuery = "SELECT * FROM users WHERE email = ?";
    db.query(checkEmailQuery, [email], async (err, results) => {
        if (err) {
            console.error("❌ MySQL Error:", err);
            return res.json({ message: "Database error. Try again later." });
        }

        if (results.length > 0) {
            return res.json({ message: "❌ Email already registered! Use another email." });
        }

        // ✅ Hash the password before storing it
        const hashedPassword = await bcrypt.hash(password, 10); // 10 = salt rounds

        // ✅ Insert new user with hashed password
        const insertQuery = "INSERT INTO users (name, email, password) VALUES (?, ?, ?)";
        db.query(insertQuery, [name, email, hashedPassword], (err, result) => {
            if (err) {
                console.error("❌ MySQL Insert Error:", err);
                return res.json({ message: "Error registering user" });
            }
            res.json({ message: "✅ Registration successful! You can now log in." });
        });
    });
});

app.post("/login", (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.json({ message: "All fields are required!" });
    }

    // ✅ Check if the user exists
    const checkUserQuery = "SELECT * FROM users WHERE email = ?";
    db.query(checkUserQuery, [email], async (err, results) => {
        if (err) {
            console.error("❌ MySQL Error:", err);
            return res.json({ message: "Database error. Try again later." });
        }

        if (results.length === 0) {
            return res.json({ message: "❌ don't have an account!" });
        }

        const user = results[0];

        // ✅ Compare hashed password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.json({ message: "❌ Invalid credentials!" });
        }

        // ✅ Login successful
        res.json({ message: "✅ Login successful!", user: { id: user.id, name: user.name } });
    });
});



//  Handle visitor form submission (linked to a user)
app.post("/submit-visitor", (req, res) => {
    const { userId, name, email, message } = req.body;
    console.log("Received Data:", req.body);
    if (!userId || !name || !email || !message) {
        return res.json({ message: "All fields are required!" });
    }
    const visitDateTime = moment().tz("Asia/Kolkata").format("YYYY-MM-DD HH:mm:ss");

    const sql = "INSERT INTO visitors (user_id, name, email, message, visit_datetime) VALUES (?, ?, ?, ?, ?)";
    db.query(sql, [userId, name, email, message, visitDateTime], (err, result) => {
        if (err) {
            console.error("MySQL Error:", err);
            return res.json({ message: "Error saving visitor data" });
        }
        console.log("Visitor Saved:", result);
        res.json({ message: "Thank you for your message!" });
    });
});

// ✅ Fetch users for dropdown menu
app.get("/get-users", (req, res) => {
    const sql = "SELECT * FROM users";
    db.query(sql, (err, results) => {
        if (err) {
            console.error("MySQL Error:", err);
            return res.status(500).json({ message: "Error fetching users" });
        }
        res.json(results);
    });
});




// Fetch Users for Dropdown
app.get("/users", (req, res) => {
    const query = "SELECT id, name, email, status FROM users";
    db.query(query, (err, results) => {
        if (err) {
            return res.status(500).json({ message: "Database Error", error: err });
        }
        res.json(results);
    });
});

// Insert Payment into Database
app.post("/payments", (req, res) => {
    const { userId, amount, paymentMethod } = req.body;

    if (!userId || !amount || !paymentMethod) {
        return res.status(400).json({ message: "All fields are required!" });
    }

    const query = "INSERT INTO payments (user_id, amount, payment_method) VALUES (?, ?, ?)";
    db.query(query, [userId, amount, paymentMethod], (err, result) => {
        if (err) {
            return res.status(500).json({ message: "Payment Failed", error: err });
        }
        res.json({ message: "Payment Successful!", paymentId: result.insertId });
    });
});

//fetch data from payments table
app.get("/payments", (req, res) => {
    const query = "SELECT * FROM payments ORDER BY created_at DESC";

    db.query(query, (err, results) => {
        if (err) {
            return res.status(500).json({ message: "Database Error", error: err });
        }
        res.json(results);  // ✅ Send JSON response
    });
});


// Fetch Visitor Data from MySQL
app.get("/visitors", (req, res) => {
    const query = "SELECT * FROM visitors ORDER BY id DESC";

    db.query(query, (err, results) => {
        if (err) {
            return res.status(500).json({ message: "Database Error", error: err });
        }
        res.json(results); // ✅ Send visitor data as JSON
    });
});


app.put("/users/:id/status", (req, res) => {
    const userId = req.params.id;
    const { status } = req.body;

    const query = "UPDATE users SET status = ? WHERE id = ?";
    db.query(query, [status, userId], (err, result) => {
        if (err) {
            console.error("Error updating status:", err);
            return res.status(500).json({ message: "Error updating user status" });
        }

        res.json({ message: `User ${userId} status updated to ${status}` });
    });
});
app.delete("/users/:id", (req, res) => {
    const userId = req.params.id;

    const query = "DELETE FROM users WHERE id = ?";
    db.query(query, [userId], (err, result) => {
        if (err) {
            console.error("Error deleting user:", err);
            return res.status(500).json({ message: "Error deleting user" });
        }

        res.json({ message: `User ${userId} deleted successfully` });
    });
});

// API to store announcement
app.post("/announcement", (req, res) => {
    const { message } = req.body;
    
    if (!message) {
        return res.status(400).json({ message: "Message is required" });
    }

    const query = "INSERT INTO announcements (message) VALUES (?)";
    db.query(query, [message], (err, result) => {
        if (err) {
            console.error("Database Insertion Error:", err);
            return res.status(500).json({ message: "Database Error", error: err });
        }

        res.json({ message: "Announcement posted successfully!" });
    });
});

app.post("/admin/register", async (req, res) => {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({ message: "All fields are required", success: false });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const query = "INSERT INTO admins (name, email, password) VALUES (?, ?, ?)";
    db.query(query, [name, email, hashedPassword], (err, result) => {
        if (err) {
            console.error("Database Error:", err);
            return res.status(500).json({ message: "Database Error", success: false });
        }
        res.json({ message: "Admin registered successfully!", success: true });
    });
});

// ✅ Admin Login Route
app.post("/admin/login", (req, res) => {
    const { email, password } = req.body;

    const query = "SELECT * FROM admins WHERE email = ?";
    db.query(query, [email], async (err, results) => {
        if (err) {
            console.error("Database Error:", err);
            return res.status(500).json({ message: "Database Error", success: false });
        }

        if (results.length === 0) {
            return res.status(400).json({ message: "Invalid credentials", success: false });
        }

        const admin = results[0];
        const isPasswordMatch = await bcrypt.compare(password, admin.password);

        if (!isPasswordMatch) {
            return res.status(400).json({ message: "Invalid credentials", success: false });
        }

        req.session.adminId = admin.id;  
        res.json({ message: "Login successful!", success: true });
    });
});
app.get("/announcements", (req, res) => {
    const query = "SELECT * FROM announcements ORDER BY id DESC"; // Fetch latest first

    db.query(query, (err, results) => {
        if (err) {
            console.error("Database Error:", err);
            return res.status(500).json({ message: "Database Error", error: err });
        }
        res.json(results);
    });
});

app.listen(3000, () => console.log("Server running on port http://localhost:3000/home.html"));
