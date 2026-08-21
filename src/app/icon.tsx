import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: 7,
          background: "linear-gradient(to bottom right, #2563eb, #7c3aed)",
        }}
      >
        <svg viewBox="0 0 24 24" width={18} height={18} fill="white">
          <path d="M13 2 3 14h7l-1 8 10-12h-7z" />
        </svg>
      </div>
    ),
    { ...size }
  );
}
