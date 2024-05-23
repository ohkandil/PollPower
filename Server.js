const express = require('express');
const mysql = require('mysql');
const bcrypt = require('bcrypt');
const bodyParser = require('body-parser');
const path = require('path');
const opn = require('opn');

const Server = express();
const SALT_ROUNDS = 10; // Define the cost factor for bcrypt

// Database connection
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'root123',
  database: 'pollpower'
});

// Connect to MySQL
db.connect((err) => {
  if (err) {
    console.error('MySQL connection error:', err);
    throw err;
  }
  console.log('MySQL connected');
});

// Middleware
Server.use(bodyParser.urlencoded({ extended: true }));
Server.use(bodyParser.json());
Server.use(express.static(path.join(__dirname, 'public')));

// Serve "Poll Power.html" as the serving point
Server.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'Poll Power.html'));
});

// Registration Route
Server.post('/register', (req, res) => {
  const { fullName, dob, passportId, email, mobile, password, residence } = req.body;

  if (!fullName || !dob || !passportId || !email || !mobile || !password || !residence) {
    return res.status(400).send('Please provide all required information');
  }

  // Hash the password
  bcrypt.hash(password, SALT_ROUNDS, (err, hashedPassword) => {
    if (err) {
      console.error('Error hashing password:', err);
      return res.status(500).send('Error hashing password');
    }

    // Insert user into database
    const sql = 'INSERT INTO usersreg (fullName, dob, passportId, email, mobile, password, residence) VALUES (?, ?, ?, ?, ?, ?, ?)';
    db.query(sql, [fullName, dob, passportId, email, mobile, hashedPassword, residence], (err, result) => {
      if (err) {
        console.error('Error inserting user into database:', err);
        return res.status(500).send('Error registering user');
      }

      console.log('User inserted with ID:', result.insertId);
      
      // Redirect to home page with a success query parameter
      res.redirect('/Rules.html?registered=success');
    });
  });
});

// Login Route
Server.post('/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).send('Please provide email and password');
  }

  // Retrieve user from database
  const sql = 'SELECT * FROM usersreg WHERE email = ?';
  db.query(sql, [email], (err, results) => {
    if (err) {
      console.error('Error querying database:', err);
      return res.status(500).send('Error querying database');
    }

    if (results.length === 0) {
      return res.status(400).send('User not found');
    }

    const user = results[0];

    // Compare provided password with hashed password
    bcrypt.compare(password, user.password, (err, isMatch) => {
      if (err) {
        console.error('Error comparing passwords:', err);
        return res.status(500).send('Error comparing passwords');
      }

      if (!isMatch) {
        return res.status(400).send('Incorrect password');
      }

      // Passwords match - Redirect to Rules.html
      res.redirect('/Rules.html');
    });
  });
});

// Admin Login Route
Server.post('/adminlogin', (req, res) => {
  const { admin_id, password } = req.body;

  if (!admin_id || !password) {
    return res.status(400).send('Please provide admin ID and password');
  }

  // Retrieve admin from database
  const sql = 'SELECT * FROM adminuser WHERE admin_id = ?';
  db.query(sql, [admin_id], (err, results) => {
    if (err) {
      console.error('Error querying database:', err);
      return res.status(500).send('Error querying database');
    }

    if (results.length === 0) {
      return res.status(400).send('Admin not found');
    }

    const admin = results[0];

    // Compare provided password with stored password
    if (password !== admin.password) {
      return res.status(400).send('Incorrect password');
    }

    // Passwords match - Redirect to Admin add and remove.html
    res.redirect('/Admin add and remove.html');
  });
});

const PORT = 3000;
Server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  
  // Open the default web browser automatically
  opn(`http://localhost:${PORT}`);
});

// Add candidate Route
Server.post('/Admin add and remove.html', (req, res) => {
  // Extract candidate details from request body
  const candidate = req.body;

  // Add the candidate to your data store
  // This will depend on how you're storing your data
  // For example, if you're using a database, you could do:
  const sql = 'INSERT INTO candidates (name, party) VALUES (?, ?)';
  db.query(sql, [candidate.name, candidate.party], (err, result) => {
    if (err) {
      console.error('Error inserting candidate into database:', err);
      return res.status(500).send('Error adding candidate');
    }

    console.log('Candidate added with ID:', result.insertId);

    // Send a response back to the client
    res.send('Candidate added successfully');
  });
});
