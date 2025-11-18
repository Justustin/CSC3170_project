// Script to create a librarian account with proper password hash
const bcrypt = require('bcrypt');

const password = 'librarian123'; // Change this to your desired password
const saltRounds = 10;

bcrypt.hash(password, saltRounds, (err, hash) => {
  if (err) {
    console.error('Error hashing password:', err);
    return;
  }

  console.log('\n=== Librarian Account Setup ===');
  console.log('Username: librarian');
  console.log('Password:', password);
  console.log('Password Hash:', hash);
  console.log('\n=== SQL Query to Insert ===');
  console.log(`
INSERT INTO users (username, email, password_hash, role, first_name, last_name)
VALUES ('librarian', 'librarian@library.com', '${hash}', 'Librarian', 'Jane', 'Doe')
ON CONFLICT (username) DO UPDATE SET password_hash = '${hash}', role = 'Librarian';
  `);
  console.log('\nRun this SQL in your Supabase SQL Editor to create/update the librarian account.');
});
