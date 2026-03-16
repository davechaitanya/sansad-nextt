import { useState, useEffect } from "react";
import Head from "next/head";
import api, { P } from "../services/api";
import { Spinner, ErrorBox, SearchInput, EmptyState, Pagination, Select } from "../components/UI";

export default function QuestionsPage({ initialData, initialTotal, initialPages }) {
  const [data, setData]         = useState(initialData || []);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState(null);
  const [search, setSearch]     = useState("");
  const [filterType, setFilterType] = useState("");
  const [page, setPage]         = useState(1);
  const [totalPages, setTotalPages] = useState(initialPages || 1);
  const [total, setTotal]       = useState(initialTotal || 0);

  useEffect(() => {
    async function load() {
      setLoading(true); setError(null);
      try {
        const res = await api.getQuestions({ page, size:25, ...(search && { search }), ...(filterType && { question_type: filterType }) });
        setData(P.list(res)); setTotal(P.total(res)); setTotalPages(P.pages(res));
      } catch(e) { setError(e.message); }
      finally { setLoading(false); }
    }
    load();
  }, [search, filterType, page]);
  useEffect(() => { setPage(1); }, [search, filterType]);

  return (
    <>
      <Head>
        <title>Parliamentary Questions — Parliament of India</title>
        <meta name="description" content="Browse all parliamentary questions asked in Lok Sabha. Filter by type, ministry and search by subject." />
      </Head>
      <div className="fade-in">
        <div style={{ background:"white", borderBottom:"1px solid #ede9e4", padding:"0 24px" }}>
          <div style={{ maxWidth:1200, margin:"0 auto", display:"flex", alignItems:"center", gap:16, height:72 }}>
            <div style={{ flexShrink:0 }}>
              <div style={{ fontSize:22, fontWeight:700, fontFamily:"'Crimson Pro',serif", color:"#1a1a1a" }}>Parliamentary Questions</div>
              <div style={{ fontSize:12, color:"#888", marginTop:1 }}><strong style={{ color:"#e8651a" }}>{total.toLocaleString()}</strong> questions</div>
            </div>
            <div style={{ width:1, height:36, background:"#ede9e4", flexShrink:0 }} />
            <div style={{ flex:"1 1 160px", minWidth:0 }}>
              <SearchInput value={search} onChange={setSearch} placeholder="Search by subject or ministry..." />
            </div>
            <Select value={filterType} onChange={setFilterType} placeholder="All Types"
              options={[{ value:"STARRED", label:"⭐ Starred" }, { value:"UNSTARRED", label:"📋 Unstarred" }]} />
            {(search||filterType) && (
              <button onClick={() => { setSearch(""); setFilterType(""); }}
                style={{ padding:"8px 12px", borderRadius:8, border:"1.5px solid #ede9e4", background:"white", cursor:"pointer", fontSize:12, color:"#888" }}>✕</button>
            )}
          </div>
        </div>
        <div style={{ maxWidth:1200, margin:"0 auto", padding:"24px" }}>
          {loading && <Spinner />}
          {error && <ErrorBox message={error} />}
          {!loading && data.length===0 && <EmptyState icon="❓" title="No questions found" />}
          {!loading && data.length>0 && (
            <div className="card" style={{ overflow:"hidden" }}>
              <table>
                <thead><tr><th>Q.No</th><th>Subject</th><th>Ministry</th><th>Type</th><th>Date</th><th>Session</th><th>PDF</th></tr></thead>
                <tbody>
                  {data.map(q => (
                    <tr key={q.questionId}>
                      <td style={{ color:"#e8651a", fontWeight:600 }}>{q.questionNo}</td>
                      <td><div style={{ maxWidth:280, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", fontSize:13 }}>{q.subject}</div></td>
                      <td style={{ fontSize:12, color:"#666", maxWidth:160 }}>{q.ministry}</td>
                      <td><span style={{ fontSize:11, padding:"2px 8px", borderRadius:6, fontWeight:600, background:q.questionType==="STARRED"?"#fff0e6":"#f5f3f0", color:q.questionType==="STARRED"?"#e8651a":"#888" }}>{q.questionType}</span></td>
                      <td style={{ fontSize:12, color:"#aaa" }}>{q.questionDate}</td>
                      <td style={{ fontSize:12, color:"#aaa" }}>Session {q.sessionNo}</td>
                      <td>{q.pdfUrl && <a href={q.pdfUrl} target="_blank" rel="noreferrer" style={{ fontSize:11, padding:"3px 8px", borderRadius:6, background:"#fff0e6", color:"#e8651a", textDecoration:"none", fontWeight:600 }}>📄 PDF</a>}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
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
    const res = await fetch("https://davechaitanya-loksabha-api.hf.space/api/questions?size=25&page=1");
    const data = await res.json();
    return { props: { initialData: data.data||[], initialTotal: data.total||0, initialPages: data.pages||1 } };
  } catch {
    return { props: { initialData:[], initialTotal:0, initialPages:1 } };
  }
}