-- DO NOT SHARE WITH PARTICIPANTS

-- Use this file to initialize the SQL database
CREATE DATABASE IF NOT EXISTS ctfdb;
USE ctfdb;

CREATE TABLE IF NOT EXISTS feedback (
    id INT AUTO_INCREMENT PRIMARY KEY,
    joke_id TEXT NOT NULL,
    feedback TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS admin (
    id INT AUTO_INCREMENT PRIMARY KEY,
    token TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS flag (
    id INT AUTO_INCREMENT PRIMARY KEY,
    flag VARCHAR(255) NOT NULL UNIQUE
);
INSERT INTO flag (flag) VALUES ('hackpackCTF{7h15_ch4ll3n63_15_4_b4d_j0k3}');

-- Revoke all permissions for ctf user - https://mariadb.com/kb/en/revoke/
REVOKE ALL PRIVILEGES, GRANT OPTION FROM 'ctf'@'%';
-- To ensure they cannot drop the entire DB :)
GRANT CREATE, INSERT, UPDATE, SELECT ON ctfdb.feedback TO 'ctf'@'%';
GRANT CREATE, INSERT, UPDATE, SELECT ON ctfdb.admin TO 'ctf'@'%';
GRANT SELECT ON ctfdb.flag TO 'ctf'@'%';
-- Apply the changes
FLUSH PRIVILEGES;
