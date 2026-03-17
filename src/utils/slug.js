/**
 * Converts text to URL-friendly slug
 * "Narendra Modi" → "narendra-modi"
 */
export function slugify(text) {
  if (!text) return "";
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")  // remove special chars
    .trim()
    .replace(/\s+/g, "-")           // spaces to hyphens
    .replace(/-+/g, "-")            // multiple hyphens to one
    .slice(0, 50);                  // max 50 chars
}

/**
 * Builds SEO-friendly member URL slug
 * mp_code=5638, name="Narendra Modi", constituency="Varanasi"
 * → "5638-narendra-modi-varanasi"
 */
export function memberSlug(mp_code, name, constituency) {
  const namePart = slugify(name || "");
  const constPart = slugify(constituency || "");
  const parts = [mp_code, namePart, constPart].filter(Boolean);
  return parts.join("-");
}

/**
 * Extracts mp_code from slug
 * "5638-narendra-modi-varanasi" → "5638"
 */
export function extractMpCode(slug) {
  if (!slug) return null;
  const match = String(slug).match(/^(\d+)/);
  return match ? match[1] : null;
}