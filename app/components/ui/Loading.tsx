"use client";

export type LoadingSize = "sm" | "md" | "lg";
export type LoadingVariant = "spinner" | "dots" | "pulse" | "fullscreen";

interface LoadingProps {
  size?: LoadingSize;
  variant?: LoadingVariant;
  text?: string;
}

const sizes = {
  sm: { outer: 20, inner: 14, border: 2 },
  md: { outer: 32, inner: 22, border: 3 },
  lg: { outer: 48, inner: 34, border: 3 },
};

// ── Spinner ──────────────────────────────────────────────
function Spinner({ size = "md" }: { size?: LoadingSize }) {
  const s = sizes[size];
  return (
    <span
      style={{
        display: "inline-block",
        width: s.outer,
        height: s.outer,
        borderRadius: "50%",
        border: `${s.border}px solid rgba(202,31,35,0.15)`,
        borderTopColor: "#ca1f23",
        animation: "spin 0.7s linear infinite",
      }}
    />
  );
}

// ── Dots ─────────────────────────────────────────────────
function Dots() {
  return (
    <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          style={{
            width: 7,
            height: 7,
            borderRadius: "50%",
            background: "#ca1f23",
            display: "inline-block",
            animation: `dotBounce 1.2s ease-in-out infinite`,
            animationDelay: `${i * 0.2}s`,
            opacity: 0.3,
          }}
        />
      ))}
    </div>
  );
}

// ── Table row skeleton ────────────────────────────────────
function SkeletonRow({ cols }: { cols: number }) {
  return (
    <tr>
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} className="px-5 py-4">
          <span
            style={{
              display: "block",
              height: 14,
              borderRadius: 6,
              background:
                "linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)",
              backgroundSize: "200% 100%",
              animation: "shimmer 1.4s infinite",
              width: i === 0 ? "60%" : i === cols - 1 ? "40%" : "80%",
            }}
          />
        </td>
      ))}
    </tr>
  );
}

// ── Full-screen page loader ───────────────────────────────
function Fullscreen({ text }: { text?: string }) {
  return (
    <div
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 20,
        minHeight: 400,
      }}
    >
      {/* Logo mark */}
      <div
        style={{
          width: 52,
          height: 52,
          borderRadius: 16,
          background: "rgba(202,31,35,0.08)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          animation: "pulseSoft 2s ease-in-out infinite",
        }}
      >
        <span
          style={{
            width: 26,
            height: 26,
            borderRadius: "50%",
            border: "3px solid rgba(202,31,35,0.2)",
            borderTopColor: "#ca1f23",
            display: "inline-block",
            animation: "spin 0.8s linear infinite",
          }}
        />
      </div>
      {text && (
        <p style={{ fontSize: 13, color: "#9ca3af", fontWeight: 500 }}>
          {text}
        </p>
      )}
    </div>
  );
}

// ── Main export ───────────────────────────────────────────
export default function Loading({
  size = "md",
  variant = "spinner",
  text,
}: LoadingProps) {
  return (
    <>
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes dotBounce {
          0%, 80%, 100% { transform: scale(0.6); opacity: 0.3; }
          40% { transform: scale(1); opacity: 1; }
        }
        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
        @keyframes pulseSoft {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.06); opacity: 0.8; }
        }
      `}</style>

      {variant === "fullscreen" && <Fullscreen text={text} />}
      {variant === "spinner" && (
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Spinner size={size} />
          {text && (
            <span style={{ fontSize: 13, color: "#9ca3af" }}>{text}</span>
          )}
        </div>
      )}
      {variant === "dots" && (
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Dots />
          {text && (
            <span style={{ fontSize: 13, color: "#9ca3af" }}>{text}</span>
          )}
        </div>
      )}
    </>
  );
}

// ── Named exports for convenience ────────────────────────
export function TableSkeleton({
  rows = 5,
  cols = 5,
}: {
  rows?: number;
  cols?: number;
}) {
  return (
    <>
      <style>{`
        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
      <tbody>
        {Array.from({ length: rows }).map((_, i) => (
          <SkeletonRow key={i} cols={cols} />
        ))}
      </tbody>
    </>
  );
}

export function CardSkeleton() {
  return (
    <>
      <style>{`
        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
      <div
        style={{
          borderRadius: 16,
          border: "1px solid #e5e7eb",
          background: "white",
          padding: 20,
          display: "flex",
          alignItems: "center",
          gap: 16,
        }}
      >
        <span
          style={{
            width: 44,
            height: 44,
            borderRadius: 12,
            background:
              "linear-gradient(90deg, #f0f0f0 25%, #e8e8e8 50%, #f0f0f0 75%)",
            backgroundSize: "200% 100%",
            animation: "shimmer 1.4s infinite",
            display: "inline-block",
            flexShrink: 0,
          }}
        />
        <div
          style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8 }}
        >
          <span
            style={{
              display: "block",
              height: 12,
              borderRadius: 6,
              width: "45%",
              background:
                "linear-gradient(90deg, #f0f0f0 25%, #e8e8e8 50%, #f0f0f0 75%)",
              backgroundSize: "200% 100%",
              animation: "shimmer 1.4s infinite",
            }}
          />
          <span
            style={{
              display: "block",
              height: 22,
              borderRadius: 6,
              width: "30%",
              background:
                "linear-gradient(90deg, #f0f0f0 25%, #e8e8e8 50%, #f0f0f0 75%)",
              backgroundSize: "200% 100%",
              animation: "shimmer 1.4s infinite 0.1s",
            }}
          />
        </div>
      </div>
    </>
  );
}
