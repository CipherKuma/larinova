export interface FAQItem {
  q: string;
  a: string;
}

export const FAQS_ID: FAQItem[] = [
  {
    q: "Seberapa akurat transkripsi Bahasa Indonesia+Inggris?",
    a: "Larinova menggunakan Deepgram AI yang dibangun khusus untuk mengenali campuran Bahasa Indonesia+Inggris dalam percakapan medis. Sistem ini menangani terminologi medis secara native - termasuk nama obat, dosis, dan istilah klinis. Akurasi terus meningkat seiring bertambahnya data percakapan medis.",
  },
  {
    q: "Apakah data pasien saya aman?",
    a: "Ya. Semua rekaman konsultasi diproses secara real-time dan tidak disimpan secara permanen. Catatan yang dihasilkan dienkripsi dan disimpan di server Indonesia. Kami tidak pernah menjual atau berbagi data pasien kepada pihak ketiga. Data Anda sepenuhnya milik Anda.",
  },
  {
    q: "Apakah bisa digunakan tanpa internet?",
    a: "Saat ini, Larinova membutuhkan koneksi internet untuk transkripsi real-time dan pemrosesan AI. Kami sedang mengembangkan mode offline untuk daerah dengan konektivitas terbatas. Aplikasi akan mengantri rekaman secara otomatis jika koneksi terputus di tengah konsultasi.",
  },
  {
    q: "Bagaimana kalau AI salah dalam catatan?",
    a: "Setiap catatan SOAP dan resep yang dihasilkan ditampilkan untuk ditinjau sebelum finalisasi. Anda bisa mengedit bagian manapun secara langsung. Larinova adalah asisten, bukan pengganti - dokter selalu memiliki wewenang penuh atas dokumentasi klinis.",
  },
  {
    q: "Bahasa apa saja yang didukung?",
    a: "Kami saat ini mendukung campuran Bahasa Indonesia+Inggris dan Jawa+Inggris, dengan Sunda dan bahasa daerah lainnya segera hadir. Kami meluncurkannya secara bertahap dengan pelatihan kosakata medis untuk masing-masing bahasa.",
  },
  {
    q: "Bisakah catatan diekspor ke sistem yang sudah ada?",
    a: "Ya. Catatan dan resep dapat diekspor sebagai PDF, dan kami sedang membangun integrasi langsung dengan sistem manajemen klinik populer di Indonesia. Jika Anda menggunakan sistem tertentu, beri tahu kami - pengguna awal mendapatkan prioritas integrasi.",
  },
  {
    q: "Berapa biayanya?",
    a: "Gratis 1 bulan dengan konsultasi tanpa batas dan akses semua fitur. Paket Pro untuk Indonesia sedang dalam persiapan - daftar sekarang untuk mendapatkan harga early adopter eksklusif. Tidak perlu kartu kredit.",
  },
  {
    q: "Saya tidak terlalu paham teknologi. Apakah mudah digunakan?",
    a: "Sangat mudah. Buka aplikasi, ketuk Rekam, bicara dengan pasien, ketuk Berhenti. Itu saja. Catatan SOAP dan resep muncul dalam 30 detik. Jika Anda bisa menggunakan WhatsApp, Anda bisa menggunakan Larinova. Tidak perlu training.",
  },
];
