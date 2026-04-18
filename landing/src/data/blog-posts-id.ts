import type { BlogPost } from "./blog-posts";

export const BLOG_POSTS_ID: BlogPost[] = [
  {
    slug: "mengapa-dokter-indonesia-butuh-ai-scribe-yang-memahami-bahasa-mereka",
    title:
      "Mengapa dokter Indonesia membutuhkan AI scribe yang memahami bahasa mereka",
    excerpt:
      "AI medical scribe global gagal menangani Bahasa Indonesia, Jawa, dan Sunda. Inilah mengapa pengenalan ucapan campur kode mengubah segalanya bagi layanan kesehatan Indonesia.",
    date: "18 Mar 2026",
    tag: "Produk",
    image: "/images/hero-doctor-id.jpg",
    author: "Gabriel Antony Xaviour",
    readingTime: "5 menit baca",
    content: [
      {
        type: "paragraph",
        content:
          "Masuklah ke klinik mana pun di Jakarta, Surabaya, atau Bandung dan dengarkan. Dokter bertanya kepada pasien apa keluhannya dalam Bahasa Indonesia. Pasien menggambarkan nyeri dada menggunakan campuran kata Bahasa Indonesia dan istilah medis Inggris yang mereka temukan di Google. Dokter merespons dengan diagnosis diselingi nama obat dalam bahasa Inggris, instruksi dosis dalam Bahasa Indonesia, dan jadwal kontrol yang berpindah antara kedua bahasa dalam satu kalimat. Inilah cara praktik kedokteran Indonesia sebenarnya terdengar. Dan tidak satu pun produk medical scribe global yang mampu menanganinya.",
      },
      {
        type: "heading",
        level: 2,
        content: "Masalah campur kode yang tidak pernah dibicarakan",
      },
      {
        type: "paragraph",
        content:
          'Ketika dokter Indonesia berbicara dengan pasien, mereka tidak memilih satu bahasa dan bertahan dengannya. Mereka melakukan code-mixing — menjalin Bahasa Indonesia, Jawa, atau Sunda dengan terminologi medis Inggris dalam satu tarikan napas. Seorang dokter jantung di Jakarta mungkin berkata: "Bapak ada mild hypertension, jadi kita mulai Amlodipine 5mg ya, diminum setiap pagi sesudah makan." Itu struktur Bahasa Indonesia, diagnosis Inggris, nama obat Inggris, dan instruksi Bahasa Indonesia — semua dalam satu kalimat. OpenAI Whisper dan Google Speech-to-Text memperlakukan ini sebagai aliran satu bahasa. Mereka memilih satu model bahasa dan memaksa seluruh ucapan melewatinya. Hasilnya adalah terminologi medis yang kacau, informasi dosis yang hilang, dan catatan klinis yang tidak akan dipercaya dokter mana pun.',
      },
      {
        type: "heading",
        level: 2,
        content:
          "Mengapa speech-to-text Barat gagal untuk konsultasi Indonesia",
      },
      {
        type: "list",
        items: [
          'Ketidakcocokan aksen: Model yang dilatih dengan bahasa Inggris Amerika dan Inggris secara konsisten salah mengenali pengucapan nama obat oleh dokter Indonesia. Metformin menjadi "met for men." Atorvastatin menjadi derau yang tidak bisa dikenali.',
          "Tidak ada dukungan code-switching: Deteksi bahasa Whisper memilih satu bahasa per segmen. Ketika dokter beralih dari Bahasa Indonesia ke Inggris untuk nama obat dan kembali ke Bahasa Indonesia untuk instruksi, model tersebut menghilangkan bahasa Inggris atau menghilangkan Bahasa Indonesianya.",
          "Kesenjangan kosakata medis: Model STT generik tidak memiliki pelatihan tentang nama merek farmasi Indonesia (Sanmol, Bodrex, Promag), terminologi penyakit regional, atau cara spesifik dokter Indonesia menyingkat istilah klinis.",
          'Transkripsi tanpa konteks: Tanpa memahami bahwa percakapan bersifat medis, model-model ini tidak dapat membedakan antara "gula" (makanan) dan "gula" (diabetes, seperti yang biasa disebut pasien di seluruh Indonesia).',
        ],
      },
      {
        type: "heading",
        level: 2,
        content: "Apa yang dipecahkan oleh pendekatan Deepgram",
      },
      {
        type: "paragraph",
        content:
          "Deepgram membangun mesin speech-to-text yang dirancang untuk menangani ucapan multibahasa dengan presisi tinggi. Tidak seperti dukungan multibahasa yang ditempel belakangan, Deepgram memperlakukan campur kode sebagai tipe input kelas satu. Mesinnya dilatih pada data ucapan nyata dari berbagai domain di mana terminologi teknis Inggris muncul di dalam kerangka bahasa lokal. Ketika kami membangun Larinova di atas Deepgram, kami menambahkan lapisan kosakata medis. Ini berarti mesin STT tahu bahwa ketika dokter berbahasa Indonesia mengucapkan kata yang terdengar seperti Inggris, itu kemungkinan besar nama obat, diagnosis, atau prosedur — dan harus ditranskripsikan dengan presisi klinis, bukan dipaksa melalui model fonetik Bahasa Indonesia.",
      },
      {
        type: "heading",
        level: 2,
        content: "Kami menjalankan konsultasi yang sama melalui tiga mesin",
      },
      {
        type: "paragraph",
        content:
          'Selama pengujian awal, kami merekam konsultasi 6 menit antara seorang dokter jantung di Menteng dan pasien berusia 54 tahun dengan dugaan hipertensi. Percakapan tersebut kira-kira 60% Bahasa Indonesia, 40% Inggris, dengan nama obat dan tanda vital dalam bahasa Inggris. Kami menjalankan audio yang sama melalui OpenAI Whisper, Google Cloud Speech-to-Text, dan Deepgram. Whisper mentranskripsikan "Amlodipine" sebagai "am lo di pine" dan melewatkan dosis sepenuhnya. Google STT menangkap segmen Inggris dengan cukup baik tetapi menghilangkan sebagian besar jaringan konektif Bahasa Indonesia antara istilah klinis, menghasilkan transkrip yang terlihat seperti daftar kata kunci. Deepgram menghasilkan transkrip yang koheren dan mudah dibaca di mana struktur kalimat Bahasa Indonesia terjaga dan istilah medis Inggris teridentifikasi dan dieja dengan benar. Perbedaannya tidak halus. Satu output dapat digunakan untuk pembuatan catatan SOAP. Dua lainnya tidak.',
      },
      {
        type: "quote",
        content:
          'Kesenjangan ini bukan tentang persentase akurasi pada benchmark. Ini tentang apakah dokter melihat transkrip dan berkata "ya, itu yang saya katakan" atau membuangnya dan menulis catatan dengan tangan.',
      },
      {
        type: "heading",
        level: 2,
        content: "Apa artinya ini bagi dokter di lapangan",
      },
      {
        type: "paragraph",
        content:
          "Rata-rata dokter Indonesia melihat 30-50 pasien per hari. Banyak yang melihat lebih. Dokumentasi memakan waktu 15-20 menit per pasien jika dilakukan secara manual. Itu berjam-jam menulis setelah klinik tutup — atau lebih buruk, catatan yang tidak pernah ditulis sama sekali. Ketika transkripsi berfungsi dalam bahasa yang benar-benar digunakan dokter, dokumentasi berhenti menjadi hambatan. Anda berbicara dengan pasien persis seperti biasa. Larinova mendengarkan, memahami ucapan campur kode, mengekstrak informasi klinis, dan menghasilkan catatan SOAP terstruktur. Tidak perlu perubahan perilaku. Tidak perlu bicara pelan-pelan. Tidak perlu beralih ke bahasa Inggris demi AI.",
      },
      {
        type: "callout",
        variant: "tip",
        content:
          "Larinova saat ini mendukung konsultasi campur kode Bahasa Indonesia+Inggris. Dukungan untuk Jawa+Inggris dan Sunda+Inggris akan diluncurkan dalam dua kuartal ke depan.",
      },
    ],
  },
  {
    slug: "catatan-soap-dalam-30-detik",
    title:
      "Catatan SOAP dalam 30 detik: bagaimana Larinova menghasilkan dokumentasi klinis",
    excerpt:
      "Penjelasan mendalam tentang bagaimana kami mengubah konsultasi Bahasa Indonesia+Inggris menjadi catatan Subjektif, Objektif, Asesmen, dan Rencana secara otomatis.",
    date: "15 Mar 2026",
    tag: "Teknologi",
    image: "/images/hero-doctor-3-id.jpg",
    author: "Gabriel Antony Xaviour",
    readingTime: "7 menit baca",
    content: [
      {
        type: "paragraph",
        content:
          "Setiap mahasiswa kedokteran mempelajari format SOAP. Subjektif — apa yang pasien ceritakan. Objektif — apa yang Anda amati dan ukur. Asesmen — interpretasi klinis Anda. Plan (Rencana) — apa yang akan Anda lakukan. Ini adalah struktur universal dokumentasi klinis. Tapi menulis catatan SOAP dengan tangan setelah melihat 40 pasien adalah alasan mengapa dokter mengalami burnout. Larinova menghasilkannya secara otomatis dari audio konsultasi. Inilah caranya secara detail.",
      },
      {
        type: "heading",
        level: 2,
        content: "Langkah 1: Penangkapan suara real-time",
      },
      {
        type: "paragraph",
        content:
          "Ketika dokter menekan Rekam di aplikasi Larinova, penangkapan audio langsung dimulai di perangkat. Kami mengalirkan potongan audio ke mesin speech-to-text Deepgram secara real-time. Tidak ada unggahan batch di akhir — transkripsi terjadi secara berkelanjutan, yang berarti dokter melihat kata-kata muncul di layar saat mereka berbicara. Pendekatan streaming real-time penting karena dua alasan. Pertama, ini memberi kepercayaan kepada dokter bahwa sistem benar-benar mendengarkan dan memahami. Kedua, ini memungkinkan pipeline NLP kami untuk memulai ekstraksi klinis sebelum konsultasi berakhir, yang merupakan cara kami mencapai target 30 detik untuk pembuatan catatan setelah percakapan selesai.",
      },
      {
        type: "heading",
        level: 2,
        content: "Langkah 2: Speech-to-text campur kode",
      },
      {
        type: "paragraph",
        content:
          "Model Deepgram menangani tantangan transkripsi inti: dokter berbicara Bahasa Indonesia dengan istilah medis Inggris tertanam di seluruhnya. Model ini tidak mencoba mendeteksi batas bahasa dan beralih model — ia memproses input campuran secara native. Code-switching dalam percakapan medis Indonesia terjadi di tingkat kata, bukan di tingkat kalimat. Satu klausa mungkin berisi kata kerja Bahasa Indonesia, nama obat Inggris, ekspresi kuantitas Bahasa Indonesia, dan diagnosis Inggris. Deepgram menghasilkan transkrip terpadu yang mempertahankan makna terlepas dari bahasa mana setiap kata berasal.",
      },
      {
        type: "heading",
        level: 2,
        content: "Langkah 3: Ekstraksi entitas klinis",
      },
      {
        type: "paragraph",
        content:
          'Setelah kami memiliki transkrip mentah, lapisan NLP kami mengidentifikasi dan menandai entitas klinis: gejala, tanda vital yang disebutkan secara verbal, obat-obatan, dosis, frekuensi, diagnosis, prosedur, dan instruksi tindak lanjut. Ini bukan sekadar pencocokan kata kunci. Ketika pasien mengatakan "sudah dua minggu saya sakit kepala", sistem perlu memahami bahwa "dua minggu" adalah durasi, "sakit kepala" adalah gejala, dan kerangka gramatikal Bahasa Indonesia memberi tahu kita bahwa ini adalah keluhan yang dilaporkan pasien sendiri — yang termasuk dalam bagian Subjektif.',
      },
      {
        type: "callout",
        variant: "info",
        content:
          "Model ekstraksi entitas kami di-fine-tune pada transkrip klinis Indonesia yang telah dianonimkan. Model ini mengenali merek obat Indonesia (Sanmol, Bodrex, Promag), deskripsi gejala regional, dan cara spesifik dokter Indonesia mengomunikasikan temuan klinis secara verbal.",
      },
      {
        type: "heading",
        level: 2,
        content: "Langkah 4: Pemetaan struktur SOAP",
      },
      {
        type: "paragraph",
        content:
          "Dengan entitas klinis yang telah ditandai, sistem memetakan setiap informasi ke bagian SOAP yang benar. Gejala yang dilaporkan pasien, riwayat, dan keluhan masuk ke Subjektif. Tanda vital, temuan pemeriksaan, dan hasil tes masuk ke Objektif. Pernyataan diagnostik dokter dan penalaran klinis masuk ke Asesmen. Resep, saran gaya hidup, rujukan, dan jadwal tindak lanjut masuk ke Plan. Pemetaan ini tidak murni berbasis aturan. Konsultasi itu berantakan — dokter mungkin menyebutkan obat saat membahas asesmen, lalu kembali ke gejala yang terlupa. Model kami menangani percakapan non-linear dengan membangun gambaran klinis lengkap terlebih dahulu, lalu mengorganisasikannya ke dalam struktur SOAP.",
      },
      {
        type: "heading",
        level: 2,
        content: "Langkah 5: Pembuatan resep",
      },
      {
        type: "paragraph",
        content:
          'Bersamaan dengan catatan SOAP, Larinova mengekstrak resep sebagai dokumen terstruktur terpisah. Setiap obat mendapatkan entri sendiri dengan nama obat, dosis, frekuensi, durasi, dan instruksi khusus (sebelum makan, sesudah makan, dengan air). Sistem melakukan cross-reference terhadap database produk farmasi Indonesia untuk menormalkan nama obat dan menandai potensi masalah — seperti jika dokter mengatakan "Bodrex" tetapi pasien menyebutkan alergi terhadap parasetamol. Ini bukan alat diagnostik dan kami tidak menggantikan penilaian dokter. Ini adalah jaring pengaman yang menangkap konflik yang jelas selama langkah dokumentasi.',
      },
      {
        type: "heading",
        level: 3,
        content: "Mengapa 30 detik dan bukan instan?",
      },
      {
        type: "paragraph",
        content:
          "Transkripsi terjadi secara real-time, tetapi penyusunan SOAP dan ekstraksi resep berjalan sebagai proses akhir setelah rekaman dihentikan. Ini memakan waktu sekitar 20-30 detik tergantung panjang konsultasi. Kami bisa mendorong hasil parsial lebih cepat, tetapi kami menemukan bahwa dokter lebih suka melihat catatan lengkap dan terstruktur daripada melihatnya dirakit secara real-time. Rasanya lebih terpercaya. Anda menghentikan rekaman, melirik ponsel selama beberapa detik, dan catatan SOAP lengkap beserta resep sudah siap untuk ditinjau.",
      },
      {
        type: "heading",
        level: 2,
        content: "Prinsip review-first",
      },
      {
        type: "paragraph",
        content:
          "Setiap catatan SOAP dan resep yang dihasilkan Larinova adalah draft. Catatan muncul dalam antarmuka yang dapat diedit di mana dokter dapat memodifikasi bagian mana pun sebelum menyelesaikan. Kami menampilkan catatan dengan label bagian yang jelas dan pengeditan inline — ketuk paragraf mana pun untuk mengubahnya. Pengujian internal kami menunjukkan bahwa 85% catatan yang dihasilkan tidak memerlukan pengeditan untuk konsultasi rutin. Tapi 15% lainnya adalah tempat kesalahan bersembunyi. Dokumentasi klinis harus akurat. Dokter selalu memiliki keputusan akhir, dan antarmuka dirancang untuk membuat peninjauan dan pengeditan secepat mungkin.",
      },
      {
        type: "quote",
        content:
          "Tujuannya bukan menggantikan penilaian klinis dokter. Tujuannya adalah menghilangkan kerja mekanis mengetik apa yang sudah mereka katakan dengan suara.",
      },
    ],
  },
  {
    slug: "peluncuran-di-jakarta",
    title: "Peluncuran di Jakarta: 100 dokter pertama kami",
    excerpt:
      "Mengapa kami memilih Jakarta sebagai kota peluncuran, apa yang kami pelajari dari dokter pilot, dan apa selanjutnya untuk Larinova di layanan kesehatan Indonesia.",
    date: "12 Mar 2026",
    tag: "Perusahaan",
    image: "/images/doctor-phone-id.jpg",
    author: "Gabriel Antony Xaviour",
    readingTime: "4 menit baca",
    content: [
      {
        type: "paragraph",
        content:
          "Larinova meluncurkan program pilotnya di DKI Jakarta, dimulai dengan 100 dokter di Jakarta Selatan, Jakarta Pusat, dan Tangerang. Kami tidak memilih Jakarta secara acak. Di sinilah campur kode paling intensif, STT berbasis Deepgram kami paling kuat, dan kami bisa secara fisik mengunjungi setiap klinik pilot dalam jarak tempuh satu hari.",
      },
      {
        type: "heading",
        level: 2,
        content: "Mengapa Jakarta lebih dulu",
      },
      {
        type: "paragraph",
        content:
          "Jakarta memiliki konsentrasi fasilitas kesehatan tertinggi di Indonesia, dengan jaringan klinik swasta yang masif. Jakarta sendiri memiliki lebih dari 15.000 praktisi swasta terdaftar. Dokter-dokter ini nyaman dengan teknologi — kebanyakan sudah menggunakan WhatsApp untuk komunikasi dengan pasien dan aplikasi pembayaran digital untuk tagihan. Tapi dokumentasi klinis mereka masih manual. Resep tulisan tangan, catatan manual, atau paling bagus, mengetik ke dalam template dasar di laptop antara pasien. Kota ini juga memiliki tradisi kuat praktik kedokteran dalam Bahasa Indonesia. Dokter di sini tidak hanya sesekali campur kode — Bahasa Indonesia adalah bahasa utama konsultasi untuk sebagian besar pasien. Jika transkripsi Bahasa Indonesia+Inggris kami berhasil di sini, di lingkungan yang paling menuntut secara linguistik, maka akan berhasil di mana pun.",
      },
      {
        type: "heading",
        level: 2,
        content: "Apa yang disampaikan dokter pilot",
      },
      {
        type: "paragraph",
        content:
          "Kami menjalankan alpha tertutup dengan 12 dokter selama empat minggu. Dokter umum, dokter anak, seorang dokter bedah ortopedi, dan dua dokter kulit. Umpan balik mereka membentuk ulang produk kami dengan cara yang tidak kami duga.",
      },
      {
        type: "list",
        items: [
          "Kecepatan di atas akurasi: Dokter lebih peduli mendapatkan catatan 90% akurat dalam 30 detik daripada catatan 99% akurat dalam 2 menit. Mereka bisa memindai dan memperbaiki kesalahan kecil secara instan. Menunggu membunuh alur kerja.",
          "Resep adalah raja: Kami awalnya fokus pada catatan SOAP sebagai output utama. Dokter memberi tahu kami bahwa resep adalah yang mereka butuhkan pertama — itu yang dibawa pasien langsung ke apotek. Catatan SOAP penting tapi sekunder dalam alur konsultasi.",
          "Ponsel, bukan tablet: Setiap dokter pilot menggunakan Larinova di ponsel mereka, bukan tablet atau laptop. Perangkat diletakkan di meja selama konsultasi. Mereka ingin ketuk sekali untuk mulai, sekali untuk berhenti, dan lihat hasilnya. Apa pun yang lebih kompleks dan mereka akan kembali ke pena dan kertas.",
          "Kecemasan privasi itu nyata: Dua dokter awalnya menolak pilot karena khawatir rekaman pasien disimpan atau dibagikan. Kami harus memandu mereka melalui arsitekturnya — pemrosesan real-time, tanpa penyimpanan audio permanen — sebelum mereka mau setuju. Dokumentasi kepercayaan harus menjadi prioritas utama.",
        ],
      },
      {
        type: "heading",
        level: 2,
        content: "Struktur pilot 100 dokter",
      },
      {
        type: "paragraph",
        content:
          "Pilot kami terstruktur dalam tiga tingkat. 30 dokter pertama mendapatkan onboarding white-glove — kami mengunjungi klinik mereka, menyiapkan aplikasi, mengamati dua konsultasi, dan menyetel sistem untuk pola bicara spesifik mereka dan kosakata spesialisasi. 40 dokter berikutnya mendapatkan onboarding jarak jauh dengan jalur dukungan WhatsApp khusus dan panggilan check-in mingguan. 30 dokter terakhir mendapatkan onboarding mandiri dengan panduan dalam aplikasi saja. Pendekatan bertingkat ini memungkinkan kami mengukur seberapa banyak pendampingan yang benar-benar dibutuhkan produk. Jika kohort mandiri bertahan sama baiknya dengan kohort white-glove, kami tahu produknya siap untuk skala tanpa tim lapangan.",
      },
      {
        type: "quote",
        content:
          "Kami tidak mencoba membuktikan bahwa AI medical scribing berhasil. Dragon Medical dan Nuance membuktikan itu satu dekade lalu di AS. Kami membuktikan bahwa itu berhasil dalam Bahasa Indonesia, di klinik 30 pasien per hari, di ponsel, dengan harga terjangkau.",
      },
      {
        type: "heading",
        level: 2,
        content: "Apa selanjutnya",
      },
      {
        type: "paragraph",
        content:
          "Setelah Jakarta, kami memperluas ke Jawa Timur (Jawa+Inggris) dan Jawa Barat (Sunda+Inggris) di Q3 2026. Dukungan Bahasa Indonesia+Inggris sudah terbangun dan sudah diluncurkan bersama pilot Jakarta. Peta jalan kami adalah bahasa-first, bukan fitur-first. Setiap provinsi baru berarti pasangan bahasa baru, kosakata medis baru, merek obat regional baru, dan pola konsultasi baru. Kami tidak mengejar jumlah bahasa. Lima bahasa yang dilakukan dengan benar mengalahkan dua puluh yang dilakukan buruk. 100 dokter pertama di Jakarta akan membentuk segalanya yang mengikuti. Jika Anda seorang dokter di Jakarta, Tangerang, atau Bekasi dan ingin bergabung dengan pilot, daftar tunggu sudah terbuka.",
      },
      {
        type: "callout",
        variant: "tip",
        content:
          "Dokter pilot awal mendapatkan akses seumur hidup ke harga peluncuran dan masukan langsung ke peta jalan produk. Bergabunglah dengan daftar tunggu di larinova.com.",
      },
    ],
  },
];
