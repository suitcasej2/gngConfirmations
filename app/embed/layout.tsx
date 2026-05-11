import "./embed-frame.css";

/** Airtable SDK expects Node; avoids opaque failures on Edge. */
export const runtime = "nodejs";

export default function EmbedLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      id="embed-frame-root"
      style={{
        margin: 0,
        padding: 0,
        background: "#faf7f2",
        fontFamily:
          'system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
        WebkitFontSmoothing: "antialiased",
      }}
    >
      {children}
    </div>
  );
}
