export type BlogSectionType =
  | "paragraph"
  | "heading"
  | "list"
  | "quote"
  | "callout";

export interface BlogSection {
  type: BlogSectionType;
  content?: string;
  level?: 2 | 3;
  items?: string[];
  variant?: "info" | "warning" | "tip";
}

export interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  tag: string;
  image: string;
  author: string;
  readingTime: string;
  content: BlogSection[];
}

export const BLOG_POSTS: BlogPost[] = [
  {
    slug: "why-indian-doctors-need-ai-scribe-that-speaks-their-language",
    title: "Why Indian doctors need an AI scribe that speaks their language",
    excerpt:
      "Global medical scribes fail on Tamil, Hindi, and Telugu. Here's why code-mixed speech recognition changes everything for Indian healthcare.",
    date: "Mar 18, 2026",
    tag: "Product",
    image: "/images/hero-doctor.jpg",
    author: "Gabriel Antony Xaviour",
    readingTime: "5 min read",
    content: [
      {
        type: "paragraph",
        content:
          "Walk into any clinic in Chennai, Coimbatore, or Madurai and listen. The doctor asks the patient what's wrong in Tamil. The patient describes chest pain using a mix of Tamil words and English medical terms they picked up from Google. The doctor responds with a diagnosis peppered with English drug names, dosage instructions in Tamil, and follow-up timelines that switch between both languages mid-sentence. This is how Indian medicine actually sounds. And not a single global medical scribe product can handle it.",
      },
      {
        type: "heading",
        level: 2,
        content: "The code-mixing problem no one talks about",
      },
      {
        type: "paragraph",
        content:
          "When Indian doctors speak to patients, they don't pick one language and stick with it. They code-mix - weaving Tamil, Hindi, or Telugu with English medical terminology in a single breath. A cardiologist in Chennai might say: \"Ungaluku mild hypertension irukku, so we'll start you on Amlodipine 5mg, daily morning food-ku appuram edukkanum.\" That's Tamil structure, English diagnosis, English drug name, and Tamil instruction - all in one sentence. OpenAI Whisper and Google Speech-to-Text treat this as a monolingual stream. They pick one language model and force the entire utterance through it. The result is garbled medical terminology, lost dosage information, and clinical notes that no doctor would trust.",
      },
      {
        type: "heading",
        level: 2,
        content: "Why Western speech-to-text fails for Indian consultations",
      },
      {
        type: "list",
        items: [
          'Accent mismatch: Models trained on American and British English consistently misrecognize Indian English pronunciation of drug names. Metformin becomes "met for men." Atorvastatin becomes unrecognizable noise.',
          "No code-switching support: Whisper's language detection picks one language per segment. When a doctor switches from Tamil to English for a drug name and back to Tamil for instructions, the model either drops the English or drops the Tamil.",
          "Medical vocabulary gaps: Generic STT models have no training on Indian pharmaceutical brand names (Dolo-650, Crocin, Pantop), regional disease terminology, or the specific way Indian doctors abbreviate clinical terms.",
          'Context-free transcription: Without understanding that the conversation is medical, these models can\'t distinguish between "sugar" (the food) and "sugar" (diabetes, as commonly referred to by patients across India).',
        ],
      },
      {
        type: "heading",
        level: 2,
        content: "What Sarvam AI's approach solves",
      },
      {
        type: "paragraph",
        content:
          "Sarvam AI built Saaras - a speech-to-text engine designed from the ground up for Indian languages. Unlike bolted-on multilingual support, Saaras treats code-mixing as a first-class input type. It was trained on real Indian speech data: customer service calls, educational lectures, casual conversations, and domains where technical English terminology appears inside vernacular language frames. When we built Larinova on top of Saaras, we added a medical vocabulary layer. This means the STT engine knows that when a Tamil-speaking doctor says a word that sounds like English, it's probably a drug name, diagnosis, or procedure - and it should be transcribed with clinical precision, not forced through a Tamil phonetic model.",
      },
      {
        type: "heading",
        level: 2,
        content: "We ran the same consultation through three engines",
      },
      {
        type: "paragraph",
        content:
          'During our early testing, we recorded a 6-minute consultation between a cardiologist in T. Nagar and a 54-year-old patient with suspected hypertension. The conversation was roughly 60% Tamil, 40% English, with drug names and vitals in English. We ran the same audio through OpenAI Whisper, Google Cloud Speech-to-Text, and Sarvam Saaras. Whisper transcribed "Amlodipine" as "am lo di pine" and missed the dosage entirely. Google STT captured the English segments reasonably but dropped most of the Tamil connective tissue between clinical terms, producing a transcript that read like a keyword list. Saaras produced a coherent, readable transcript where the Tamil sentence structure was preserved and the English medical terms were correctly identified and spelled. The difference wasn\'t subtle. One output was usable for SOAP note generation. The other two weren\'t.',
      },
      {
        type: "quote",
        content:
          "The gap is not accuracy percentages on a benchmark. It's whether a doctor looks at the transcript and says 'yes, that's what I said' or throws it away and writes notes by hand.",
      },
      {
        type: "heading",
        level: 2,
        content: "What this means for doctors on the ground",
      },
      {
        type: "paragraph",
        content:
          "The average Indian doctor sees 30-50 patients per day. Many see more. Documentation takes 15-20 minutes per patient when done manually. That's hours of writing after the clinic closes - or worse, notes that never get written at all. When transcription works in the language the doctor actually speaks, documentation stops being the bottleneck. You talk to your patient exactly as you normally would. Larinova listens, understands the code-mixed speech, extracts the clinical information, and produces structured SOAP notes. No behavior change required. No speaking slowly. No switching to English for the AI's benefit.",
      },
      {
        type: "callout",
        variant: "tip",
        content:
          "Larinova currently supports Tamil+English and Hindi+English code-mixed consultations. Telugu, Kannada, Malayalam, and Bengali are launching progressively as we train medical vocabulary for each language.",
      },
    ],
  },
  {
    slug: "soap-notes-in-30-seconds",
    title:
      "SOAP notes in 30 seconds: how Larinova generates clinical documentation",
    excerpt:
      "A deep dive into how we turn a Tamil+English consultation into structured Subjective, Objective, Assessment, and Plan notes automatically.",
    date: "Mar 15, 2026",
    tag: "Technology",
    image: "/images/hero-doctor-3.jpg",
    author: "Gabriel Antony Xaviour",
    readingTime: "7 min read",
    content: [
      {
        type: "paragraph",
        content:
          "Every medical student learns the SOAP format. Subjective - what the patient tells you. Objective - what you observe and measure. Assessment - your clinical interpretation. Plan - what you're going to do about it. It's the universal structure of clinical documentation. But writing SOAP notes by hand after seeing 40 patients is why doctors burn out. Larinova generates them automatically from the consultation audio. Here's exactly how.",
      },
      {
        type: "heading",
        level: 2,
        content: "Step 1: Real-time voice capture",
      },
      {
        type: "paragraph",
        content:
          "When a doctor taps Record in the Larinova app, audio capture begins immediately on-device. We stream audio chunks to Sarvam AI's Saaras speech-to-text engine in real time. There is no batch upload at the end - transcription happens continuously, which means the doctor sees words appearing on screen as they speak. The real-time streaming approach matters for two reasons. First, it gives the doctor confidence that the system is actually listening and understanding. Second, it allows our NLP pipeline to begin clinical extraction before the consultation ends, which is how we hit the 30-second target for note generation after the conversation finishes.",
      },
      {
        type: "heading",
        level: 2,
        content: "Step 2: Code-mixed speech-to-text",
      },
      {
        type: "paragraph",
        content:
          "Sarvam's Saaras model handles the core transcription challenge: a doctor speaking Tamil with English medical terms embedded throughout. The model doesn't try to detect language boundaries and switch models - it processes the mixed input natively. Code-switching in Indian medical conversations happens at the word level, not the sentence level. A single clause might contain Tamil verbs, an English drug name, a Tamil quantity expression, and an English diagnosis. Saaras outputs a unified transcript that preserves the meaning regardless of which language each word belongs to.",
      },
      {
        type: "heading",
        level: 2,
        content: "Step 3: Clinical entity extraction",
      },
      {
        type: "paragraph",
        content:
          'Once we have the raw transcript, our NLP layer identifies and tags clinical entities: symptoms, vitals mentioned verbally, medications, dosages, frequencies, diagnoses, procedures, and follow-up instructions. This is not simple keyword matching. When a patient says "two weeks-a headache irukku" (I\'ve had a headache for two weeks), the system needs to understand that "two weeks" is a duration, "headache" is a symptom, and the Tamil grammatical frame tells us this is the patient\'s self-reported complaint - which belongs in the Subjective section.',
      },
      {
        type: "callout",
        variant: "info",
        content:
          "Our entity extraction model is fine-tuned on anonymized Indian clinical transcripts. It recognizes Indian drug brands (Dolo-650, Pantop-D, Glycomet), regional symptom descriptions, and the specific way Indian doctors communicate clinical findings verbally.",
      },
      {
        type: "heading",
        level: 2,
        content: "Step 4: SOAP structure mapping",
      },
      {
        type: "paragraph",
        content:
          "With clinical entities tagged, the system maps each piece of information to the correct SOAP section. Patient-reported symptoms, history, and complaints go to Subjective. Vitals, examination findings, and test results go to Objective. The doctor's diagnostic statements and clinical reasoning go to Assessment. Prescriptions, lifestyle advice, referrals, and follow-up schedules go to Plan. The mapping isn't purely rule-based. Consultations are messy - a doctor might mention a medication while discussing the assessment, then circle back to a symptom they forgot. Our model handles non-linear conversations by building a complete clinical picture first, then organizing it into the SOAP structure.",
      },
      {
        type: "heading",
        level: 2,
        content: "Step 5: Prescription generation",
      },
      {
        type: "paragraph",
        content:
          "Alongside the SOAP note, Larinova extracts the prescription as a separate structured document. Each medication gets its own entry with the drug name, dosage, frequency, duration, and any special instructions (before food, after food, with water). The system cross-references against a database of Indian pharmaceutical products to normalize drug names and flag potential issues - like if a doctor says \"Combiflam\" but the patient mentioned they're allergic to ibuprofen. This isn't a diagnostic tool and we don't override the doctor's judgment. It's a safety net that catches obvious conflicts during the documentation step.",
      },
      {
        type: "heading",
        level: 3,
        content: "Why 30 seconds and not instant?",
      },
      {
        type: "paragraph",
        content:
          "The transcription happens in real-time, but the SOAP structuring and prescription extraction run as a final pass once the recording stops. This takes about 20-30 seconds depending on consultation length. We could push partial results faster, but we found that doctors prefer to see the complete, structured note rather than watching it assemble in real time. It feels more trustworthy. You stop the recording, glance at your phone for a few seconds, and the full SOAP note and prescription are ready for review.",
      },
      {
        type: "heading",
        level: 2,
        content: "The review-first principle",
      },
      {
        type: "paragraph",
        content:
          "Every SOAP note and prescription Larinova generates is a draft. It appears in an editable interface where the doctor can modify any section before finalizing. We surface the note with clear section labels and inline editing - tap any paragraph to change it. In our early pilot testing, the majority of generated notes for routine consultations needed minimal or no edits. But edge cases are where mistakes hide. Clinical documentation must be accurate. The doctor always has the final word, and the interface is designed to make review and editing as fast as possible.",
      },
      {
        type: "quote",
        content:
          "The goal is not to replace the doctor's clinical judgment. It's to eliminate the mechanical labor of typing what they already said out loud.",
      },
    ],
  },
  {
    slug: "launching-in-tamil-nadu",
    title: "Launching in Tamil Nadu: our first 100 doctors",
    excerpt:
      "Why we chose Chennai as our launch city, what we learned from pilot doctors, and what's next for Larinova in Indian healthcare.",
    date: "Mar 12, 2026",
    tag: "Company",
    image: "/images/doctor-phone.jpg",
    author: "Gabriel Antony Xaviour",
    readingTime: "4 min read",
    content: [
      {
        type: "paragraph",
        content:
          "Larinova is launching its pilot program in Tamil Nadu, starting with 100 doctors across Chennai, Coimbatore, and Madurai. We didn't pick Tamil Nadu randomly. It's where code-mixing is hardest, our Sarvam-based STT is strongest, and we can physically visit every pilot clinic within a day's drive.",
      },
      {
        type: "heading",
        level: 2,
        content: "Why Tamil Nadu first",
      },
      {
        type: "paragraph",
        content:
          "Tamil Nadu has one of the highest doctor-to-patient ratios in India, with a massive private clinic network. Chennai alone has over 12,000 registered private practitioners. These doctors are tech-comfortable - most already use WhatsApp for patient communication and digital payment apps for billing. But their clinical documentation is still manual. Paper prescriptions, handwritten notes, or at best, typing into basic templates on a laptop between patients. The state also has a strong tradition of Tamil-medium medical education and practice. Doctors here don't just code-mix occasionally - Tamil is the primary language of consultation for the vast majority of patients. If our Tamil+English transcription works here, in the most linguistically demanding environment, it works everywhere.",
      },
      {
        type: "heading",
        level: 2,
        content: "What pilot doctors told us",
      },
      {
        type: "paragraph",
        content:
          "We ran a closed alpha with 12 doctors over four weeks. General practitioners, pediatricians, an orthopedic surgeon, and two dermatologists. The feedback reshaped our product in ways we didn't expect.",
      },
      {
        type: "list",
        items: [
          "Speed over accuracy: Doctors cared more about getting a 90% accurate note in 30 seconds than a 99% accurate note in 2 minutes. They can scan and fix a small error instantly. Waiting kills the workflow.",
          "Prescription is king: We initially focused on SOAP notes as the primary output. Doctors told us the prescription is what they need first - it's what the patient takes to the pharmacy immediately. SOAP notes are important but secondary in the consultation flow.",
          "Phone, not tablet: Every pilot doctor used Larinova on their phone, not a tablet or laptop. The device sits on the desk during consultation. They want to tap once to start, once to stop, and see the result. Anything more complex and they'll revert to pen and paper.",
          "Privacy anxiety is real: Two doctors initially refused to pilot because they were worried about patient recordings being stored or shared. We had to walk them through the architecture - real-time processing, no persistent audio storage - before they'd agree. Trust documentation needs to be front and center.",
        ],
      },
      {
        type: "heading",
        level: 2,
        content: "The 100-doctor pilot structure",
      },
      {
        type: "paragraph",
        content:
          "Our pilot is structured in three tiers. The first 30 doctors get white-glove onboarding - we visit their clinic, set up the app, observe two consultations, and tune the system for their specific speech patterns and specialty vocabulary. The next 40 doctors get remote onboarding with a dedicated WhatsApp support line and weekly check-in calls. The final 30 doctors get self-serve onboarding with in-app guidance only. This tiered approach lets us measure how much hand-holding the product actually needs. If the self-serve cohort retains as well as the white-glove cohort, we know the product is ready to scale without a field team.",
      },
      {
        type: "quote",
        content:
          "We're not trying to prove that AI medical scribing works. Dragon Medical and Nuance proved that a decade ago in the US. We're proving that it works in Tamil, in a 30-patient-per-day clinic, on a phone, for \u20B9999 a month.",
      },
      {
        type: "heading",
        level: 2,
        content: "What's next",
      },
      {
        type: "paragraph",
        content:
          "After Tamil Nadu, we're expanding to Karnataka (Kannada+English) and Andhra Pradesh (Telugu+English). Hindi+English support is already built and will launch alongside a Delhi NCR pilot soon after. Our roadmap is language-first, not feature-first. Every new state means a new language pair, new medical vocabulary, new regional drug brands, and new consultation patterns. We're not chasing language count. Five languages done right beats twenty done poorly. The first 100 doctors in Tamil Nadu will shape everything that follows. If you're a doctor in Chennai, Coimbatore, or Madurai, you can start a free trial today.",
      },
      {
        type: "callout",
        variant: "tip",
        content:
          "Early pilot doctors get lifetime access to launch pricing (\u20B9999/month) and direct input into the product roadmap. Start your free trial at larinova.com.",
      },
    ],
  },
];
