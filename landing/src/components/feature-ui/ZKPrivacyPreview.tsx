"use client";

import { useState, useEffect, useMemo } from "react";

const charset =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";
const dataItems = ["Patient ID: JD-4829", "DOB: 03/15/1985", "Diagnosis: ****"];

function EncryptedText({
  text,
  isEncrypting,
}: {
  text: string;
  isEncrypting: boolean;
}) {
  const [displayText, setDisplayText] = useState(text);
  const [encryptedCount, setEncryptedCount] = useState(0);

  useEffect(() => {
    if (isEncrypting) {
      // Encrypting animation
      const interval = setInterval(() => {
        setEncryptedCount((prev) => {
          if (prev >= text.length) return prev;
          return prev + 1;
        });
      }, 40);

      const scrambleInterval = setInterval(() => {
        setDisplayText((prev) => {
          return text
            .split("")
            .map((char, i) => {
              if (i < encryptedCount) {
                return charset[Math.floor(Math.random() * charset.length)];
              }
              return char;
            })
            .join("");
        });
      }, 50);

      return () => {
        clearInterval(interval);
        clearInterval(scrambleInterval);
      };
    } else {
      setEncryptedCount(0);
      setDisplayText(text);
    }
  }, [isEncrypting, text, encryptedCount]);

  return (
    <span
      className={
        isEncrypting ? "text-primary font-mono" : "text-muted-foreground"
      }
    >
      {displayText}
    </span>
  );
}

export function ZKPrivacyPreview() {
  const [isEncrypting, setIsEncrypting] = useState(false);
  const [isEncrypted, setIsEncrypted] = useState(false);

  useEffect(() => {
    const cycle = () => {
      // Start encrypting
      setIsEncrypting(true);
      setIsEncrypted(false);

      // After encryption completes
      setTimeout(() => {
        setIsEncrypted(true);

        // Reset after showing encrypted state
        setTimeout(() => {
          setIsEncrypting(false);
          setIsEncrypted(false);
        }, 1500);
      }, 1200);
    };

    cycle();
    const interval = setInterval(cycle, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="h-full w-full p-3 flex flex-col items-center justify-center">
      {/* Data blocks */}
      <div className="w-full max-w-[180px] space-y-1.5 mb-3">
        {dataItems.map((item, i) => (
          <div
            key={i}
            className={`px-2 py-1.5 rounded border text-[10px] transition-all duration-300 ${
              isEncrypted
                ? "bg-primary/10 border-primary/30"
                : "bg-white border-border/50"
            }`}
          >
            {isEncrypted ? (
              <span className="text-primary font-mono">
                {"•".repeat(item.length)}
              </span>
            ) : isEncrypting ? (
              <EncryptedText text={item} isEncrypting={isEncrypting} />
            ) : (
              <span className="text-muted-foreground">{item}</span>
            )}
          </div>
        ))}
      </div>

      {/* Lock status */}
      <div className="flex items-center gap-2">
        <div
          className={`w-6 h-6 rounded-full flex items-center justify-center transition-all duration-300 ${
            isEncrypted ? "bg-accent" : "bg-secondary"
          }`}
        >
          <svg
            className={`w-3.5 h-3.5 transition-colors ${isEncrypted ? "text-white" : "text-muted-foreground"}`}
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
        </div>
        <span className="text-[10px] text-muted-foreground">
          {isEncrypted
            ? "Zero-Knowledge Secured"
            : isEncrypting
              ? "Encrypting..."
              : "Patient data"}
        </span>
      </div>
    </div>
  );
}
