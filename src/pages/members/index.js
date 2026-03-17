import { useState, useEffect, useCallback } from "react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import api, { F, P } from "../../services/api";
import { Spinner, ErrorBox, SearchInput, EmptyState, Pagination } from "../../components/UI";
import MemberAvatar from "../../components/MemberAvatar";
import { memberSlug } from "../../utils/slug";

const ALL_PARTIES = [
  "BJP","INC","SP","AITC","DMK","TDP","JDU","SHSUBT","NCPSP","SHS","NCP","CPI(M)","CPI",
  "YSR Congress","BRS","AAP","RJD","JMM","BJD","TRS","AIMIM","LJP","LJPRV","Ind.","BSP",
  "AIADMK","J&KNC","PDP","SAD","INLD","HJC","AJSU","NPF","MNF","NPP","KEC","RSP","IUML",
  "KCM","VCK","MDMK","CPI(ML)","RLP","RLTP","Congress(I)","JD(S)","JD(U)","AGP","AIUDF","AIFB",
];
const ALL_STATES = [
  "Andaman and Nicobar Islands","Andhra Pradesh","Arunachal Pradesh","Assam","Bihar","Chandigarh",
  "Chhattisgarh","Dadra and Nagar Haveli and Daman and Diu","Delhi","Goa","Gujarat","Haryana",
  "Himachal Pradesh","Jammu and Kashmir","Jharkhand","Karnataka","Kerala","Ladakh","Lakshadweep",
  "Madhya Pradesh","Maharashtra","Manipur","Meghalaya","Mizoram","Nagaland","Odisha","Puducherry",
  "Punjab","Rajasthan","Sikkim","Tamil Nadu","Telangana","Tripura","Uttar Pradesh","Uttarakhand","West Bengal",
];

export default function MembersPage({ initialMembers, initialTotal, initialPages }) {
  const router = useRouter();
  const [members, setMembers]           = useState(initialMembers || []);
  const [loading, setLoading]           = useState(false);
  const [error, setError]               = useState(null);
  const [search, setSearch]             = useState(router.query.search || "");
  const [filterParty, setFilterParty]   = useState("");
  const [filterState, setFilterState]   = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterTerm, setFilterTerm]     = useState("");
  const [page, setPage]                 = useState(1);
  const [totalPages, setTotalPages]     = useState(initialPages || 1);
  const [total, setTotal]               = useState(initialTotal || 0);
  const [viewMode, setViewMode]         = useState("grid");

  const fetchMembers = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const res = await api.getMembers({ page, size:20,
        ...(search       && { search }),
        ...(filterParty  && { party: filterParty }),
        ...(filterState  && { state: filterState }),
        ...(filterStatus && { status: filterStatus }),
        ...(filterTerm   && { loksabha: filterTerm }),
      });
      setMembers(P.list(res)); setTotal(P.total(res)); setTotalPages(P.pages(res));
    } catch(e) { setError(e.message); }
    finally { setLoading(false); }
  }, [search, filterParty, filterState, filterStatus, filterTerm, page]);

  useEffect(() => { fetchMembers(); }, [fetchMembers]);
  useEffect(() => { setPage(1); }, [search, filterParty, filterState, filterStatus, filterTerm]);

  return (
    <>
      <Head>
        <title>Members of Parliament — Parliament of India</title>
        <meta name="description" content="Browse all Members of Parliament across all Lok Sabha terms." />
      </Head>
      <div className="fade-in">
        <div style={{ background:"white", borderBottom:"1px solid #ede9e4", padding:"0 24px" }}>
          <div style={{ maxWidth:1200, margin:"0 auto", display:"flex", alignItems:"center", gap:16, height:72 }}>
            <div style={{ flexShrink:0 }}>
              <div style={{ fontSize:22, fontWeight:700, fontFamily:"'Crimson Pro',serif", color:"#1a1a1a" }}>Members of Parliament</div>
              <div style={{ fontSize:12, color:"#888", marginTop:1 }}><strong style={{ color:"#e8651a" }}>{total.toLocaleString()}</strong> members</div>
            </div>
            <div style={{ width:1, height:36, background:"#ede9e4", flexShrink:0 }} />
            <div style={{ flex:"2 1 240px", minWidth:0, marginRight:8 }}>
              <SearchInput value={search} onChange={setSearch} placeholder="Search name, party, state or MP code..." />
            </div>
            <div style={{ width:1, height:36, background:"#ede9e4", flexShrink:0 }} />
            <select value={filterParty} onChange={e=>setFilterParty(e.target.value)} style={{ padding:"8px 10px", border:"1.5px solid #ede9e4", borderRadius:10, fontSize:12, outline:"none", background:"white", cursor:"pointer", fontFamily:"'DM Sans',sans-serif", maxWidth:110 }}>
              <option value="">Parties</option>{ALL_PARTIES.map(p=><option key={p} value={p}>{p}</option>)}
            </select>
            <select value={filterState} onChange={e=>setFilterState(e.target.value)} style={{ padding:"8px 10px", border:"1.5px solid #ede9e4", borderRadius:10, fontSize:12, outline:"none", background:"white", cursor:"pointer", fontFamily:"'DM Sans',sans-serif", maxWidth:110 }}>
              <option value="">States</option>{ALL_STATES.map(s=><option key={s} value={s}>{s}</option>)}
            </select>
            <select value={filterStatus} onChange={e=>setFilterStatus(e.target.value)} style={{ padding:"8px 10px", border:"1.5px solid #ede9e4", borderRadius:10, fontSize:12, outline:"none", background:"white", cursor:"pointer", fontFamily:"'DM Sans',sans-serif", maxWidth:100 }}>
              <option value="">All MPs</option><option value="Sitting">✅ Sitting</option><option value="Former">🕐 Former</option>
            </select>
            <select value={filterTerm} onChange={e=>setFilterTerm(e.target.value)} style={{ padding:"8px 10px", border:"1.5px solid #ede9e4", borderRadius:10, fontSize:12, outline:"none", background:"white", cursor:"pointer", fontFamily:"'DM Sans',sans-serif", maxWidth:120 }}>
              <option value="">All Terms</option>
              {[18,17,16,15,14,13,12,11,10,9,8,7,6,5,4,3,2,1].map(t=><option key={t} value={String(t)}>{t}th Lok Sabha</option>)}
            </select>
            {(search||filterParty||filterState||filterStatus||filterTerm) && (
              <button onClick={()=>{setSearch("");setFilterParty("");setFilterState("");setFilterStatus("");setFilterTerm("");}}
                style={{ flexShrink:0, padding:"8px 12px", borderRadius:8, border:"1.5px solid #ede9e4", background:"white", cursor:"pointer", fontSize:12, color:"#888" }}>✕</button>
            )}
            <div style={{ width:1, height:36, background:"#ede9e4", flexShrink:0 }} />
            <div style={{ display:"flex", gap:4 }}>
              {["grid","table"].map(m=>(
                <button key={m} onClick={()=>setViewMode(m)} style={{ width:34, height:34, borderRadius:8, border:"1.5px solid #ede9e4", background:viewMode===m?"#fff0e6":"white", color:viewMode===m?"#e8651a":"#aaa", cursor:"pointer", fontSize:15 }}>{m==="grid"?"⊞":"☰"}</button>
              ))}
            </div>
          </div>
        </div>
        <div style={{ maxWidth:1200, margin:"0 auto", padding:"24px" }}>
          {loading && <Spinner />}
          {error && <ErrorBox message={error} />}
          {!loading && members.length===0 && <EmptyState icon="👤" title="No members found" subtitle="Try adjusting your filters" />}
          {!loading && members.length>0 && viewMode==="grid" && (
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(260px, 1fr))", gap:14, alignItems:"stretch" }}>
              {members.map(m=>(
                <Link key={m.id} href={`/members/${memberSlug(F.id(m), m.name, m.constituency)}`} style={{ textDecoration:"none" }}>
                  <div className="card hover-lift" style={{ cursor:"pointer", padding:20, height:"100%", display:"flex", flexDirection:"column", justifyContent:"space-between" }}>
                    <div style={{ display:"flex", gap:14, alignItems:"flex-start" }}>
                      <MemberAvatar member={m} size={56} />
                      <div style={{ flex:1, minWidth:0 }}>
                        <div style={{ fontSize:14, fontWeight:700, color:"#1a1a1a", marginBottom:2, lineHeight:1.3, display:"-webkit-box", WebkitLineClamp:2, WebkitBoxOrient:"vertical", overflow:"hidden" }}>{F.name(m)}</div>
                        <div style={{ fontSize:12, color:"#e8651a", fontWeight:600, marginBottom:4, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{F.party(m)}</div>
                        <div style={{ fontSize:11, color:"#aaa", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>📍 {F.constituency(m)}, {F.state(m)}</div>
                      </div>
                    </div>
                    <div style={{ marginTop:14, paddingTop:12, borderTop:"1px solid #f5f3f0", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                      <span style={{ fontSize:11, padding:"3px 10px", borderRadius:20, fontWeight:600, background:m.status==="Sitting"?"#dcfce7":"#f5f3f0", color:m.status==="Sitting"?"#16a34a":"#888" }}>{m.status==="Sitting"?"✅ Sitting":"🕐 Former"}</span>
                      <div style={{ display:"flex", gap:6 }}>
                        <span style={{ fontSize:10, padding:"2px 7px", borderRadius:6, background:"#e8f0fe", color:"#1a5ce8", fontWeight:600 }}>🏛 Lok Sabha</span>
                        <span style={{ fontSize:11, color:"#aaa" }}>Term {F.terms(m)}</span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
          {!loading && members.length>0 && viewMode==="table" && (
            <div className="card" style={{ overflow:"hidden" }}>
              <table>
                <thead><tr><th>MP</th><th>Party</th><th>Constituency</th><th>State</th><th>Terms</th><th>Status</th></tr></thead>
                <tbody>
                  {members.map(m=>(
                    <tr key={m.id} style={{ cursor:"pointer" }} onClick={()=>router.push(`/members/${memberSlug(F.id(m), m.name, m.constituency)}`)}>
                      <td><div style={{ display:"flex", gap:10, alignItems:"center" }}><MemberAvatar member={m} size={36} /><span style={{ fontWeight:600, fontSize:13 }}>{F.name(m)}</span></div></td>
                      <td>{F.party(m)}</td><td>{F.constituency(m)}</td><td style={{ color:"#666" }}>{F.state(m)}</td>
                      <td style={{ color:"#aaa", fontSize:12 }}>Term {F.terms(m)}</td>
                      <td><span style={{ fontSize:11, padding:"3px 10px", borderRadius:20, fontWeight:600, background:m.status==="Sitting"?"#dcfce7":"#f5f3f0", color:m.status==="Sitting"?"#16a34a":"#888" }}>{m.status==="Sitting"?"✅ Sitting":"🕐 Former"}</span></td>
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

export async function getServerSideProps({ query }) {
  try {
    const params = new URLSearchParams({ size:"20", page:"1" });
    if (query.search) params.set("search", query.search);
    const res = await fetch(`https://davechaitanya-loksabha-api.hf.space/api/members?${params}`);
    const data = await res.json();
    return { props: { initialMembers: data.data||[], initialTotal: data.total||0, initialPages: data.pages||1 } };
  } catch {
    return { props: { initialMembers:[], initialTotal:0, initialPages:1 } };
  }
}