const express = require('express');
const mysql = require('mysql');
const bcrypt = require('bcrypt');
const bodyParser = require('body-parser');
const path = require('path');
const opn = require('opn');
const Server = express();
const SALT_ROUNDS = 10;

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

// Serve Voting Panel
Server.get('/voting-panel', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'Voting panel.html'));
});

// Get Candidates
Server.get('/candidates', (req, res) => {
  const sql = `
    SELECT candidates.candidate_id, candidates.name, candidates.age, vote_count.vote_count
    FROM candidates
    LEFT JOIN vote_count ON candidates.candidate_id = vote_count.candidate_id
  `;
  db.query(sql, (err, results) => {
    if (err) {
      console.error('Error fetching candidates:', err);
      return res.status(500).send('Error fetching candidates');
    }
    res.json(results);
  });
});

// Add Candidate
Server.post('/add-candidate', (req, res) => {
  const { name, age } = req.body;
  const sql = 'INSERT INTO candidates (name, age) VALUES (?, ?)';
  db.query(sql, [name, age], (err, result) => {
    if (err) {
      console.error('Error adding candidate:', err);
      return res.status(500).send('Error adding candidate');
    }
    const newCandidate = { candidate_id: result.insertId, name, age };
    res.json(newCandidate);
  });
});

// Remove Candidate
Server.delete('/remove-candidate/:id', (req, res) => {
  const { id } = req.params;
  const sql = 'DELETE FROM candidates WHERE candidate_id = ?';
  db.query(sql, [id], (err, result) => {
    if (err) {
      console.error('Error removing candidate:', err);
      return res.status(500).send('Error removing candidate');
    }
    if (result.affectedRows === 0) {
      return res.status(404).send('Candidate not found');
    }
    res.sendStatus(204);
  });
});

// Submit Vote
Server.post('/submit-vote', (req, res) => {
  const { passportId, candidate_id, confirm } = req.body;

  if (!passportId || !candidate_id || !confirm) {
    return res.status(400).send('Please provide all required information');
  }

  // Check if the user has already voted
  const checkVoteSql = 'SELECT * FROM votes WHERE passportId = ?';
  db.query(checkVoteSql, [passportId], (err, results) => {
    if (err) {
      console.error('Error checking existing vote:', err);
      return res.status(500).send('Error checking existing vote');
    }

    if (results.length > 0) {
      return res.status(400).send('User has already voted');
    }

    // Insert vote into votes table
    const sql = 'INSERT INTO votes (passportId, candidate_id) VALUES (?, ?)';
    db.query(sql, [passportId, candidate_id], (err, result) => {
      if (err) {
        console.error('Error inserting vote into database:', err);
        return res.status(500).send('Error submitting vote');
      }

      // Update vote count
      const updateVoteCountSql = 'UPDATE vote_count SET vote_count = vote_count + 1 WHERE candidate_id = ?';
      db.query(updateVoteCountSql, [candidate_id], (err, updateResult) => {
        if (err) {
          console.error('Error updating vote count:', err);
          return res.status(500).send('Error updating vote count');
        }

        console.log('Vote submitted and vote count updated');
        res.redirect('/Rules.html');
      });
    });
  });
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

    // Passwords match - Redirect to Voting panel
    res.redirect('/Voting panel.html');
  });
});

// Start the server
const PORT = 3000;
Server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  opn(`http://localhost:${PORT}`);
});
