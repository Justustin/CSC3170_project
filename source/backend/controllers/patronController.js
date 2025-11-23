// backend/controllers/patronController.js
// Pengontrol untuk fungsi patron perpustakaan

const supabase = require('../config/supabase');
const bcrypt = require('bcrypt');
const dayjs = require('dayjs');

// Cari Katalog
exports.searchCatalog = async (req, res) => {
    try {
        const { query, type, genre, author } = req.query;

        let kueriSupabase = supabase.from('resources').select('*');

        // Terapkan filter
        if (query) {
            kueriSupabase = kueriSupabase.or(`title.ilike.%${query}%,author.ilike.%${query}%,isbn.ilike.%${query}%`);
        }
        if (type && type !== 'All') {
            kueriSupabase = kueriSupabase.eq('resource_type', type);
        }
        if (genre) {
            kueriSupabase = kueriSupabase.eq('genre', genre);
        }
        if (author) {
            kueriSupabase = kueriSupabase.ilike('author', `%${author}%`);
        }

        const { data: hasilData, error: kesalahan } = await kueriSupabase;

        if (kesalahan) {
            console.error('Kesalahan mencari katalog:', kesalahan);
            return res.status(500).json({ error: 'Gagal mencari katalog.' });
        }

        res.json(hasilData || []);
    } catch (err) {
        console.error('Kesalahan pencarian katalog:', err);
        res.status(500).json({ error: 'Kesalahan server internal.' });
    }
};

// Pinjam Sumber Daya
exports.borrowResource = async (req, res) => {
    try {
        const { resource_id } = req.body;
        const idPengguna = req.user.user_id;

        // Periksa apakah sumber daya ada dan tersedia
        const { data: sumberDaya, error: kesalahanSumber } = await supabase
            .from('resources')
            .select('*')
            .eq('resource_id', resource_id)
            .single();

        if (kesalahanSumber || !sumberDaya) {
            return res.status(404).json({ error: 'Sumber daya tidak ditemukan.' });
        }

        if (sumberDaya.available_copies < 1) {
            return res.status(400).json({ error: 'Tidak ada salinan tersedia untuk sumber daya ini.' });
        }

        // Buat catatan peminjaman
        const tanggalPinjam = new Date().toISOString().split('T')[0];
        const tanggalJatuhTempo = new Date();
        tanggalJatuhTempo.setDate(tanggalJatuhTempo.getDate() + 14); // Periode pinjam 2 minggu
        const strTanggalJatuhTempo = tanggalJatuhTempo.toISOString().split('T')[0];

        const { data: peminjaman, error: kesalahanPinjam } = await supabase
            .from('borrowings')
            .insert([{
                user_id: idPengguna,
                resource_id,
                borrow_date: tanggalPinjam,
                due_date: strTanggalJatuhTempo,
                status: 'Active'
            }])
            .select()
            .single();

        if (kesalahanPinjam) {
            console.error('Kesalahan membuat peminjaman:', kesalahanPinjam);
            return res.status(500).json({ error: 'Gagal meminjam sumber daya.' });
        }

        // Perbarui salinan tersedia
        const { error: kesalahanUpdate } = await supabase
            .from('resources')
            .update({ available_copies: sumberDaya.available_copies - 1 })
            .eq('resource_id', resource_id);

        if (kesalahanUpdate) {
            console.error('Kesalahan memperbarui sumber daya:', kesalahanUpdate);
            return res.status(500).json({ error: 'Gagal memperbarui ketersediaan sumber daya.' });
        }

        res.status(200).json({
            message: 'Sumber daya berhasil dipinjam.',
            due_date: strTanggalJatuhTempo,
            borrowing: peminjaman
        });
    } catch (err) {
        console.error('Kesalahan peminjaman sumber daya:', err);
        res.status(500).json({ error: 'Kesalahan server internal.' });
    }
};

// Reservasi Sumber Daya
exports.reserveResource = async (req, res) => {
    try {
        const { resource_id } = req.body;
        const idPengguna = req.user.user_id;

        if (!resource_id) {
            return res.status(400).json({ error: 'Mohon berikan resource_id.' });
        }

        // Periksa apakah sumber daya ada
        const { data: sumberDaya, error: kesalahanSumber } = await supabase
            .from('resources')
            .select('*')
            .eq('resource_id', resource_id)
            .single();

        if (kesalahanSumber || !sumberDaya) {
            return res.status(404).json({ error: 'Sumber daya tidak ditemukan.' });
        }

        // Periksa apakah sumber daya tersedia
        if (sumberDaya.available_copies > 0) {
            return res.status(400).json({ error: 'Sumber daya tersedia. Anda bisa meminjam langsung.' });
        }

        // Periksa apakah pengguna sudah memiliki reservasi
        const { data: reservasiAda } = await supabase
            .from('reservations')
            .select('*')
            .eq('user_id', idPengguna)
            .eq('resource_id', resource_id)
            .eq('status', 'Pending')
            .single();

        if (reservasiAda) {
            return res.status(400).json({ error: 'Anda sudah mereservasi sumber daya ini.' });
        }

        // Masukkan reservasi
        const { data: reservasi, error: kesalahanReservasi } = await supabase
            .from('reservations')
            .insert([{
                user_id: idPengguna,
                resource_id,
                status: 'Pending'
            }])
            .select()
            .single();

        if (kesalahanReservasi) {
            console.error('Kesalahan membuat reservasi:', kesalahanReservasi);
            return res.status(500).json({ error: 'Gagal mereservasi sumber daya.' });
        }

        res.status(201).json({
            message: 'Sumber daya berhasil direservasi.',
            reservation: reservasi
        });
    } catch (err) {
        console.error('Kesalahan reservasi sumber daya:', err);
        res.status(500).json({ error: 'Kesalahan server internal.' });
    }
};

// Dapatkan Buku yang Dipinjam
exports.getBorrowedBooks = async (req, res) => {
    try {
        const idPengguna = req.user && req.user.user_id;

        if (!idPengguna) {
            return res.status(400).json({ error: 'ID pengguna tidak valid.' });
        }

        const { data: dataPeminjaman, error: kesalahan } = await supabase
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
            .eq('user_id', idPengguna)
            .eq('status', 'Active')
            .order('borrow_date', { ascending: false });

        if (kesalahan) {
            console.error('Kesalahan mengambil buku yang dipinjam:', kesalahan);
            return res.status(500).json({ error: 'Gagal mengambil buku yang dipinjam.' });
        }

        res.json(dataPeminjaman || []);
    } catch (err) {
        console.error('Kesalahan mendapatkan buku yang dipinjam:', err);
        res.status(500).json({ error: 'Kesalahan server internal.' });
    }
};

// Perpanjang Peminjaman
exports.renewBorrowing = async (req, res) => {
    try {
        const idPeminjaman = req.params.borrowingId;
        const idPengguna = req.user.user_id;

        const MAKS_PERPANJANGAN = 2;
        const PERIODE_PERPANJANGAN_HARI = 14;

        // Ambil catatan peminjaman
        const { data: peminjaman, error: kesalahanAmbil } = await supabase
            .from('borrowings')
            .select('*')
            .eq('borrowing_id', idPeminjaman)
            .eq('user_id', idPengguna)
            .eq('status', 'Active')
            .single();

        if (kesalahanAmbil || !peminjaman) {
            return res.status(404).json({ error: 'Catatan peminjaman tidak ditemukan atau sudah dikembalikan.' });
        }

        // Periksa apakah perpanjangan maksimum tercapai
        if (peminjaman.renewals >= MAKS_PERPANJANGAN) {
            return res.status(400).json({ error: `Perpanjangan maksimum (${MAKS_PERPANJANGAN}) tercapai.` });
        }

        // Periksa apakah buku terlambat
        const hariIni = dayjs().startOf('day');
        const tanggalJatuhTempo = dayjs(peminjaman.due_date);

        if (hariIni.isAfter(tanggalJatuhTempo)) {
            return res.status(400).json({ error: 'Tidak dapat memperpanjang buku yang terlambat.' });
        }

        // Hitung tanggal jatuh tempo baru
        const tanggalJatuhTempoBaru = tanggalJatuhTempo.add(PERIODE_PERPANJANGAN_HARI, 'day').format('YYYY-MM-DD');

        // Perbarui catatan peminjaman
        const { error: kesalahanUpdate } = await supabase
            .from('borrowings')
            .update({
                due_date: tanggalJatuhTempoBaru,
                renewals: peminjaman.renewals + 1
            })
            .eq('borrowing_id', idPeminjaman)
            .eq('user_id', idPengguna);

        if (kesalahanUpdate) {
            console.error('Kesalahan memperbarui catatan peminjaman:', kesalahanUpdate);
            return res.status(500).json({ error: 'Gagal memperpanjang peminjaman.' });
        }

        res.json({
            message: 'Peminjaman berhasil diperpanjang.',
            new_due_date: tanggalJatuhTempoBaru,
            renewals: peminjaman.renewals + 1
        });
    } catch (err) {
        console.error('Kesalahan perpanjangan peminjaman:', err);
        res.status(500).json({ error: 'Kesalahan server internal.' });
    }
};

// Kembalikan Peminjaman
exports.returnBorrowing = async (req, res) => {
    try {
        const idPeminjaman = req.params.borrowingId;
        const idPengguna = req.user.user_id;

        // Ambil catatan peminjaman
        const { data: peminjaman, error: kesalahanAmbil } = await supabase
            .from('borrowings')
            .select('*, resources(*)')
            .eq('borrowing_id', idPeminjaman)
            .eq('user_id', idPengguna)
            .eq('status', 'Active')
            .single();

        if (kesalahanAmbil || !peminjaman) {
            return res.status(404).json({ error: 'Catatan peminjaman tidak ditemukan atau sudah dikembalikan.' });
        }

        // Periksa apakah data sumber daya ada
        if (!peminjaman.resources) {
            return res.status(500).json({ error: 'Data sumber daya tidak ditemukan untuk peminjaman ini.' });
        }

        // Perbarui catatan peminjaman menjadi dikembalikan
        const { error: kesalahanUpdate } = await supabase
            .from('borrowings')
            .update({
                return_date: new Date().toISOString().split('T')[0],
                status: 'Returned'
            })
            .eq('borrowing_id', idPeminjaman)
            .eq('user_id', idPengguna);

        if (kesalahanUpdate) {
            console.error('Kesalahan memperbarui catatan peminjaman:', kesalahanUpdate);
            return res.status(500).json({ error: 'Gagal mengembalikan buku.' });
        }

        // Tambah salinan tersedia di tabel sumber daya
        const { error: kesalahanSumber } = await supabase
            .from('resources')
            .update({
                available_copies: peminjaman.resources.available_copies + 1
            })
            .eq('resource_id', peminjaman.resource_id);

        if (kesalahanSumber) {
            console.error('Kesalahan memperbarui sumber daya:', kesalahanSumber);
            // Lanjutkan - status peminjaman sudah diperbarui
            return res.status(207).json({
                message: 'Buku ditandai dikembalikan tapi jumlah inventaris mungkin tidak akurat. Silakan hubungi pustakawan.',
                return_date: new Date().toISOString().split('T')[0],
                warning: 'Pembaruan ketersediaan sumber daya gagal'
            });
        }

        res.json({
            message: 'Buku berhasil dikembalikan.',
            return_date: new Date().toISOString().split('T')[0]
        });
    } catch (err) {
        console.error('Kesalahan pengembalian peminjaman:', err);
        res.status(500).json({ error: 'Kesalahan server internal.' });
    }
};

// Lihat Riwayat Peminjaman
exports.borrowHistory = async (req, res) => {
    try {
        const idPengguna = req.user.user_id;

        const { data: dataRiwayat, error: kesalahan } = await supabase
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
            .eq('user_id', idPengguna)
            .order('borrow_date', { ascending: false });

        if (kesalahan) {
            console.error('Kesalahan mengambil riwayat peminjaman:', kesalahan);
            return res.status(500).json({ error: 'Gagal mengambil riwayat peminjaman.' });
        }

        res.json(dataRiwayat || []);
    } catch (err) {
        console.error('Kesalahan riwayat peminjaman:', err);
        res.status(500).json({ error: 'Kesalahan server internal.' });
    }
};

// Dapatkan Notifikasi
exports.getNotifications = async (req, res) => {
    try {
        const idPengguna = req.user.user_id;

        const { data: dataNotifikasi, error: kesalahan } = await supabase
            .from('notifications')
            .select('*')
            .eq('user_id', idPengguna)
            .order('date_sent', { ascending: false });

        if (kesalahan) {
            console.error('Kesalahan mengambil notifikasi:', kesalahan);
            return res.status(500).json({ error: 'Gagal mengambil notifikasi.' });
        }

        res.json(dataNotifikasi || []);
    } catch (err) {
        console.error('Kesalahan mendapatkan notifikasi:', err);
        res.status(500).json({ error: 'Kesalahan server internal.' });
    }
};

// Perbarui Profil
exports.updateProfile = async (req, res) => {
    try {
        const idPengguna = req.user.user_id;
        const { email, password, first_name, last_name, phone_number } = req.body;

        const dataUpdate = {
            email,
            first_name,
            last_name,
            phone_number
        };

        // Jika kata sandi diberikan, hash terlebih dahulu
        if (password) {
            const katasandiHash = await bcrypt.hash(password, 10);
            dataUpdate.password_hash = katasandiHash;
        }

        const { error: kesalahan } = await supabase
            .from('users')
            .update(dataUpdate)
            .eq('user_id', idPengguna);

        if (kesalahan) {
            console.error('Kesalahan memperbarui profil:', kesalahan);
            return res.status(500).json({ error: 'Gagal memperbarui profil.' });
        }

        res.json({ message: 'Profil berhasil diperbarui.' });
    } catch (err) {
        console.error('Kesalahan pembaruan profil:', err);
        res.status(500).json({ error: 'Kesalahan server internal.' });
    }
};
