-- creating candidates table
CREATE TABLE candidates (
    candidate_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255),
    age INT
);

-- Create usersreg table 
CREATE TABLE usersreg (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    fullName VARCHAR(255),
    dob VARCHAR(255),
    passportId VARCHAR(255) UNIQUE,
    email VARCHAR(255) UNIQUE,
    mobile VARCHAR(255) UNIQUE,
    password VARCHAR(255),
    residence VARCHAR(255)
);
-- creating adminusers table and inserting in some values
CREATE TABLE adminuser (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    admin_id VARCHAR(255),
    password VARCHAR(255)
);

INSERT INTO adminuser (admin_id, password) VALUES
('abdelmalek', 'shaba7gamed'),
('eyad', 'shaba7gamedawy'),
('sherif', 'shaba7gamedawyawy'),
('omar', 'shba7gamedawyawyawy');

-- Create votes table
CREATE TABLE votes (
    vote_id INT AUTO_INCREMENT PRIMARY KEY,
    passportId VARCHAR(255),
    candidate_id INT,
    FOREIGN KEY (candidate_id) REFERENCES candidates(candidate_id),
    FOREIGN KEY (passportId) REFERENCES usersreg(passportId)
);

-- Create vote_count table
CREATE TABLE vote_count (
    candidate_id INT PRIMARY KEY,
    name varchar(255),
    age int,
    vote_count INT DEFAULT 0,
    FOREIGN KEY (candidate_id) REFERENCES candidates(candidate_id)
);

-- creating a view called candidate_vote_counts
CREATE VIEW candidate_vote_counts AS
SELECT 
    c.candidate_id,
    c.name,
    c.age,
    COUNT(v.votes_id) AS vote_count
FROM 
    candidates c
LEFT JOIN 
    votes v ON c.candidate_id = v.candidate_id
GROUP BY 
    c.candidate_id, c.name, c.age;