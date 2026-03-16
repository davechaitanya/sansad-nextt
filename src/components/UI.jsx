// Spinner
export function Spinner({ size = 32 }) {
  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", padding: 40 }}>
      <div style={{
        width: size, height: size,
        border: `3px solid #f0ece8`,
        borderTop: `3px solid #e8651a`,
        borderRadius: "50%",
        animation: "spin 0.8s linear infinite"
      }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

// Error box
export function ErrorBox({ message }) {
  return (
    <div style={{ background: "#fff5f5", border: "1px solid #fecaca", borderRadius: 8, padding: "16px 20px", color: "#c53030", fontSize: 14, display: "flex", gap: 10, alignItems: "center" }}>
      <span style={{ fontSize: 18 }}>⚠️</span> {message || "Something went wrong. Please try again."}
    </div>
  );
}

// Empty state
export function EmptyState({ icon = "📋", title, subtitle }) {
  return (
    <div style={{ textAlign: "center", padding: "60px 20px", color: "#aaa" }}>
      <div style={{ fontSize: 40, marginBottom: 12 }}>{icon}</div>
      <div style={{ fontSize: 16, fontWeight: 600, color: "#555", marginBottom: 4, fontFamily: "'Crimson Pro', serif" }}>{title}</div>
      {subtitle && <div style={{ fontSize: 13, fontFamily: "'DM Sans', sans-serif" }}>{subtitle}</div>}
    </div>
  );
}

// Stat card
export function StatCard({ icon, label, value, sub, color = "#e8651a" }) {
  return (
    <div className="stat-card hover-lift" style={{ cursor: "default" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <div style={{ fontSize: 12, color: "#888", fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.8, fontFamily: "'DM Sans', sans-serif", marginBottom: 8 }}>{label}</div>
          <div style={{ fontSize: 32, fontWeight: 700, color: "#1a1a1a", fontFamily: "'Crimson Pro', serif", lineHeight: 1 }}>{value}</div>
          {sub && <div style={{ fontSize: 12, color: "#aaa", marginTop: 4, fontFamily: "'DM Sans', sans-serif" }}>{sub}</div>}
        </div>
        <div style={{ width: 44, height: 44, background: `${color}18`, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>
          {icon}
        </div>
      </div>
    </div>
  );
}

// Search input
export function SearchInput({ value, onChange, placeholder }) {
  return (
    <div style={{ position: "relative" }}>
      <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", fontSize: 16, color: "#aaa" }}>🔍</span>
      <input
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder || "Search..."}
        style={{
          paddingLeft: 38, paddingRight: 16, paddingTop: 10, paddingBottom: 10,
          border: "1.5px solid #ede9e4", borderRadius: 10,
          fontSize: 14, width: "100%", outline: "none", background: "white",
          transition: "border-color 0.2s", fontFamily: "'DM Sans', sans-serif",
          color: "#333"
        }}
        onFocus={e => e.target.style.borderColor = "#e8651a"}
        onBlur={e => e.target.style.borderColor = "#ede9e4"}
      />
    </div>
  );
}

// Select dropdown
export function Select({ value, onChange, options, placeholder }) {
  return (
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      style={{
        padding: "10px 16px", border: "1.5px solid #ede9e4", borderRadius: 10,
        fontSize: 14, outline: "none", background: "white", cursor: "pointer",
        color: "#333", fontFamily: "'DM Sans', sans-serif", transition: "border-color 0.2s"
      }}
      onFocus={e => e.target.style.borderColor = "#e8651a"}
      onBlur={e => e.target.style.borderColor = "#ede9e4"}
    >
      {placeholder && <option value="">{placeholder}</option>}
      {options.map(o => (
        <option key={o.value} value={o.value}>{o.label}</option>
      ))}
    </select>
  );
}

// Pagination
export function Pagination({ page, totalPages, onChange }) {
  const pages = [];
  const start = Math.max(1, page - 2);
  const end = Math.min(totalPages, page + 2);
  for (let i = start; i <= end; i++) pages.push(i);

  const btnStyle = (active) => ({
    width: 36, height: 36, borderRadius: 8,
    border: active ? "none" : "1.5px solid #ede9e4",
    background: active ? "#e8651a" : "white",
    color: active ? "white" : "#555",
    cursor: "pointer", fontSize: 13, fontWeight: active ? 700 : 400,
    fontFamily: "'DM Sans', sans-serif", transition: "all 0.15s"
  });

  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 6, padding: "24px 0" }}>
      <button style={btnStyle(false)} onClick={() => onChange(Math.max(1, page - 1))} disabled={page === 1}>←</button>
      {start > 1 && <button style={btnStyle(false)} onClick={() => onChange(1)}>1</button>}
      {start > 2 && <span style={{ color: "#aaa", fontSize: 13 }}>…</span>}
      {pages.map(p => <button key={p} style={btnStyle(p === page)} onClick={() => onChange(p)}>{p}</button>)}
      {end < totalPages - 1 && <span style={{ color: "#aaa", fontSize: 13 }}>…</span>}
      {end < totalPages && <button style={btnStyle(false)} onClick={() => onChange(totalPages)}>{totalPages}</button>}
      <button style={btnStyle(false)} onClick={() => onChange(Math.min(totalPages, page + 1))} disabled={page === totalPages}>→</button>
    </div>
  );
}

// Info row for profile
export function InfoRow({ label, value }) {
  if (!value) return null;
  return (
    <div style={{ display: "flex", padding: "10px 0", borderBottom: "1px solid #f5f3f0", gap: 16 }}>
      <div style={{ minWidth: 160, fontSize: 12, fontWeight: 600, color: "#aaa", textTransform: "uppercase", letterSpacing: 0.6, fontFamily: "'DM Sans', sans-serif", paddingTop: 2 }}>{label}</div>
      <div style={{ fontSize: 14, color: "#333", flex: 1, fontFamily: "'DM Sans', sans-serif" }}>{value}</div>
    </div>
  );
}

// Section header
export function SectionHeader({ title, subtitle, action }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 24 }}>
      <div>
        <h2 className="section-title">{title}</h2>
        {subtitle && <p className="section-subtitle">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}
