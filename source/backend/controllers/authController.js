// backend/controllers/authController.js
// Pengontrol untuk autentikasi pengguna

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const supabase = require('../config/supabase');

// Daftar patron baru
exports.registerPatron = async (req, res) => {
    try {
        const { username, email, password, first_name, last_name, phone_number } = req.body;

        // Periksa apakah pengguna sudah ada
        const { data: penggunaAda } = await supabase
            .from('users')
            .select('*')
            .or(`username.eq.${username},email.eq.${email}`)
            .single();

        if (penggunaAda) {
            return res.status(400).json({ error: 'Username atau email sudah digunakan.' });
        }

        // Hash kata sandi
        const katasandiHash = await bcrypt.hash(password, 10);

        // Masukkan pengguna baru
        const { data: penggunaBaru, error: kesalahan } = await supabase
            .from('users')
            .insert([{
                username,
                email,
                password_hash: katasandiHash,
                role: 'Patron',
                first_name,
                last_name,
                phone_number
            }])
            .select()
            .single();

        if (kesalahan) {
            console.error('Kesalahan mendaftar patron:', kesalahan);
            return res.status(500).json({ error: 'Gagal mendaftar patron.' });
        }

        // Buat token JWT
        const token = jwt.sign(
            { user_id: penggunaBaru.user_id, username: penggunaBaru.username, role: penggunaBaru.role },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        // Hapus kata sandi dari respons
        delete penggunaBaru.password_hash;

        res.status(201).json({
            message: 'Patron berhasil didaftarkan.',
            token,
            user: penggunaBaru
        });
    } catch (err) {
        console.error('Kesalahan pendaftaran:', err);
        res.status(500).json({ error: 'Kesalahan server internal.' });
    }
};

// Masuk
exports.login = async (req, res) => {
    try {
        const { username, password } = req.body;

        // Ambil pengguna berdasarkan username
        const { data: pengguna, error: kesalahan } = await supabase
            .from('users')
            .select('*')
            .eq('username', username)
            .single();

        if (kesalahan || !pengguna) {
            return res.status(401).json({ error: 'Kredensial tidak valid.' });
        }

        // Bandingkan kata sandi
        const cocok = await bcrypt.compare(password, pengguna.password_hash);
        if (!cocok) {
            return res.status(401).json({ error: 'Kredensial tidak valid.' });
        }

        // Buat token JWT
        const token = jwt.sign(
            { user_id: pengguna.user_id, username: pengguna.username, role: pengguna.role },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        // Hapus kata sandi dari respons
        delete pengguna.password_hash;

        res.status(200).json({
            message: 'Login berhasil.',
            token,
            user: pengguna
        });
    } catch (err) {
        console.error('Kesalahan login:', err);
        res.status(500).json({ error: 'Kesalahan server internal.' });
    }
};
