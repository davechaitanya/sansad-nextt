import { useState, useEffect } from "react";
import Head from "next/head";
import api, { P } from "../services/api";
import { Spinner, ErrorBox, SearchInput, EmptyState, Pagination, Select } from "../components/UI";

export default function CommitteesPage({ initialData, initialTotal, initialPages }) {
  const [data, setData]             = useState(initialData || []);
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState(null);
  const [search, setSearch]         = useState("");
  const [filterLoksabha, setFilterLoksabha] = useState("");
  const [page, setPage]             = useState(1);
  const [totalPages, setTotalPages] = useState(initialPages || 1);
  const [total, setTotal]           = useState(initialTotal || 0);

  useEffect(() => {
    async function load() {
      setLoading(true); setError(null);
      try {
        const res = await api.getCommittees({ page, size:25, ...(search && { search }), ...(filterLoksabha && { loksabha: filterLoksabha }) });
        setData(P.list(res)); setTotal(P.total(res)); setTotalPages(P.pages(res));
      } catch(e) { setError(e.message); }
      finally { setLoading(false); }
    }
    load();
  }, [search, filterLoksabha, page]);
  useEffect(() => { setPage(1); }, [search, filterLoksabha]);

  return (
    <>
      <Head>
        <title>Committees — Parliament of India</title>
        <meta name="description" content="Browse parliamentary committee memberships in Lok Sabha." />
      </Head>
      <div className="fade-in">
        <div style={{ background:"white", borderBottom:"1px solid #ede9e4", padding:"0 24px" }}>
          <div style={{ maxWidth:1200, margin:"0 auto", display:"flex", alignItems:"center", gap:16, height:72 }}>
            <div style={{ flexShrink:0 }}>
              <div style={{ fontSize:22, fontWeight:700, fontFamily:"'Crimson Pro',serif", color:"#1a1a1a" }}>Committees</div>
              <div style={{ fontSize:12, color:"#888", marginTop:1 }}><strong style={{ color:"#e8651a" }}>{total.toLocaleString()}</strong> committee memberships</div>
            </div>
            <div style={{ width:1, height:36, background:"#ede9e4", flexShrink:0 }} />
            <div style={{ flex:"1 1 160px", minWidth:0 }}>
              <SearchInput value={search} onChange={setSearch} placeholder="Search by committee name..." />
            </div>
            <Select value={filterLoksabha} onChange={setFilterLoksabha} placeholder="All Terms"
              options={[18,17,16,15,14,13].map(t=>({value:String(t),label:`${t}th Lok Sabha`}))} />
            {(search||filterLoksabha) && (
              <button onClick={()=>{setSearch("");setFilterLoksabha("");}}
                style={{ padding:"8px 12px", borderRadius:8, border:"1.5px solid #ede9e4", background:"white", cursor:"pointer", fontSize:12, color:"#888" }}>✕</button>
            )}
          </div>
        </div>
        <div style={{ maxWidth:1200, margin:"0 auto", padding:"24px" }}>
          {loading && <Spinner />}
          {error && <ErrorBox message={error} />}
          {!loading && data.length===0 && <EmptyState icon="🏛" title="No committees found" />}
          {!loading && data.length>0 && (
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(300px, 1fr))", gap:14 }}>
              {data.map(c => (
                <div key={c.id} className="card" style={{ padding:"18px 20px" }}>
                  <div style={{ display:"flex", gap:12, alignItems:"flex-start" }}>
                    <div style={{ width:40, height:40, borderRadius:10, background:"#fff0e6", display:"flex", alignItems:"center", justifyContent:"center", fontSize:18, flexShrink:0 }}>🏛</div>
                    <div>
                      <div style={{ fontWeight:600, color:"#1a1a1a", fontSize:14, marginBottom:4, lineHeight:1.3 }}>{c.committeeName}</div>
                      {c.status && <div style={{ fontSize:12, color:"#e8651a", fontWeight:600, marginBottom:4 }}>{c.status}</div>}
                      <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
                        {c.loksabha && <span style={{ fontSize:11, padding:"2px 7px", borderRadius:6, background:"#e8f0fe", color:"#1a5ce8", fontWeight:600 }}>{c.loksabha}th Lok Sabha</span>}
                        {c.date_from && <span style={{ fontSize:11, color:"#aaa" }}>📅 {c.date_from} → {c.date_to||"Present"}</span>}
                      </div>
                    </div>
                  </div>
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
    const res = await fetch("https://davechaitanya-loksabha-api.hf.space/api/committees?size=25&page=1");
    const data = await res.json();
    return { props: { initialData: data.data||[], initialTotal: data.total||0, initialPages: data.pages||1 } };
  } catch {
    return { props: { initialData:[], initialTotal:0, initialPages:1 } };
  }
}