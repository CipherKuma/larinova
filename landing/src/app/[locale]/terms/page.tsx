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

  const title = isId ? "Ketentuan Layanan" : "Terms of Service";
  const description = isId
    ? "Ketentuan yang mengatur penggunaan platform OPD Larinova oleh dokter dan klinik, termasuk tanggung jawab klinis dan penagihan."
    : "The terms governing doctors' and clinics' use of the Larinova OPD platform, including clinical responsibility and billing.";

  return {
    title,
    description,
    alternates: {
      canonical: `${SITE_URL}/${isId ? "id" : "in"}/terms`,
      languages: {
        "en-IN": `${SITE_URL}/in/terms`,
        id: `${SITE_URL}/id/terms`,
        "x-default": `${SITE_URL}/in/terms`,
      },
    },
    openGraph: {
      title,
      description,
      url: `${SITE_URL}/${isId ? "id" : "in"}/terms`,
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
  title: "Terms of Service",
  lastUpdated: LAST_UPDATED_IN,
  intro:
    "These Terms of Service (the \"Terms\") govern your access to and use of Larinova — an end-to-end outpatient (OPD) platform for doctors and clinics in India and Indonesia — including larinova.com, app.larinova.com, the patient portal, and the associated APIs and services (together, the \"Service\"). By creating an account or using the Service, you agree to these Terms. If you do not agree, do not use the Service.",
  sections: [
    {
      heading: "1. The Service",
      body: [
        "Larinova provides software to help registered doctors and clinics run their outpatient workflow: online booking, AI-guided patient intake, pre-consult Prep Briefs, consultation recording and transcription, SOAP notes, ICD-10/medical coding assistance, prescription drafting, medical certificate generation, and automated patient follow-up via email, SMS, and WhatsApp.",
        "Larinova is a tool that assists clinicians. It does not practice medicine, and it is not a substitute for the professional judgment of a qualified healthcare provider.",
      ],
    },
    {
      heading: "2. Eligibility and accounts",
      body: [
        "The Service is intended for registered, qualified healthcare practitioners and the staff they authorize. By signing up, you confirm that you are legally permitted to practice in your jurisdiction and that the registration and identity details you provide are accurate and current.",
        "You are responsible for safeguarding access to your account and for all activity that occurs under it. Notify us immediately at hello@larinova.com if you suspect any unauthorized use.",
      ],
    },
    {
      heading: "3. Doctor responsibilities",
      body: [
        "As the treating clinician, you are solely responsible for the care you provide and the records you create. In particular, you agree to:",
      ],
      list: [
        "Review, correct, and approve every AI-generated output — transcripts, SOAP notes, codes, prescriptions, and certificates — before relying on it, signing it, or sharing it with a patient.",
        "Apply your own clinical judgment to all diagnoses, treatment decisions, prescriptions, and medical documents. AI-assisted drafts are starting points, not final clinical decisions.",
        "Obtain any patient consent required by law before recording a consultation or processing a patient's health information.",
        "Sign and seal medical certificates and prescriptions yourself; documents produced by the Service are drafts until you finalize them.",
        "Maintain records in accordance with the professional, legal, and regulatory standards that apply to your practice.",
      ],
    },
    {
      heading: "4. Medical disclaimer",
      body: [
        "Larinova assists with documentation and workflow; it does not diagnose, prescribe, or make clinical decisions. AI features can produce inaccurate, incomplete, or inappropriate output. The treating doctor remains fully responsible for all clinical decisions and for the accuracy and appropriateness of every record, prescription, and certificate generated with the Service.",
        "Nothing produced by the Service should be acted on without independent clinical review. Larinova is not liable for clinical decisions made using the Service.",
      ],
      footnote:
        "The doctor is responsible for clinical decisions. Larinova assists; it does not replace professional medical judgment.",
    },
    {
      heading: "5. Acceptable use",
      body: ["You agree not to:"],
      list: [
        "Use the Service for any unlawful purpose or in violation of any applicable medical, privacy, or data-protection law.",
        "Access, or attempt to access, patient data or accounts that are not yours, or otherwise circumvent the Service's access controls.",
        "Misrepresent your identity, qualifications, or registration status.",
        "Upload malware, attempt to disrupt or overload the Service, or reverse-engineer it except as permitted by law.",
        "Resell, sublicense, or provide the Service to third parties without our written agreement.",
      ],
    },
    {
      heading: "6. Patient data and privacy",
      body: [
        "Your use of patient data through the Service is also governed by our Privacy Policy. You act as the controller of your patients' clinical records; Larinova processes that data on your behalf to provide the Service. You are responsible for having a lawful basis to collect and process patient information and for honoring patient rights as required by applicable law.",
      ],
    },
    {
      heading: "7. Billing and subscriptions",
      body: [
        "Paid plans are billed on a recurring subscription basis through our payment processor (Razorpay). By subscribing, you authorize recurring charges for the plan you select until you cancel. Fees are exclusive of taxes unless stated otherwise.",
        "Promotional access (for example, a free trial period) is provided as described at sign-up and may convert to a paid plan unless cancelled before it ends. Except where required by law, fees already paid are non-refundable. We may change pricing on a prospective basis with reasonable notice.",
      ],
    },
    {
      heading: "8. Intellectual property",
      body: [
        "Larinova and its software, design, and content are owned by Larinova and protected by applicable law. We grant you a limited, non-exclusive, non-transferable right to use the Service in accordance with these Terms. You retain ownership of the clinical records and content you create; you grant us the limited rights needed to host and process that content to provide the Service.",
      ],
    },
    {
      heading: "9. Third-party services",
      body: [
        "The Service relies on third-party providers (including infrastructure, transcription, email, payment, and messaging vendors) to function. Your use of the Service may be subject to those providers' availability and terms. We are not responsible for outages or failures originating from third-party services outside our reasonable control.",
      ],
    },
    {
      heading: "10. Disclaimers and limitation of liability",
      body: [
        "The Service is provided \"as is\" and \"as available\" without warranties of any kind, to the maximum extent permitted by law. We do not warrant that the Service will be uninterrupted, error-free, or that AI-generated output will be accurate or fit for any particular clinical purpose.",
        "To the maximum extent permitted by law, Larinova will not be liable for any indirect, incidental, special, or consequential damages, or for any clinical decision made using the Service. Our total aggregate liability for any claim arising out of or relating to the Service is limited to the amounts you paid to Larinova for the Service in the twelve months preceding the claim.",
      ],
    },
    {
      heading: "11. Termination",
      body: [
        "You may stop using the Service and close your account at any time by contacting hello@larinova.com. We may suspend or terminate access if you breach these Terms, misuse the Service, or where required to protect patients, other users, or the Service.",
        "On termination, your right to use the Service ends. We will handle any data export or deletion in accordance with our Privacy Policy and applicable medical record-keeping obligations.",
      ],
    },
    {
      heading: "12. Changes to these Terms",
      body: [
        "We may update these Terms as the Service or applicable law evolves. When we make material changes, we will update the \"last updated\" date above and, where appropriate, notify account holders. Continued use of the Service after an update constitutes acceptance of the revised Terms.",
      ],
    },
    {
      heading: "13. Governing law",
      body: [
        "These Terms are governed by the laws applicable to the market in which you practice — India or Indonesia — without regard to conflict-of-laws principles. Any dispute will be subject to the competent courts of the applicable jurisdiction, unless mandatory local law provides otherwise.",
      ],
    },
    {
      heading: "14. Contact us",
      body: [
        "Questions about these Terms can be sent to hello@larinova.com. We're happy to help.",
      ],
    },
  ],
};

const idContent: LegalContent = {
  locale: "id",
  eyebrow: "Legal",
  title: "Ketentuan Layanan",
  titleEn: "Terms of Service",
  lastUpdated: LAST_UPDATED_ID,
  intro:
    "Ketentuan Layanan ini (\"Ketentuan\") mengatur akses dan penggunaan Anda atas Larinova — platform rawat jalan (OPD) end-to-end untuk dokter dan klinik di India dan Indonesia — termasuk larinova.com, app.larinova.com, portal pasien, serta API dan layanan terkait (bersama-sama disebut \"Layanan\"). Dengan membuat akun atau menggunakan Layanan, Anda menyetujui Ketentuan ini. Jika tidak setuju, jangan gunakan Layanan. (These Terms govern your use of Larinova, the OPD platform for doctors in India and Indonesia. By using the Service, you agree to these Terms.)",
  sections: [
    {
      heading: "1. Tentang Layanan",
      headingEn: "The Service",
      body: [
        "Larinova menyediakan perangkat lunak untuk membantu dokter dan klinik terdaftar menjalankan alur kerja rawat jalan: booking online, intake terpandu AI, Prep Brief pra-konsultasi, perekaman dan transkripsi konsultasi, catatan SOAP, bantuan kode ICD-10/medis, penyusunan resep, pembuatan surat keterangan dokter, dan follow-up pasien otomatis via email, SMS, dan WhatsApp. (Larinova provides software to help registered doctors run their OPD workflow.)",
        "Larinova adalah alat yang membantu klinisi. Larinova tidak mempraktikkan kedokteran dan bukan pengganti penilaian profesional penyedia layanan kesehatan yang berkualifikasi. (Larinova assists clinicians and is not a substitute for professional medical judgment.)",
      ],
    },
    {
      heading: "2. Kelayakan dan akun",
      headingEn: "Eligibility and accounts",
      body: [
        "Layanan ini ditujukan untuk praktisi kesehatan terdaftar dan berkualifikasi serta staf yang mereka beri wewenang. Dengan mendaftar, Anda menyatakan bahwa Anda diizinkan secara hukum untuk berpraktik di yurisdiksi Anda dan bahwa data registrasi serta identitas yang Anda berikan akurat dan terkini. (The Service is for registered practitioners; you confirm you are permitted to practice and that your details are accurate.)",
        "Anda bertanggung jawab menjaga akses ke akun Anda dan atas semua aktivitas yang terjadi di dalamnya. Segera beri tahu kami di hello@larinova.com jika Anda menduga ada penggunaan tidak sah. (You are responsible for safeguarding your account; notify hello@larinova.com of any unauthorized use.)",
      ],
    },
    {
      heading: "3. Tanggung jawab dokter",
      headingEn: "Doctor responsibilities",
      body: [
        "Sebagai klinisi yang merawat, Anda sepenuhnya bertanggung jawab atas perawatan yang Anda berikan dan rekam yang Anda buat. Khususnya, Anda setuju untuk: (As the treating clinician, you are solely responsible for the care you provide and the records you create. You agree to:)",
      ],
      list: [
        "Meninjau, mengoreksi, dan menyetujui setiap keluaran yang dihasilkan AI — transkrip, catatan SOAP, kode, resep, dan surat keterangan — sebelum mengandalkannya, menandatanganinya, atau membagikannya ke pasien. (Review, correct, and approve every AI-generated output before relying on it.)",
        "Menerapkan penilaian klinis Anda sendiri atas semua diagnosis, keputusan terapi, resep, dan dokumen medis. Draf berbantuan AI adalah titik awal, bukan keputusan klinis final. (Apply your own clinical judgment; AI drafts are starting points, not final decisions.)",
        "Memperoleh persetujuan pasien yang diwajibkan hukum sebelum merekam konsultasi atau memproses informasi kesehatan pasien. (Obtain required patient consent before recording or processing health data.)",
        "Menandatangani dan menstempel sendiri surat keterangan dan resep; dokumen yang dihasilkan Layanan bersifat draf hingga Anda finalkan. (Sign and seal certificates and prescriptions yourself; documents are drafts until finalized.)",
        "Menyimpan rekam sesuai standar profesional, hukum, dan regulasi yang berlaku pada praktik Anda. (Maintain records per applicable professional and legal standards.)",
      ],
    },
    {
      heading: "4. Penafian medis",
      headingEn: "Medical disclaimer",
      body: [
        "Larinova membantu dokumentasi dan alur kerja; Larinova tidak mendiagnosis, meresepkan, atau membuat keputusan klinis. Fitur AI dapat menghasilkan keluaran yang tidak akurat, tidak lengkap, atau tidak tepat. Dokter yang merawat tetap sepenuhnya bertanggung jawab atas semua keputusan klinis dan atas akurasi serta kelayakan setiap rekam, resep, dan surat keterangan yang dihasilkan dengan Layanan. (Larinova assists with documentation; it does not make clinical decisions. The treating doctor remains fully responsible for all clinical decisions and for the accuracy of every record generated.)",
        "Tidak ada keluaran Layanan yang boleh ditindaklanjuti tanpa peninjauan klinis independen. Larinova tidak bertanggung jawab atas keputusan klinis yang dibuat menggunakan Layanan. (Nothing should be acted on without independent clinical review.)",
      ],
      footnote:
        "Dokter bertanggung jawab atas keputusan klinis. Larinova membantu; tidak menggantikan penilaian medis profesional. (The doctor is responsible for clinical decisions. Larinova assists; it does not replace professional medical judgment.)",
    },
    {
      heading: "5. Penggunaan yang dapat diterima",
      headingEn: "Acceptable use",
      body: ["Anda setuju untuk tidak: (You agree not to:)"],
      list: [
        "Menggunakan Layanan untuk tujuan melanggar hukum atau melanggar hukum medis, privasi, atau perlindungan data yang berlaku. (Use the Service unlawfully.)",
        "Mengakses, atau mencoba mengakses, data pasien atau akun yang bukan milik Anda, atau menghindari kontrol akses Layanan. (Access data or accounts that are not yours, or circumvent access controls.)",
        "Memalsukan identitas, kualifikasi, atau status registrasi Anda. (Misrepresent your identity, qualifications, or registration.)",
        "Mengunggah malware, mengganggu atau membebani Layanan, atau merekayasa balik kecuali diizinkan hukum. (Upload malware, disrupt the Service, or reverse-engineer it except as permitted by law.)",
        "Menjual kembali, mensublisensikan, atau menyediakan Layanan ke pihak ketiga tanpa persetujuan tertulis kami. (Resell or sublicense the Service without our written agreement.)",
      ],
    },
    {
      heading: "6. Data pasien dan privasi",
      headingEn: "Patient data and privacy",
      body: [
        "Penggunaan data pasien melalui Layanan juga diatur oleh Kebijakan Privasi kami. Anda bertindak sebagai pengendali rekam klinis pasien Anda; Larinova memproses data itu atas nama Anda untuk menyediakan Layanan. Anda bertanggung jawab memiliki dasar hukum untuk mengumpulkan dan memproses informasi pasien serta menghormati hak pasien sebagaimana diwajibkan hukum. (Your use of patient data is governed by our Privacy Policy; you are the controller of patient records and Larinova processes them on your behalf.)",
      ],
    },
    {
      heading: "7. Penagihan dan langganan",
      headingEn: "Billing and subscriptions",
      body: [
        "Paket berbayar ditagih secara berulang berbasis langganan melalui pemroses pembayaran kami (Razorpay). Dengan berlangganan, Anda mengizinkan penagihan berulang atas paket yang Anda pilih hingga Anda membatalkan. Biaya belum termasuk pajak kecuali dinyatakan lain. (Paid plans are billed recurringly via Razorpay until you cancel; fees exclude taxes unless stated.)",
        "Akses promosi (misalnya masa uji coba gratis) diberikan seperti dijelaskan saat pendaftaran dan dapat berubah menjadi paket berbayar kecuali dibatalkan sebelum berakhir. Kecuali diwajibkan hukum, biaya yang sudah dibayar tidak dapat dikembalikan. Kami dapat mengubah harga secara prospektif dengan pemberitahuan wajar. (Promotional access may convert to paid unless cancelled; paid fees are non-refundable except where required by law.)",
      ],
    },
    {
      heading: "8. Kekayaan intelektual",
      headingEn: "Intellectual property",
      body: [
        "Larinova beserta perangkat lunak, desain, dan kontennya dimiliki oleh Larinova dan dilindungi hukum yang berlaku. Kami memberi Anda hak terbatas, non-eksklusif, dan tidak dapat dialihkan untuk menggunakan Layanan sesuai Ketentuan ini. Anda tetap memiliki rekam klinis dan konten yang Anda buat; Anda memberi kami hak terbatas yang diperlukan untuk menghosting dan memproses konten itu guna menyediakan Layanan. (Larinova owns its software; you retain ownership of records you create and grant us limited rights to host and process them.)",
      ],
    },
    {
      heading: "9. Layanan pihak ketiga",
      headingEn: "Third-party services",
      body: [
        "Layanan bergantung pada penyedia pihak ketiga (termasuk infrastruktur, transkripsi, email, pembayaran, dan pengiriman pesan) untuk berfungsi. Penggunaan Layanan oleh Anda dapat tunduk pada ketersediaan dan ketentuan penyedia tersebut. Kami tidak bertanggung jawab atas gangguan atau kegagalan yang berasal dari layanan pihak ketiga di luar kendali wajar kami. (The Service relies on third-party providers; we are not responsible for outages outside our reasonable control.)",
      ],
    },
    {
      heading: "10. Penafian dan batasan tanggung jawab",
      headingEn: "Disclaimers and limitation of liability",
      body: [
        "Layanan disediakan \"sebagaimana adanya\" dan \"sebagaimana tersedia\" tanpa jaminan apa pun, sejauh diizinkan hukum. Kami tidak menjamin Layanan akan bebas gangguan, bebas kesalahan, atau bahwa keluaran AI akan akurat atau sesuai untuk tujuan klinis tertentu. (The Service is provided \"as is\" without warranties; we do not warrant accuracy of AI output.)",
        "Sejauh diizinkan hukum, Larinova tidak bertanggung jawab atas kerugian tidak langsung, insidental, khusus, atau konsekuensial, atau atas keputusan klinis yang dibuat menggunakan Layanan. Total tanggung jawab agregat kami atas klaim apa pun dibatasi pada jumlah yang Anda bayarkan ke Larinova dalam dua belas bulan sebelum klaim. (Liability is limited and excludes clinical decisions; total liability is capped at fees paid in the prior twelve months.)",
      ],
    },
    {
      heading: "11. Penghentian",
      headingEn: "Termination",
      body: [
        "Anda dapat berhenti menggunakan Layanan dan menutup akun kapan saja dengan menghubungi hello@larinova.com. Kami dapat menangguhkan atau menghentikan akses jika Anda melanggar Ketentuan ini, menyalahgunakan Layanan, atau bila diperlukan untuk melindungi pasien, pengguna lain, atau Layanan. (You may close your account anytime; we may suspend access for breach or to protect users.)",
        "Saat penghentian, hak Anda menggunakan Layanan berakhir. Kami akan menangani ekspor atau penghapusan data sesuai Kebijakan Privasi dan kewajiban penyimpanan rekam medis yang berlaku. (On termination, your access ends; data export or deletion follows our Privacy Policy.)",
      ],
    },
    {
      heading: "12. Perubahan Ketentuan ini",
      headingEn: "Changes to these Terms",
      body: [
        "Kami dapat memperbarui Ketentuan ini seiring perkembangan Layanan atau hukum yang berlaku. Saat ada perubahan material, kami memperbarui tanggal \"terakhir diperbarui\" di atas dan, bila perlu, memberi tahu pemegang akun. Melanjutkan penggunaan Layanan setelah pembaruan berarti menerima Ketentuan yang direvisi. (We may update these Terms; the \"last updated\" date will change and continued use constitutes acceptance.)",
      ],
    },
    {
      heading: "13. Hukum yang mengatur",
      headingEn: "Governing law",
      body: [
        "Ketentuan ini diatur oleh hukum yang berlaku di pasar tempat Anda berpraktik — India atau Indonesia — tanpa memperhatikan prinsip konflik hukum. Setiap sengketa tunduk pada pengadilan yang berwenang di yurisdiksi yang berlaku, kecuali hukum lokal yang bersifat memaksa menentukan lain. (These Terms are governed by the law of the market where you practice — India or Indonesia.)",
      ],
    },
    {
      heading: "14. Hubungi kami",
      headingEn: "Contact us",
      body: [
        "Pertanyaan tentang Ketentuan ini dapat dikirim ke hello@larinova.com. Kami senang membantu. (Questions about these Terms can be sent to hello@larinova.com.)",
      ],
    },
  ],
};

export default async function TermsPage({ params }: PageProps) {
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
