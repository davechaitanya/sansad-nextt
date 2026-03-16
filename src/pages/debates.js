import { useState, useEffect } from "react";
import Head from "next/head";
import api, { P } from "../services/api";
import { Spinner, ErrorBox, SearchInput, EmptyState, Pagination, Select } from "../components/UI";

export default function DebatesPage({ initialData, initialTotal, initialPages }) {
  const [data, setData]             = useState(initialData || []);
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState(null);
  const [search, setSearch]         = useState("");
  const [filterLoksabha, setFilterLoksabha] = useState("");
  const [filterSession, setFilterSession]   = useState("");
  const [page, setPage]             = useState(1);
  const [totalPages, setTotalPages] = useState(initialPages || 1);
  const [total, setTotal]           = useState(initialTotal || 0);

  useEffect(() => {
    async function load() {
      setLoading(true); setError(null);
      try {
        const res = await api.getDebates({ page, size:25, ...(search && { search }), ...(filterLoksabha && { loksabha: filterLoksabha }), ...(filterSession && { session: filterSession }) });
        setData(P.list(res)); setTotal(P.total(res)); setTotalPages(P.pages(res));
      } catch(e) { setError(e.message); }
      finally { setLoading(false); }
    }
    load();
  }, [search, filterLoksabha, filterSession, page]);
  useEffect(() => { setPage(1); }, [search, filterLoksabha, filterSession]);

  return (
    <>
      <Head>
        <title>Debates — Parliament of India</title>
        <meta name="description" content="Browse parliamentary debates and discussions in Lok Sabha. Filter by Lok Sabha term and session." />
      </Head>
      <div className="fade-in">
        <div style={{ background:"white", borderBottom:"1px solid #ede9e4", padding:"0 24px" }}>
          <div style={{ maxWidth:1200, margin:"0 auto", display:"flex", alignItems:"center", gap:16, height:72 }}>
            <div style={{ flexShrink:0 }}>
              <div style={{ fontSize:22, fontWeight:700, fontFamily:"'Crimson Pro',serif", color:"#1a1a1a" }}>Debates</div>
              <div style={{ fontSize:12, color:"#888", marginTop:1 }}><strong style={{ color:"#e8651a" }}>{total.toLocaleString()}</strong> debates</div>
            </div>
            <div style={{ width:1, height:36, background:"#ede9e4", flexShrink:0 }} />
            <div style={{ flex:"1 1 160px", minWidth:0 }}>
              <SearchInput value={search} onChange={setSearch} placeholder="Search by subject or member..." />
            </div>
            <Select value={filterLoksabha} onChange={setFilterLoksabha} placeholder="All Lok Sabhas"
              options={[18,17,16,15,14,13,12,11,10].map(t => ({ value:String(t), label:`${t}th Lok Sabha` }))} />
            <Select value={filterSession} onChange={setFilterSession} placeholder="All Sessions"
              options={[1,2,3,4,5,6,7].map(s => ({ value:String(s), label:`Session ${s}` }))} />
            {(search||filterLoksabha||filterSession) && (
              <button onClick={() => { setSearch(""); setFilterLoksabha(""); setFilterSession(""); }}
                style={{ padding:"8px 12px", borderRadius:8, border:"1.5px solid #ede9e4", background:"white", cursor:"pointer", fontSize:12, color:"#888" }}>✕</button>
            )}
          </div>
        </div>
        <div style={{ maxWidth:1200, margin:"0 auto", padding:"24px" }}>
          {loading && <Spinner />}
          {error && <ErrorBox message={error} />}
          {!loading && data.length===0 && <EmptyState icon="🗣" title="No debates found" />}
          {!loading && data.length>0 && (
            <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
              {data.map((d,i) => {
                let members = []; try { members = JSON.parse(d.member_names||"[]"); } catch {}
                return (
                  <div key={d.debateId||i} className="card" style={{ padding:"16px 20px" }}>
                    <div style={{ display:"flex", gap:14, alignItems:"flex-start" }}>
                      <div style={{ width:36, height:36, borderRadius:8, background:"#f0fdf4", display:"flex", alignItems:"center", justifyContent:"center", fontSize:16, flexShrink:0 }}>🗣</div>
                      <div style={{ flex:1 }}>
                        <div style={{ fontWeight:600, color:"#1a1a1a", fontSize:14, marginBottom:6, lineHeight:1.4 }}>{(d.debateSubject||d.title||"").trim()||"Debate"}</div>
                        <div style={{ display:"flex", gap:10, flexWrap:"wrap", alignItems:"center", marginBottom:members.length?8:0 }}>
                          {d.debate_type_desc && <span style={{ fontSize:11, padding:"3px 10px", borderRadius:20, fontWeight:600, background:"#fff0e6", color:"#e8651a" }}>{d.debate_type_desc}</span>}
                          {d.loksabha && <span style={{ fontSize:11, padding:"2px 8px", borderRadius:6, background:"#e8f0fe", color:"#1a5ce8", fontWeight:600 }}>🏛 {d.loksabha}th Lok Sabha</span>}
                          {d.debateDate && <span style={{ fontSize:12, color:"#aaa" }}>📅 {d.debateDate}</span>}
                          {d.session && <span style={{ fontSize:11, padding:"2px 8px", borderRadius:6, background:"#f5f3f0", color:"#888" }}>Session {d.session}</span>}
                        </div>
                        {members.length>0 && <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>{members.map((n,i)=><span key={i} style={{ fontSize:11, padding:"3px 10px", borderRadius:20, background:"#f5f3f0", color:"#555" }}>👤 {n}</span>)}</div>}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          {!loading && totalPages>1 && <Pagination page={page} totalPages={totalPages} onChange={setPage} />}
        </div>
      </div>
    </>
  );
}

export async function getServerSideProps() {
  try {
    const res = await fetch("https://davechaitanya-loksabha-api.hf.space/api/debates?size=25&page=1");
    const data = await res.json();
    return { props: { initialData: data.data||[], initialTotal: data.total||0, initialPages: data.pages||1 } };
  } catch {
    return { props: { initialData:[], initialTotal:0, initialPages:1 } };
  }
}