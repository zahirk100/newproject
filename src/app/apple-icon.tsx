import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(to bottom right, #2563eb, #7c3aed)",
        }}
      >
        <svg viewBox="0 0 24 24" width={100} height={100} fill="white">
          <path d="M13 2 3 14h7l-1 8 10-12h-7z" />
        </svg>
      </div>
    ),
    { ...size }
  );
}
