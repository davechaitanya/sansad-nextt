import { useState, useEffect } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import Link from "next/link";
import api, { F, P } from "../../services/api";
import { Spinner, ErrorBox, EmptyState } from "../../components/UI";
import MemberAvatar from "../../components/MemberAvatar";
import { extractMpCode, memberSlug } from "../../utils/slug";

const TABS = [
  { id:"overview",   label:"Overview",        icon:"👤" },
  { id:"questions",  label:"Questions",        icon:"❓" },
  { id:"debates",    label:"Debates",          icon:"🗣" },
  { id:"committees", label:"Committees",       icon:"🏛" },
  { id:"assurances", label:"Assurances",       icon:"📜" },
  { id:"mentions",   label:"Special Mentions", icon:"⭐" },
  { id:"tours",      label:"Tours",            icon:"✈️" },
  { id:"gallery",    label:"Gallery",          icon:"🎬" },
];

export default function MemberProfilePage({ member: initialMember, dashboard: initialDashboard }) {
  const router = useRouter();
  const { slug } = router.query;
  const mp_code = extractMpCode(slug);

  const [member, setMember]             = useState(initialMember || null);
  const [dashboard, setDashboard]       = useState(initialDashboard || null);
  const [personal, setPersonal]         = useState(null);
  const [otherDetails, setOtherDetails] = useState(null);
  const [loading, setLoading]           = useState(!initialMember);
  const [error, setError]               = useState(null);
  const [activeTab, setActiveTab]       = useState("overview");
  const [tabData, setTabData]           = useState({});
  const [tabLoading, setTabLoading]     = useState(false);

  useEffect(() => {
    if (!mp_code || initialMember) return;
    setLoading(true);
    Promise.all([api.getMemberProfile(mp_code), api.getDashboard(mp_code).catch(()=>null)])
      .then(([profile, dash]) => { setMember(profile?.member || profile); setDashboard(dash); })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [mp_code]);

  useEffect(() => {
    if (!mp_code || activeTab === "overview" || tabData[activeTab] !== undefined) return;
    setTabLoading(true);
    const p = { mp_code, size: 50 };
    const fetchers = {
      questions:  () => api.getQuestions(p),
      debates:    () => api.getDebates(p),
      committees: () => api.getCommittees(p),
      assurances: () => api.getAssurances(p),
      mentions:   () => api.getSpecialMentions(p),
      tours:      () => api.getTours(p),
      gallery:    () => api.getGallery(p),
    };
    (fetchers[activeTab] || (() => Promise.resolve([])))()
      .then(res => setTabData(prev => ({ ...prev, [activeTab]: Array.isArray(res) ? res : res?.data || [] })))
      .catch(() => setTabData(prev => ({ ...prev, [activeTab]: [] })))
      .finally(() => setTabLoading(false));
  }, [activeTab, mp_code]);

  useEffect(() => {
    if (mp_code) {
      api.getPersonalDetails(mp_code).then(setPersonal).catch(() => setPersonal(null));
      api.getOtherDetails(mp_code).then(setOtherDetails).catch(() => setOtherDetails(null));
    }
  }, [mp_code]);

  // Always redirect to canonical slug URL
  useEffect(() => {
    if (member && slug && mp_code) {
      const canonical = memberSlug(mp_code, member.name, member.constituency);
      if (slug !== canonical) {
        router.replace(`/members/${canonical}`);
      }
    }
  }, [member, slug]);

  if (loading) return <div style={{ maxWidth:1200, margin:"48px auto", padding:"0 24px" }}><Spinner /></div>;
  if (error)   return <div style={{ maxWidth:1200, margin:"48px auto", padding:"0 24px" }}><ErrorBox message={error} /></div>;
  if (!member) return <div style={{ maxWidth:1200, margin:"48px auto", padding:"0 24px" }}><EmptyState icon="👤" title="Member not found" /></div>;

  const stats = dashboard ? [
    { label:"Questions",     value: dashboard.questions_count  || dashboard.total_questions  || "—" },
    { label:"Debates",       value: dashboard.debates_count    || dashboard.total_debates    || "—" },
    { label:"Attendance",    value: dashboard.attendance_percentage ? `${dashboard.attendance_percentage}%` : "—" },
    { label:"Private Bills", value: dashboard.bills_count || "—" },
  ] : [];

  return (
    <>
      <Head>
        <title>{F.name(member)} — MP from {F.constituency(member)} | Parliament of India</title>
        <meta name="description" content={`Profile of ${F.name(member)}, Member of Parliament from ${F.constituency(member)}, ${F.state(member)}. Party: ${F.party(member)}. View questions, debates, committees and more.`} />
        <meta property="og:title" content={`${F.name(member)} — MP from ${F.constituency(member)}`} />
        <meta property="og:description" content={`${F.name(member)} is a Member of Parliament from ${F.constituency(member)}, ${F.state(member)} representing ${F.party(member)}.`} />
      </Head>
      <div className="fade-in">
        <div style={{ maxWidth:1200, margin:"0 auto", padding:"32px 24px 0" }}>
          <Link href="/members" style={{ fontSize:13, color:"#e8651a", textDecoration:"none", display:"inline-flex", alignItems:"center", gap:6, marginBottom:24 }}>
            ← Back to Members
          </Link>

          {/* Profile Header */}
          <div className="card" style={{ padding:32, marginBottom:24 }}>
            <div style={{ display:"flex", gap:28, alignItems:"flex-start", flexWrap:"wrap" }}>
              <MemberAvatar member={member} size={100} style={{ borderRadius:16 }} />
              <div style={{ flex:1, minWidth:240 }}>
                <h1 style={{ fontSize:32, fontWeight:700, color:"#1a1a1a", marginBottom:6, fontFamily:"'Crimson Pro',serif" }}>{F.name(member)}</h1>
                <div style={{ display:"flex", gap:10, flexWrap:"wrap", marginBottom:12 }}>
                  <span style={{ fontSize:14, padding:"4px 14px", borderRadius:20, background:"#fff0e6", color:"#e8651a", fontWeight:600 }}>{F.party(member)}</span>
                  <span style={{ fontSize:13, padding:"4px 14px", borderRadius:20, background:"#f5f3f0", color:"#555" }}>📍 {F.constituency(member)}, {F.state(member)}</span>
                  <span style={{ fontSize:13, padding:"4px 14px", borderRadius:20, background: member.status==="Sitting"?"#dcfce7":"#f5f3f0", color: member.status==="Sitting"?"#16a34a":"#888", fontWeight:600 }}>
                    {member.status==="Sitting"?"✅ Sitting":"🕐 Former"}
                  </span>
                </div>
                <div style={{ display:"flex", gap:16, flexWrap:"wrap" }}>
                  {F.email(member) && <span style={{ fontSize:13, color:"#666" }}>✉️ {F.email(member)}</span>}
                  {F.phone(member) && <span style={{ fontSize:13, color:"#666" }}>📞 {F.phone(member)}</span>}
                  {F.profileLink(member) && <a href={F.profileLink(member)} target="_blank" rel="noreferrer" style={{ fontSize:13, color:"#e8651a", textDecoration:"none" }}>🔗 Official Profile</a>}
                </div>
              </div>
              {stats.length>0 && (
                <div style={{ display:"grid", gridTemplateColumns:"repeat(2, 1fr)", gap:12 }}>
                  {stats.map(s => (
                    <div key={s.label} className="stat-card" style={{ padding:"16px 20px", minWidth:100, textAlign:"center" }}>
                      <div style={{ fontSize:24, fontWeight:700, color:"#e8651a", fontFamily:"'Crimson Pro',serif" }}>{s.value}</div>
                      <div style={{ fontSize:11, color:"#888", marginTop:4 }}>{s.label}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Tabs */}
          <div className="tabs" style={{ overflowX:"auto" }}>
            {TABS.map(t => (
              <button key={t.id} onClick={() => setActiveTab(t.id)} className={`tab ${activeTab===t.id?"active":""}`}>
                {t.icon} {t.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div style={{ marginBottom:48 }}>
            {tabLoading && <Spinner />}
            {!tabLoading && activeTab==="overview"   && <OverviewTab member={member} personal={personal} otherDetails={otherDetails} />}
            {!tabLoading && activeTab==="questions"  && <QuestionsTab  data={tabData.questions  || []} />}
            {!tabLoading && activeTab==="debates"    && <DebatesTab    data={tabData.debates    || []} />}
            {!tabLoading && activeTab==="committees" && <CommitteesTab data={tabData.committees || []} />}
            {!tabLoading && activeTab==="assurances" && <AssurancesTab data={tabData.assurances || []} />}
            {!tabLoading && activeTab==="mentions"   && <MentionsTab   data={tabData.mentions   || []} />}
            {!tabLoading && activeTab==="tours"      && <ToursTab      data={tabData.tours      || []} />}
            {!tabLoading && activeTab==="gallery"    && <GalleryTab    data={tabData.gallery    || []} />}
          </div>
        </div>
      </div>
    </>
  );
}

function OverviewTab({ member, personal, otherDetails }) {
  return (
    <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(300px, 1fr))", gap:20 }}>
      <div className="card" style={{ padding:24 }}>
        <h3 style={{ fontSize:18, marginBottom:16, color:"#1a1a1a" }}>Political Info</h3>
        {[
          ["Party", member.party], ["Constituency", member.constituency], ["State", member.state],
          ["Status", member.status], ["Terms Served", member.terms], ["MP Code", member.mp_code],
        ].filter(([,v]) => v).map(([k,v]) => (
          <div key={k} style={{ display:"flex", justifyContent:"space-between", padding:"8px 0", borderBottom:"1px solid #f5f3f0", fontSize:14 }}>
            <span style={{ color:"#888" }}>{k}</span>
            <span style={{ fontWeight:600, color:"#1a1a1a", textAlign:"right", maxWidth:"60%" }}>{v}</span>
          </div>
        ))}
      </div>
      {personal && (
        <div className="card" style={{ padding:24 }}>
          <h3 style={{ fontSize:18, marginBottom:16, color:"#1a1a1a" }}>Personal Details</h3>
          {[
            ["Date of Birth", personal.dateBirth], ["Place of Birth", personal.placeBirth],
            ["Marital Status", personal.maritalStatus], ["Spouse", personal.spouseName],
            ["Father's Name", personal.fatherName], ["Mother's Name", personal.motherName],
            ["Sons", personal.no_of_sons ?? personal.noSons], ["Daughters", personal.no_of_daughters ?? personal.noDaughters],
            ["Permanent Address", personal.permanentAddress], ["Present Address", personal.presentAddress],
          ].filter(([,v]) => v !== null && v !== undefined && v !== "").map(([k,v]) => (
            <div key={k} style={{ padding:"8px 0", borderBottom:"1px solid #f5f3f0", fontSize:14 }}>
              <div style={{ color:"#888", marginBottom:2 }}>{k}</div>
              <div style={{ fontWeight:600, color:"#1a1a1a", lineHeight:1.4 }}>{String(v)}</div>
            </div>
          ))}
        </div>
      )}
      {personal && (
        <div className="card" style={{ padding:24 }}>
          <h3 style={{ fontSize:18, marginBottom:16, color:"#1a1a1a" }}>Education & Career</h3>
          {[
            ["Qualification", personal.qualification], ["Education Level", personal.education_level], ["Profession", personal.profession],
          ].filter(([,v]) => v).map(([k,v]) => (
            <div key={k} style={{ padding:"8px 0", borderBottom:"1px solid #f5f3f0", fontSize:14 }}>
              <div style={{ color:"#888", marginBottom:2 }}>{k}</div>
              <div style={{ fontWeight:600, color:"#1a1a1a", lineHeight:1.5 }}>{v}</div>
            </div>
          ))}
        </div>
      )}
      {otherDetails && (
        <div className="card" style={{ padding:24 }}>
          <h3 style={{ fontSize:18, marginBottom:16, color:"#1a1a1a" }}>Other Details</h3>
          {[
            ["Freedom Fighter", otherDetails.freedomFighter],
            ["Countries Visited", otherDetails.countriesVisited],
            ["Books Published", otherDetails.booksPublished],
            ["Sports Interests", otherDetails.sportsInterests],
            ["Social Activities", otherDetails.socialActivities],
            ["Other Information", otherDetails.otherInformation],
          ].filter(([,v]) => v && v !== "null" && v !== "N/A" && v !== "N").map(([k,v]) => (
            <div key={k} style={{ padding:"10px 0", borderBottom:"1px solid #f5f3f0", fontSize:14 }}>
              <div style={{ color:"#888", marginBottom:4 }}>{k}</div>
              <div style={{ fontWeight:600, color:"#1a1a1a", lineHeight:1.5 }}>{v}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function QuestionsTab({ data }) {
  if (!data.length) return <EmptyState icon="❓" title="No questions found" />;
  return (
    <div className="card" style={{ overflow:"hidden" }}>
      <table>
        <thead><tr><th>Q.No</th><th>Subject</th><th>Ministry</th><th>Type</th><th>Date</th><th>PDF</th></tr></thead>
        <tbody>
          {data.map(q => (
            <tr key={q.questionId}>
              <td style={{ color:"#e8651a", fontWeight:600 }}>{q.questionNo}</td>
              <td><div style={{ maxWidth:280, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", fontSize:13 }}>{q.subject}</div></td>
              <td style={{ fontSize:12, color:"#666" }}>{q.ministry}</td>
              <td><span style={{ fontSize:11, padding:"2px 8px", borderRadius:6, fontWeight:600, background:q.questionType==="STARRED"?"#fff0e6":"#f5f3f0", color:q.questionType==="STARRED"?"#e8651a":"#888" }}>{q.questionType}</span></td>
              <td style={{ fontSize:12, color:"#aaa" }}>{q.questionDate}</td>
              <td>{q.pdfUrl && <a href={q.pdfUrl} target="_blank" rel="noreferrer" style={{ fontSize:11, padding:"3px 8px", borderRadius:6, background:"#fff0e6", color:"#e8651a", textDecoration:"none", fontWeight:600 }}>📄</a>}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function DebatesTab({ data }) {
  if (!data.length) return <EmptyState icon="🗣" title="No debates found" />;
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
      {data.map(d => {
        let members = []; try { members = JSON.parse(d.member_names||"[]"); } catch {}
        return (
          <div key={d.debateId} className="card" style={{ padding:"14px 20px" }}>
            <div style={{ fontWeight:600, color:"#1a1a1a", fontSize:14, marginBottom:6, lineHeight:1.4 }}>{(d.debateSubject||d.title||"").trim()||"Debate"}</div>
            <div style={{ display:"flex", gap:10, flexWrap:"wrap", alignItems:"center", marginBottom:members.length?8:0 }}>
              {d.debate_type_desc && <span style={{ fontSize:11, padding:"2px 8px", borderRadius:6, background:"#fff0e6", color:"#e8651a", fontWeight:600 }}>{d.debate_type_desc}</span>}
              {d.loksabha && <span style={{ fontSize:11, padding:"2px 8px", borderRadius:6, background:"#e8f0fe", color:"#1a5ce8", fontWeight:600 }}>🏛 {d.loksabha}th Lok Sabha</span>}
              {d.debateDate && <span style={{ fontSize:12, color:"#aaa" }}>📅 {d.debateDate}</span>}
              {d.session && <span style={{ fontSize:11, color:"#aaa" }}>Session {d.session}</span>}
            </div>
            {members.length>0 && <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>{members.map((n,i)=><span key={i} style={{ fontSize:11, padding:"3px 10px", borderRadius:20, background:"#f5f3f0", color:"#555" }}>👤 {n}</span>)}</div>}
          </div>
        );
      })}
    </div>
  );
}

function CommitteesTab({ data }) {
  if (!data.length) return <EmptyState icon="🏛" title="No committees found" />;
  return (
    <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(280px, 1fr))", gap:12 }}>
      {data.map(c => (
        <div key={c.id} className="card" style={{ padding:"16px 20px" }}>
          <div style={{ display:"flex", gap:10 }}>
            <div style={{ width:36, height:36, borderRadius:8, background:"#fff0e6", display:"flex", alignItems:"center", justifyContent:"center", fontSize:16, flexShrink:0 }}>🏛</div>
            <div>
              <div style={{ fontWeight:600, color:"#1a1a1a", fontSize:14, marginBottom:4 }}>{c.committeeName}</div>
              {c.status && <div style={{ fontSize:12, color:"#e8651a", fontWeight:600, marginBottom:4 }}>{c.status}</div>}
              {c.date_from && <div style={{ fontSize:11, color:"#aaa" }}>📅 {c.date_from} → {c.date_to||"Present"}</div>}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function AssurancesTab({ data }) {
  if (!data.length) return <EmptyState icon="📜" title="No assurances found" />;
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
      {data.map(a => (
        <div key={a.id} className="card" style={{ padding:"16px 20px" }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:8 }}>
            <div style={{ fontWeight:600, color:"#1a1a1a", fontSize:14, lineHeight:1.4, flex:1 }}>{a.subject}</div>
            <span style={{ fontSize:11, padding:"3px 10px", borderRadius:20, fontWeight:600, marginLeft:12, flexShrink:0, background:a.status==="FULFILLED"?"#dcfce7":"#fef9c3", color:a.status==="FULFILLED"?"#16a34a":"#a16207" }}>{a.status}</span>
          </div>
          <div style={{ display:"flex", gap:10, flexWrap:"wrap" }}>
            {a.ministry && <span style={{ fontSize:12, color:"#555" }}>🏛 {a.ministry}</span>}
            {a.date && <span style={{ fontSize:12, color:"#aaa" }}>📅 {a.date}</span>}
          </div>
          {a.text_of_assurance && <div style={{ fontSize:13, color:"#666", lineHeight:1.6, marginTop:8 }}>{a.text_of_assurance.slice(0,200)}{a.text_of_assurance.length>200?"...":""}</div>}
        </div>
      ))}
    </div>
  );
}

function MentionsTab({ data }) {
  if (!data.length) return <EmptyState icon="⭐" title="No special mentions found" />;
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
      {data.map((item,i) => (
        <div key={item.id||i} className="card" style={{ padding:"14px 20px" }}>
          <div style={{ fontWeight:600, color:"#1a1a1a", fontSize:14, marginBottom:6 }}>{item.subject||item.title||item.debateSubject||"Special Mention"}</div>
          <div style={{ display:"flex", gap:10, flexWrap:"wrap" }}>
            {item.debate_type_desc && <span style={{ fontSize:11, padding:"2px 8px", borderRadius:6, background:"#fff0e6", color:"#e8651a", fontWeight:600 }}>{item.debate_type_desc}</span>}
            {(item.madeDate||item.debateDate) && <span style={{ fontSize:12, color:"#aaa" }}>📅 {item.madeDate||item.debateDate}</span>}
          </div>
        </div>
      ))}
    </div>
  );
}

function ToursTab({ data }) {
  if (!data.length) return <EmptyState icon="✈️" title="No tour records found" />;
  return (
    <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(280px, 1fr))", gap:12 }}>
      {data.map(t => (
        <div key={t.id} className="card" style={{ padding:"16px 20px" }}>
          <div style={{ display:"flex", gap:10 }}>
            <div style={{ width:36, height:36, borderRadius:8, background:"#e8f0fe", display:"flex", alignItems:"center", justifyContent:"center", fontSize:16, flexShrink:0 }}>✈️</div>
            <div>
              <div style={{ fontWeight:600, color:"#1a1a1a", fontSize:14, marginBottom:4 }}>{t.purpose||"Tour"}</div>
              {t.tour_place && <div style={{ fontSize:12, color:"#e8651a", fontWeight:600, marginBottom:4 }}>📍 {t.tour_place}</div>}
              {t.tour_date && <div style={{ fontSize:11, color:"#aaa" }}>📅 {t.tour_date}</div>}
              {t.description && <div style={{ fontSize:12, color:"#666", marginTop:6 }}>{t.description}</div>}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function GalleryTab({ data }) {
  if (!data.length) return <EmptyState icon="🎬" title="No gallery videos" />;
  return (
    <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(300px, 1fr))", gap:16 }}>
      {data.map((item,i) => (
        <div key={i} className="card" style={{ overflow:"hidden" }}>
          {item.videoUrl ? (
            <video controls style={{ width:"100%", height:180, objectFit:"cover", background:"#1a1a1a" }}>
              <source src={item.videoUrl} type="video/mp4" />
            </video>
          ) : (
            <div style={{ width:"100%", height:180, background:"#1a1a1a", display:"flex", alignItems:"center", justifyContent:"center", fontSize:40 }}>🎬</div>
          )}
          <div style={{ padding:"12px 16px" }}>
            {item.subject_title && <div style={{ fontSize:13, fontWeight:600, color:"#1a1a1a", marginBottom:6 }}>{item.subject_title}</div>}
            <div style={{ display:"flex", gap:10, flexWrap:"wrap", alignItems:"center" }}>
              {item.debateType && <span style={{ fontSize:11, padding:"2px 8px", borderRadius:6, background:"#fff0e6", color:"#e8651a", fontWeight:600 }}>{item.debateType}</span>}
              {item.eventDate && <span style={{ fontSize:11, color:"#aaa" }}>📅 {item.eventDate}</span>}
              {item.sizeOfVideo && <span style={{ fontSize:11, color:"#aaa" }}>💾 {item.sizeOfVideo}</span>}
            </div>
            {item.videoUrl && (
              <a href={item.videoUrl} target="_blank" rel="noreferrer"
                style={{ display:"inline-flex", alignItems:"center", gap:5, marginTop:8, padding:"6px 12px", borderRadius:8, background:"#fff0e6", color:"#e8651a", fontSize:12, fontWeight:600, textDecoration:"none" }}>
                ▶ Open Video
              </a>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

export async function getServerSideProps({ params }) {
  const mp_code = extractMpCode(params.slug);
  if (!mp_code) return { notFound: true };
  try {
    const [profileRes, dashRes] = await Promise.all([
      fetch(`https://davechaitanya-loksabha-api.hf.space/api/member-profile/${mp_code}`),
      fetch(`https://davechaitanya-loksabha-api.hf.space/api/dashboard/${mp_code}`),
    ]);
    const profile = await profileRes.json();
    const dash = dashRes.ok ? await dashRes.json() : null;
    if (!profile?.member) return { notFound: true };

    // Server-side canonical redirect
    const canonical = memberSlug(mp_code, profile.member.name, profile.member.constituency);
    if (params.slug !== canonical) {
      return {
        redirect: {
          destination: `/members/${canonical}`,
          permanent: true, // 301 redirect — best for SEO
        }
      };
    }

    return { props: { member: profile.member, dashboard: dash } };
  } catch {
    return { notFound: true };
  }
}