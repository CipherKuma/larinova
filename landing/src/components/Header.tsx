"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";

export function Header() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-white/80 backdrop-blur-lg shadow-sm border-b border-border/50"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link href="/" className="group">
            <div className="flex items-center gap-2 transform group-hover:scale-105 transition-transform duration-200">
              <Image
                src="/larinova-icon.png"
                alt="Larinova"
                width={36}
                height={36}
                className="h-9 w-9 object-contain"
                priority
              />
              <span className="text-xl font-semibold text-foreground tracking-tight">
                Larinova
              </span>
            </div>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <a
              href="#features"
              className="text-muted-foreground hover:text-foreground transition-colors font-medium"
            >
              Features
            </a>
            <a
              href="#how-it-works"
              className="text-muted-foreground hover:text-foreground transition-colors font-medium"
            >
              How It Works
            </a>
            {/* TEMPORARILY HIDDEN: Testimonials nav link - hidden until testimonials section is restored */}
            {/* <a
              href="#testimonials"
              className="text-muted-foreground hover:text-foreground transition-colors font-medium"
            >
              Testimonials
            </a> */}
            <a
              href="#faq"
              className="text-muted-foreground hover:text-foreground transition-colors font-medium"
            >
              FAQ
            </a>
          </nav>

          {/* CTAs */}
          <div className="flex items-center gap-3">
            <Link href="/book">
              <Button className="bg-gradient-to-r from-primary to-accent hover:opacity-90 text-white font-semibold px-6 shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all duration-200">
                Book a Call
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
