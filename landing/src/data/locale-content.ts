export type Locale = "in" | "id";

export interface TranscriptionLine {
  speaker: "doctor" | "patient";
  text: string;
}

export interface StepContent {
  num: string;
  verb: string;
  video: string;
  desc: string;
  detail: string;
}

export interface FeatureContent {
  title: string;
  headline: string;
  desc: string;
  tags: string[];
  preview: string;
}

export interface TrustItem {
  title: string;
  desc: string;
}

export interface StatContent {
  value: string;
  label: string;
}

export interface PricingTier {
  name: string;
  badge?: string;
  subtitle: string;
  price: string;
  originalPrice?: string;
  period: string;
  features: string[];
  cta: string;
}

export interface FeaturePreviewData {
  transcriptionLabel: string;
  soapPreview: { k: string; v: string }[];
  codingPreview: { code: string; label: string; conf: string }[];
  prescriptionPreview: { med: string; dose: string; dur: string }[];
}

export interface OpdPhase {
  num: string;
  label: string;
  verb: string;
  noun: string;
  desc: string;
  accent: string;
}

export interface OpdHero {
  headline: string;
  sub: string;
  ctaPrimary: string;
  ctaPrimaryHref: string;
  ctaSecondary: string;
  ctaSecondaryHref: string;
}

export interface OpdFeatures {
  sectionLabel: string;
  headlinePre: string;
  headlineAccent: string;
  phases: OpdPhase[];
}

export interface OpdPricingTier {
  name: string;
  subtitle: string;
  priceMonthly: string;
  priceYearly: string;
  periodMonthly: string;
  periodYearly: string;
  features: string[];
  cta: string;
  ctaHref: string;
  badge?: string;
  savingsBadge?: string;
}

export interface OpdPricing {
  sectionLabel: string;
  headlinePre: string;
  headlineAccent: string;
  monthlyLabel: string;
  yearlyLabel: string;
  savingsPill: string;
  free: OpdPricingTier;
  pro: OpdPricingTier;
  enterpriseLabel: string;
  enterpriseSub: string;
  enterpriseCta: string;
  enterpriseHref: string;
}

export interface OpdContent {
  hero: OpdHero;
  features: OpdFeatures;
  pricing: OpdPricing;
}

export interface LandingContent {
  opd?: OpdContent;
  nav: {
    links: string[];
    cta: string;
  };
  hero: {
    languages: string[];
    headline: string;
    languageTriggerWord: string;
    subtitle: string;
    ctaPrimary: string;
    ctaSecondary: string;
    featureTags: string[];
    poweredByText: string;
    provider: "sarvam" | "deepgram";
    heroVideo: string;
  };
  problem: {
    headline: string;
    headlineAccent: string;
    headlinePost: string;
    stats: StatContent[];
  };
  howItWorks: {
    sectionLabel: string;
    headlinePre: string;
    headlineAccent: string;
    steps: StepContent[];
  };
  features: {
    sectionLabel: string;
    headlinePre: string;
    headlineAccent: string;
    features: FeatureContent[];
    transcriptionLines: { s: string; t: string }[];
    previewData: FeaturePreviewData;
  };
  trust: {
    sectionLabel: string;
    headline: string;
    items: TrustItem[];
  };
  poweredBy: {
    provider: "sarvam" | "deepgram";
    sectionLabel: string;
    headlinePre: string;
    headlineAccent: string;
    description: string;
    languages: string[];
    highlightLanguage: string;
    moreCount: string;
    stats: { val: string; label: string }[];
  };
  pricing: {
    sectionLabel: string;
    headlinePre: string;
    headlineAccent: string;
    free: PricingTier;
    pro: PricingTier;
  };
  demo: {
    transcriptionLines: TranscriptionLine[];
    phaseLabels: {
      recording: string;
      soap: string;
      analysis: string;
      actions: string;
    };
    liveTranscript: string;
    soapGenerated: string;
    clinicalAnalysis: string;
    actionsComplete: string;
    doctorLabel: string;
    patientLabel: string;
    drugInteraction: string;
    drugInteractionStatus: string;
    icdCodes: string;
    icdCodesStatus: string;
    cardiovascularRisk: string;
    cardiovascularRiskStatus: string;
    prescriptionGenerated: string;
    patientRecords: string;
    summarySent: string;
    followUp: string;
    soapItems: { key: string; value: string }[];
  };
  finalCta: {
    headline: string;
    body: string;
    cta: string;
    note: string;
  };
  footer: {
    description: string;
    poweredByText: string;
    provider: "sarvam" | "deepgram";
    sections: {
      product: string;
      company: string;
    };
    links: {
      features: string;
      pricing: string;
      howItWorks: string;
      blog: string;
      about: string;
      contact: string;
      privacy: string;
    };
    copyright: string;
  };
  mobileCta: string;
  blog: {
    sectionLabel: string;
    headline: string;
    viewAll: string;
  };
  faq: {
    sectionLabel: string;
    headline: string;
  };
}

export const content: Record<Locale, LandingContent> = {
  in: {
    opd: {
      hero: {
        headline: "Larinova — the OPD assistant for Indian doctors.",
        sub: "See more patients. Type less. Send prescriptions on WhatsApp.",
        ctaPrimary: "Start free",
        ctaPrimaryHref: "https://app.larinova.com/in/signup",
        ctaSecondary: "See how it works",
        ctaSecondaryHref: "#opd-journey",
      },
      features: {
        sectionLabel: "The journey",
        headlinePre: "One OPD.",
        headlineAccent: "Five moments you never think about again.",
        phases: [
          {
            num: "01",
            label: "BOOK",
            verb: "Your booking page,",
            noun: "live in 60 seconds.",
            desc: "Share a single link. Patients pick a slot, fill contact details, and get confirmations over WhatsApp, SMS, and email — automatically.",
            accent: "#10b981",
          },
          {
            num: "02",
            label: "INTAKE",
            verb: "Patients fill your intake form.",
            noun: "Not ours.",
            desc: "Design the questions you actually ask. Patients answer before the consult, upload labs and photos. The AI follows up for missing details so you don't have to.",
            accent: "#0ea5e9",
          },
          {
            num: "03",
            label: "PREP",
            verb: "Walk into every consult",
            noun: "prepared.",
            desc: "Our pre-consult AI reads the intake, the history, the uploads — and hands you a 60-second Prep Brief the moment the patient arrives. Red flags highlighted.",
            accent: "#a855f7",
          },
          {
            num: "04",
            label: "CONSULT",
            verb: "You talk.",
            noun: "We write.",
            desc: "Tap record. Speak Tamil, Hindi, English, code-mixed — anything. Larinova produces SOAP notes, ICD-10 codes, and a signed prescription before you stand up.",
            accent: "#f59e0b",
          },
          {
            num: "05",
            label: "FOLLOW-UP",
            verb: "Follow-ups,",
            noun: "on autopilot.",
            desc: "Day 1, 3, 7 — a wellness agent checks in over WhatsApp. It probes, classifies, and flags you only when something actually needs attention.",
            accent: "#ef4444",
          },
        ],
      },
      pricing: {
        sectionLabel: "Pricing",
        headlinePre: "Simple.",
        headlineAccent: "Built for a solo OPD.",
        monthlyLabel: "Monthly",
        yearlyLabel: "Annual",
        savingsPill: "Save 17%",
        free: {
          name: "Free",
          subtitle: "Everything, up to a point.",
          priceMonthly: "₹0",
          priceYearly: "₹0",
          periodMonthly: "/month",
          periodYearly: "/year",
          features: [
            "20 consultations per month",
            "All five OPD phases included",
            "WhatsApp / SMS / Email follow-ups",
            "SOAP notes, ICD-10, prescriptions",
            "No credit card required",
          ],
          cta: "Start free",
          ctaHref: "https://app.larinova.com/in/signup",
        },
        pro: {
          name: "Pro",
          subtitle: "For doctors with a full day.",
          priceMonthly: "₹1,500",
          priceYearly: "₹15,000",
          periodMonthly: "/month",
          periodYearly: "/year",
          savingsBadge: "Save ₹3,000",
          features: [
            "Unlimited consultations",
            "Priority pre-consult AI",
            "Custom intake templates",
            "Full Rx formulary + PDF export",
            "Priority support",
          ],
          cta: "Subscribe to Pro",
          ctaHref: "https://app.larinova.com/in/signup?next=/settings/billing",
          badge: "POPULAR",
        },
        enterpriseLabel: "Hospitals & clinic chains",
        enterpriseSub:
          "Multi-doctor deployments, SSO, custom billing cycles, on-prem options.",
        enterpriseCta: "Talk to us",
        enterpriseHref: "mailto:hello@larinova.com",
      },
    },
    nav: {
      links: ["Features", "Pricing", "Blog"],
      cta: "Try Free for 1 Month",
    },
    hero: {
      languages: ["தமிழ்", "हिन्दी", "తెలుగు"],
      headline: "Your patients speak Tamil. Your scribe should too.",
      languageTriggerWord: "Tamil.",
      subtitle:
        "AI medical scribe that listens to your consultations in Tamil, Hindi, or English - and generates structured clinical notes in real-time.",
      ctaPrimary: "Try Free for 1 Month",
      ctaSecondary: "See How It Works",
      featureTags: [
        "Tamil · Hindi · English",
        "SOAP notes",
        "ICD-10 codes",
        "Prescriptions",
      ],
      poweredByText: "Powered by",
      provider: "sarvam",
      heroVideo: "/images/hero-video.mp4",
    },
    problem: {
      headline: "Indian doctors lose",
      headlineAccent: "2+ hours daily",
      headlinePost: "to paperwork",
      stats: [
        { value: "2+", label: "Hours lost daily to documentation" },
        { value: "22+", label: "Indian languages spoken in consultations" },
        { value: "0", label: "AI scribes built for Indian languages" },
      ],
    },
    howItWorks: {
      sectionLabel: "How It Works",
      headlinePre: "From conversation to documentation",
      headlineAccent: "in 30 seconds",
      steps: [
        {
          num: "01",
          verb: "Record",
          video: "/videos/record.mp4",
          desc: "Tap to start. Larinova listens to your consultation - ambient, non-intrusive. Works in noisy OPDs.",
          detail:
            "No setup. No training. Just tap and talk to your patient as you normally would.",
        },
        {
          num: "02",
          verb: "Transcribe",
          video: "/videos/transcribe.mp4",
          desc: "Sarvam AI processes Tamil+English code-mixed speech in real-time. Medical terminology recognized natively.",
          detail:
            '"Patient-oda BP 140/90" is understood exactly as you said it - not mangled by a foreign STT.',
        },
        {
          num: "03",
          verb: "Document",
          video: "/videos/document.mp4",
          desc: "Structured SOAP notes, ICD-10 codes, prescriptions - generated instantly. Review, edit, export.",
          detail:
            "30 seconds from conversation to complete clinical documentation. Print-ready prescriptions included.",
        },
      ],
    },
    features: {
      sectionLabel: "Features",
      headlinePre: "Everything a doctor needs,",
      headlineAccent: "nothing they don't",
      features: [
        {
          title: "Real-Time Transcription",
          headline: "Understands how Indian doctors actually talk",
          desc: "Tamil+English code-mixed speech transcribed in real-time. Medical terminology recognized natively - not just translated, but understood.",
          tags: [
            "Tamil",
            "Hindi",
            "Telugu",
            "English",
            "Code-mixing",
            "Medical NLP",
          ],
          preview: "transcription",
        },
        {
          title: "SOAP Note Generation",
          headline: "From conversation to clinical documentation in seconds",
          desc: "Automatically structures your consultation into Subjective, Objective, Assessment, and Plan - formatted to your preferred template.",
          tags: ["Structured notes", "Auto-formatting", "Template support"],
          preview: "soap",
        },
        {
          title: "Medical Coding",
          headline: "ICD-10 codes suggested automatically",
          desc: "AI analyzes the consultation and suggests relevant diagnostic codes. Faster billing, fewer claim rejections.",
          tags: [
            "ICD-10",
            "Billing codes",
            "Faster billing",
            "Fewer rejections",
          ],
          preview: "coding",
        },
        {
          title: "Prescription Generation",
          headline: "Prescriptions drafted from the conversation",
          desc: "Medications, dosages, and duration extracted automatically. Drug interaction checks included. Print-ready format.",
          tags: ["Drug interactions", "Dosage check", "Print-ready"],
          preview: "prescription",
        },
      ],
      transcriptionLines: [
        { s: "Dr", t: "BP check pannunga, 140/90 irukku" },
        { s: "Pt", t: "Thalai valikku romba doctor" },
        { s: "Dr", t: "Paracetamol 500mg prescribe pannuren" },
      ],
      previewData: {
        transcriptionLabel: "Live transcription",
        soapPreview: [
          { k: "S", v: "Headache x 2 days, h/o hypertension" },
          { k: "O", v: "BP 140/90, afebrile, neuro intact" },
          { k: "A", v: "Tension headache, HTN" },
          { k: "P", v: "Paracetamol 500mg TDS, review 1 week" },
        ],
        codingPreview: [
          {
            code: "G44.209",
            label: "Tension headache, unspecified",
            conf: "94%",
          },
          { code: "I10", label: "Essential hypertension", conf: "98%" },
          {
            code: "99213",
            label: "Office visit, established patient",
            conf: "91%",
          },
        ],
        prescriptionPreview: [
          { med: "Paracetamol 500mg", dose: "1 tab TDS", dur: "3 days" },
          { med: "Amlodipine 5mg", dose: "1 tab OD", dur: "continue" },
        ],
      },
    },
    trust: {
      sectionLabel: "Trust & Security",
      headline: "Your patients trust you. You can trust us.",
      items: [
        {
          title: "Patient data never sold",
          desc: "Your consultation data belongs to you. We never sell, share, or use patient information for advertising or training third-party models.",
        },
        {
          title: "Indian servers only",
          desc: "All data processing and storage happens on servers located in India. Your patient records never leave the country.",
        },
        {
          title: "Enterprise-grade encryption",
          desc: "End-to-end encryption, access controls, audit trails, and minimum necessary data handling - built to meet DPDP Act and international data protection standards.",
        },
        {
          title: "Doctor has final say",
          desc: "Every AI-generated note requires your review and approval. Larinova assists - it never makes clinical decisions autonomously.",
        },
      ],
    },
    poweredBy: {
      provider: "sarvam",
      sectionLabel: "Infrastructure",
      headlinePre: "Built on India's",
      headlineAccent: "sovereign AI infrastructure",
      description:
        "Larinova is powered by Sarvam AI - India's full-stack AI platform with native support for 22 Indian languages. No foreign STT that butchers your Tamil.",
      languages: [
        "Tamil",
        "Hindi",
        "Bengali",
        "Telugu",
        "Marathi",
        "Gujarati",
        "Kannada",
        "Malayalam",
        "Odia",
        "Punjabi",
        "English",
      ],
      highlightLanguage: "Tamil",
      moreCount: "+11 more",
      stats: [
        { val: "22", label: "languages" },
        { val: "<500ms", label: "latency" },
        { val: "Native", label: "code-mixing" },
        { val: "Medical", label: "vocabulary" },
      ],
    },
    pricing: {
      sectionLabel: "Pricing",
      headlinePre: "Start free.",
      headlineAccent: "Scale when ready.",
      free: {
        name: "Free Trial",
        subtitle: "Try Larinova with zero commitment",
        price: "₹0",
        period: "for 1 month",
        features: [
          "Unlimited consultations",
          "Full feature access",
          "Tamil + English + Hindi",
          "SOAP notes + prescriptions",
          "No credit card required",
        ],
        cta: "Start 1 Month Free",
      },
      pro: {
        name: "Pro",
        badge: "RECOMMENDED",
        subtitle: "Launch pricing for first 100 doctors",
        originalPrice: "₹1,999",
        price: "₹999",
        period: "/month",
        features: [
          "Unlimited consultations",
          "All 22 Indian languages",
          "Priority Sarvam AI processing",
          "SOAP + ICD-10 + prescriptions",
          "Export to any EHR",
          "Priority support",
        ],
        cta: "Get Started - ₹999/month",
      },
    },
    demo: {
      transcriptionLines: [
        {
          speaker: "doctor",
          text: "Patient-oda BP 140/90, recent-aa headache irukku",
        },
        {
          speaker: "patient",
          text: "Aamaa doctor, thalai valikku 2 naal aagudhu",
        },
        {
          speaker: "doctor",
          text: "Paracetamol 500mg TDS eduthukkonga, BP medication continue pannunga",
        },
      ],
      phaseLabels: {
        recording: "Recording",
        soap: "SOAP Note",
        analysis: "Analysis",
        actions: "Actions",
      },
      liveTranscript: "Live Transcript",
      soapGenerated: "SOAP Note Generated",
      clinicalAnalysis: "Clinical Analysis",
      actionsComplete: "Actions Complete",
      doctorLabel: "Doctor",
      patientLabel: "Patient",
      drugInteraction: "Drug interaction check",
      drugInteractionStatus: "No conflicts found",
      icdCodes: "ICD-10: G44.209, I10",
      icdCodesStatus: "Codes assigned",
      cardiovascularRisk: "Cardiovascular risk",
      cardiovascularRiskStatus: "Moderate - monitor BP",
      prescriptionGenerated: "Prescription generated",
      patientRecords: "Added to patient records",
      summarySent: "Summary sent to patient",
      followUp: "Follow-up in 1 week",
      soapItems: [
        { key: "S", value: "Headache for 2 days, h/o hypertension" },
        { key: "O", value: "BP: 140/90 mmHg, afebrile, neuro intact" },
        { key: "A", value: "Tension headache, Essential hypertension" },
        { key: "P", value: "Tab. Paracetamol 500mg TDS x 3 days" },
      ],
    },
    finalCta: {
      headline: "Ready to reclaim your time?",
      body: "Join doctors across Tamil Nadu who are spending less time on paperwork and more time with patients.",
      cta: "Start 1 Month Free",
      note: "No credit card required · 1 month free · All features included",
    },
    footer: {
      description:
        "AI medical scribe for Indian doctors. Real-time transcription in Tamil, Hindi, and English.",
      poweredByText: "Powered by",
      provider: "sarvam",
      sections: {
        product: "Product",
        company: "Company",
      },
      links: {
        features: "Features",
        pricing: "Pricing",
        howItWorks: "How It Works",
        blog: "Blog",
        about: "About",
        contact: "Contact",
        privacy: "Privacy",
      },
      copyright: "All rights reserved.",
    },
    mobileCta: "Try Free for 1 Month — All Features",
    blog: {
      sectionLabel: "Blog",
      headline: "Latest from Larinova",
      viewAll: "View all posts",
    },
    faq: {
      sectionLabel: "FAQ",
      headline: "Questions doctors ask us",
    },
  },

  id: {
    nav: {
      links: ["Fitur", "Harga", "Blog"],
      cta: "Coba Gratis 1 Bulan",
    },
    hero: {
      languages: ["Indonesia", "Jawa", "Sunda"],
      headline: "Pasien Anda berbicara Indonesia. Scribe Anda juga harus bisa.",
      languageTriggerWord: "Indonesia.",
      subtitle:
        "AI medical scribe yang mendengarkan konsultasi Anda dalam Bahasa Indonesia, Jawa, atau Inggris - dan menghasilkan catatan klinis terstruktur secara real-time.",
      ctaPrimary: "Coba Gratis 1 Bulan",
      ctaSecondary: "Lihat Cara Kerjanya",
      featureTags: [
        "Indonesia · Jawa · Inggris",
        "Catatan SOAP",
        "Kode ICD-10",
        "Resep",
      ],
      poweredByText: "Didukung oleh",
      provider: "deepgram",
      heroVideo: "/images/hero-video-id.mp4",
    },
    problem: {
      headline: "Dokter Indonesia kehilangan",
      headlineAccent: "2+ jam sehari",
      headlinePost: "untuk administrasi",
      stats: [
        { value: "2+", label: "Jam terbuang setiap hari untuk dokumentasi" },
        {
          value: "700+",
          label: "Bahasa daerah di seluruh Indonesia",
        },
        {
          value: "0",
          label: "AI scribe yang dibangun untuk bahasa Indonesia",
        },
      ],
    },
    howItWorks: {
      sectionLabel: "Cara Kerja",
      headlinePre: "Dari percakapan ke dokumentasi",
      headlineAccent: "dalam 30 detik",
      steps: [
        {
          num: "01",
          verb: "Rekam",
          video: "/videos/record-id.mp4",
          desc: "Ketuk untuk mulai. Larinova mendengarkan konsultasi Anda - tenang, tidak mengganggu. Berfungsi di OPD yang ramai.",
          detail:
            "Tidak perlu setup. Tidak perlu training. Cukup ketuk dan bicara dengan pasien seperti biasa.",
        },
        {
          num: "02",
          verb: "Transkripsi",
          video: "/videos/transcribe-id.mp4",
          desc: "Deepgram AI memproses campuran Bahasa Indonesia+Inggris secara real-time. Terminologi medis dikenali secara native.",
          detail:
            '"Tekanan darah-nya 140/90" dipahami persis seperti yang Anda ucapkan - bukan dirusak oleh STT asing.',
        },
        {
          num: "03",
          verb: "Dokumentasi",
          video: "/videos/document-id.mp4",
          desc: "Catatan SOAP terstruktur, kode ICD-10, resep - dihasilkan instan. Tinjau, edit, ekspor.",
          detail:
            "30 detik dari percakapan ke dokumentasi klinis lengkap. Resep siap cetak sudah termasuk.",
        },
      ],
    },
    features: {
      sectionLabel: "Fitur",
      headlinePre: "Semua yang dibutuhkan dokter,",
      headlineAccent: "tidak lebih, tidak kurang",
      features: [
        {
          title: "Transkripsi Real-Time",
          headline: "Memahami cara dokter Indonesia berbicara",
          desc: "Campuran Bahasa Indonesia+Inggris ditranskripsikan secara real-time. Terminologi medis dikenali secara native - bukan hanya diterjemahkan, tapi dipahami.",
          tags: [
            "Bahasa Indonesia",
            "Jawa",
            "Sunda",
            "Inggris",
            "Campuran bahasa",
            "NLP Medis",
          ],
          preview: "transcription",
        },
        {
          title: "Pembuatan Catatan SOAP",
          headline:
            "Dari percakapan ke dokumentasi klinis dalam hitungan detik",
          desc: "Secara otomatis menyusun konsultasi Anda ke dalam format Subjektif, Objektif, Penilaian, dan Rencana - sesuai template pilihan Anda.",
          tags: ["Catatan terstruktur", "Format otomatis", "Dukungan template"],
          preview: "soap",
        },
        {
          title: "Koding Medis",
          headline: "Kode ICD-10 disarankan secara otomatis",
          desc: "AI menganalisis konsultasi dan menyarankan kode diagnostik yang relevan. Penagihan lebih cepat, klaim lebih sedikit ditolak.",
          tags: [
            "ICD-10",
            "Kode penagihan",
            "Penagihan cepat",
            "Penolakan berkurang",
          ],
          preview: "coding",
        },
        {
          title: "Pembuatan Resep",
          headline: "Resep disusun dari percakapan",
          desc: "Obat, dosis, dan durasi diekstrak secara otomatis. Pemeriksaan interaksi obat termasuk. Format siap cetak.",
          tags: ["Interaksi obat", "Pemeriksaan dosis", "Siap cetak"],
          preview: "prescription",
        },
      ],
      transcriptionLines: [
        { s: "Dr", t: "Cek tekanan darah dulu ya, 140/90 nih" },
        { s: "Pt", t: "Iya dok, kepala saya udah sakit 2 hari" },
        { s: "Dr", t: "Saya resepkan Parasetamol 500mg" },
      ],
      previewData: {
        transcriptionLabel: "Transkripsi langsung",
        soapPreview: [
          { k: "S", v: "Sakit kepala 2 hari, riwayat hipertensi" },
          { k: "O", v: "TD 140/90, afebris, neuro intak" },
          { k: "A", v: "Tension headache, hipertensi" },
          { k: "P", v: "Parasetamol 500mg TDS, kontrol 1 minggu" },
        ],
        codingPreview: [
          {
            code: "G44.209",
            label: "Tension headache, tidak spesifik",
            conf: "94%",
          },
          { code: "I10", label: "Hipertensi esensial", conf: "98%" },
          {
            code: "99213",
            label: "Kunjungan rawat jalan, pasien lama",
            conf: "91%",
          },
        ],
        prescriptionPreview: [
          { med: "Parasetamol 500mg", dose: "1 tab 3x/hari", dur: "3 hari" },
          { med: "Amlodipin 5mg", dose: "1 tab 1x/hari", dur: "lanjutkan" },
        ],
      },
    },
    trust: {
      sectionLabel: "Kepercayaan & Keamanan",
      headline: "Pasien Anda mempercayai Anda. Anda bisa mempercayai kami.",
      items: [
        {
          title: "Data pasien tidak pernah dijual",
          desc: "Data konsultasi Anda sepenuhnya milik Anda. Kami tidak pernah menjual, berbagi, atau menggunakan informasi pasien untuk iklan atau melatih model pihak ketiga.",
        },
        {
          title: "Infrastruktur aman & terenkripsi",
          desc: "Semua data dienkripsi saat transit dan saat disimpan. Akses dibatasi secara ketat dan tidak ada data pasien yang tersimpan tanpa enkripsi.",
        },
        {
          title: "Sesuai UU PDP & standar global",
          desc: "Kontrol akses, jejak audit, dan penanganan data minimal - dibangun sesuai UU Perlindungan Data Pribadi dan standar perlindungan data internasional.",
        },
        {
          title: "Dokter memiliki keputusan akhir",
          desc: "Setiap catatan yang dihasilkan AI memerlukan tinjauan dan persetujuan Anda. Larinova membantu - tidak pernah membuat keputusan klinis secara otonom.",
        },
      ],
    },
    poweredBy: {
      provider: "deepgram",
      sectionLabel: "Infrastruktur",
      headlinePre: "Dibangun di atas",
      headlineAccent: "infrastruktur AI global",
      description:
        "Larinova didukung oleh Deepgram - platform AI speech-to-text terdepan dunia dengan akurasi terbaik di kelasnya. Dioptimalkan untuk percakapan medis dan campuran bahasa Indonesia.",
      languages: ["Bahasa Indonesia", "Jawa", "Sunda", "Inggris"],
      highlightLanguage: "Bahasa Indonesia",
      moreCount: "+bahasa daerah segera hadir",
      stats: [
        { val: "4+", label: "bahasa" },
        { val: "<500ms", label: "latensi" },
        { val: "Native", label: "campuran bahasa" },
        { val: "Medis", label: "kosakata" },
      ],
    },
    pricing: {
      sectionLabel: "Harga",
      headlinePre: "Mulai gratis.",
      headlineAccent: "Berkembang saat siap.",
      free: {
        name: "Uji Coba Gratis",
        subtitle: "Coba Larinova tanpa komitmen",
        price: "Rp 0",
        period: "selama 1 bulan",
        features: [
          "Konsultasi tanpa batas",
          "Akses fitur lengkap",
          "Bahasa Indonesia + Inggris",
          "Catatan SOAP + resep",
          "Tidak perlu kartu kredit",
        ],
        cta: "Mulai Gratis 1 Bulan",
      },
      pro: {
        name: "Pro",
        badge: "SEGERA HADIR",
        subtitle: "Harga khusus early adopter Indonesia",
        price: "Segera Hadir",
        period: "",
        features: [
          "Konsultasi tanpa batas",
          "Semua bahasa Indonesia",
          "Prioritas pemrosesan Deepgram AI",
          "SOAP + ICD-10 + resep",
          "Ekspor ke EHR manapun",
          "Dukungan prioritas",
        ],
        cta: "Daftar Early Access",
      },
    },
    demo: {
      transcriptionLines: [
        {
          speaker: "doctor",
          text: "Tekanan darah-nya 140/90, belakangan ini ada keluhan sakit kepala",
        },
        {
          speaker: "patient",
          text: "Iya dok, kepala saya udah sakit 2 hari ini",
        },
        {
          speaker: "doctor",
          text: "Saya resepkan Parasetamol 500mg TDS, obat hipertensinya tetap dilanjutkan",
        },
      ],
      phaseLabels: {
        recording: "Merekam",
        soap: "Catatan SOAP",
        analysis: "Analisis",
        actions: "Tindakan",
      },
      liveTranscript: "Transkrip Langsung",
      soapGenerated: "Catatan SOAP Dihasilkan",
      clinicalAnalysis: "Analisis Klinis",
      actionsComplete: "Tindakan Selesai",
      doctorLabel: "Dokter",
      patientLabel: "Pasien",
      drugInteraction: "Pemeriksaan interaksi obat",
      drugInteractionStatus: "Tidak ada konflik",
      icdCodes: "ICD-10: G44.209, I10",
      icdCodesStatus: "Kode ditetapkan",
      cardiovascularRisk: "Risiko kardiovaskular",
      cardiovascularRiskStatus: "Sedang - pantau TD",
      prescriptionGenerated: "Resep dihasilkan",
      patientRecords: "Ditambahkan ke rekam medis",
      summarySent: "Ringkasan dikirim ke pasien",
      followUp: "Tindak lanjut dalam 1 minggu",
      soapItems: [
        { key: "S", value: "Sakit kepala 2 hari, riwayat hipertensi" },
        { key: "O", value: "TD: 140/90 mmHg, afebris, neuro intak" },
        { key: "A", value: "Tension headache, Hipertensi esensial" },
        { key: "P", value: "Tab. Parasetamol 500mg 3x/hari x 3 hari" },
      ],
    },
    finalCta: {
      headline: "Siap menghemat waktu Anda?",
      body: "Bergabung dengan dokter di seluruh Indonesia yang menghabiskan lebih sedikit waktu untuk administrasi dan lebih banyak waktu bersama pasien.",
      cta: "Mulai Gratis 1 Bulan",
      note: "Tidak perlu kartu kredit · Gratis 1 bulan · Semua fitur termasuk",
    },
    footer: {
      description:
        "AI medical scribe untuk dokter Indonesia. Transkripsi real-time dalam Bahasa Indonesia, Jawa, dan Inggris.",
      poweredByText: "Didukung oleh",
      provider: "deepgram",
      sections: {
        product: "Produk",
        company: "Perusahaan",
      },
      links: {
        features: "Fitur",
        pricing: "Harga",
        howItWorks: "Cara Kerja",
        blog: "Blog",
        about: "Tentang Kami",
        contact: "Hubungi Kami",
        privacy: "Privasi",
      },
      copyright: "Hak cipta dilindungi.",
    },
    mobileCta: "Coba Gratis 1 Bulan — Semua Fitur",
    blog: {
      sectionLabel: "Blog",
      headline: "Terbaru dari Larinova",
      viewAll: "Lihat semua artikel",
    },
    faq: {
      sectionLabel: "FAQ",
      headline: "Pertanyaan yang dokter tanyakan kepada kami",
    },
  },
};
