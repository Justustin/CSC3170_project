-- Additional Sample Data for Library Management System
-- This file adds 30+ realistic records to test the system

-- Additional Users (Mix of Patrons and Librarians)
INSERT INTO users (username, email, password_hash, role, first_name, last_name, phone_number) VALUES
('alice_johnson', 'alice.johnson@email.com', '$2b$10$placeholder', 'Patron', 'Alice', 'Johnson', '555-0101'),
('bob_smith', 'bob.smith@email.com', '$2b$10$placeholder', 'Patron', 'Bob', 'Smith', '555-0102'),
('carol_white', 'carol.white@email.com', '$2b$10$placeholder', 'Patron', 'Carol', 'White', '555-0103'),
('david_brown', 'david.brown@email.com', '$2b$10$placeholder', 'Patron', 'David', 'Brown', '555-0104'),
('emma_davis', 'emma.davis@email.com', '$2b$10$placeholder', 'Patron', 'Emma', 'Davis', '555-0105'),
('frank_miller', 'frank.miller@email.com', '$2b$10$placeholder', 'Patron', 'Frank', 'Miller', '555-0106'),
('grace_wilson', 'grace.wilson@email.com', '$2b$10$placeholder', 'Patron', 'Grace', 'Wilson', '555-0107'),
('henry_moore', 'henry.moore@email.com', '$2b$10$placeholder', 'Patron', 'Henry', 'Moore', '555-0108'),
('isabel_taylor', 'isabel.taylor@email.com', '$2b$10$placeholder', 'Patron', 'Isabel', 'Taylor', '555-0109'),
('jack_anderson', 'jack.anderson@email.com', '$2b$10$placeholder', 'Patron', 'Jack', 'Anderson', '555-0110'),
('karen_thomas', 'karen.thomas@email.com', '$2b$10$placeholder', 'Librarian', 'Karen', 'Thomas', '555-0201'),
('larry_jackson', 'larry.jackson@email.com', '$2b$10$placeholder', 'Librarian', 'Larry', 'Jackson', '555-0202')
ON CONFLICT (username) DO NOTHING;

-- Additional Books and Resources (40+ books)
INSERT INTO resources (title, author, isbn, publication_year, genre, resource_type, total_copies, available_copies, publisher, description) VALUES
('Harry Potter and the Sorcerers Stone', 'J.K. Rowling', '978-0-439-70818-8', 1997, 'Fantasy', 'Book', 5, 4, 'Scholastic', 'A young wizard begins his magical education'),
('The Hobbit', 'J.R.R. Tolkien', '978-0-547-92822-7', 1937, 'Fantasy', 'Book', 4, 3, 'Houghton Mifflin', 'A hobbit''s unexpected journey'),
('The Catcher in the Rye', 'J.D. Salinger', '978-0-316-76948-0', 1951, 'Fiction', 'Book', 3, 3, 'Little, Brown', 'A story of teenage rebellion'),
('Lord of the Flies', 'William Golding', '978-0-399-50148-7', 1954, 'Fiction', 'Book', 4, 4, 'Faber and Faber', 'A tale of civilization versus savagery'),
('Animal Farm', 'George Orwell', '978-0-452-28424-1', 1945, 'Political Fiction', 'Book', 5, 5, 'Secker & Warburg', 'A satirical allegory of totalitarianism'),
('Brave New World', 'Aldous Huxley', '978-0-060-85052-4', 1932, 'Dystopian', 'Book', 3, 3, 'Chatto & Windus', 'A dystopian vision of the future'),
('The Chronicles of Narnia', 'C.S. Lewis', '978-0-06-076648-2', 1950, 'Fantasy', 'Book', 4, 4, 'Geoffrey Bles', 'Chronicles of magical adventures'),
('Moby-Dick', 'Herman Melville', '978-0-14-243724-7', 1851, 'Adventure', 'Book', 2, 2, 'Harper & Brothers', 'The quest for the white whale'),
('War and Peace', 'Leo Tolstoy', '978-0-14-303999-0', 1869, 'Historical Fiction', 'Book', 3, 3, 'The Russian Messenger', 'Epic tale of Russian society'),
('Crime and Punishment', 'Fyodor Dostoevsky', '978-0-14-044913-3', 1866, 'Psychological Fiction', 'Book', 3, 3, 'The Russian Messenger', 'A psychological thriller'),
('The Odyssey', 'Homer', '978-0-14-026886-7', -800, 'Epic Poetry', 'Book', 4, 4, 'Ancient Greek', 'Epic poem of Odysseus journey'),
('The Iliad', 'Homer', '978-0-14-027536-0', -750, 'Epic Poetry', 'Book', 3, 3, 'Ancient Greek', 'Epic poem of the Trojan War'),
('Fahrenheit 451', 'Ray Bradbury', '978-1-451-67331-9', 1953, 'Dystopian', 'Book', 4, 4, 'Ballantine Books', 'A future where books are banned'),
('The Scarlet Letter', 'Nathaniel Hawthorne', '978-0-14-243726-1', 1850, 'Historical Fiction', 'Book', 2, 2, 'Ticknor, Reed & Fields', 'A tale of sin and redemption'),
('Wuthering Heights', 'Emily Brontë', '978-0-14-143955-6', 1847, 'Gothic Fiction', 'Book', 3, 3, 'Thomas Cautley Newby', 'A dark love story on the moors'),
('Jane Eyre', 'Charlotte Brontë', '978-0-14-144114-6', 1847, 'Gothic Fiction', 'Book', 3, 3, 'Smith, Elder & Co.', 'A governess''s journey to love'),
('Les Misérables', 'Victor Hugo', '978-0-451-41943-3', 1862, 'Historical Fiction', 'Book', 2, 2, 'A. Lacroix, Verboeckhoven & Cie', 'A story of justice and redemption'),
('The Count of Monte Cristo', 'Alexandre Dumas', '978-0-14-044926-3', 1844, 'Adventure', 'Book', 3, 3, 'Pétion', 'A tale of betrayal and revenge'),
('Don Quixote', 'Miguel de Cervantes', '978-0-06-093434-1', 1605, 'Satire', 'Book', 3, 3, 'Francisco de Robles', 'A knight''s delusional adventures'),
('One Hundred Years of Solitude', 'Gabriel García Márquez', '978-0-06-088328-7', 1967, 'Magical Realism', 'Book', 3, 3, 'Harper & Row', 'Multi-generational family saga'),
('The Alchemist', 'Paulo Coelho', '978-0-06-112241-5', 1988, 'Fiction', 'Book', 5, 5, 'HarperOne', 'A journey of self-discovery'),
('Life of Pi', 'Yann Martel', '978-0-15-602732-2', 2001, 'Adventure', 'Book', 4, 4, 'Knopf Canada', 'A boy''s survival story with a tiger'),
('The Kite Runner', 'Khaled Hosseini', '978-1-594-48000-3', 2003, 'Historical Fiction', 'Book', 4, 4, 'Riverhead Books', 'A story of friendship and redemption'),
('The Book Thief', 'Markus Zusak', '978-0-375-84220-7', 2005, 'Historical Fiction', 'Book', 3, 3, 'Knopf', 'A girl''s love of books in Nazi Germany'),
('The Hunger Games', 'Suzanne Collins', '978-0-439-02348-1', 2008, 'Dystopian', 'Book', 6, 6, 'Scholastic', 'A deadly survival competition'),
('Divergent', 'Veronica Roth', '978-0-06-202402-2', 2011, 'Dystopian', 'Book', 5, 5, 'Katherine Tegen Books', 'A society divided by factions'),
('The Fault in Our Stars', 'John Green', '978-0-14-242417-9', 2012, 'Young Adult', 'Book', 4, 4, 'Dutton Books', 'A love story about two teens with cancer'),
('Gone Girl', 'Gillian Flynn', '978-0-307-58836-4', 2012, 'Thriller', 'Book', 3, 3, 'Crown Publishing', 'A psychological thriller about a missing wife'),
('The Girl on the Train', 'Paula Hawkins', '978-1-594-63402-4', 2015, 'Thriller', 'Book', 4, 4, 'Riverhead Books', 'A thriller about obsession and memory'),
('Educated', 'Tara Westover', '978-0-399-59050-4', 2018, 'Memoir', 'Book', 3, 3, 'Random House', 'A memoir of education and escape'),
('Becoming', 'Michelle Obama', '978-1-524-76313-8', 2018, 'Autobiography', 'Book', 5, 5, 'Crown', 'Former First Lady''s memoir'),
('Where the Crawdads Sing', 'Delia Owens', '978-0-735-21909-0', 2018, 'Mystery', 'Book', 5, 5, 'G.P. Putnam''s Sons', 'A murder mystery in the marshlands'),
('The Silent Patient', 'Alex Michaelides', '978-1-250-30170-7', 2019, 'Thriller', 'Book', 4, 4, 'Celadon Books', 'A psychotherapist and a silent patient'),
('Normal People', 'Sally Rooney', '978-1-984-82218-4', 2018, 'Contemporary Fiction', 'Book', 3, 3, 'Hogarth', 'An intimate story of modern love'),
('Circe', 'Madeline Miller', '978-0-316-55633-4', 2018, 'Fantasy', 'Book', 4, 4, 'Little, Brown', 'A retelling of the sorceress Circe'),
('The Midnight Library', 'Matt Haig', '978-0-525-55948-1', 2020, 'Fantasy', 'Book', 5, 5, 'Viking', 'A library between life and death'),
('Project Hail Mary', 'Andy Weir', '978-0-593-13520-3', 2021, 'Science Fiction', 'Book', 4, 4, 'Ballantine Books', 'A lone astronaut''s mission to save Earth'),
('The Seven Husbands of Evelyn Hugo', 'Taylor Jenkins Reid', '978-1-501-13922-9', 2017, 'Historical Fiction', 'Book', 4, 4, 'Atria Books', 'A Hollywood icon tells her story'),
('Little Fires Everywhere', 'Celeste Ng', '978-0-735-22430-8', 2017, 'Fiction', 'Book', 3, 3, 'Penguin Press', 'Secrets and tensions in suburban Ohio'),
('The Nightingale', 'Kristin Hannah', '978-0-312-57722-2', 2015, 'Historical Fiction', 'Book', 4, 4, 'St. Martin''s Press', 'Two sisters in Nazi-occupied France')
ON CONFLICT (isbn) DO NOTHING;

-- Academic Journals
INSERT INTO resources (title, author, isbn, publication_year, genre, resource_type, total_copies, available_copies, publisher, description) VALUES
('Nature Science Journal Vol.520', 'Various Authors', '978-0-000-00001-1', 2024, 'Science', 'Journal', 2, 2, 'Nature Publishing', 'Leading science journal'),
('IEEE Computer Science Review', 'IEEE', '978-0-000-00002-2', 2024, 'Computer Science', 'Journal', 3, 3, 'IEEE', 'Computer science research journal'),
('Medical Journal of Medicine', 'Medical Association', '978-0-000-00003-3', 2024, 'Medicine', 'Journal', 2, 2, 'Medical Publishers', 'Medical research and studies'),
('Journal of Psychology Today', 'Psychology Press', '978-0-000-00004-4', 2024, 'Psychology', 'Journal', 2, 2, 'Psychology Press', 'Modern psychological research'),
('Economics Quarterly Review', 'Economic Society', '978-0-000-00005-5', 2024, 'Economics', 'Journal', 2, 2, 'Economic Publishers', 'Economic theory and policy')
ON CONFLICT (isbn) DO NOTHING;

-- Sample Borrowings (Mix of active, returned, and overdue)
INSERT INTO borrowings (user_id, resource_id, borrow_date, due_date, return_date, renewals, status) VALUES
-- Active borrowings
(3, 5, CURRENT_DATE - INTERVAL '3 days', CURRENT_DATE + INTERVAL '11 days', NULL, 0, 'Active'),
(4, 6, CURRENT_DATE - INTERVAL '5 days', CURRENT_DATE + INTERVAL '9 days', NULL, 1, 'Active'),
(5, 7, CURRENT_DATE - INTERVAL '7 days', CURRENT_DATE + INTERVAL '7 days', NULL, 0, 'Active'),
(6, 8, CURRENT_DATE - INTERVAL '2 days', CURRENT_DATE + INTERVAL '12 days', NULL, 0, 'Active'),
-- Overdue borrowings
(7, 9, CURRENT_DATE - INTERVAL '20 days', CURRENT_DATE - INTERVAL '6 days', NULL, 0, 'Active'),
(8, 10, CURRENT_DATE - INTERVAL '35 days', CURRENT_DATE - INTERVAL '21 days', NULL, 2, 'Active'),
-- Returned borrowings
(9, 11, CURRENT_DATE - INTERVAL '30 days', CURRENT_DATE - INTERVAL '16 days', CURRENT_DATE - INTERVAL '15 days', 1, 'Returned'),
(10, 12, CURRENT_DATE - INTERVAL '25 days', CURRENT_DATE - INTERVAL '11 days', CURRENT_DATE - INTERVAL '10 days', 0, 'Returned'),
(11, 13, CURRENT_DATE - INTERVAL '45 days', CURRENT_DATE - INTERVAL '31 days', CURRENT_DATE - INTERVAL '28 days', 1, 'Returned')
ON CONFLICT DO NOTHING;

-- Sample Reservations
INSERT INTO reservations (user_id, resource_id, status) VALUES
(12, 5, 'Pending'),
(13, 6, 'Pending'),
(4, 7, 'Fulfilled')
ON CONFLICT DO NOTHING;

-- Sample Notifications
INSERT INTO notifications (user_id, message, is_read) VALUES
(3, 'Your book "Harry Potter and the Sorcerers Stone" is due in 3 days.', false),
(4, 'Your book has been renewed successfully. New due date: ' || (CURRENT_DATE + INTERVAL '9 days')::date, false),
(7, 'Reminder: Your book is overdue. Please return it as soon as possible.', false),
(9, 'Thank you for returning your book on time!', true),
(12, 'Your reserved book "Harry Potter and the Sorcerers Stone" is now available.', false)
ON CONFLICT DO NOTHING;

-- Sample Library Logs
INSERT INTO library_logs (user_id, action, entity_type, entity_id, description) VALUES
(1, 'LOGIN', 'USER', 1, 'Director logged in'),
(2, 'LOGIN', 'USER', 2, 'Librarian Jane Doe logged in'),
(3, 'BORROW_RESOURCE', 'RESOURCE', 5, 'Patron Alice Johnson borrowed "Harry Potter and the Sorcerers Stone"'),
(4, 'RENEW_BORROWING', 'BORROWING', 2, 'Patron Bob Smith renewed borrowing'),
(2, 'ADD_RESOURCE', 'RESOURCE', 40, 'Librarian added new book "The Midnight Library"'),
(2, 'UPDATE_USER', 'USER', 5, 'Librarian updated patron Emma Davis information'),
(9, 'RETURN_RESOURCE', 'RESOURCE', 11, 'Patron Isabel Taylor returned book'),
(1, 'CREATE_LIBRARIAN', 'USER', 11, 'Director created new librarian account'),
(3, 'RESERVE_RESOURCE', 'RESOURCE', 8, 'Patron Alice Johnson reserved a book')
ON CONFLICT DO NOTHING;