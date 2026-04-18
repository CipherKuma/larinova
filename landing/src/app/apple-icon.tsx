import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#0a0f1e",
        borderRadius: 32,
      }}
    >
      <svg
        viewBox="0 0 32 32"
        width="140"
        height="140"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle
          cx="12"
          cy="16"
          r="7"
          fill="none"
          stroke="white"
          strokeWidth="1.2"
          opacity="0.8"
        />
        <circle
          cx="20"
          cy="16"
          r="7"
          fill="none"
          stroke="white"
          strokeWidth="1.2"
          opacity="0.8"
        />
        <path
          d="M16.5 10.1a7 7 0 0 0-1 11.8 7 7 0 0 0 1-11.8Z"
          fill="#10b981"
        />
        <path
          d="M15.5 10.1a7 7 0 0 1 1 11.8 7 7 0 0 1-1-11.8Z"
          fill="#10b981"
        />
      </svg>
    </div>,
    { ...size },
  );
}
