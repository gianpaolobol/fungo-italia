import type { CSSProperties } from "react";

import type { SporePrintToken } from "@/lib/summary-cards";
import { cn } from "@/lib/utils";

type SporePrintProps = {
  token: SporePrintToken;
  className?: string;
  size?: "sm" | "md" | "lg";
};

const tokenColor: Record<SporePrintToken, string> = {
  white: "#f7f4e8",
  cream: "#eee3bf",
  "pale-yellow": "#e8d58f",
  ochre: "#b98743",
  pink: "#d9a5a4",
  salmon: "#cf8b78",
  rust: "#9b5936",
  brown: "#73533d",
  "purple-brown": "#5d4652",
  black: "#262522",
  variable: "#b8aa8e",
  unknown: "#c8cec4",
  "not-applicable": "#e4e7e1",
};

const accessibleLabel: Record<SporePrintToken, string> = {
  white: "Sporata bianca",
  cream: "Sporata crema",
  "pale-yellow": "Sporata giallo pallido",
  ochre: "Sporata ocra",
  pink: "Sporata rosata",
  salmon: "Sporata salmone",
  rust: "Sporata ruggine",
  brown: "Sporata bruna",
  "purple-brown": "Sporata bruno-violacea",
  black: "Sporata nera",
  variable: "Sporata variabile nel gruppo",
  unknown: "Colore della sporata in preparazione",
  "not-applicable": "Sporata non applicabile",
};

const sizeClass = {
  sm: "size-16",
  md: "size-24",
  lg: "size-32",
};

export function SporePrint({
  token,
  className,
  size = "md",
}: SporePrintProps) {
  const color = tokenColor[token];
  const variable =
    token === "variable"
      ? "conic-gradient(from 12deg, #f7f4e8, #d9a5a4 18%, #b98743 38%, #73533d 58%, #5d4652 78%, #f7f4e8)"
      : undefined;

  const style = {
    "--spore-color": color,
    background: variable,
  } as CSSProperties;

  return (
    <div
      role="img"
      aria-label={accessibleLabel[token]}
      title={accessibleLabel[token]}
      className={cn(
        "relative grid shrink-0 place-items-center overflow-hidden rounded-full border border-[#c8d0c4] bg-[#fbfaf4] shadow-inner",
        sizeClass[size],
        className,
      )}
      style={style}
    >
      <div
        aria-hidden="true"
        className="absolute inset-[10%] rounded-full"
        style={{
          background:
            token === "variable"
              ? "repeating-conic-gradient(from 0deg, color-mix(in srgb, transparent 35%, white) 0deg 1.2deg, transparent 1.2deg 4deg)"
              : "repeating-conic-gradient(from 0deg, var(--spore-color) 0deg 1.15deg, transparent 1.15deg 4deg)",
        }}
      />
      <div
        aria-hidden="true"
        className="absolute size-[18%] rounded-full bg-[#fbfaf4] shadow-[0_0_14px_8px_#fbfaf4]"
      />
      {(token === "unknown" || token === "not-applicable") && (
        <div
          aria-hidden="true"
          className="absolute inset-[18%] rounded-full border border-dashed border-[#8e9b8c]"
        />
      )}
    </div>
  );
}
