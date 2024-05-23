const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql2');

const app = express();

// Middleware to parse request bodies
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Create a connection to the database
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root', // replace with your database username
    password: 'root123', // replace with your database password
    database: 'pollpower' // replace with your database name
});

db.connect(err => {
    if (err) {
        console.error('Error connecting to the database:', err);
        return;
    }
    console.log('Connected to the database');
});

// Route to handle registration form submission
app.post('/register', (req, res) => {
    const { fullName, dob, id, email, mobile, password, residence } = req.body;

    const query = 'INSERT INTO users (fullName, dob, passportId, email, mobile, password, residence) VALUES (?, ?, ?, ?, ?, ?, ?)';
    const values = [fullName, dob, id, email, mobile, password, residence];

    db.query(query, values, (err, results) => {
        if (err) {
            console.error('Error inserting data into the database:', err);
            res.status(500).send('Server error');
            return;
        }
        res.send('Registration form submitted successfully');
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

