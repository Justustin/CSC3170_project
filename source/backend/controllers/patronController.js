// backend/controllers/patronController.js

const supabase = require('../config/supabase');
const bcrypt = require('bcrypt');
const dayjs = require('dayjs');

// Search Catalog
exports.searchCatalog = async (req, res) => {
    try {
        const { query, type, genre, author } = req.query;

        let supabaseQuery = supabase.from('resources').select('*');

        // Apply filters
        if (query) {
            supabaseQuery = supabaseQuery.or(`title.ilike.%${query}%,author.ilike.%${query}%,isbn.ilike.%${query}%`);
        }
        if (type && type !== 'All') {
            supabaseQuery = supabaseQuery.eq('resource_type', type);
        }
        if (genre) {
            supabaseQuery = supabaseQuery.eq('genre', genre);
        }
        if (author) {
            supabaseQuery = supabaseQuery.ilike('author', `%${author}%`);
        }

        const { data, error } = await supabaseQuery;

        if (error) {
            console.error('Error searching catalog:', error);
            return res.status(500).json({ error: 'Failed to search catalog.' });
        }

        res.json(data || []);
    } catch (err) {
        console.error('Search catalog error:', err);
        res.status(500).json({ error: 'Internal server error.' });
    }
};

// Borrow Resource
exports.borrowResource = async (req, res) => {
    try {
        const { resource_id } = req.body;
        const user_id = req.user.user_id;

        // Check if resource exists and is available
        const { data: resource, error: resourceError } = await supabase
            .from('resources')
            .select('*')
            .eq('resource_id', resource_id)
            .single();

        if (resourceError || !resource) {
            return res.status(404).json({ error: 'Resource not found.' });
        }

        if (resource.available_copies < 1) {
            return res.status(400).json({ error: 'No available copies for this resource.' });
        }

        // Create borrowing record
        const borrow_date = new Date().toISOString().split('T')[0];
        const due_date = new Date();
        due_date.setDate(due_date.getDate() + 14); // 2 weeks loan period
        const dueDateStr = due_date.toISOString().split('T')[0];

        const { data: borrowing, error: borrowError } = await supabase
            .from('borrowings')
            .insert([{
                user_id,
                resource_id,
                borrow_date,
                due_date: dueDateStr,
                status: 'Active'
            }])
            .select()
            .single();

        if (borrowError) {
            console.error('Error creating borrowing:', borrowError);
            return res.status(500).json({ error: 'Failed to borrow resource.' });
        }

        // Update available copies
        const { error: updateError } = await supabase
            .from('resources')
            .update({ available_copies: resource.available_copies - 1 })
            .eq('resource_id', resource_id);

        if (updateError) {
            console.error('Error updating resource:', updateError);
            return res.status(500).json({ error: 'Failed to update resource availability.' });
        }

        res.status(200).json({
            message: 'Resource borrowed successfully.',
            due_date: dueDateStr,
            borrowing
        });
    } catch (err) {
        console.error('Borrow resource error:', err);
        res.status(500).json({ error: 'Internal server error.' });
    }
};

// Reserve Resource
exports.reserveResource = async (req, res) => {
    try {
        const { resource_id } = req.body;
        const user_id = req.user.user_id;

        if (!resource_id) {
            return res.status(400).json({ error: 'Please provide resource_id.' });
        }

        // Check if resource exists
        const { data: resource, error: resourceError } = await supabase
            .from('resources')
            .select('*')
            .eq('resource_id', resource_id)
            .single();

        if (resourceError || !resource) {
            return res.status(404).json({ error: 'Resource not found.' });
        }

        // Check if resource is available
        if (resource.available_copies > 0) {
            return res.status(400).json({ error: 'Resource is available. You can borrow it instead of reserving.' });
        }

        // Check if user already has a reservation
        const { data: existingReservation } = await supabase
            .from('reservations')
            .select('*')
            .eq('user_id', user_id)
            .eq('resource_id', resource_id)
            .eq('status', 'Pending')
            .single();

        if (existingReservation) {
            return res.status(400).json({ error: 'You have already reserved this resource.' });
        }

        // Insert reservation
        const { data: reservation, error: reservationError } = await supabase
            .from('reservations')
            .insert([{
                user_id,
                resource_id,
                status: 'Pending'
            }])
            .select()
            .single();

        if (reservationError) {
            console.error('Error creating reservation:', reservationError);
            return res.status(500).json({ error: 'Failed to reserve resource.' });
        }

        res.status(201).json({
            message: 'Resource reserved successfully.',
            reservation
        });
    } catch (err) {
        console.error('Reserve resource error:', err);
        res.status(500).json({ error: 'Internal server error.' });
    }
};

// Get Borrowed Books
exports.getBorrowedBooks = async (req, res) => {
    try {
        const userId = req.user && req.user.user_id;

        if (!userId) {
            return res.status(400).json({ error: 'Invalid user ID.' });
        }

        const { data, error } = await supabase
            .from('borrowings')
            .select(`
                borrowing_id,
                borrow_date,
                due_date,
                return_date,
                status,
                renewals,
                resource:resources (
                    resource_id,
                    title,
                    author,
                    isbn,
                    resource_type
                )
            `)
            .eq('user_id', userId)
            .eq('status', 'Active')
            .order('borrow_date', { ascending: false });

        if (error) {
            console.error('Error fetching borrowed books:', error);
            return res.status(500).json({ error: 'Failed to fetch borrowed books.' });
        }

        res.json(data || []);
    } catch (err) {
        console.error('Get borrowed books error:', err);
        res.status(500).json({ error: 'Internal server error.' });
    }
};

// Renew Borrowing
exports.renewBorrowing = async (req, res) => {
    try {
        const borrowingId = req.params.borrowingId;
        const userId = req.user.user_id;

        const MAX_RENEWALS = 2;
        const RENEWAL_PERIOD_DAYS = 14;

        // Fetch borrowing record
        const { data: borrowing, error: fetchError } = await supabase
            .from('borrowings')
            .select('*')
            .eq('borrowing_id', borrowingId)
            .eq('user_id', userId)
            .eq('status', 'Active')
            .single();

        if (fetchError || !borrowing) {
            return res.status(404).json({ error: 'Borrowing record not found or already returned.' });
        }

        // Check if maximum renewals have been reached
        if (borrowing.renewals >= MAX_RENEWALS) {
            return res.status(400).json({ error: `Maximum renewals (${MAX_RENEWALS}) reached.` });
        }

        // Check if the book is overdue
        const today = dayjs().startOf('day');
        const dueDate = dayjs(borrowing.due_date);

        if (today.isAfter(dueDate)) {
            return res.status(400).json({ error: 'Cannot renew an overdue book.' });
        }

        // Calculate new due date
        const newDueDate = dueDate.add(RENEWAL_PERIOD_DAYS, 'day').format('YYYY-MM-DD');

        // Update the borrowing record
        const { error: updateError } = await supabase
            .from('borrowings')
            .update({
                due_date: newDueDate,
                renewals: borrowing.renewals + 1
            })
            .eq('borrowing_id', borrowingId)
            .eq('user_id', userId);

        if (updateError) {
            console.error('Error updating borrowing record:', updateError);
            return res.status(500).json({ error: 'Failed to renew borrowing.' });
        }

        res.json({
            message: 'Borrowing renewed successfully.',
            new_due_date: newDueDate,
            renewals: borrowing.renewals + 1
        });
    } catch (err) {
        console.error('Renew borrowing error:', err);
        res.status(500).json({ error: 'Internal server error.' });
    }
};

// View Borrowing History
exports.borrowHistory = async (req, res) => {
    try {
        const user_id = req.user.user_id;

        const { data, error } = await supabase
            .from('borrowings')
            .select(`
                borrowing_id,
                borrow_date,
                due_date,
                return_date,
                status,
                renewals,
                resource:resources (
                    title,
                    author,
                    isbn
                )
            `)
            .eq('user_id', user_id)
            .order('borrow_date', { ascending: false });

        if (error) {
            console.error('Error fetching borrow history:', error);
            return res.status(500).json({ error: 'Failed to fetch borrow history.' });
        }

        res.json(data || []);
    } catch (err) {
        console.error('Borrow history error:', err);
        res.status(500).json({ error: 'Internal server error.' });
    }
};

// Get Notifications
exports.getNotifications = async (req, res) => {
    try {
        const user_id = req.user.user_id;

        const { data, error } = await supabase
            .from('notifications')
            .select('*')
            .eq('user_id', user_id)
            .order('date_sent', { ascending: false });

        if (error) {
            console.error('Error fetching notifications:', error);
            return res.status(500).json({ error: 'Failed to fetch notifications.' });
        }

        res.json(data || []);
    } catch (err) {
        console.error('Get notifications error:', err);
        res.status(500).json({ error: 'Internal server error.' });
    }
};

// Update Profile
exports.updateProfile = async (req, res) => {
    try {
        const user_id = req.user.user_id;
        const { email, password, first_name, last_name, phone_number } = req.body;

        const updateData = {
            email,
            first_name,
            last_name,
            phone_number
        };

        // If password is provided, hash it
        if (password) {
            const hashedPassword = await bcrypt.hash(password, 10);
            updateData.password_hash = hashedPassword;
        }

        const { error } = await supabase
            .from('users')
            .update(updateData)
            .eq('user_id', user_id);

        if (error) {
            console.error('Error updating profile:', error);
            return res.status(500).json({ error: 'Failed to update profile.' });
        }

        res.json({ message: 'Profile updated successfully.' });
    } catch (err) {
        console.error('Update profile error:', err);
        res.status(500).json({ error: 'Internal server error.' });
    }
};
