export interface FAQItem {
  q: string;
  a: string;
}

export const FAQS: FAQItem[] = [
  {
    q: "How accurate is the Tamil+English transcription?",
    a: "Larinova uses Sarvam AI's Saaras STT which is built specifically for Indian languages and code-mixing. It handles Tamil+English medical conversations natively - including medical terminology like drug names, dosages, and clinical terms. Accuracy improves as the model learns from more medical conversations.",
  },
  {
    q: "Is my patient data safe?",
    a: "Yes. All consultation recordings are processed in real-time and not stored permanently. Generated notes are encrypted and stored on Indian servers. We never sell or share patient data with third parties. You own your data completely.",
  },
  {
    q: "Does it work without internet?",
    a: "Currently, Larinova requires an internet connection for real-time transcription and AI processing. We're working on an offline mode for areas with poor connectivity. The app gracefully queues recordings if connection drops mid-consultation.",
  },
  {
    q: "What if the AI gets something wrong in the notes?",
    a: "Every generated SOAP note and prescription is presented for your review before finalizing. You can edit any section directly. Larinova is an assistant, not a replacement - the doctor always has final authority over clinical documentation.",
  },
  {
    q: "Which languages are supported?",
    a: "We currently support Tamil+English and Hindi+English code-mixed consultations, with Telugu, Kannada, Malayalam, and Bengali coming soon. Sarvam AI's infrastructure supports 22 Indian languages - we're rolling them out progressively with medical vocabulary training for each.",
  },
  {
    q: "Can I export notes to my existing system?",
    a: "Yes. Notes and prescriptions can be exported as PDF, and we're building direct integrations with popular Indian hospital management systems. If you use a specific system, let us know - early adopters get priority integration.",
  },
  {
    q: "How much does it cost?",
    a: "1 month free with unlimited consultations and full feature access. After that, Pro plan is \u20B9999/month (launch pricing for first 100 doctors - standard price will be \u20B91,999/month). No credit card required, no hidden fees, cancel anytime.",
  },
  {
    q: "I'm not tech-savvy. Is it hard to use?",
    a: "Not at all. Open the app, tap Record, talk to your patient, tap Stop. That's it. SOAP notes and prescriptions appear in 30 seconds. If you can use WhatsApp, you can use Larinova. No training needed.",
  },
];
