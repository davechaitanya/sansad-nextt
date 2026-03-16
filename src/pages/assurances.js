import { useState, useEffect } from "react";
import Head from "next/head";
import api, { P } from "../services/api";
import { Spinner, ErrorBox, SearchInput, EmptyState, Pagination, Select } from "../components/UI";

export default function AssurancesPage({ initialData, initialTotal, initialPages }) {
  const [data, setData]             = useState(initialData || []);
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState(null);
  const [search, setSearch]         = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterLoksabha, setFilterLoksabha] = useState("");
  const [page, setPage]             = useState(1);
  const [totalPages, setTotalPages] = useState(initialPages || 1);
  const [total, setTotal]           = useState(initialTotal || 0);
  const [expanded, setExpanded]     = useState({});

  useEffect(() => {
    async function load() {
      setLoading(true); setError(null);
      try {
        const res = await api.getAssurances({ page, size:25, ...(search && { search }), ...(filterStatus && { status: filterStatus }), ...(filterLoksabha && { loksabha: filterLoksabha }) });
        setData(P.list(res)); setTotal(P.total(res)); setTotalPages(P.pages(res));
      } catch(e) { setError(e.message); }
      finally { setLoading(false); }
    }
    load();
  }, [search, filterStatus, filterLoksabha, page]);
  useEffect(() => { setPage(1); }, [search, filterStatus, filterLoksabha]);

  return (
    <>
      <Head>
        <title>Assurances — Parliament of India</title>
        <meta name="description" content="Browse government assurances made in Lok Sabha. Filter by status (Pending/Fulfilled) and Lok Sabha term." />
      </Head>
      <div className="fade-in">
        <div style={{ background:"white", borderBottom:"1px solid #ede9e4", padding:"0 24px" }}>
          <div style={{ maxWidth:1200, margin:"0 auto", display:"flex", alignItems:"center", gap:16, height:72 }}>
            <div style={{ flexShrink:0 }}>
              <div style={{ fontSize:22, fontWeight:700, fontFamily:"'Crimson Pro',serif", color:"#1a1a1a" }}>Assurances</div>
              <div style={{ fontSize:12, color:"#888", marginTop:1 }}><strong style={{ color:"#e8651a" }}>{total.toLocaleString()}</strong> assurances</div>
            </div>
            <div style={{ width:1, height:36, background:"#ede9e4", flexShrink:0 }} />
            <div style={{ flex:"1 1 160px", minWidth:0 }}>
              <SearchInput value={search} onChange={setSearch} placeholder="Search by subject or ministry..." />
            </div>
            <Select value={filterStatus} onChange={setFilterStatus} placeholder="All Status"
              options={[{value:"PENDING",label:"🟡 Pending"},{value:"FULFILLED",label:"✅ Fulfilled"}]} />
            <Select value={filterLoksabha} onChange={setFilterLoksabha} placeholder="All Terms"
              options={[18,17,16,15,14,13].map(t=>({value:String(t),label:`${t}th Lok Sabha`}))} />
            {(search||filterStatus||filterLoksabha) && (
              <button onClick={()=>{setSearch("");setFilterStatus("");setFilterLoksabha("");}}
                style={{ padding:"8px 12px", borderRadius:8, border:"1.5px solid #ede9e4", background:"white", cursor:"pointer", fontSize:12, color:"#888" }}>✕</button>
            )}
          </div>
        </div>
        <div style={{ maxWidth:1200, margin:"0 auto", padding:"24px" }}>
          {loading && <Spinner />}
          {error && <ErrorBox message={error} />}
          {!loading && data.length===0 && <EmptyState icon="📜" title="No assurances found" />}
          {!loading && data.length>0 && (
            <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
              {data.map(a => (
                <div key={a.id} className="card" style={{ padding:"16px 20px" }}>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:8 }}>
                    <div style={{ fontWeight:600, color:"#1a1a1a", fontSize:14, lineHeight:1.4, flex:1 }}>{a.subject}</div>
                    <span style={{ fontSize:11, padding:"3px 10px", borderRadius:20, fontWeight:600, marginLeft:12, flexShrink:0, background:a.status==="FULFILLED"?"#dcfce7":"#fef9c3", color:a.status==="FULFILLED"?"#16a34a":"#a16207" }}>{a.status}</span>
                  </div>
                  <div style={{ display:"flex", gap:10, flexWrap:"wrap", marginBottom:a.text_of_assurance?8:0 }}>
                    {a.member && <span style={{ fontSize:12, color:"#555" }}>👤 {a.member}</span>}
                    {a.ministry && <span style={{ fontSize:12, color:"#555" }}>🏛 {a.ministry}</span>}
                    {a.loksabha && <span style={{ fontSize:11, padding:"2px 7px", borderRadius:6, background:"#e8f0fe", color:"#1a5ce8", fontWeight:600 }}>{a.loksabha}th LS</span>}
                    {a.date && <span style={{ fontSize:12, color:"#aaa" }}>📅 {a.date}</span>}
                  </div>
                  {a.text_of_assurance && (
                    <div style={{ fontSize:13, color:"#666", lineHeight:1.6 }}>
                      {expanded[a.id] ? a.text_of_assurance : a.text_of_assurance.slice(0,200)}
                      {a.text_of_assurance.length>200 && (
                        <button onClick={()=>setExpanded(p=>({...p,[a.id]:!p[a.id]}))}
                          style={{ marginLeft:8, background:"none", border:"none", color:"#e8651a", cursor:"pointer", fontSize:12, fontWeight:600 }}>
                          {expanded[a.id]?"Show less":"Read more"}
                        </button>
                      )}
                    </div>
                  )}
                </div>
              ))}
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
    const res = await fetch("https://davechaitanya-loksabha-api.hf.space/api/assurances?size=25&page=1");
    const data = await res.json();
    return { props: { initialData: data.data||[], initialTotal: data.total||0, initialPages: data.pages||1 } };
  } catch {
    return { props: { initialData:[], initialTotal:0, initialPages:1 } };
  }
}