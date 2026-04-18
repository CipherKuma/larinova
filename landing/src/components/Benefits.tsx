"use client";

import { ScribingPreview } from "./feature-ui/ScribingPreview";
import { SOAPPreview } from "./feature-ui/SOAPPreview";
import { CodingPreview } from "./feature-ui/CodingPreview";
import { ZKPrivacyPreview } from "./feature-ui/ZKPrivacyPreview";
import { AutomationPreview } from "./feature-ui/AutomationPreview";
import { DocumentPreview } from "./feature-ui/DocumentPreview";
import { MultiSpecialtyPreview } from "./feature-ui/MultiSpecialtyPreview";

interface FeatureCardProps {
  title: string;
  description: string;
  children: React.ReactNode;
  className?: string;
}

function FeatureCard({
  title,
  description,
  children,
  className = "",
}: FeatureCardProps) {
  return (
    <div
      className={`group relative bg-white rounded-2xl border border-border/50 overflow-hidden shadow-sm hover:shadow-xl hover:shadow-primary/10 hover:border-primary/30 transition-all duration-300 flex flex-col ${className}`}
    >
      {/* Preview area */}
      <div className="h-[140px] bg-gradient-to-br from-secondary/30 to-secondary/10 border-b border-border/30">
        {children}
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="text-base font-semibold text-foreground mb-1 group-hover:text-primary transition-colors">
          {title}
        </h3>
        <p className="text-xs text-muted-foreground leading-relaxed">
          {description}
        </p>
      </div>
    </div>
  );
}

// Large feature card for hero features
function HeroFeatureCard({
  title,
  description,
  children,
  className = "",
}: FeatureCardProps) {
  return (
    <div
      className={`group relative bg-white rounded-2xl border border-border/50 overflow-hidden shadow-sm hover:shadow-xl hover:shadow-primary/10 hover:border-primary/30 transition-all duration-300 ${className}`}
    >
      <div className="flex flex-col md:flex-row h-full">
        {/* Preview area */}
        <div className="md:w-1/2 h-[180px] md:h-auto md:min-h-[200px] bg-gradient-to-br from-secondary/30 to-secondary/10 border-b md:border-b-0 md:border-r border-border/30">
          {children}
        </div>

        {/* Content */}
        <div className="md:w-1/2 p-6 flex flex-col justify-center">
          <h3 className="text-xl font-bold text-foreground mb-2 group-hover:text-primary transition-colors">
            {title}
          </h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {description}
          </p>
        </div>
      </div>
    </div>
  );
}

export function Benefits() {
  return (
    <section id="features" className="py-24 md:py-32 bg-white relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center max-w-3xl mx-auto mb-16 md:mb-20">
          <span className="inline-block text-primary font-semibold text-sm uppercase tracking-wider mb-4">
            What Larinova Does
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-6">
            AI that handles your paperwork{" "}
            <span className="text-gradient">so you don&apos;t have to</span>
          </h2>
          <p className="text-lg text-muted-foreground leading-relaxed">
            From real-time transcription to zero-knowledge encryption -
            everything you need to document smarter and protect patient privacy.
          </p>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {/* Hero Card - AI Scribing (spans 2 columns) */}
          <HeroFeatureCard
            title="AI Medical Scribing"
            description="Real-time transcription of consultations. Just talk to your patient - Larinova captures every detail automatically without disrupting your workflow."
            className="md:col-span-2"
          >
            <ScribingPreview />
          </HeroFeatureCard>

          {/* ZK Privacy */}
          <FeatureCard
            title="Zero-Knowledge Privacy"
            description="Patient data stored locally and encrypted. Only the patient holds the key."
          >
            <ZKPrivacyPreview />
          </FeatureCard>

          {/* SOAP Notes */}
          <FeatureCard
            title="SOAP Note Generation"
            description="Automatically generate structured SOAP notes. Review, edit, and approve in seconds."
          >
            <SOAPPreview />
          </FeatureCard>

          {/* Medical Coding */}
          <FeatureCard
            title="Medical Coding"
            description="AI-powered ICD-10 and CPT code suggestions. Accurate coding, fewer claim denials."
          >
            <CodingPreview />
          </FeatureCard>

          {/* Task Automation */}
          <FeatureCard
            title="Task Automation"
            description="Auto-generate summaries, process claims, manage appointments, and track prescriptions."
          >
            <AutomationPreview />
          </FeatureCard>

          {/* Document Generation (spans 2 columns) */}
          <HeroFeatureCard
            title="Document Generation"
            description="Generate referral letters, discharge summaries, and clinical documents with complete patient context - ready to send instantly."
            className="md:col-span-2"
          >
            <DocumentPreview />
          </HeroFeatureCard>

          {/* Multi-Specialty */}
          <FeatureCard
            title="Multi-Specialty Support"
            description="Built for every specialty - from cardiology to pediatrics. Larinova adapts to your clinical workflow."
          >
            <MultiSpecialtyPreview />
          </FeatureCard>
        </div>

        {/* Trust indicators */}
        <div className="mt-16 flex flex-wrap items-center justify-center gap-6 md:gap-10">
          <div className="flex items-center gap-2 text-muted-foreground">
            <svg
              className="w-5 h-5 text-primary"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
              />
            </svg>
            <span className="text-sm font-medium">HIPAA Ready</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <svg
              className="w-5 h-5 text-primary"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
            <span className="text-sm font-medium">Zero-Trust Architecture</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <svg
              className="w-5 h-5 text-primary"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
              />
            </svg>
            <span className="text-sm font-medium">E2E Encryption</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <svg
              className="w-5 h-5 text-primary"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span className="text-sm font-medium">GDPR Compliant</span>
          </div>
        </div>
      </div>
    </section>
  );
}
