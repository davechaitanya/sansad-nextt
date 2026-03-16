import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import Link from "next/link";
import api, { F, P } from "../services/api";
import { Spinner } from "../components/UI";
import MemberAvatar from "../components/MemberAvatar";

export default function HomePage({ initialMembers, totalMembers }) {
  const router = useRouter();
  const [featuredMembers, setFeaturedMembers] = useState(initialMembers || []);
  const [total, setTotal] = useState(totalMembers || 0);
  const [search, setSearch] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [sugLoading, setSugLoading] = useState(false);
  const [showDrop, setShowDrop] = useState(false);
  const debounceRef = useRef(null);
  const dropRef = useRef(null);

  useEffect(() => {
    const handler = e => { if (dropRef.current && !dropRef.current.contains(e.target)) setShowDrop(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    if (!search.trim() || search.length < 2) { setSuggestions([]); setShowDrop(false); return; }
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setSugLoading(true);
      try {
        const trimmed = search.trim();
        const isCode = /^\d+$/.test(trimmed);
        let results = [];
        if (isCode) {
          try { const m = await api.getMember(trimmed); results = m ? [m] : []; } catch { results = []; }
        } else {
          const res = await api.getMembers({ search: trimmed, size: 6 });
          results = P.list(res);
        }
        setSuggestions(results);
        setShowDrop(results.length > 0);
      } catch { setSuggestions([]); }
      finally { setSugLoading(false); }
    }, 300);
    return () => clearTimeout(debounceRef.current);
  }, [search]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (!search.trim()) return;
    setShowDrop(false);
    const trimmed = search.trim();
    if (/^\d+$/.test(trimmed)) router.push(`/members/${trimmed}`);
    else router.push(`/members?search=${encodeURIComponent(trimmed)}`);
  };

  return (
    <>
      <Head>
        <title>Parliament of India — Data Portal</title>
        <meta name="description" content="Explore data on Members of Parliament, Bills, Questions, Debates and more from the Lok Sabha." />
      </Head>

      <div className="fade-in">
        {/* Hero */}
        <div style={{ background: "linear-gradient(135deg, #1a1a1a 0%, #2d1a0e 50%, #1a1a1a 100%)", padding: "80px 24px", textAlign: "center", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(circle at 30% 50%, rgba(232,101,26,0.15) 0%, transparent 60%), radial-gradient(circle at 70% 50%, rgba(245,149,66,0.1) 0%, transparent 60%)" }} />
          <div style={{ maxWidth: 700, margin: "0 auto", position: "relative" }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(232,101,26,0.2)", border: "1px solid rgba(232,101,26,0.3)", borderRadius: 20, padding: "6px 16px", marginBottom: 24 }}>
              <span style={{ fontSize: 12, color: "#f59542", fontWeight: 600, fontFamily: "'DM Sans',sans-serif", letterSpacing: 1, textTransform: "uppercase" }}>🏛 Lok Sabha Data Portal</span>
            </div>
            <h1 style={{ fontSize: 52, fontWeight: 700, color: "white", marginBottom: 16, lineHeight: 1.15, fontFamily: "'Crimson Pro',serif" }}>
              Parliament of <span style={{ color: "#f59542" }}>India</span>
            </h1>
            <p style={{ fontSize: 18, color: "#aaa", marginBottom: 40, lineHeight: 1.7, fontFamily: "'DM Sans',sans-serif" }}>
              Explore data on {total.toLocaleString()}+ Members of Parliament, Bills, Questions, Debates and more.
            </p>

            {/* Search */}
            <div ref={dropRef} style={{ position: "relative", maxWidth: 560, margin: "0 auto" }}>
              <form onSubmit={handleSearch} style={{ display: "flex", gap: 0, background: "white", borderRadius: 14, overflow: "hidden", boxShadow: "0 8px 32px rgba(0,0,0,0.3)" }}>
                <input
                  value={search} onChange={e => setSearch(e.target.value)}
                  placeholder="Search MP name, party, state or MP code..."
                  style={{ flex: 1, padding: "16px 20px", border: "none", outline: "none", fontSize: 15, fontFamily: "'DM Sans',sans-serif", color: "#1a1a1a" }}
                />
                <button type="submit" className="orange-btn" style={{ padding: "16px 24px", fontSize: 15, borderRadius: 0, fontFamily: "'DM Sans',sans-serif", fontWeight: 600 }}>
                  Search
                </button>
              </form>

              {showDrop && (
                <div style={{ position: "absolute", top: "calc(100% + 8px)", left: 0, right: 0, background: "white", borderRadius: 12, boxShadow: "0 8px 32px rgba(0,0,0,0.15)", border: "1px solid #ede9e4", zIndex: 200, overflow: "hidden" }}>
                  {sugLoading && <div style={{ padding: 16, textAlign: "center", color: "#aaa", fontSize: 13 }}>Searching...</div>}
                  {!sugLoading && suggestions.map(m => (
                    <div key={F.id(m)} onClick={() => { setShowDrop(false); setSearch(""); router.push(`/members/${F.id(m)}`); }}
                      style={{ display: "flex", gap: 12, alignItems: "center", padding: "12px 16px", cursor: "pointer", borderBottom: "1px solid #f5f3f0", transition: "background 0.15s" }}
                      onMouseEnter={e => e.currentTarget.style.background = "#fffaf6"}
                      onMouseLeave={e => e.currentTarget.style.background = "white"}>
                      <MemberAvatar member={m} size={36} />
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 14, color: "#1a1a1a", fontFamily: "'DM Sans',sans-serif" }}>{F.name(m)}</div>
                        <div style={{ fontSize: 12, color: "#888", fontFamily: "'DM Sans',sans-serif" }}>{F.party(m)} · {F.constituency(m)}</div>
                      </div>
                      <div style={{ marginLeft: "auto" }}>
                        <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 6, background: m.status === "Sitting" ? "#dcfce7" : "#f5f3f0", color: m.status === "Sitting" ? "#16a34a" : "#888", fontWeight: 600 }}>{m.status}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Stats */}
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "48px 24px 0" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 16, marginBottom: 48 }}>
            {[
              { label: "Members of Parliament", value: total.toLocaleString(), icon: "👤", href: "/members" },
              { label: "Parliamentary Questions", value: "6.3L+", icon: "❓", href: "/questions" },
              { label: "Debates & Discussions", value: "1.3L+", icon: "🗣", href: "/debates" },
              { label: "Bills Introduced", value: "3,600+", icon: "📋", href: "/bills" },
              { label: "Committees", value: "50,000+", icon: "🏛", href: "/committees" },
              { label: "Assurances", value: "10,000+", icon: "📜", href: "/assurances" },
            ].map(stat => (
              <Link key={stat.label} href={stat.href} style={{ textDecoration: "none" }}>
                <div className="stat-card hover-lift" style={{ cursor: "pointer" }}>
                  <div style={{ fontSize: 28, marginBottom: 8 }}>{stat.icon}</div>
                  <div style={{ fontSize: 28, fontWeight: 700, color: "#e8651a", fontFamily: "'Crimson Pro',serif", marginBottom: 4 }}>{stat.value}</div>
                  <div style={{ fontSize: 12, color: "#888", fontFamily: "'DM Sans',sans-serif" }}>{stat.label}</div>
                </div>
              </Link>
            ))}
          </div>

          {/* Featured MPs */}
          <div style={{ marginBottom: 48 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <div>
                <h2 className="section-title">Members of Parliament</h2>
                <p className="section-subtitle">Browse all {total.toLocaleString()} MPs across all Lok Sabha terms</p>
              </div>
              <Link href="/members" style={{ padding: "10px 20px", borderRadius: 10, background: "#fff0e6", color: "#e8651a", fontWeight: 600, fontSize: 13, fontFamily: "'DM Sans',sans-serif", textDecoration: "none", border: "1px solid #ffd4b0" }}>
                View All →
              </Link>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 14 }}>
              {featuredMembers.map(m => (
                <Link key={F.id(m)} href={`/members/${F.id(m)}`} style={{ textDecoration: "none" }}>
                  <div className="card hover-lift" style={{ cursor: "pointer", padding: 20 }}>
                    <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
                      <MemberAvatar member={m} size={56} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 14, fontWeight: 700, color: "#1a1a1a", marginBottom: 2, fontFamily: "'DM Sans',sans-serif", lineHeight: 1.3 }}>{F.name(m)}</div>
                        <div style={{ fontSize: 12, color: "#e8651a", fontWeight: 600, fontFamily: "'DM Sans',sans-serif", marginBottom: 4 }}>{F.party(m)}</div>
                        <div style={{ fontSize: 11, color: "#aaa", fontFamily: "'DM Sans',sans-serif" }}>📍 {F.constituency(m)}, {F.state(m)}</div>
                      </div>
                    </div>
                    <div style={{ marginTop: 14, paddingTop: 12, borderTop: "1px solid #f5f3f0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontSize: 11, padding: "3px 10px", borderRadius: 20, fontWeight: 600, background: m.status === "Sitting" ? "#dcfce7" : "#f5f3f0", color: m.status === "Sitting" ? "#16a34a" : "#888" }}>
                        {m.status === "Sitting" ? "✅ Sitting" : "🕐 Former"}
                      </span>
                      <span style={{ fontSize: 10, padding: "2px 7px", borderRadius: 6, background: "#e8f0fe", color: "#1a5ce8", fontFamily: "'DM Sans',sans-serif", fontWeight: 600 }}>🏛 Lok Sabha</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export async function getServerSideProps() {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/members?size=8&status=Sitting`);
    const data = await res.json();
    return {
      props: {
        initialMembers: data.data || [],
        totalMembers: data.total || 0,
      }
    };
  } catch {
    return { props: { initialMembers: [], totalMembers: 0 } };
  }
}