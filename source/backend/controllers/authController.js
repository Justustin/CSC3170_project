// backend/controllers/authController.js

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const supabase = require('../config/supabase');

// Register a new patron
exports.registerPatron = async (req, res) => {
    try {
        const { username, email, password, first_name, last_name, phone_number } = req.body;

        // Check if user already exists
        const { data: existingUser } = await supabase
            .from('users')
            .select('*')
            .or(`username.eq.${username},email.eq.${email}`)
            .single();

        if (existingUser) {
            return res.status(400).json({ error: 'Username or email already exists.' });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert new user
        const { data: newUser, error } = await supabase
            .from('users')
            .insert([{
                username,
                email,
                password_hash: hashedPassword,
                role: 'Patron',
                first_name,
                last_name,
                phone_number
            }])
            .select()
            .single();

        if (error) {
            console.error('Error registering patron:', error);
            return res.status(500).json({ error: 'Failed to register patron.' });
        }

        // Generate JWT token
        const token = jwt.sign(
            { user_id: newUser.user_id, username: newUser.username, role: newUser.role },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        // Remove password from response
        delete newUser.password_hash;

        res.status(201).json({
            message: 'Patron registered successfully.',
            token,
            user: newUser
        });
    } catch (err) {
        console.error('Register error:', err);
        res.status(500).json({ error: 'Internal server error.' });
    }
};

// Login
exports.login = async (req, res) => {
    try {
        const { username, password } = req.body;

        // Fetch user by username
        const { data: user, error } = await supabase
            .from('users')
            .select('*')
            .eq('username', username)
            .single();

        if (error || !user) {
            return res.status(401).json({ error: 'Invalid credentials.' });
        }

        // Compare password
        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid credentials.' });
        }

        // Generate JWT token
        const token = jwt.sign(
            { user_id: user.user_id, username: user.username, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        // Remove password from response
        delete user.password_hash;

        // Log the login
        await supabase.from('library_logs').insert([{
            user_id: user.user_id,
            action: 'LOGIN',
            description: `User ${user.username} logged in`
        }]);

        res.status(200).json({
            message: 'Login successful.',
            token,
            user
        });
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ error: 'Internal server error.' });
    }
};
