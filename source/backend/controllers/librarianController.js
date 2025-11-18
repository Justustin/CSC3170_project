// backend/controllers/librarianController.js

const supabase = require('../config/supabase');
const bcrypt = require('bcrypt');

// Add New Resource
exports.addResource = async (req, res) => {
    try {
        const { title, author, isbn, resource_type, total_copies, available_copies, genre, publication_year, publisher, description } = req.body;

        if (!title || !author || !resource_type) {
            return res.status(400).json({ error: 'Please enter all required fields.' });
        }

        const { data, error } = await supabase
            .from('resources')
            .insert([{
                title,
                author,
                isbn,
                resource_type,
                total_copies: total_copies || 1,
                available_copies: available_copies || total_copies || 1,
                genre,
                publication_year,
                publisher,
                description
            }])
            .select()
            .single();

        if (error) {
            console.error('Error adding resource:', error);
            return res.status(500).json({ error: 'Failed to add resource.' });
        }

        res.status(201).json({ message: 'Resource added successfully.', resource: data });
    } catch (err) {
        console.error('Add resource error:', err);
        res.status(500).json({ error: 'Internal server error.' });
    }
};

// Update Resource
exports.updateResource = async (req, res) => {
    try {
        const resourceId = req.params.id;
        const { title, author, isbn, resource_type, total_copies, available_copies, genre, publication_year, publisher, description } = req.body;

        const { error } = await supabase
            .from('resources')
            .update({
                title,
                author,
                isbn,
                resource_type,
                total_copies,
                available_copies,
                genre,
                publication_year,
                publisher,
                description
            })
            .eq('resource_id', resourceId);

        if (error) {
            console.error('Error updating resource:', error);
            return res.status(500).json({ error: 'Failed to update resource.' });
        }

        res.json({ message: 'Resource updated successfully.' });
    } catch (err) {
        console.error('Update resource error:', err);
        res.status(500).json({ error: 'Internal server error.' });
    }
};

// Edit Resource
exports.editResource = async (req, res) => {
    try {
        const resourceId = req.params.id;
        const { title, author, isbn, resource_type, total_copies, available_copies, genre, publication_year, publisher, description } = req.body;

        // Validation
        if (!title || !author || !resource_type) {
            return res.status(400).json({ error: 'Please enter all required fields.' });
        }

        if (isNaN(total_copies) || total_copies < 0 || isNaN(available_copies) || available_copies < 0) {
            return res.status(400).json({ error: 'Copies must be positive integers.' });
        }

        if (available_copies > total_copies) {
            return res.status(400).json({ error: 'Available copies cannot exceed total copies.' });
        }

        const { data, error } = await supabase
            .from('resources')
            .update({
                title,
                author,
                isbn,
                resource_type,
                total_copies,
                available_copies,
                genre,
                publication_year,
                publisher,
                description
            })
            .eq('resource_id', resourceId)
            .select();

        if (error) {
            console.error('Error editing resource:', error);
            if (error.code === '23505') { // PostgreSQL unique violation
                return res.status(400).json({ error: 'A resource with this ISBN already exists.' });
            }
            return res.status(500).json({ error: 'Failed to edit resource.' });
        }

        if (!data || data.length === 0) {
            return res.status(404).json({ error: 'Resource not found.' });
        }

        res.json({ message: 'Resource updated successfully.' });
    } catch (err) {
        console.error('Edit resource error:', err);
        res.status(500).json({ error: 'Internal server error.' });
    }
};

// Delete Resource
exports.deleteResource = async (req, res) => {
    try {
        const resourceId = req.params.id;

        const { error } = await supabase
            .from('resources')
            .delete()
            .eq('resource_id', resourceId);

        if (error) {
            console.error('Error deleting resource:', error);
            return res.status(500).json({ error: 'Failed to delete resource.' });
        }

        res.json({ message: 'Resource deleted successfully.' });
    } catch (err) {
        console.error('Delete resource error:', err);
        res.status(500).json({ error: 'Internal server error.' });
    }
};

// Get Resources
exports.getResources = async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('resources')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching resources:', error);
            return res.status(500).json({ error: 'Failed to fetch resources.' });
        }

        res.json(data || []);
    } catch (err) {
        console.error('Get resources error:', err);
        res.status(500).json({ error: 'Internal server error.' });
    }
};

// Manage Borrowing
exports.manageBorrowing = async (req, res) => {
    try {
        const borrowingId = req.params.id;
        const { status, due_date } = req.body;

        const { error } = await supabase
            .from('borrowings')
            .update({ status, due_date })
            .eq('borrowing_id', borrowingId);

        if (error) {
            console.error('Error managing borrowing:', error);
            return res.status(500).json({ error: 'Failed to update borrowing status.' });
        }

        res.json({ message: 'Borrowing status updated successfully.' });
    } catch (err) {
        console.error('Manage borrowing error:', err);
        res.status(500).json({ error: 'Internal server error.' });
    }
};

// Track Inventory
exports.trackInventory = async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('resources')
            .select('resource_id, title, resource_type, total_copies, available_copies');

        if (error) {
            console.error('Error tracking inventory:', error);
            return res.status(500).json({ error: 'Failed to track inventory.' });
        }

        res.json(data || []);
    } catch (err) {
        console.error('Track inventory error:', err);
        res.status(500).json({ error: 'Internal server error.' });
    }
};

// Handle Reservations
exports.handleReservation = async (req, res) => {
    try {
        const reservationId = req.params.id;
        const { status } = req.body;

        const { error } = await supabase
            .from('reservations')
            .update({ status })
            .eq('reservation_id', reservationId);

        if (error) {
            console.error('Error handling reservation:', error);
            return res.status(500).json({ error: 'Failed to update reservation status.' });
        }

        res.json({ message: 'Reservation status updated successfully.' });
    } catch (err) {
        console.error('Handle reservation error:', err);
        res.status(500).json({ error: 'Internal server error.' });
    }
};

// Generate Reports
exports.generateReports = async (req, res) => {
    try {
        // Get total resources
        const { count: totalResources } = await supabase
            .from('resources')
            .select('*', { count: 'exact', head: true });

        // Get total borrowings
        const { count: totalBorrowings } = await supabase
            .from('borrowings')
            .select('*', { count: 'exact', head: true });

        // Get active borrowings
        const { count: activeBorrowings } = await supabase
            .from('borrowings')
            .select('*', { count: 'exact', head: true })
            .eq('status', 'Active');

        // Get overdue borrowings
        const today = new Date().toISOString().split('T')[0];
        const { count: overdueBorrowings } = await supabase
            .from('borrowings')
            .select('*', { count: 'exact', head: true })
            .eq('status', 'Active')
            .lt('due_date', today);

        // Get total users
        const { count: totalUsers } = await supabase
            .from('users')
            .select('*', { count: 'exact', head: true });

        // Get popular resources
        const { data: popularResources } = await supabase
            .from('borrowings')
            .select('resource_id, resources(*)')
            .eq('status', 'Active')
            .limit(10);

        res.json({
            total_resources: totalResources || 0,
            total_borrowings: totalBorrowings || 0,
            active_borrowings: activeBorrowings || 0,
            overdue_borrowings: overdueBorrowings || 0,
            total_users: totalUsers || 0,
            popular_resources: popularResources || []
        });
    } catch (err) {
        console.error('Generate reports error:', err);
        res.status(500).json({ error: 'Internal server error.' });
    }
};

// Send Notification
exports.sendNotification = async (req, res) => {
    try {
        const { user_id, message } = req.body;

        if (!user_id || !message) {
            return res.status(400).json({ error: 'Please provide user_id and message.' });
        }

        const { data, error } = await supabase
            .from('notifications')
            .insert([{
                user_id,
                message,
                is_read: false
            }])
            .select()
            .single();

        if (error) {
            console.error('Error sending notification:', error);
            return res.status(500).json({ error: 'Failed to send notification.' });
        }

        res.status(201).json({ message: 'Notification sent successfully.', notification: data });
    } catch (err) {
        console.error('Send notification error:', err);
        res.status(500).json({ error: 'Internal server error.' });
    }
};

// Get All Users
exports.getAllUsers = async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('users')
            .select('user_id, username, email, first_name, last_name, role, phone_number, created_at, updated_at')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching users:', error);
            return res.status(500).json({ error: 'Failed to fetch users.' });
        }

        res.json(data || []);
    } catch (err) {
        console.error('Get all users error:', err);
        res.status(500).json({ error: 'Internal server error.' });
    }
};

// Create New User
exports.createUser = async (req, res) => {
    try {
        const { username, email, password, first_name, last_name, role, phone_number } = req.body;

        if (!username || !email || !password || !first_name || !last_name || !role) {
            return res.status(400).json({ error: 'Please enter all required fields.' });
        }

        const validRoles = ['Librarian', 'Patron'];
        if (!validRoles.includes(role)) {
            return res.status(400).json({ error: `Role must be one of: ${validRoles.join(', ')}.` });
        }

        // Check if email already exists
        const { data: existingUser } = await supabase
            .from('users')
            .select('*')
            .or(`username.eq.${username},email.eq.${email}`)
            .single();

        if (existingUser) {
            return res.status(400).json({ error: 'A user with this username or email already exists.' });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert new user
        const { data, error } = await supabase
            .from('users')
            .insert([{
                username,
                email,
                password_hash: hashedPassword,
                first_name,
                last_name,
                role,
                phone_number
            }])
            .select()
            .single();

        if (error) {
            console.error('Error creating user:', error);
            return res.status(500).json({ error: 'Failed to create user.' });
        }

        res.status(201).json({ message: 'User account created successfully.', user: data });
    } catch (err) {
        console.error('Create user error:', err);
        res.status(500).json({ error: 'Internal server error.' });
    }
};

// Manage (Update) User Accounts
exports.manageUser = async (req, res) => {
    try {
        const userId = req.params.id;
        const { username, email, password, first_name, last_name, role, phone_number } = req.body;

        if (!username || !email || !first_name || !last_name || !role) {
            return res.status(400).json({ error: 'Please enter all required fields.' });
        }

        const validRoles = ['Librarian', 'Patron'];
        if (!validRoles.includes(role)) {
            return res.status(400).json({ error: `Role must be one of: ${validRoles.join(', ')}.` });
        }

        const updateData = {
            username,
            email,
            first_name,
            last_name,
            role,
            phone_number
        };

        // If password is provided, hash it
        if (password) {
            const hashedPassword = await bcrypt.hash(password, 10);
            updateData.password_hash = hashedPassword;
        }

        const { data, error } = await supabase
            .from('users')
            .update(updateData)
            .eq('user_id', userId)
            .select();

        if (error) {
            console.error('Error managing user:', error);
            return res.status(500).json({ error: 'Failed to update user.' });
        }

        if (!data || data.length === 0) {
            return res.status(404).json({ error: 'User not found.' });
        }

        res.json({ message: 'User account updated successfully.' });
    } catch (err) {
        console.error('Manage user error:', err);
        res.status(500).json({ error: 'Internal server error.' });
    }
};

// Delete User Account
exports.deleteUser = async (req, res) => {
    try {
        const userId = req.params.id;

        const { error } = await supabase
            .from('users')
            .delete()
            .eq('user_id', userId);

        if (error) {
            console.error('Error deleting user:', error);
            return res.status(500).json({ error: 'Failed to delete user.' });
        }

        res.json({ message: 'User account deleted successfully.' });
    } catch (err) {
        console.error('Delete user error:', err);
        res.status(500).json({ error: 'Internal server error.' });
    }
};
