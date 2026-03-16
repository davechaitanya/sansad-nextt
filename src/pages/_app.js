import '../styles/globals.css';
import Navbar from '../components/Navbar';

export default function App({ Component, pageProps }) {
  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", minHeight: "100vh", background: "#faf9f7" }}>
      <Navbar />
      <main>
        <Component {...pageProps} />
      </main>
      <footer style={{ background:"#1a1a1a", color:"#999", padding:"24px", marginTop:"80px", textAlign:"center" }}>
        <div style={{ maxWidth:1200, margin:"0 auto" }}>
          <div style={{ display:"flex", justifyContent:"center", alignItems:"center", gap:12 }}>
            <div style={{ width:28, height:28, background:"linear-gradient(135deg,#e8651a,#f59542)", borderRadius:6, display:"flex", alignItems:"center", justifyContent:"center" }}>
              <span style={{ color:"white", fontWeight:800, fontSize:13, fontFamily:"'Crimson Pro',serif" }}>भा</span>
            </div>
            <span style={{ color:"white", fontWeight:600, fontSize:15, fontFamily:"'Crimson Pro',serif" }}>Parliament of India — Data Portal</span>
          </div>
        </div>
      </footer>
    </div>
  );
}