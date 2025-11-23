// backend/controllers/librarianController.js
// Pengontrol untuk fungsi pustakawan perpustakaan

const supabase = require('../config/supabase');
const bcrypt = require('bcrypt');

// Tambah Sumber Daya Baru
exports.addResource = async (req, res) => {
    try {
        const { title, author, isbn, resource_type, total_copies, available_copies, genre, publication_year, publisher, description } = req.body;

        if (!title || !author || !resource_type) {
            return res.status(400).json({ error: 'Mohon masukkan semua field yang diperlukan.' });
        }

        const { data: dataSumber, error: kesalahan } = await supabase
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

        if (kesalahan) {
            console.error('Kesalahan menambah sumber daya:', kesalahan);
            return res.status(500).json({ error: 'Gagal menambah sumber daya.' });
        }

        res.status(201).json({ message: 'Sumber daya berhasil ditambahkan.', resource: dataSumber });
    } catch (err) {
        console.error('Kesalahan tambah sumber daya:', err);
        res.status(500).json({ error: 'Kesalahan server internal.' });
    }
};

// Perbarui Sumber Daya
exports.updateResource = async (req, res) => {
    try {
        const idSumberDaya = req.params.id;
        const { title, author, isbn, resource_type, total_copies, available_copies, genre, publication_year, publisher, description } = req.body;

        const { error: kesalahan } = await supabase
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
            .eq('resource_id', idSumberDaya);

        if (kesalahan) {
            console.error('Kesalahan memperbarui sumber daya:', kesalahan);
            return res.status(500).json({ error: 'Gagal memperbarui sumber daya.' });
        }

        res.json({ message: 'Sumber daya berhasil diperbarui.' });
    } catch (err) {
        console.error('Kesalahan perbarui sumber daya:', err);
        res.status(500).json({ error: 'Kesalahan server internal.' });
    }
};

// Edit Sumber Daya
exports.editResource = async (req, res) => {
    try {
        const idSumberDaya = req.params.id;
        const { title, author, isbn, resource_type, total_copies, available_copies, genre, publication_year, publisher, description } = req.body;

        // Validasi
        if (!title || !author || !resource_type) {
            return res.status(400).json({ error: 'Mohon masukkan semua field yang diperlukan.' });
        }

        if (isNaN(total_copies) || total_copies < 0 || isNaN(available_copies) || available_copies < 0) {
            return res.status(400).json({ error: 'Jumlah salinan harus bilangan positif.' });
        }

        if (available_copies > total_copies) {
            return res.status(400).json({ error: 'Salinan tersedia tidak boleh melebihi total salinan.' });
        }

        const { data: dataSumber, error: kesalahan } = await supabase
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
            .eq('resource_id', idSumberDaya)
            .select();

        if (kesalahan) {
            console.error('Kesalahan mengedit sumber daya:', kesalahan);
            if (kesalahan.code === '23505') { // Pelanggaran unik PostgreSQL
                return res.status(400).json({ error: 'Sumber daya dengan ISBN ini sudah ada.' });
            }
            return res.status(500).json({ error: 'Gagal mengedit sumber daya.' });
        }

        if (!dataSumber || dataSumber.length === 0) {
            return res.status(404).json({ error: 'Sumber daya tidak ditemukan.' });
        }

        res.json({ message: 'Sumber daya berhasil diperbarui.' });
    } catch (err) {
        console.error('Kesalahan edit sumber daya:', err);
        res.status(500).json({ error: 'Kesalahan server internal.' });
    }
};

// Hapus Sumber Daya
exports.deleteResource = async (req, res) => {
    try {
        const idSumberDaya = req.params.id;

        const { error: kesalahan } = await supabase
            .from('resources')
            .delete()
            .eq('resource_id', idSumberDaya);

        if (kesalahan) {
            console.error('Kesalahan menghapus sumber daya:', kesalahan);
            return res.status(500).json({ error: 'Gagal menghapus sumber daya.' });
        }

        res.json({ message: 'Sumber daya berhasil dihapus.' });
    } catch (err) {
        console.error('Kesalahan hapus sumber daya:', err);
        res.status(500).json({ error: 'Kesalahan server internal.' });
    }
};

// Dapatkan Sumber Daya
exports.getResources = async (req, res) => {
    try {
        const { data: dataSumber, error: kesalahan } = await supabase
            .from('resources')
            .select('*')
            .order('created_at', { ascending: false });

        if (kesalahan) {
            console.error('Kesalahan mengambil sumber daya:', kesalahan);
            return res.status(500).json({ error: 'Gagal mengambil sumber daya.' });
        }

        res.json(dataSumber || []);
    } catch (err) {
        console.error('Kesalahan dapatkan sumber daya:', err);
        res.status(500).json({ error: 'Kesalahan server internal.' });
    }
};

// Kelola Peminjaman
exports.manageBorrowing = async (req, res) => {
    try {
        const idPeminjaman = req.params.id;
        const { status, due_date } = req.body;

        // Ambil peminjaman untuk memeriksa perubahan status dan mendapatkan resource_id
        const { data: peminjaman, error: kesalahanAmbil } = await supabase
            .from('borrowings')
            .select('*, resources(*)')
            .eq('borrowing_id', idPeminjaman)
            .single();

        if (kesalahanAmbil || !peminjaman) {
            return res.status(404).json({ error: 'Peminjaman tidak ditemukan.' });
        }

        // Perbarui peminjaman
        const dataUpdate = { status };
        if (due_date) dataUpdate.due_date = due_date;
        if (status === 'Returned') {
            dataUpdate.return_date = new Date().toISOString().split('T')[0];
        }

        const { error: kesalahan } = await supabase
            .from('borrowings')
            .update(dataUpdate)
            .eq('borrowing_id', idPeminjaman);

        if (kesalahan) {
            console.error('Kesalahan mengelola peminjaman:', kesalahan);
            return res.status(500).json({ error: 'Gagal memperbarui status peminjaman.' });
        }

        // Jika status berubah ke 'Returned' dan sebelumnya 'Active', perbarui salinan tersedia
        if (status === 'Returned' && peminjaman.status === 'Active' && peminjaman.resources) {
            const { error: kesalahanSumber } = await supabase
                .from('resources')
                .update({
                    available_copies: peminjaman.resources.available_copies + 1
                })
                .eq('resource_id', peminjaman.resource_id);

            if (kesalahanSumber) {
                console.error('Kesalahan memperbarui ketersediaan sumber daya:', kesalahanSumber);
                // Lanjutkan - status peminjaman sudah diperbarui
            }
        }

        res.json({ message: 'Status peminjaman berhasil diperbarui.' });
    } catch (err) {
        console.error('Kesalahan kelola peminjaman:', err);
        res.status(500).json({ error: 'Kesalahan server internal.' });
    }
};

// Lacak Inventaris
exports.trackInventory = async (req, res) => {
    try {
        const { data: dataInventaris, error: kesalahan } = await supabase
            .from('resources')
            .select('resource_id, title, resource_type, total_copies, available_copies');

        if (kesalahan) {
            console.error('Kesalahan melacak inventaris:', kesalahan);
            return res.status(500).json({ error: 'Gagal melacak inventaris.' });
        }

        res.json(dataInventaris || []);
    } catch (err) {
        console.error('Kesalahan lacak inventaris:', err);
        res.status(500).json({ error: 'Kesalahan server internal.' });
    }
};

// Tangani Reservasi
exports.handleReservation = async (req, res) => {
    try {
        const idReservasi = req.params.id;
        const { status } = req.body;

        const { error: kesalahan } = await supabase
            .from('reservations')
            .update({ status })
            .eq('reservation_id', idReservasi);

        if (kesalahan) {
            console.error('Kesalahan menangani reservasi:', kesalahan);
            return res.status(500).json({ error: 'Gagal memperbarui status reservasi.' });
        }

        res.json({ message: 'Status reservasi berhasil diperbarui.' });
    } catch (err) {
        console.error('Kesalahan tangani reservasi:', err);
        res.status(500).json({ error: 'Kesalahan server internal.' });
    }
};

// Buat Laporan
exports.generateReports = async (req, res) => {
    try {
        // Dapatkan total sumber daya
        const { count: totalSumberDaya } = await supabase
            .from('resources')
            .select('*', { count: 'exact', head: true });

        // Dapatkan total peminjaman
        const { count: totalPeminjaman } = await supabase
            .from('borrowings')
            .select('*', { count: 'exact', head: true });

        // Dapatkan peminjaman aktif
        const { count: peminjamanAktif } = await supabase
            .from('borrowings')
            .select('*', { count: 'exact', head: true })
            .eq('status', 'Active');

        // Dapatkan peminjaman terlambat (gunakan tanggal lokal untuk mencocokkan getOverdueItems)
        const sekarang = new Date();
        const hariIni = sekarang.getFullYear() + '-' +
            String(sekarang.getMonth() + 1).padStart(2, '0') + '-' +
            String(sekarang.getDate()).padStart(2, '0');
        const { count: peminjamanTerlambat } = await supabase
            .from('borrowings')
            .select('*', { count: 'exact', head: true })
            .eq('status', 'Active')
            .lt('due_date', hariIni);

        // Dapatkan total pengguna
        const { count: totalPengguna } = await supabase
            .from('users')
            .select('*', { count: 'exact', head: true });

        // Dapatkan sumber daya populer dengan jumlah peminjaman
        // Pertama ambil semua peminjaman dengan data sumber daya
        const { data: semuaPeminjaman } = await supabase
            .from('borrowings')
            .select('resource_id, resources(resource_id, title, author, isbn, genre)');

        // Agregasi berdasarkan resource_id
        const hitungPeminjamanSumber = {};
        if (semuaPeminjaman) {
            semuaPeminjaman.forEach(peminjaman => {
                if (peminjaman.resources) {
                    const idSumber = peminjaman.resource_id;
                    if (!hitungPeminjamanSumber[idSumber]) {
                        hitungPeminjamanSumber[idSumber] = {
                            ...peminjaman.resources,
                            borrow_count: 0
                        };
                    }
                    hitungPeminjamanSumber[idSumber].borrow_count++;
                }
            });
        }

        // Konversi ke array dan urutkan berdasarkan jumlah peminjaman
        const sumberPopuler = Object.values(hitungPeminjamanSumber)
            .sort((a, b) => b.borrow_count - a.borrow_count)
            .slice(0, 10);

        // Dapatkan jumlah sumber daya tersedia
        const { data: hitungTersedia } = await supabase
            .from('resources')
            .select('available_copies');

        const totalTersedia = hitungTersedia ?
            hitungTersedia.reduce((jumlah, r) => jumlah + (r.available_copies || 0), 0) : 0;

        res.json({
            total_resources: totalSumberDaya || 0,
            total_borrowings: totalPeminjaman || 0,
            active_borrowings: peminjamanAktif || 0,
            overdue_borrowings: peminjamanTerlambat || 0,
            total_users: totalPengguna || 0,
            available_resources: totalTersedia,
            popular_resources: sumberPopuler || []
        });
    } catch (err) {
        console.error('Kesalahan membuat laporan:', err);
        res.status(500).json({ error: 'Kesalahan server internal.' });
    }
};

// Kirim Notifikasi
exports.sendNotification = async (req, res) => {
    try {
        const { user_id, message } = req.body;

        if (!user_id || !message) {
            return res.status(400).json({ error: 'Mohon berikan user_id dan pesan.' });
        }

        const { data: dataNotifikasi, error: kesalahan } = await supabase
            .from('notifications')
            .insert([{
                user_id,
                message,
                is_read: false
            }])
            .select()
            .single();

        if (kesalahan) {
            console.error('Kesalahan mengirim notifikasi:', kesalahan);
            return res.status(500).json({ error: 'Gagal mengirim notifikasi.' });
        }

        res.status(201).json({ message: 'Notifikasi berhasil dikirim.', notification: dataNotifikasi });
    } catch (err) {
        console.error('Kesalahan kirim notifikasi:', err);
        res.status(500).json({ error: 'Kesalahan server internal.' });
    }
};

// Dapatkan Semua Pengguna
exports.getAllUsers = async (req, res) => {
    try {
        const { data: dataPengguna, error: kesalahan } = await supabase
            .from('users')
            .select('user_id, username, email, first_name, last_name, role, phone_number, created_at, updated_at')
            .order('created_at', { ascending: false });

        if (kesalahan) {
            console.error('Kesalahan mengambil pengguna:', kesalahan);
            return res.status(500).json({ error: 'Gagal mengambil pengguna.' });
        }

        res.json(dataPengguna || []);
    } catch (err) {
        console.error('Kesalahan dapatkan semua pengguna:', err);
        res.status(500).json({ error: 'Kesalahan server internal.' });
    }
};

// Buat Pengguna Baru
exports.createUser = async (req, res) => {
    try {
        const { username, email, password, first_name, last_name, role, phone_number } = req.body;

        if (!username || !email || !password || !first_name || !last_name || !role) {
            return res.status(400).json({ error: 'Mohon masukkan semua field yang diperlukan.' });
        }

        const peranValid = ['Librarian', 'Patron'];
        if (!peranValid.includes(role)) {
            return res.status(400).json({ error: `Peran harus salah satu dari: ${peranValid.join(', ')}.` });
        }

        // Periksa apakah email sudah ada
        const { data: penggunaAda } = await supabase
            .from('users')
            .select('*')
            .or(`username.eq.${username},email.eq.${email}`)
            .single();

        if (penggunaAda) {
            return res.status(400).json({ error: 'Pengguna dengan username atau email ini sudah ada.' });
        }

        // Hash kata sandi
        const katasandiHash = await bcrypt.hash(password, 10);

        // Masukkan pengguna baru
        const { data: dataPengguna, error: kesalahan } = await supabase
            .from('users')
            .insert([{
                username,
                email,
                password_hash: katasandiHash,
                first_name,
                last_name,
                role,
                phone_number
            }])
            .select()
            .single();

        if (kesalahan) {
            console.error('Kesalahan membuat pengguna:', kesalahan);
            return res.status(500).json({ error: 'Gagal membuat pengguna.' });
        }

        res.status(201).json({ message: 'Akun pengguna berhasil dibuat.', user: dataPengguna });
    } catch (err) {
        console.error('Kesalahan buat pengguna:', err);
        res.status(500).json({ error: 'Kesalahan server internal.' });
    }
};

// Kelola (Perbarui) Akun Pengguna
exports.manageUser = async (req, res) => {
    try {
        const idPengguna = req.params.id;
        const { username, email, password, first_name, last_name, role, phone_number } = req.body;

        if (!username || !email || !first_name || !last_name || !role) {
            return res.status(400).json({ error: 'Mohon masukkan semua field yang diperlukan.' });
        }

        const peranValid = ['Librarian', 'Patron'];
        if (!peranValid.includes(role)) {
            return res.status(400).json({ error: `Peran harus salah satu dari: ${peranValid.join(', ')}.` });
        }

        const dataUpdate = {
            username,
            email,
            first_name,
            last_name,
            role,
            phone_number
        };

        // Jika kata sandi diberikan, hash terlebih dahulu
        if (password) {
            const katasandiHash = await bcrypt.hash(password, 10);
            dataUpdate.password_hash = katasandiHash;
        }

        const { data: dataPengguna, error: kesalahan } = await supabase
            .from('users')
            .update(dataUpdate)
            .eq('user_id', idPengguna)
            .select();

        if (kesalahan) {
            console.error('Kesalahan mengelola pengguna:', kesalahan);
            return res.status(500).json({ error: 'Gagal memperbarui pengguna.' });
        }

        if (!dataPengguna || dataPengguna.length === 0) {
            return res.status(404).json({ error: 'Pengguna tidak ditemukan.' });
        }

        res.json({ message: 'Akun pengguna berhasil diperbarui.' });
    } catch (err) {
        console.error('Kesalahan kelola pengguna:', err);
        res.status(500).json({ error: 'Kesalahan server internal.' });
    }
};

// Hapus Akun Pengguna
exports.deleteUser = async (req, res) => {
    try {
        const idPengguna = req.params.id;

        const { error: kesalahan } = await supabase
            .from('users')
            .delete()
            .eq('user_id', idPengguna);

        if (kesalahan) {
            console.error('Kesalahan menghapus pengguna:', kesalahan);
            return res.status(500).json({ error: 'Gagal menghapus pengguna.' });
        }

        res.json({ message: 'Akun pengguna berhasil dihapus.' });
    } catch (err) {
        console.error('Kesalahan hapus pengguna:', err);
        res.status(500).json({ error: 'Kesalahan server internal.' });
    }
};

// Dapatkan Semua Peminjaman dengan Detail Pengguna dan Sumber Daya
exports.getAllBorrowings = async (req, res) => {
    try {
        const { data: dataPeminjaman, error: kesalahan } = await supabase
            .from('borrowings')
            .select('*, users(*), resources(*)')
            .order('borrow_date', { ascending: false });

        if (kesalahan) {
            console.error('Kesalahan mengambil peminjaman:', kesalahan);
            return res.status(500).json({ error: 'Gagal mengambil peminjaman.' });
        }

        res.json(dataPeminjaman || []);
    } catch (err) {
        console.error('Kesalahan dapatkan semua peminjaman:', err);
        res.status(500).json({ error: 'Kesalahan server internal.' });
    }
};

// Dapatkan Item Terlambat dengan Detail Pengguna dan Sumber Daya
exports.getOverdueItems = async (req, res) => {
    try {
        // Gunakan tanggal lokal untuk menghindari masalah timezone
        const sekarang = new Date();
        const hariIni = sekarang.getFullYear() + '-' +
            String(sekarang.getMonth() + 1).padStart(2, '0') + '-' +
            String(sekarang.getDate()).padStart(2, '0');

        const { data: dataTerlambat, error: kesalahan } = await supabase
            .from('borrowings')
            .select('*, users(*), resources(*)')
            .eq('status', 'Active')
            .lt('due_date', hariIni)
            .order('due_date', { ascending: true });

        if (kesalahan) {
            console.error('Kesalahan mengambil item terlambat:', kesalahan);
            return res.status(500).json({ error: 'Gagal mengambil item terlambat.' });
        }

        res.json(dataTerlambat || []);
    } catch (err) {
        console.error('Kesalahan dapatkan item terlambat:', err);
        res.status(500).json({ error: 'Kesalahan server internal.' });
    }
};

// Dapatkan Log Perpustakaan
exports.getLibraryLogs = async (req, res) => {
    try {
        const { data: dataLog, error: kesalahan } = await supabase
            .from('library_logs')
            .select('*, users(username)')
            .order('created_at', { ascending: false })
            .limit(100);

        if (kesalahan) {
            console.error('Kesalahan mengambil log perpustakaan:', kesalahan);
            return res.status(500).json({ error: 'Gagal mengambil log perpustakaan.' });
        }

        res.json(dataLog || []);
    } catch (err) {
        console.error('Kesalahan dapatkan log perpustakaan:', err);
        res.status(500).json({ error: 'Kesalahan server internal.' });
    }
};
