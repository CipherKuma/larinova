"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const testimonials = [
  {
    quote:
      "Larinova has completely transformed my practice. I used to spend 3 hours after clinic finishing notes. Now I walk out the door at 5pm with everything done.",
    author: "Dr. Sarah Chen",
    role: "Family Medicine Physician",
    location: "Stanford Health Care",
    initials: "SC",
    color: "bg-gradient-to-br from-pink-500 to-rose-500",
  },
  {
    quote:
      "The accuracy is remarkable. It understands complex neurology terminology and produces notes that actually sound like me. My patients love that I'm more present during visits.",
    author: "Dr. Michael Rodriguez",
    role: "Neurologist",
    location: "Mayo Clinic",
    initials: "MR",
    color: "bg-gradient-to-br from-blue-500 to-cyan-500",
  },
  {
    quote:
      "As a surgeon, every minute counts. Larinova lets me document procedures in real-time without breaking sterile technique. It's like having the perfect resident.",
    author: "Dr. Emily Thompson",
    role: "Orthopedic Surgeon",
    location: "Cleveland Clinic",
    initials: "ET",
    color: "bg-gradient-to-br from-violet-500 to-purple-500",
  },
  {
    quote:
      "We've rolled out Larinova to our entire primary care network. Physician satisfaction is up 40% and burnout rates have dropped significantly.",
    author: "Dr. James Park",
    role: "Chief Medical Officer",
    location: "Kaiser Permanente",
    initials: "JP",
    color: "bg-gradient-to-br from-emerald-500 to-teal-500",
  },
  {
    quote:
      "Integration with Epic was seamless. Our IT team was amazed. Larinova actually made our EHR better to use, which I didn't think was possible.",
    author: "Dr. Lisa Nguyen",
    role: "Internal Medicine",
    location: "Mount Sinai Hospital",
    initials: "LN",
    color: "bg-gradient-to-br from-orange-500 to-amber-500",
  },
  {
    quote:
      "I was skeptical at first, but after one week I was hooked. The note quality is better than what I was typing manually, and I gained back my evenings.",
    author: "Dr. David Williams",
    role: "Pediatrician",
    location: "Children's Hospital LA",
    initials: "DW",
    color: "bg-gradient-to-br from-indigo-500 to-blue-500",
  },
];

export function Testimonials() {
  return (
    <section id="testimonials" className="py-24 md:py-32 bg-white relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center max-w-3xl mx-auto mb-16 md:mb-20">
          <span className="inline-block text-primary font-semibold text-sm uppercase tracking-wider mb-4">
            Trusted by Leading Physicians
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-6">
            Hear from doctors who{" "}
            <span className="text-gradient">reclaimed their time</span>
          </h2>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Join thousands of healthcare professionals who have transformed
            their documentation workflow with Larinova.
          </p>
        </div>

        {/* Testimonials grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {testimonials.map((testimonial, index) => (
            <Card
              key={index}
              className="group border-0 shadow-lg shadow-black/5 hover:shadow-xl hover:shadow-primary/10 transition-all duration-300 hover:-translate-y-1 bg-white overflow-hidden"
            >
              <CardContent className="p-8">
                {/* Quote icon */}
                <div className="mb-6">
                  <svg
                    className="w-10 h-10 text-primary/20"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                  </svg>
                </div>

                {/* Quote */}
                <p className="text-foreground leading-relaxed mb-6 text-[15px]">
                  &ldquo;{testimonial.quote}&rdquo;
                </p>

                {/* Author */}
                <div className="flex items-center gap-4">
                  <Avatar className="w-12 h-12">
                    <AvatarFallback
                      className={`${testimonial.color} text-white font-semibold`}
                    >
                      {testimonial.initials}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-semibold text-foreground">
                      {testimonial.author}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {testimonial.role}
                    </div>
                    <div className="text-xs text-muted-foreground/70">
                      {testimonial.location}
                    </div>
                  </div>
                </div>

                {/* Rating stars */}
                <div className="flex gap-1 mt-4">
                  {[...Array(5)].map((_, i) => (
                    <svg
                      key={i}
                      className="w-4 h-4 text-amber-400 fill-current"
                      viewBox="0 0 20 20"
                    >
                      <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                    </svg>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Logos section */}
        <div className="mt-20">
          <p className="text-center text-sm text-muted-foreground mb-8">
            Trusted by healthcare organizations worldwide
          </p>
          <div className="flex flex-wrap items-center justify-center gap-8 md:gap-16 opacity-60">
            {[
              "Mayo Clinic",
              "Stanford",
              "Kaiser",
              "Cleveland Clinic",
              "Mount Sinai",
              "Johns Hopkins",
            ].map((org, index) => (
              <div
                key={index}
                className="text-xl md:text-2xl font-bold text-muted-foreground/50"
              >
                {org}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
