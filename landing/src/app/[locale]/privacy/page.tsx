import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { LegalPage, type LegalContent } from "@/components/legal/LegalPage";
import { type Locale } from "@/data/locale-content";
import { SITE_URL } from "@/lib/metadata";

interface PageProps {
  params: Promise<{ locale: string }>;
}

const VALID_LOCALES: Locale[] = ["in", "id"];

export function generateStaticParams() {
  return VALID_LOCALES.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const isId = locale === "id";

  const title = isId ? "Kebijakan Privasi" : "Privacy Policy";
  const description = isId
    ? "Bagaimana Larinova mengumpulkan, menggunakan, menyimpan, dan melindungi data dokter dan pasien di platform OPD kami."
    : "How Larinova collects, uses, stores, and protects doctor and patient data across our OPD platform.";

  return {
    title,
    description,
    alternates: {
      canonical: `${SITE_URL}/${isId ? "id" : "in"}/privacy`,
      languages: {
        "en-IN": `${SITE_URL}/in/privacy`,
        id: `${SITE_URL}/id/privacy`,
        "x-default": `${SITE_URL}/in/privacy`,
      },
    },
    openGraph: {
      title,
      description,
      url: `${SITE_URL}/${isId ? "id" : "in"}/privacy`,
      locale: isId ? "id_ID" : "en_IN",
      type: "website",
    },
  };
}

const LAST_UPDATED_IN = "Last updated: 19 June 2026";
const LAST_UPDATED_ID = "Terakhir diperbarui: 19 Juni 2026";

const inContent: LegalContent = {
  locale: "in",
  eyebrow: "Legal",
  title: "Privacy Policy",
  lastUpdated: LAST_UPDATED_IN,
  intro:
    "Larinova operates an end-to-end outpatient (OPD) platform used by doctors and clinics in India and Indonesia. We handle sensitive personal and health information, and we treat protecting it as a core responsibility — not a checkbox. This policy explains what we collect, why we collect it, how it is stored and secured, how long we keep it, who we share it with, and the rights you have over your data. It applies to larinova.com, app.larinova.com, the patient portal, and the associated APIs and services (together, the \"Service\").",
  sections: [
    {
      heading: "1. Who we are",
      body: [
        "Larinova is operated by Larinova, the data controller for the personal information described in this policy. You can reach our team at hello@larinova.com for any privacy question, request, or concern.",
        "Doctors and clinics that use Larinova to deliver care act as controllers of their own patients' clinical records; Larinova acts as a processor on their behalf for that clinical data, and as a controller for account, billing, and product-usage data.",
      ],
    },
    {
      heading: "2. Information we collect",
      body: [
        "We only collect what the Service genuinely needs to function. This falls into the following categories:",
      ],
      list: [
        "Doctor identity and registration data — name, email, phone/WhatsApp number, specialization, clinic or hospital details, and medical registration identifiers (e.g. NMC registration in India, KKI registration in Indonesia) used to verify that a registered practitioner is using the platform.",
        "Patient health data — names, contact details, intake responses, symptoms, history, diagnoses, SOAP notes, ICD-10 codes, prescriptions, medical certificates, insurance details, and other clinical records created during a consultation.",
        "Audio recordings and transcripts — when a doctor records a consultation, we process the audio to produce a real-time transcript and downstream clinical notes. Audio is processed for transcription and is not used to train third-party models.",
        "Intake and questionnaire responses — answers patients provide through the AI-guided intake before or during a consultation.",
        "Account and billing data — subscription plan, payment status, and transaction metadata. Card details are handled by our payment processor (Razorpay); Larinova does not store full card numbers.",
        "Technical and usage data — IP address, device and browser information, log data, and product-usage events used to keep the Service secure, reliable, and improving.",
      ],
    },
    {
      heading: "3. How and why we use information",
      body: ["We use the information above only for clearly defined purposes:"],
      list: [
        "To provide the core OPD workflow — booking, intake, consultation capture, transcription, SOAP notes, medical coding, prescriptions, certificates, and follow-up.",
        "To verify doctor credentials and prevent unauthorized clinical use of the platform.",
        "To deliver appointment confirmations, follow-ups, and transactional messages via email, SMS, and WhatsApp.",
        "To process subscriptions and payments and to send billing-related communications.",
        "To secure the Service, detect abuse, debug issues, and maintain reliability.",
        "To comply with applicable legal, regulatory, and record-keeping obligations.",
      ],
      footnote:
        "We do not sell personal or health data, and we do not use patient clinical data for advertising.",
    },
    {
      heading: "4. Storage and processing",
      body: [
        "Larinova's application data — including clinical records — is stored in managed PostgreSQL databases and object storage operated through Supabase, our primary infrastructure provider. Access to clinical records is restricted by row-level security so that a doctor can only access their own patients' records, and a patient (via the portal) can only access their own.",
        "Some processing is performed by carefully selected sub-processors (see Section 7) — for example, speech-to-text transcription, transactional email, and messaging delivery. We share only the minimum data each sub-processor needs to perform its function.",
      ],
    },
    {
      heading: "5. How we protect your data",
      body: [
        "We apply technical and organizational measures appropriate to the sensitivity of health data, including:",
      ],
      list: [
        "Encryption of data in transit (TLS) and at rest.",
        "Row-level access controls enforcing strict per-doctor and per-patient data isolation.",
        "Authentication for all clinical access — doctors sign in with one-time email codes; the patient portal uses verified magic-link sign-in.",
        "Least-privilege access to production systems and regular review of who can access what.",
        "Logging and monitoring to detect and respond to unusual activity.",
      ],
      footnote:
        "No system can guarantee absolute security, but we work continuously to reduce risk and respond quickly to any incident.",
    },
    {
      heading: "6. Data retention",
      body: [
        "We retain clinical records for as long as the treating doctor or clinic maintains an active account and as required to meet medical record-keeping obligations in the relevant jurisdiction. Account and billing records are retained for as long as needed to operate the Service and satisfy legal and tax requirements.",
        "Audio recordings are retained only as long as needed to generate and let the doctor review the resulting transcript and clinical notes, after which they may be deleted in line with the controlling doctor's settings and applicable law. When data is no longer required, we delete or irreversibly anonymize it.",
      ],
    },
    {
      heading: "7. Sub-processors",
      body: [
        "We use a small set of trusted providers to operate the Service. Each is bound by contractual confidentiality and data-protection obligations:",
      ],
      list: [
        "Supabase — database, authentication, and file storage (core application and clinical data).",
        "Sarvam AI / Deepgram — speech-to-text transcription of consultation audio.",
        "Resend — transactional and notification email delivery from hello@larinova.com.",
        "Razorpay — subscription and payment processing (card data handled by the processor, not by Larinova).",
        "MSG91 and Gupshup — SMS and WhatsApp message delivery for confirmations and follow-ups.",
      ],
      footnote:
        "We review our sub-processors periodically and update this list as the Service evolves. Contact hello@larinova.com for the current list at any time.",
    },
    {
      heading: "8. Your rights",
      body: [
        "Depending on your jurisdiction, you may have the right to access, correct, export, restrict, or delete your personal data, and to object to certain processing. For clinical records held on behalf of a doctor or clinic, requests are routed through that controller; Larinova will assist them in fulfilling valid requests.",
        "To exercise any right, or if you have a complaint about how your data is handled, email hello@larinova.com. We will respond within the timeframe required by applicable law.",
      ],
    },
    {
      heading: "9. Children's data",
      body: [
        "Larinova is used by doctors to deliver care, which can include treating minors. Where a clinical record relates to a minor, it is created and controlled by the treating doctor or clinic in the course of care, in accordance with applicable law. The Larinova product itself is intended for use by registered healthcare practitioners, not directly by children.",
      ],
    },
    {
      heading: "10. International transfers",
      body: [
        "Larinova serves doctors in India and Indonesia, and some of our sub-processors operate infrastructure in other regions. Where personal data is transferred across borders, we rely on appropriate safeguards and contractual protections to keep that data protected to the standard described in this policy.",
      ],
    },
    {
      heading: "11. Changes to this policy",
      body: [
        "We may update this policy as the Service, our sub-processors, or applicable law change. When we make material changes, we will update the \"last updated\" date above and, where appropriate, notify account holders. Continued use of the Service after an update constitutes acceptance of the revised policy.",
      ],
    },
    {
      heading: "12. Contact us",
      body: [
        "For any privacy question, data-subject request, or concern, contact us at hello@larinova.com. We take every request seriously and aim to resolve it promptly.",
      ],
    },
  ],
};

const idContent: LegalContent = {
  locale: "id",
  eyebrow: "Legal",
  title: "Kebijakan Privasi",
  titleEn: "Privacy Policy",
  lastUpdated: LAST_UPDATED_ID,
  intro:
    "Larinova menjalankan platform rawat jalan (OPD) end-to-end yang digunakan oleh dokter dan klinik di India dan Indonesia. Kami menangani informasi pribadi dan kesehatan yang sensitif, dan melindunginya adalah tanggung jawab inti kami. Kebijakan ini menjelaskan data apa yang kami kumpulkan, mengapa, bagaimana data disimpan dan diamankan, berapa lama kami menyimpannya, dengan siapa kami membagikannya, dan hak Anda atas data Anda. Berlaku untuk larinova.com, app.larinova.com, portal pasien, serta API dan layanan terkait (bersama-sama disebut \"Layanan\"). (Larinova operates an end-to-end OPD platform used by doctors and clinics in India and Indonesia. This policy explains what we collect, why, how it is stored and secured, how long we keep it, who we share it with, and your rights over your data.)",
  sections: [
    {
      heading: "1. Tentang kami",
      headingEn: "Who we are",
      body: [
        "Larinova dioperasikan oleh Larinova, pengendali data atas informasi pribadi yang dijelaskan dalam kebijakan ini. Anda dapat menghubungi tim kami di hello@larinova.com untuk pertanyaan, permintaan, atau keluhan privasi apa pun. (Larinova is the data controller for the personal information described here. Reach us at hello@larinova.com.)",
        "Dokter dan klinik yang menggunakan Larinova bertindak sebagai pengendali atas rekam medis pasien mereka sendiri; Larinova bertindak sebagai pemroses atas data klinis tersebut, dan sebagai pengendali untuk data akun, penagihan, dan penggunaan produk. (Doctors and clinics are controllers of their patients' records; Larinova is a processor for that clinical data and a controller for account, billing, and usage data.)",
      ],
    },
    {
      heading: "2. Informasi yang kami kumpulkan",
      headingEn: "Information we collect",
      body: [
        "Kami hanya mengumpulkan data yang benar-benar dibutuhkan Layanan, dalam kategori berikut: (We only collect what the Service genuinely needs, in the following categories:)",
      ],
      list: [
        "Identitas dan registrasi dokter — nama, email, nomor telepon/WhatsApp, spesialisasi, detail klinik atau rumah sakit, dan nomor registrasi medis (mis. registrasi KKI di Indonesia, NMC di India) untuk memverifikasi bahwa pengguna adalah praktisi terdaftar. (Doctor identity and registration data, including medical registration numbers, used to verify a registered practitioner.)",
        "Data kesehatan pasien — nama, kontak, jawaban intake, gejala, riwayat, diagnosis, catatan SOAP, kode ICD-10, resep, surat keterangan dokter, detail asuransi, dan rekam klinis lain yang dibuat selama konsultasi. (Patient health data created during a consultation.)",
        "Rekaman audio dan transkrip — saat dokter merekam konsultasi, kami memproses audio untuk menghasilkan transkrip real-time dan catatan klinis. Audio tidak digunakan untuk melatih model pihak ketiga. (Audio recordings and transcripts; audio is not used to train third-party models.)",
        "Jawaban intake dan kuesioner — jawaban yang diberikan pasien melalui intake terpandu AI. (Intake and questionnaire responses.)",
        "Data akun dan penagihan — paket langganan, status pembayaran, dan metadata transaksi. Detail kartu ditangani oleh pemroses pembayaran (Razorpay); Larinova tidak menyimpan nomor kartu lengkap. (Account and billing data; card data handled by Razorpay, not stored by Larinova.)",
        "Data teknis dan penggunaan — alamat IP, informasi perangkat dan browser, log, dan peristiwa penggunaan untuk menjaga keamanan dan keandalan Layanan. (Technical and usage data to keep the Service secure and reliable.)",
      ],
    },
    {
      heading: "3. Bagaimana dan mengapa kami menggunakan informasi",
      headingEn: "How and why we use information",
      body: [
        "Kami menggunakan informasi di atas hanya untuk tujuan yang jelas: (We use this information only for clearly defined purposes:)",
      ],
      list: [
        "Menjalankan alur kerja OPD inti — booking, intake, perekaman konsultasi, transkripsi, catatan SOAP, kode medis, resep, surat keterangan, dan follow-up. (To provide the core OPD workflow.)",
        "Memverifikasi kredensial dokter dan mencegah penggunaan klinis yang tidak sah. (To verify doctor credentials and prevent unauthorized use.)",
        "Mengirim konfirmasi janji temu, follow-up, dan pesan transaksional via email, SMS, dan WhatsApp. (To deliver confirmations and follow-ups.)",
        "Memproses langganan dan pembayaran serta mengirim komunikasi terkait penagihan. (To process subscriptions and payments.)",
        "Mengamankan Layanan, mendeteksi penyalahgunaan, dan menjaga keandalan. (To secure the Service and maintain reliability.)",
        "Mematuhi kewajiban hukum, regulasi, dan penyimpanan rekam yang berlaku. (To comply with legal and regulatory obligations.)",
      ],
      footnote:
        "Kami tidak menjual data pribadi atau kesehatan, dan tidak menggunakan data klinis pasien untuk iklan. (We do not sell personal or health data, and do not use patient clinical data for advertising.)",
    },
    {
      heading: "4. Penyimpanan dan pemrosesan",
      headingEn: "Storage and processing",
      body: [
        "Data aplikasi Larinova — termasuk rekam klinis — disimpan dalam basis data PostgreSQL terkelola dan penyimpanan objek melalui Supabase, penyedia infrastruktur utama kami. Akses ke rekam klinis dibatasi dengan row-level security sehingga dokter hanya dapat mengakses rekam pasiennya sendiri, dan pasien (lewat portal) hanya rekam miliknya. (Application data, including clinical records, is stored via Supabase with row-level security enforcing per-doctor and per-patient isolation.)",
        "Sebagian pemrosesan dilakukan oleh sub-pemroses tepercaya (lihat Bagian 7) — misalnya transkripsi suara, email transaksional, dan pengiriman pesan. Kami hanya membagikan data minimum yang dibutuhkan tiap sub-pemroses. (Some processing is performed by trusted sub-processors; we share only the minimum data needed.)",
      ],
    },
    {
      heading: "5. Bagaimana kami melindungi data Anda",
      headingEn: "How we protect your data",
      body: [
        "Kami menerapkan langkah teknis dan organisasi yang sesuai dengan sensitivitas data kesehatan, termasuk: (We apply technical and organizational measures appropriate to health data, including:)",
      ],
      list: [
        "Enkripsi data saat transit (TLS) dan saat disimpan. (Encryption in transit and at rest.)",
        "Kontrol akses row-level yang menjaga isolasi data per-dokter dan per-pasien. (Row-level access controls.)",
        "Autentikasi untuk semua akses klinis — dokter masuk dengan kode email sekali pakai; portal pasien memakai magic-link terverifikasi. (Authentication for all clinical access.)",
        "Akses dengan hak paling minim ke sistem produksi dan peninjauan akses berkala. (Least-privilege access and regular review.)",
        "Pencatatan dan pemantauan untuk mendeteksi aktivitas tidak biasa. (Logging and monitoring.)",
      ],
      footnote:
        "Tidak ada sistem yang menjamin keamanan absolut, tetapi kami terus bekerja menurunkan risiko dan merespons insiden dengan cepat. (No system guarantees absolute security, but we work continuously to reduce risk.)",
    },
    {
      heading: "6. Penyimpanan data (retensi)",
      headingEn: "Data retention",
      body: [
        "Kami menyimpan rekam klinis selama dokter atau klinik mempertahankan akun aktif dan sepanjang diwajibkan oleh kewajiban penyimpanan rekam medis di yurisdiksi terkait. Data akun dan penagihan disimpan selama dibutuhkan untuk menjalankan Layanan dan memenuhi persyaratan hukum dan pajak. (We retain clinical records while the account is active and as required by medical record-keeping rules.)",
        "Rekaman audio disimpan hanya selama dibutuhkan untuk menghasilkan dan meninjau transkrip serta catatan klinis, setelah itu dapat dihapus sesuai pengaturan dokter pengendali dan hukum yang berlaku. Saat data tidak lagi diperlukan, kami menghapus atau menganonimkannya secara permanen. (Audio is retained only as long as needed for review, then may be deleted.)",
      ],
    },
    {
      heading: "7. Sub-pemroses",
      headingEn: "Sub-processors",
      body: [
        "Kami menggunakan sejumlah kecil penyedia tepercaya untuk menjalankan Layanan, masing-masing terikat kewajiban kerahasiaan dan perlindungan data: (We use a small set of trusted providers, each bound by confidentiality and data-protection obligations:)",
      ],
      list: [
        "Supabase — basis data, autentikasi, dan penyimpanan berkas (data aplikasi dan klinis inti). (Database, authentication, and file storage.)",
        "Sarvam AI / Deepgram — transkripsi suara dari audio konsultasi. (Speech-to-text transcription.)",
        "Resend — pengiriman email transaksional dan notifikasi dari hello@larinova.com. (Transactional email delivery.)",
        "Razorpay — pemrosesan langganan dan pembayaran (data kartu ditangani pemroses, bukan Larinova). (Subscription and payment processing.)",
        "MSG91 dan Gupshup — pengiriman SMS dan WhatsApp untuk konfirmasi dan follow-up. (SMS and WhatsApp delivery.)",
      ],
      footnote:
        "Kami meninjau sub-pemroses secara berkala dan memperbarui daftar ini seiring perkembangan Layanan. Hubungi hello@larinova.com untuk daftar terkini. (We review sub-processors periodically; contact hello@larinova.com for the current list.)",
    },
    {
      heading: "8. Hak Anda",
      headingEn: "Your rights",
      body: [
        "Tergantung yurisdiksi Anda, Anda dapat memiliki hak untuk mengakses, mengoreksi, mengekspor, membatasi, atau menghapus data pribadi Anda, dan menolak pemrosesan tertentu. Untuk rekam klinis yang disimpan atas nama dokter atau klinik, permintaan diarahkan melalui pengendali tersebut; Larinova akan membantu mereka memenuhi permintaan yang sah. (You may have rights to access, correct, export, restrict, or delete your data; clinical-record requests are routed through the controlling doctor.)",
        "Untuk menggunakan hak apa pun, atau jika Anda memiliki keluhan, kirim email ke hello@larinova.com. Kami akan merespons dalam jangka waktu yang diwajibkan hukum. (To exercise a right or file a complaint, email hello@larinova.com.)",
      ],
    },
    {
      heading: "9. Data anak",
      headingEn: "Children's data",
      body: [
        "Larinova digunakan oleh dokter untuk memberikan perawatan, yang dapat mencakup menangani anak di bawah umur. Bila rekam klinis berkaitan dengan anak, rekam itu dibuat dan dikendalikan oleh dokter atau klinik dalam rangka perawatan sesuai hukum yang berlaku. Produk Larinova sendiri ditujukan untuk praktisi kesehatan terdaftar, bukan langsung untuk anak. (Larinova is intended for use by registered practitioners; minors' records are created and controlled by the treating doctor as part of care.)",
      ],
    },
    {
      heading: "10. Transfer internasional",
      headingEn: "International transfers",
      body: [
        "Larinova melayani dokter di India dan Indonesia, dan sebagian sub-pemroses kami mengoperasikan infrastruktur di wilayah lain. Bila data pribadi ditransfer lintas batas, kami mengandalkan perlindungan yang sesuai dan ketentuan kontraktual untuk menjaga data tetap terlindungi sesuai standar kebijakan ini. (Where data is transferred across borders, we rely on appropriate safeguards and contractual protections.)",
      ],
    },
    {
      heading: "11. Perubahan kebijakan ini",
      headingEn: "Changes to this policy",
      body: [
        "Kami dapat memperbarui kebijakan ini seiring perubahan Layanan, sub-pemroses, atau hukum yang berlaku. Saat ada perubahan material, kami memperbarui tanggal \"terakhir diperbarui\" di atas dan, bila perlu, memberi tahu pemegang akun. Melanjutkan penggunaan Layanan setelah pembaruan berarti menerima kebijakan yang direvisi. (We may update this policy; the \"last updated\" date will change and continued use constitutes acceptance.)",
      ],
    },
    {
      heading: "12. Hubungi kami",
      headingEn: "Contact us",
      body: [
        "Untuk pertanyaan privasi, permintaan subjek data, atau keluhan apa pun, hubungi kami di hello@larinova.com. Kami menanggapi setiap permintaan dengan serius dan berupaya menyelesaikannya dengan cepat. (For any privacy question or request, contact hello@larinova.com.)",
      ],
    },
  ],
};

export default async function PrivacyPage({ params }: PageProps) {
  const { locale } = await params;

  if (!VALID_LOCALES.includes(locale as Locale)) {
    notFound();
  }

  const l = locale as Locale;
  const legal = l === "id" ? idContent : inContent;

  return (
    <>
      <Nav locale={l} />
      <main className="relative z-10">
        <LegalPage content={legal} />
      </main>
      <Footer locale={l} />
    </>
  );
}
