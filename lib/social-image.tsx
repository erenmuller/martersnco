import { ImageResponse } from "next/og";
import { site } from "@/lib/site";

export const socialImageSize = { width: 1200, height: 630 };

/** Shared Open Graph/Twitter card, kept visual rather than promotional. */
export function createSocialImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#f5f3ed",
          color: "#16181a",
          padding: "64px 72px",
          fontFamily: "Georgia, serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderBottom: "1px solid #d8d4c8",
            paddingBottom: 28,
          }}
        >
          <div style={{ display: "flex", fontSize: 30, letterSpacing: -0.5 }}>
            Marters <span style={{ color: "#1f4d3f" }}>&amp;</span> Co.
          </div>
          <div
            style={{
              display: "flex",
              color: "#1f4d3f",
              fontFamily: "monospace",
              fontSize: 15,
              letterSpacing: 2.2,
              textTransform: "uppercase",
            }}
          >
            DIFC licensed · Dubai · Est. {site.founded}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", maxWidth: 950 }}>
          <div style={{ display: "flex", fontSize: 76, lineHeight: 1.04 }}>
            Automation that survives contact with your business.
          </div>
          <div
            style={{
              display: "flex",
              marginTop: 30,
              color: "#494d50",
              fontFamily: "Arial, sans-serif",
              fontSize: 25,
              lineHeight: 1.35,
            }}
          >
            We map the process, build the system, and train the people who run it.
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          {[72, 112, 56, 156, 36, 112, 50].map((width, index) => (
            <div
              key={`${width}-${index}`}
              style={{
                display: "flex",
                width,
                height: 17,
                border: "1px solid #b9b4a5",
                background: index === 4 ? "#1f4d3f" : "#cbc5b3",
              }}
            />
          ))}
          <div
            style={{
              display: "flex",
              height: 1,
              flex: 1,
              background: "#d8d4c8",
              marginLeft: 12,
            }}
          />
          <div
            style={{
              display: "flex",
              fontFamily: "monospace",
              color: "#7b7f82",
              fontSize: 14,
              letterSpacing: 1.2,
              textTransform: "uppercase",
            }}
          >
            Process measured
          </div>
        </div>
      </div>
    ),
    socialImageSize,
  );
}
