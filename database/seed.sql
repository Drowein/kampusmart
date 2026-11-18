
-- KAMPUSMART INITIAL DATA

INSERT INTO categories (name, description)
VALUES
('Elektronik', 'Perangkat elektronik dan aksesoris'),
('Buku', 'Buku pelajaran dan bacaan'),
('Alat Tulis', 'Perlengkapan alat tulis mahasiswa'),
('Fashion', 'Pakaian dan aksesoris'),
('Perlengkapan Kuliah', 'Kebutuhan kegiatan perkuliahan'),
('Aksesoris', 'Aksesoris dan perlengkapan tambahan'),
('Kebutuhan Harian', 'Produk kebutuhan sehari-hari')
ON CONFLICT (name) DO NOTHING;
