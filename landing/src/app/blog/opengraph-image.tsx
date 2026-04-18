import { ImageResponse } from "next/og";

export const alt = "Larinova Blog";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function BlogOgImage() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background:
          "linear-gradient(135deg, #0a0f1e 0%, #111827 50%, #0a0f1e 100%)",
        fontFamily: "system-ui, sans-serif",
      }}
    >
      {/* Glow */}
      <div
        style={{
          position: "absolute",
          width: 400,
          height: 400,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(16, 185, 129, 0.12) 0%, transparent 70%)",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
        }}
      />

      {/* Logo */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          marginBottom: 24,
        }}
      >
        <svg
          viewBox="0 0 32 32"
          width="48"
          height="48"
          xmlns="http://www.w3.org/2000/svg"
        >
          <rect
            x="3"
            y="12"
            width="2"
            height="8"
            rx="1"
            fill="#10b981"
            opacity="0.5"
          />
          <rect
            x="6.5"
            y="9"
            width="2"
            height="14"
            rx="1"
            fill="#10b981"
            opacity="0.7"
          />
          <rect
            x="10"
            y="6"
            width="2"
            height="20"
            rx="1"
            fill="#10b981"
            opacity="0.9"
          />
          <path
            d="M14 6v20M14 16l10-10M14 16l10 10"
            stroke="#10b981"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
        </svg>
        <span style={{ fontSize: 40, fontWeight: 700, color: "#f9fafb" }}>
          Larinova<span style={{ color: "#10b981" }}>AI</span>
        </span>
      </div>

      {/* Blog title */}
      <p
        style={{
          fontSize: 48,
          fontWeight: 700,
          color: "#f9fafb",
          marginBottom: 16,
        }}
      >
        Blog
      </p>

      <p
        style={{
          fontSize: 20,
          color: "#94a3b8",
          textAlign: "center",
          maxWidth: 600,
        }}
      >
        Insights on AI medical scribing and Indian healthcare technology
      </p>
    </div>,
    { ...size },
  );
}
