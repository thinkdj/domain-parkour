/**
 * The only boundary between stored page configuration and HTML.
 *
 * Config is intentionally plain data. It may have come from an older worker,
 * a hand-written D1 row, or a current admin request, so rendering never
 * assumes that it was previously validated.
 */

export const SUPPORTED_MODES = new Set(["parking", "coming-soon", "landing", "profile"]);
export const SOCIAL_PLATFORMS = new Set([
  "twitter",
  "x",
  "facebook",
  "instagram",
  "linkedin",
  "github",
  "email",
]);

const MAX_URL_LENGTH = 2_048;
const MAX_HOSTNAME_LENGTH = 253;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MANAGED_AVATAR_RE = /^\/_assets\/[A-Za-z0-9._/-]+$/;
const MANAGED_AVATAR_KEY_RE = /^profiles\/[A-Za-z0-9._/-]+$/;

const TEXT_LIMITS = {
  domainTitle: 120,
  title: 180,
  subtitle: 280,
  description: 2_000,
  footerText: 500,
  statusLabel: 80,
  eyebrowText: 120,
  pageTitleSuffix: 100,
  salePrice: 80,
  domainAgeYears: 32,
  domainExtension: 32,
  domainRegistration: 160,
  priceLabel: 80,
  inquiryLabel: 80,
  noPriceTitle: 180,
  contactCopy: 1_000,
  availabilityCopy: 1_000,
  contactButtonText: 120,
  domainAgeLabel: 80,
  extensionLabel: 80,
  trustValue: 80,
  trustLabel: 80,
  tagline: 280,
  launchLabel: 80,
  daysLabel: 40,
  hoursLabel: 40,
  minutesLabel: 40,
  secondsLabel: 40,
  countdownNote: 1_000,
  launchedText: 200,
  statusPanelLabel: 80,
  statusPanelTitle: 180,
  statusPanelText: 1_000,
  linksLabel: 80,
  name: 120,
  role: 160,
  bio: 2_000,
};

export class ConfigValidationError extends Error {
  constructor(message) {
    super(message);
    this.name = "ConfigValidationError";
  }
}

function isPlainObject(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}

function hasControlCharacters(value) {
  return /[\u0000-\u001F\u007F]/.test(value);
}

function fail(strict, message) {
  if (strict) throw new ConfigValidationError(message);
  return null;
}

function stringValue(value, field, limit, strict) {
  if (value === undefined || value === null || value === "") return undefined;
  if (typeof value !== "string") return fail(strict, `${field} must be text`);
  const text = value.trim();
  if (!text) return undefined;
  if (text.length > limit) {
    if (strict) throw new ConfigValidationError(`${field} must be ${limit} characters or fewer`);
    return text.slice(0, limit);
  }
  return text;
}

/** Escape a value for either HTML text or a quoted HTML attribute. */
export function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/** Safely embed JSON inside an inline script without allowing </script>. */
export function serializeForScript(value) {
  let serialized;
  try {
    serialized = JSON.stringify(value);
  } catch {
    serialized = "null";
  }
  return (serialized || "null").replace(/[<>&\u2028\u2029]/g, (character) => {
    const escapes = {
      "<": "\\u003c",
      ">": "\\u003e",
      "&": "\\u0026",
      "\u2028": "\\u2028",
      "\u2029": "\\u2029",
    };
    return escapes[character];
  });
}

export function normalizeMode(value) {
  return typeof value === "string" && SUPPORTED_MODES.has(value) ? value : null;
}

export function assertMode(value) {
  const mode = normalizeMode(value);
  if (!mode) throw new ConfigValidationError("Invalid mode");
  return mode;
}

/** Normalize an exact hostname accepted by the self-hosted admin API. */
export function normalizeHostname(value, { allowDefault = true } = {}) {
  if (typeof value !== "string") throw new ConfigValidationError("Hostname is required");
  const hostname = value.trim().toLowerCase().replace(/\.$/, "");
  if (allowDefault && hostname === "_default") return hostname;
  if (!hostname || hostname.length > MAX_HOSTNAME_LENGTH || hasControlCharacters(hostname)) {
    throw new ConfigValidationError("Invalid hostname");
  }
  if (/^\d{1,3}(?:\.\d{1,3}){3}$/.test(hostname)) {
    if (hostname.split(".").every((part) => Number(part) <= 255)) return hostname;
    throw new ConfigValidationError("Invalid hostname");
  }
  const labels = hostname.split(".");
  if (labels.some((label) => !/^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/.test(label))) {
    throw new ConfigValidationError("Invalid hostname");
  }
  return hostname;
}

export function normalizeEmail(value, { strict = false, field = "contactEmail" } = {}) {
  if (value === undefined || value === null || value === "") return undefined;
  if (typeof value !== "string") return fail(strict, `${field} must be an email address`);
  const email = value.trim().toLowerCase();
  if (email.length > 254 || !EMAIL_RE.test(email) || hasControlCharacters(email)) {
    return fail(strict, `${field} must be a valid email address`);
  }
  return email;
}

function normalizeHttpsUrl(value, { strict = false, field = "url" } = {}) {
  if (value === undefined || value === null || value === "") return undefined;
  if (typeof value !== "string") return fail(strict, `${field} must be a URL`);
  const input = value.trim();
  if (!input || input.length > MAX_URL_LENGTH || hasControlCharacters(input)) {
    return fail(strict, `${field} must be a safe HTTPS URL`);
  }
  try {
    const parsed = new URL(input);
    if (parsed.protocol !== "https:" || !parsed.hostname || parsed.username || parsed.password) {
      return fail(strict, `${field} must be a safe HTTPS URL`);
    }
    return parsed.href;
  } catch {
    return fail(strict, `${field} must be a safe HTTPS URL`);
  }
}

/** Safe href for a general visitor link: HTTPS or a simple email link. */
export function safeLinkUrl(value, { strict = false, field = "url" } = {}) {
  if (typeof value !== "string") return fail(strict, `${field} must be a URL`);
  const input = value.trim();
  if (input.toLowerCase().startsWith("mailto:")) {
    const email = normalizeEmail(input.slice(7), { strict, field });
    return email ? `mailto:${email}` : undefined;
  }
  // Accepting a raw address is safe and makes the email social field forgiving.
  if (EMAIL_RE.test(input)) {
    const email = normalizeEmail(input, { strict, field });
    return email ? `mailto:${email}` : undefined;
  }
  return normalizeHttpsUrl(input, { strict, field });
}

function safeEmailHref(value, strict) {
  if (typeof value !== "string") return fail(strict, "socialLinks.email must be an email address");
  const input = value.trim();
  const email = input.toLowerCase().startsWith("mailto:")
    ? normalizeEmail(input.slice(7), { strict, field: "socialLinks.email" })
    : normalizeEmail(input, { strict, field: "socialLinks.email" });
  return email ? `mailto:${email}` : undefined;
}

/** Safe href for a social network: email is mailto; all other platforms are HTTPS. */
export function safeSocialUrl(platform, value, { strict = false } = {}) {
  if (platform === "email") return safeEmailHref(value, strict);
  return normalizeHttpsUrl(value, { strict, field: `socialLinks.${platform}` });
}

/** Safe source for a profile image: a managed asset path or an HTTPS image URL. */
export function safeAvatarUrl(value, { strict = false } = {}) {
  if (value === undefined || value === null || value === "") return undefined;
  if (typeof value !== "string") return fail(strict, "avatarUrl must be a safe image URL");
  const input = value.trim();
  if (MANAGED_AVATAR_RE.test(input) && !input.includes("..") && !input.includes("//")) return input;
  return normalizeHttpsUrl(input, { strict, field: "avatarUrl" });
}

export function safeAccentColor(value) {
  if (typeof value !== "string") return undefined;
  const color = value.trim();
  return /^#[0-9a-fA-F]{3}(?:[0-9a-fA-F]{3})?$/.test(color) ? color.toLowerCase() : undefined;
}

function normalizeArray(value, field, strict, itemNormalizer, maxItems) {
  if (value === undefined || value === null) return undefined;
  if (!Array.isArray(value)) return fail(strict, `${field} must be an array`);
  if (value.length > maxItems) {
    if (strict) throw new ConfigValidationError(`${field} can contain at most ${maxItems} items`);
    value = value.slice(0, maxItems);
  }
  const items = [];
  for (const [index, item] of value.entries()) {
    try {
      const normalized = itemNormalizer(item, index);
      if (normalized) items.push(normalized);
    } catch (error) {
      if (strict) throw error;
    }
  }
  return items;
}

function normalizeFeature(value, index, strict) {
  if (typeof value === "string" && !strict) {
    const title = stringValue(value, `features[${index}].title`, 160, false);
    return title ? { title } : null;
  }
  if (!isPlainObject(value)) return fail(strict, `features[${index}] must be an object`);
  if (strict && Object.keys(value).some((key) => key !== "title" && key !== "description")) {
    throw new ConfigValidationError(`features[${index}] contains an unsupported field`);
  }
  const title = stringValue(value.title, `features[${index}].title`, 160, strict);
  const description = stringValue(value.description, `features[${index}].description`, 800, strict);
  if (!title) return fail(strict, `features[${index}].title is required`);
  return description ? { title, description } : { title };
}

function normalizeLink(value, index, strict) {
  if (!isPlainObject(value)) return fail(strict, `links[${index}] must be an object`);
  if (strict && Object.keys(value).some((key) => key !== "title" && key !== "url")) {
    throw new ConfigValidationError(`links[${index}] contains an unsupported field`);
  }
  const title = stringValue(value.title, `links[${index}].title`, 160, strict);
  const url = safeLinkUrl(value.url, { strict, field: `links[${index}].url` });
  if (!title || !url) return fail(strict, `links[${index}] needs a title and safe URL`);
  return { title, url };
}

function normalizeSocialLinks(value, strict) {
  if (value === undefined || value === null) return undefined;
  if (!isPlainObject(value)) return fail(strict, "socialLinks must be an object");
  const links = {};
  for (const [platform, url] of Object.entries(value)) {
    if (!SOCIAL_PLATFORMS.has(platform)) {
      if (strict) throw new ConfigValidationError(`Unsupported social platform: ${platform}`);
      continue;
    }
    const normalized = safeSocialUrl(platform, url, { strict });
    if (normalized) links[platform] = normalized;
  }
  return links;
}

function normalizeLaunchDate(value, strict) {
  const date = stringValue(value, "launchDate", 64, strict);
  if (!date) return undefined;
  if (Number.isNaN(new Date(date).getTime())) return fail(strict, "launchDate must be a valid date/time");
  return date;
}

function normalizeAvatarObjectKey(value, avatarUrl, strict) {
  if (value === undefined || value === null || value === "") return undefined;
  if (typeof value !== "string" || !MANAGED_AVATAR_KEY_RE.test(value) || value.includes("..")) {
    return fail(strict, "avatarObjectKey is invalid");
  }
  if (avatarUrl !== `/_assets/${value}`) {
    return fail(strict, "avatarObjectKey must match avatarUrl");
  }
  return value;
}

/**
 * Validate a new admin payload strictly, or repair an old/untrusted stored
 * config when strict is false. In either case unknown fields never reach a
 * renderer.
 */
export function normalizeConfig(raw, { mode, strict = false } = {}) {
  if (!isPlainObject(raw)) {
    if (strict) throw new ConfigValidationError("config must be an object");
    raw = {};
  }
  const resolvedMode = normalizeMode(mode || raw.mode) || "landing";
  if (strict && mode && raw.mode !== undefined && raw.mode !== mode) {
    throw new ConfigValidationError("config.mode must match mode");
  }

  const allowedFields = new Set([
    "mode",
    ...Object.keys(TEXT_LIMITS),
    "contactEmail",
    "registrationDate",
    "launchDate",
    "accentColor",
    "showCredit",
    "features",
    "links",
    "socialLinks",
    "avatarUrl",
    "avatarObjectKey",
  ]);
  if (strict) {
    for (const key of Object.keys(raw)) {
      if (!allowedFields.has(key)) throw new ConfigValidationError(`Unsupported config field: ${key}`);
    }
  }

  const config = {};
  for (const [field, limit] of Object.entries(TEXT_LIMITS)) {
    const text = stringValue(raw[field], field, limit, strict);
    if (text !== undefined) config[field] = text;
  }

  const contactEmail = normalizeEmail(raw.contactEmail, { strict });
  if (contactEmail) config.contactEmail = contactEmail;

  const registrationDate = stringValue(raw.registrationDate, "registrationDate", 64, strict);
  if (registrationDate) {
    if (Number.isNaN(new Date(registrationDate).getTime())) {
      fail(strict, "registrationDate must be a valid date/time");
    } else {
      config.registrationDate = registrationDate;
    }
  }

  const launchDate = normalizeLaunchDate(raw.launchDate, strict);
  if (launchDate) config.launchDate = launchDate;

  if (raw.accentColor !== undefined && raw.accentColor !== null && raw.accentColor !== "") {
    const accentColor = safeAccentColor(raw.accentColor);
    if (!accentColor) fail(strict, "accentColor must be a 3- or 6-digit hex color");
    else config.accentColor = accentColor;
  }

  if (raw.showCredit !== undefined) {
    if (typeof raw.showCredit !== "boolean") fail(strict, "showCredit must be true or false");
    else config.showCredit = raw.showCredit;
  }

  const features = normalizeArray(raw.features, "features", strict, (item, index) =>
    normalizeFeature(item, index, strict), 12);
  if (features !== undefined) config.features = features;

  const links = normalizeArray(raw.links, "links", strict, (item, index) =>
    normalizeLink(item, index, strict), 24);
  if (links !== undefined) config.links = links;

  const socialLinks = normalizeSocialLinks(raw.socialLinks, strict);
  if (socialLinks !== undefined) config.socialLinks = socialLinks;

  const avatarUrl = safeAvatarUrl(raw.avatarUrl, { strict });
  if (avatarUrl) config.avatarUrl = avatarUrl;
  const avatarObjectKey = normalizeAvatarObjectKey(raw.avatarObjectKey, avatarUrl, strict);
  if (avatarObjectKey) config.avatarObjectKey = avatarObjectKey;

  return { mode: resolvedMode, config };
}

export function validateConfig(raw, mode) {
  return normalizeConfig(raw, { mode: assertMode(mode), strict: true }).config;
}

export function sanitizeStoredConfig(raw, mode) {
  return normalizeConfig(raw, { mode, strict: false });
}
