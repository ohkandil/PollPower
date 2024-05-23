create database pollpower;
use pollpower;

CREATE TABLE usersreg (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    fullName VARCHAR(255),
    dob VARCHAR(255),
    passportId vARCHAR(255),
    email VARCHAR(255),
    mobile varchar(255),
    password VARCHAR(255),
    residence varchar(255)

);

select * from usersreg;

CREATE TABLE adminuser (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    admin_id VARCHAR(255),
    password VARCHAR(255)
);
-- INSERT INTO adminuser (admin_id, password) VALUES
-- ('abdelmalek', 'shaba7gamed'),
-- ('eyad', 'shaba7gamedawy'),
-- ('sherif', 'shaba7gamedawyawy'),
-- ('omar', 'shba7gamedawyawyawy')

select * from adminuser;

CREATE TABLE candidates (
    candidate_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255),
    age INT
);

-- INSERT INTO candidates (name, age) VALUES
-- ('zyad hesham', 45),
-- ('Ana de armes', 54),
-- ('Lana del ray ', 38),
-- ('sukuna ', 60),
-- ('briar', 12),
-- ('Zoe',20000);

select * from candidates;

CREATE TABLE votes (
    vote_id INT AUTO_INCREMENT PRIMARY KEY,
    passportId VARCHAR(255),
    candidate_id INT,
    FOREIGN KEY (candidate_id) REFERENCES candidates(candidate_id),
    FOREIGN KEY (passportId) REFERENCES usersreg(passportId)
);

ALTER TABLE usersreg ADD INDEX (passportId);

CREATE TABLE vote_count (
    candidate_id INT PRIMARY KEY,
    
    vote_count INT DEFAULT 0,
    FOREIGN KEY (candidate_id) REFERENCES candidates(candidate_id)
);

-- Initialize vote_count table
INSERT INTO vote_count (candidate_id, vote_count)
SELECT candidate_id, 0 FROM candidates;

select * from vote_count;