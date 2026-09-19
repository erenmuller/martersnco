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
          background: "#f6f5f0",
          color: "#14243c",
          padding: "64px 72px",
          fontFamily: "Helvetica, Arial, sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderBottom: "1px solid #e0ddd2",
            paddingBottom: 28,
          }}
        >
          <div style={{
              display: "flex",
              fontSize: 30,
              letterSpacing: 0.9,
              fontFamily: "Georgia, serif",
            }}>
            Marters
            <span style={{ color: "#8a6a2f", margin: "0 10px" }}>
              &amp;
            </span>
            Co.
          </div>
          <div
            style={{
              display: "flex",
              color: "#63697a",
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
          <div style={{ display: "flex", fontSize: 76, lineHeight: 1.06, letterSpacing: -1.9 }}>
            Automation that survives contact with your business.
          </div>
          <div
            style={{
              display: "flex",
              marginTop: 30,
              color: "#3f4756",
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
                border: "1px solid #d6d2c6",
                background: index === 4 ? "#8a6a2f" : "#e0ddd2",
              }}
            />
          ))}
          <div
            style={{
              display: "flex",
              height: 1,
              flex: 1,
              background: "#e0ddd2",
              marginLeft: 12,
            }}
          />
          <div
            style={{
              display: "flex",
              fontFamily: "monospace",
              color: "#63697a",
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
