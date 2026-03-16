import Link from 'next/link';
import { useRouter } from 'next/router';

export default function Navbar() {
  const router = useRouter();

  const links = [
    { href: "/",            label: "Home" },
    { href: "/members",     label: "Members" },
    { href: "/questions",   label: "Questions" },
    { href: "/bills",       label: "Bills" },
    { href: "/committees",  label: "Committees" },
    { href: "/assurances",  label: "Assurances" },
    { href: "/debates",     label: "Debates" },
  ];

  const isActive = (href) => {
    if (href === "/") return router.pathname === "/";
    return router.pathname.startsWith(href);
  };

  return (
    <nav style={{ background:"white", borderBottom:"1px solid #ede9e4", position:"sticky", top:0, zIndex:100, boxShadow:"0 1px 12px rgba(0,0,0,0.06)" }}>
      <div style={{ maxWidth:1200, margin:"0 auto", padding:"0 24px", display:"flex", alignItems:"center", height:60, gap:24 }}>
        <Link href="/" style={{ display:"flex", alignItems:"center", gap:10, textDecoration:"none", flexShrink:0 }}>
          <div style={{ width:36, height:36, background:"linear-gradient(135deg,#e8651a,#f59542)", borderRadius:8, display:"flex", alignItems:"center", justifyContent:"center", boxShadow:"0 2px 8px rgba(232,101,26,0.3)" }}>
            <span style={{ color:"white", fontWeight:800, fontSize:16, fontFamily:"'Crimson Pro',serif" }}>भा</span>
          </div>
          <div style={{ textAlign:"left" }}>
            <div style={{ fontSize:14, fontWeight:700, color:"#1a1a1a", fontFamily:"'Crimson Pro',serif", lineHeight:1.1 }}>Parliament</div>
            <div style={{ fontSize:10, color:"#e8651a", fontWeight:600, fontFamily:"'DM Sans',sans-serif", textTransform:"uppercase", letterSpacing:0.8 }}>of India</div>
          </div>
        </Link>

        <div style={{ width:1, height:32, background:"#ede9e4", flexShrink:0 }} />

        <div style={{ display:"flex", gap:2, flex:1, overflowX:"auto" }}>
          {links.map(link => (
            <Link key={link.href} href={link.href}
              style={{
                background: isActive(link.href) ? "#fff0e6" : "none",
                border:"none", cursor:"pointer", padding:"6px 12px", borderRadius:8,
                fontSize:13, fontWeight: isActive(link.href) ? 600 : 500,
                color: isActive(link.href) ? "#e8651a" : "#555",
                fontFamily:"'DM Sans',sans-serif", textDecoration:"none",
                transition:"all 0.15s", whiteSpace:"nowrap", flexShrink:0,
                display:"inline-block"
              }}>
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}