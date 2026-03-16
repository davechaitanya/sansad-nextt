const BASE = "https://davechaitanya-loksabha-api.hf.space";

async function get(path, params = {}) {
  const url = new URL(BASE + path);
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== "" && v !== null) {
      url.searchParams.set(k, v);
    }
  });
  const res = await fetch(url.toString());
  if (!res.ok) throw new Error(`API error ${res.status}`);
  return res.json();
}

export const api = {
  // ── MEMBERS ──────────────────────────────────────────────────────
  // GET /api/members → { total, page, size, pages, data: [...] }
  // Params: page, size, search, party, state, status
  getMembers: (params = {}) => get("/api/members", params),

  // GET /api/members/{mp_code}
  getMember: (mp_code) => get(`/api/members/${mp_code}`),

  // GET /api/member-profile/{mp_code} → combined profile
  getMemberProfile: (mp_code) => get(`/api/member-profile/${mp_code}`),

  // ── MEMBER DETAILS ───────────────────────────────────────────────
  // GET /api/personal-details/{mp_code}
  getPersonalDetails: (mp_code) => get(`/api/personal-details/${mp_code}`),

  // GET /api/other-details/{mp_code}
  getOtherDetails: (mp_code) => get(`/api/other-details/${mp_code}`),

  // GET /api/dashboard/{mp_code} → { questions_count, debates_count, attendance_pct, ... }
  getDashboard: (mp_code) => get(`/api/dashboard/${mp_code}`),

  // ── BILLS ────────────────────────────────────────────────────────
  getGovernmentBills: (params = {}) => get("/api/bills/government", params),
  getPrivateBills: (params = {}) => get("/api/bills/private", params),

  // ── PARLIAMENTARY ACTIVITIES ─────────────────────────────────────
  // All support: page, size, search, mp_code
  getQuestions:      (params = {}) => get("/api/questions", params),
  getDebates:        (params = {}) => get("/api/debates", params),
  getCommittees:     (params = {}) => get("/api/committees", params),
  getAssurances:     (params = {}) => get("/api/assurances", params),
  getAttendance:     (params = {}) => get("/api/attendance", params),
  getSpecialMentions:(params = {}) => get("/api/special-mentions", params),
  getTours:          (params = {}) => get("/api/tours", params),
  getGallery:        (params = {}) => get("/api/gallery", params),

  // ── NEW DATA ─────────────────────────────────────────────────────
  getNewSummary:       () => get("/api/new-data/summary"),
  getNewQuestions:     (params = {}) => get("/api/questions/new", params),
  getNewDebates:       (params = {}) => get("/api/debates/new", params),
  getNewMentions:      (params = {}) => get("/api/special-mentions/new", params),
  getMemberNewActivities: (mp_code) => get(`/api/members/${mp_code}/new-activities`),
  getScrapeTracker:    () => get("/api/scrape-tracker"),

  // ── HEALTH ───────────────────────────────────────────────────────
  getHealth: () => get("/health"),
};

// ── IMAGE URL BUILDER ────────────────────────────────────────────
// Uses your backend proxy to avoid CORS issues with sansad.in
// Primary:  /api/members/{mp_code}/image
// Fallback: /api/image-proxy?url={original_url}

export function getMemberImageUrl(mp_code, original_url = null) {
  if (!mp_code) return null;
  // Always use the clean proxy endpoint first
  return `${BASE}/api/members/${mp_code}/image`;
}

export function getProxiedImageUrl(original_url) {
  if (!original_url) return null;
  return `${BASE}/api/image-proxy?url=${encodeURIComponent(original_url)}`;
}

// ── FIELD HELPERS (confirmed from API response) ──────────────────
export const F = {
  name:         (m) => m?.name || "Unknown MP",
  party:        (m) => m?.party || "—",
  constituency: (m) => m?.constituency || "—",
  state:        (m) => m?.state || "—",
  status:       (m) => m?.status || "—",       // "Sitting" | "Former"
  image:        (m) => getProxiedImageUrl(m?.image_url),
  imageFallback:(m) => getProxiedImageUrl(m?.image_url),
  id:           (m) => m?.mp_code || m?.id,
  terms:        (m) => m?.terms || "—",
  email:        (m) => m?.email || null,
  phone:        (m) => m?.phone || null,
  profileLink:  (m) => m?.profile_link || null,
};

// ── PAGINATION HELPERS ───────────────────────────────────────────
export const P = {
  list:  (res) => (Array.isArray(res) ? res : res?.data || []),
  total: (res) => res?.total || 0,
  pages: (res) => res?.pages || 1,
  page:  (res) => res?.page || 1,
};

export default api;