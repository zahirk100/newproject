import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(to bottom right, #0f172a, #1e1b4b)",
          color: "white",
          fontFamily: "Helvetica",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 20, marginBottom: 36 }}>
          <div
            style={{
              width: 84,
              height: 84,
              borderRadius: 18,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "linear-gradient(to bottom right, #2563eb, #7c3aed)",
            }}
          >
            <svg viewBox="0 0 24 24" width={46} height={46} fill="white">
              <path d="M13 2 3 14h7l-1 8 10-12h-7z" />
            </svg>
          </div>
          <div style={{ fontSize: 64, fontWeight: 700, letterSpacing: -1 }}>OfferteFlits</div>
        </div>
        <div style={{ fontSize: 32, color: "#cbd5e1", textAlign: "center", maxWidth: 880 }}>
          Offertes maken met AI, van aanvraag tot betaalde klus
        </div>
      </div>
    ),
    { ...size }
  );
}
