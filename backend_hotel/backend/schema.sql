-- =============================================
-- HOTEL DATABASE SCHEMA
-- Jalankan file ini di PostgreSQL (pgAdmin/psql)
-- =============================================

DROP TABLE IF EXISTS payments CASCADE;
DROP TABLE IF EXISTS bookings CASCADE;
DROP TABLE IF EXISTS room_facilities CASCADE;
DROP TABLE IF EXISTS facilities CASCADE;
DROP TABLE IF EXISTS room_images CASCADE;
DROP TABLE IF EXISTS rooms CASCADE;
DROP TABLE IF EXISTS payment_methods CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- =============================================
-- TABEL USERS
-- =============================================
CREATE TABLE users (
  user_id    SERIAL PRIMARY KEY,
  name       VARCHAR(100) NOT NULL,
  username   VARCHAR(50)  NOT NULL UNIQUE,
  email      VARCHAR(100) NOT NULL UNIQUE,
  password   VARCHAR(255) NOT NULL,
  phone      VARCHAR(20),
  address    TEXT,
  role       VARCHAR(20)  NOT NULL DEFAULT 'customer',
  created_at TIMESTAMP    NOT NULL DEFAULT NOW()
);

-- =============================================
-- TABEL ROOMS
-- =============================================
CREATE TABLE rooms (
  room_id     SERIAL PRIMARY KEY,
  room_number VARCHAR(10)   NOT NULL UNIQUE,
  type        VARCHAR(20)   NOT NULL,
  name        VARCHAR(100)  NOT NULL,
  description TEXT,
  price       NUMERIC(12,2) NOT NULL,
  capacity    INT           NOT NULL DEFAULT 2,
  status      VARCHAR(20)   NOT NULL DEFAULT 'Available',
  created_at  TIMESTAMP     NOT NULL DEFAULT NOW()
);

-- =============================================
-- TABEL ROOM_IMAGES (max 2 per kamar)
-- =============================================
CREATE TABLE room_images (
  image_id   SERIAL PRIMARY KEY,
  room_id    INT          NOT NULL REFERENCES rooms(room_id) ON DELETE CASCADE,
  image_url  VARCHAR(255) NOT NULL,
  created_at TIMESTAMP    NOT NULL DEFAULT NOW()
);

-- =============================================
-- TABEL FACILITIES
-- =============================================
CREATE TABLE facilities (
  facility_id SERIAL PRIMARY KEY,
  name        VARCHAR(100) NOT NULL UNIQUE
);

-- =============================================
-- TABEL ROOM_FACILITIES (many-to-many)
-- =============================================
CREATE TABLE room_facilities (
  room_id     INT NOT NULL REFERENCES rooms(room_id)         ON DELETE CASCADE,
  facility_id INT NOT NULL REFERENCES facilities(facility_id) ON DELETE CASCADE,
  PRIMARY KEY (room_id, facility_id)
);

-- =============================================
-- TABEL PAYMENT_METHODS
-- =============================================
CREATE TABLE payment_methods (
  method_id SERIAL PRIMARY KEY,
  name      VARCHAR(50) NOT NULL,
  type      VARCHAR(20) NOT NULL
);

-- =============================================
-- TABEL BOOKINGS
-- status: pending, confirmed, cancelled, checked_out
-- =============================================
CREATE TABLE bookings (
  booking_id   SERIAL PRIMARY KEY,
  booking_code VARCHAR(30)   NOT NULL UNIQUE,
  user_id      INT           NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  room_id      INT           NOT NULL REFERENCES rooms(room_id) ON DELETE CASCADE,
  check_in     DATE          NOT NULL,
  check_out    DATE          NOT NULL,
  num_guests   INT           NOT NULL DEFAULT 1,
  total_price  NUMERIC(12,2) NOT NULL,
  status       VARCHAR(20)   NOT NULL DEFAULT 'pending',
  created_at   TIMESTAMP     NOT NULL DEFAULT NOW()
);

-- =============================================
-- TABEL PAYMENTS
-- status: pending, paid
-- =============================================
CREATE TABLE payments (
  payment_id  SERIAL PRIMARY KEY,
  booking_id  INT          NOT NULL REFERENCES bookings(booking_id) ON DELETE CASCADE,
  method_id   INT          REFERENCES payment_methods(method_id),
  proof_image VARCHAR(255),
  status      VARCHAR(20)  NOT NULL DEFAULT 'pending',
  verified_at TIMESTAMP,
  verified_by INT          REFERENCES users(user_id),
  created_at  TIMESTAMP    NOT NULL DEFAULT NOW()
);

-- =============================================
-- SEED: ADMIN (password: admin123)
-- =============================================
INSERT INTO users (name, username, email, password, role) VALUES
  ('Administrator','admin','admin@hotel.com',
   '$2b$10$ZFik0VkwMNLGuWzkZ8x7qeQn0KjdcTdHb7iu/vhsbUrWE7VB/V/EK',
   'admin');

-- =============================================
-- SEED: 10 CUSTOMER (password: admin123)
-- =============================================
INSERT INTO users (name, username, email, password, phone, address, role) VALUES
  ('Budi Santoso',   'budi_santoso',   'budi@gmail.com',   '$2b$10$ZFik0VkwMNLGuWzkZ8x7qeQn0KjdcTdHb7iu/vhsbUrWE7VB/V/EK','081234567801','Jl. Merdeka No.1, Jakarta',    'customer'),
  ('Siti Rahayu',    'siti_rahayu',    'siti@gmail.com',   '$2b$10$ZFik0VkwMNLGuWzkZ8x7qeQn0KjdcTdHb7iu/vhsbUrWE7VB/V/EK','081234567802','Jl. Sudirman No.2, Bandung',   'customer'),
  ('Ahmad Fauzi',    'ahmad_fauzi',    'ahmad@gmail.com',  '$2b$10$ZFik0VkwMNLGuWzkZ8x7qeQn0KjdcTdHb7iu/vhsbUrWE7VB/V/EK','081234567803','Jl. Gatot Subroto No.3, Bekasi','customer'),
  ('Dewi Lestari',   'dewi_lestari',   'dewi@gmail.com',   '$2b$10$ZFik0VkwMNLGuWzkZ8x7qeQn0KjdcTdHb7iu/vhsbUrWE7VB/V/EK','081234567804','Jl. Ahmad Yani No.4, Surabaya','customer'),
  ('Rizky Pratama',  'rizky_pratama',  'rizky@gmail.com',  '$2b$10$ZFik0VkwMNLGuWzkZ8x7qeQn0KjdcTdHb7iu/vhsbUrWE7VB/V/EK','081234567805','Jl. Diponegoro No.5, Semarang','customer'),
  ('Maya Indah',     'maya_indah',     'maya@gmail.com',   '$2b$10$ZFik0VkwMNLGuWzkZ8x7qeQn0KjdcTdHb7iu/vhsbUrWE7VB/V/EK','081234567806','Jl. Pahlawan No.6, Yogyakarta','customer'),
  ('Hendra Wijaya',  'hendra_wijaya',  'hendra@gmail.com', '$2b$10$ZFik0VkwMNLGuWzkZ8x7qeQn0KjdcTdHb7iu/vhsbUrWE7VB/V/EK','081234567807','Jl. Veteran No.7, Medan',      'customer'),
  ('Fitri Handayani','fitri_handayani','fitri@gmail.com',  '$2b$10$ZFik0VkwMNLGuWzkZ8x7qeQn0KjdcTdHb7iu/vhsbUrWE7VB/V/EK','081234567808','Jl. Imam Bonjol No.8, Malang', 'customer'),
  ('Doni Kurniawan', 'doni_kurniawan', 'doni@gmail.com',   '$2b$10$ZFik0VkwMNLGuWzkZ8x7qeQn0KjdcTdHb7iu/vhsbUrWE7VB/V/EK','081234567809','Jl. Hayam Wuruk No.9, Bali',   'customer'),
  ('Rina Marlina',   'rina_marlina',   'rina@gmail.com',   '$2b$10$ZFik0VkwMNLGuWzkZ8x7qeQn0KjdcTdHb7iu/vhsbUrWE7VB/V/EK','081234567810','Jl. Kertajaya No.10, Makassar','customer');

-- =============================================
-- SEED: FASILITAS
-- =============================================
INSERT INTO facilities (name) VALUES
  ('WiFi'),('AC'),('TV'),('Breakfast'),
  ('Water Heater'),('Bathtub'),('Minibar'),('Balcony');

-- =============================================
-- SEED: METODE PEMBAYARAN
-- =============================================
INSERT INTO payment_methods (name, type) VALUES
  ('Dana','ewallet'),('OVO','ewallet'),('GoPay','ewallet'),
  ('ShopeePay','ewallet'),('QRIS','ewallet'),
  ('BCA','bank'),('BRI','bank'),('BNI','bank'),('Mandiri','bank');

-- =============================================
-- SEED: 4 KAMAR
-- =============================================
INSERT INTO rooms (room_number, type, name, description, price, capacity) VALUES
  ('101','Standard','Standard Room','Kamar standar nyaman dengan fasilitas lengkap.',        350000,2),
  ('201','Deluxe',  'Deluxe Room',  'Kamar deluxe dengan pemandangan kota yang indah.',      550000,2),
  ('301','Family',  'Family Room',  'Kamar luas cocok untuk keluarga dengan 2 double bed.',  750000,4),
  ('401','Suite',   'Suite Room',   'Suite mewah dengan ruang tamu terpisah dan jacuzzi.', 1200000,2);

-- =============================================
-- SEED: FASILITAS PER KAMAR
-- =============================================
-- Standard (room 1): WiFi, AC, TV
INSERT INTO room_facilities VALUES (1,1),(1,2),(1,3);
-- Deluxe (room 2): WiFi, AC, TV, Breakfast, Water Heater
INSERT INTO room_facilities VALUES (2,1),(2,2),(2,3),(2,4),(2,5);
-- Family (room 3): WiFi, AC, TV, Breakfast, Water Heater
INSERT INTO room_facilities VALUES (3,1),(3,2),(3,3),(3,4),(3,5);
-- Suite (room 4): Semua fasilitas
INSERT INTO room_facilities VALUES (4,1),(4,2),(4,3),(4,4),(4,5),(4,6),(4,7),(4,8);

-- =============================================
-- SEED: 15 BOOKING
-- user_id: 2=Budi, 3=Siti, 4=Ahmad, 5=Dewi,
--          6=Rizky, 7=Maya, 8=Hendra, 9=Fitri,
--          10=Doni, 11=Rina
-- room_id: 1=Standard, 2=Deluxe, 3=Family, 4=Suite
-- =============================================
INSERT INTO bookings (booking_code, user_id, room_id, check_in, check_out, num_guests, total_price, status, created_at) VALUES
  -- 10 booking SELESAI (checked_out)
  ('BK-20260510-1001', 2, 1,'2026-05-10','2026-05-13',2, 1050000,'checked_out','2026-05-09 10:00:00'),
  ('BK-20260515-1002', 3, 2,'2026-05-15','2026-05-17',2, 1100000,'checked_out','2026-05-14 11:00:00'),
  ('BK-20260520-1003', 4, 4,'2026-05-20','2026-05-23',2, 3600000,'checked_out','2026-05-19 09:00:00'),
  ('BK-20260525-1004', 5, 3,'2026-05-25','2026-05-28',4, 2250000,'checked_out','2026-05-24 14:00:00'),
  ('BK-20260601-1005', 6, 1,'2026-06-01','2026-06-03',2,  700000,'checked_out','2026-05-31 08:00:00'),
  ('BK-20260605-1006', 7, 2,'2026-06-05','2026-06-08',2, 1650000,'checked_out','2026-06-04 10:00:00'),
  ('BK-20260610-1007', 8, 4,'2026-06-10','2026-06-12',2, 2400000,'checked_out','2026-06-09 13:00:00'),
  ('BK-20260612-1008', 9, 3,'2026-06-12','2026-06-15',3, 2250000,'checked_out','2026-06-11 09:30:00'),
  ('BK-20260615-1009',10, 1,'2026-06-15','2026-06-17',1,  700000,'checked_out','2026-06-14 15:00:00'),
  ('BK-20260616-1010',11, 2,'2026-06-16','2026-06-18',2, 1100000,'checked_out','2026-06-15 11:00:00'),
  -- 1 booking DIBATALKAN
  ('BK-20260505-1011', 6, 4,'2026-05-05','2026-05-07',2, 2400000,'cancelled',  '2026-05-04 10:00:00'),
  -- 2 booking CONFIRMED (akan datang, sudah bayar)
  ('BK-20260618-1012', 2, 2,'2026-06-20','2026-06-23',2, 1650000,'confirmed',  '2026-06-18 09:00:00'),
  ('BK-20260618-1013', 4, 3,'2026-06-22','2026-06-25',4, 2250000,'confirmed',  '2026-06-18 10:00:00'),
  -- 2 booking PENDING (belum bayar)
  ('BK-20260618-1014', 3, 4,'2026-07-01','2026-07-04',2, 3600000,'pending',    '2026-06-18 14:00:00'),
  ('BK-20260618-1015', 7, 1,'2026-07-05','2026-07-07',2,  700000,'pending',    '2026-06-18 15:00:00');

-- =============================================
-- SEED: PAYMENTS
-- =============================================
INSERT INTO payments (booking_id, method_id, proof_image, status, verified_at, verified_by, created_at) VALUES
  (1, 1,'/uploads/payments/bukti_1.jpg', 'paid','2026-05-09 12:00:00',1,'2026-05-09 10:30:00'),
  (2, 2,'/uploads/payments/bukti_2.jpg', 'paid','2026-05-14 13:00:00',1,'2026-05-14 11:30:00'),
  (3, 6,'/uploads/payments/bukti_3.jpg', 'paid','2026-05-19 10:00:00',1,'2026-05-19 09:30:00'),
  (4, 9,'/uploads/payments/bukti_4.jpg', 'paid','2026-05-24 15:00:00',1,'2026-05-24 14:30:00'),
  (5, 3,'/uploads/payments/bukti_5.jpg', 'paid','2026-05-31 09:00:00',1,'2026-05-31 08:30:00'),
  (6, 7,'/uploads/payments/bukti_6.jpg', 'paid','2026-06-04 11:00:00',1,'2026-06-04 10:30:00'),
  (7, 5,'/uploads/payments/bukti_7.jpg', 'paid','2026-06-09 14:00:00',1,'2026-06-09 13:30:00'),
  (8, 8,'/uploads/payments/bukti_8.jpg', 'paid','2026-06-11 10:00:00',1,'2026-06-11 09:30:00'),
  (9, 4,'/uploads/payments/bukti_9.jpg', 'paid','2026-06-14 16:00:00',1,'2026-06-14 15:30:00'),
  (10,6,'/uploads/payments/bukti_10.jpg','paid','2026-06-15 12:00:00',1,'2026-06-15 11:30:00'),
  -- cancelled: tidak ada bukti
  (11,NULL,NULL,'pending',NULL,NULL,'2026-05-04 10:30:00'),
  -- confirmed: sudah bayar
  (12,2,'/uploads/payments/bukti_12.jpg','paid','2026-06-18 09:30:00',1,'2026-06-18 09:10:00'),
  (13,6,'/uploads/payments/bukti_13.jpg','paid','2026-06-18 10:30:00',1,'2026-06-18 10:10:00'),
  -- pending: belum bayar
  (14,NULL,NULL,'pending',NULL,NULL,'2026-06-18 14:10:00'),
  (15,NULL,NULL,'pending',NULL,NULL,'2026-06-18 15:10:00');

-- =============================================
-- UPDATE STATUS KAMAR (sesuai booking aktif)
-- Room 2 & 3 = Booked (confirmed Jun 20-25)
-- Room 4 & 1 = Booked (pending Jul, sudah dibooking)
-- =============================================
UPDATE rooms SET status = 'Booked' WHERE room_id IN (1,2,3,4);

-- =============================================
-- VERIFIKASI AKHIR
-- =============================================
SELECT 'USERS'    AS tabel, COUNT(*) AS total FROM users    UNION ALL
SELECT 'ROOMS',    COUNT(*) FROM rooms    UNION ALL
SELECT 'BOOKINGS', COUNT(*) FROM bookings UNION ALL
SELECT 'PAYMENTS', COUNT(*) FROM payments UNION ALL
SELECT 'FACILITIES', COUNT(*) FROM facilities UNION ALL
SELECT 'PAYMENT_METHODS', COUNT(*) FROM payment_methods;
