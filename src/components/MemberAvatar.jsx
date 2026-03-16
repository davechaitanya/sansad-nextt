// Smart MP image component
// Primary:  /api/image-proxy?url={original_url}   ← your choice
// Fallback: /api/members/{mp_code}/image
// Final:    Initials avatar

import { useState } from "react";
import { F } from "../services/api";

const BASE = "https://davechaitanya-loksabha-api.hf.space";

function buildProxyUrl(original_url) {
  if (!original_url) return null;
  return `${BASE}/api/image-proxy?url=${encodeURIComponent(original_url)}`;
}

function buildDirectUrl(mp_code) {
  if (!mp_code) return null;
  return `${BASE}/api/members/${mp_code}/image`;
}

export default function MemberAvatar({ member, size = 44, style = {} }) {
  const mp_code     = member?.mp_code || member?.id;
  const original_url = member?.image_url;
  const name        = F.name(member);

  // Stage: "proxy" → "direct" → "initials"
  const [src, setSrc]     = useState(() => buildProxyUrl(original_url));
  const [stage, setStage] = useState(original_url ? "proxy" : mp_code ? "direct" : "initials");

  const handleError = () => {
    if (stage === "proxy" && mp_code) {
      setSrc(buildDirectUrl(mp_code));
      setStage("direct");
    } else {
      setStage("initials");
    }
  };

  const radius = size > 60 ? 14 : size > 35 ? 10 : 8;

  if (stage === "initials") {
    return <InitialsAvatar name={name} size={size} radius={radius} style={style} />;
  }

  return (
    <img
      src={src}
      alt={name}
      onError={handleError}
      style={{
        width: size, height: size,
        borderRadius: radius,
        objectFit: "cover",
        objectPosition: "top center",
        flexShrink: 0,
        border: "2px solid #f0ece8",
        background: "#f5f3f0",
        display: "block",
        ...style,
      }}
    />
  );
}

export function InitialsAvatar({ name = "?", size = 44, radius, style = {} }) {
  const r = radius ?? (size > 60 ? 14 : size > 35 ? 10 : 8);

  // Strip honorifics so we get real initials
  const clean = name.replace(/^(Dr\.|Mr\.|Mrs\.|Ms\.|Adv\.?|Capt\.?|Col\.?|Brig\.?|Shri|Smt\.?)\s*/i, "").trim();
  const initials = clean.split(" ").filter(Boolean).slice(0, 2).map(w => w[0]?.toUpperCase()).join("");

  // Consistent color per name
  const palettes = [
    ["#e8651a", "#f59542"],
    ["#1a5ce8", "#4a7cf0"],
    ["#16a34a", "#22c55e"],
    ["#9333ea", "#a855f7"],
    ["#0891b2", "#06b6d4"],
    ["#dc2626", "#ef4444"],
    ["#d97706", "#f59e0b"],
  ];
  const [from, to] = palettes[name.charCodeAt(0) % palettes.length];

  return (
    <div style={{
      width: size, height: size, borderRadius: r,
      flexShrink: 0,
      background: `linear-gradient(135deg, ${from}, ${to})`,
      display: "flex", alignItems: "center", justifyContent: "center",
      color: "white", fontWeight: 700,
      fontSize: Math.max(Math.floor(size * 0.36), 11),
      fontFamily: "'Crimson Pro', serif",
      letterSpacing: 0.5,
      userSelect: "none",
      ...style,
    }}>
      {initials || name.charAt(0).toUpperCase()}
    </div>
  );
}