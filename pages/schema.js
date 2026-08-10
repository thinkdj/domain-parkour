/**
 * The one config vocabulary both apps speak.
 *
 * Canonical keys are snake_case, because that is what cloud's live
 * `published_sites.config_json` rows already contain — switching to OSS's
 * camelCase would have needed a data migration for zero benefit. The alias table
 * absorbs the OSS spelling and cloud's older key names instead, so every stored
 * row and every demo preset keeps rendering.
 *
 * `normalize` is total and repairs; `validate` is strict and throws. The editor
 * calls validate on input; the runtime calls normalize on whatever it reads.
 */

import {
  bool, isPlainObject, object, plainText, safeAccentColor, safeEmail, safeHostname, safeHttpsUrl,
  safeImageUrl, safeLinkUrl, safeSocialUrl, SOCIAL_PLATFORMS,
} from './safety.js';
import { OVERRIDABLE } from './defaults.js';

export const MODES = ['parking', 'coming_soon', 'landing', 'profile', 'redirect', 'maintenance'];
export const DEFAULT_MODE = 'parking';
export const SCHEMA_VERSION = 2;

/** Text fields and their caps. The cap is the validation — there is no free-length field. */
const TEXT = {
  domain_title: 120,
  eyebrow: 120,
  status_label: 80,
  headline: 180,
  subhead: 300,
  body: 2000,
  note: 500,
  price: 80,
  launch_date: 64,
  launch_note: 500,
  links_label: 80,
  name: 120,
  role: 160,
  bio: 2000,
  footer_text: 500,
  registration_date: 64,
};

/**
 * Legacy key -> canonical path. Both dialects land in the same shape.
 * The OSS label fields that survived fold into one `labels` object; the ones that
 * did not (countdown cells, stat labels) belonged to features that are gone.
 */
const ALIASES = {
  domainTitle: 'domain_title',
  eyebrowText: 'eyebrow',
  statusLabel: 'status_label',
  tagline: 'headline',
  title: 'headline',
  sub: 'subhead',
  subtitle: 'subhead',
  description: 'body',
  salePrice: 'price',
  contactEmail: 'contact_email',
  registrationDate: 'registration_date',
  launchDate: 'launch_date',
  countdownNote: 'launch_note',
  footerText: 'footer_text',
  showCredit: 'footer_credit',
  accentColor: 'theme.accent',
  socialLinks: 'socials',
  avatarUrl: 'avatar_url',
  linksLabel: 'links_label',
  statusPanelLabel: 'status_panel.label',
  statusPanelTitle: 'status_panel.title',
  statusPanelText: 'status_panel.text',
  notify: 'capture.waitlist',
  priceLabel: 'labels.priceLabel',
  inquiryLabel: 'labels.inquiryLabel',
  noPriceTitle: 'labels.noPriceTitle',
  contactCopy: 'labels.contactCopy',
  availabilityCopy: 'labels.availabilityCopy',
  contactButtonText: 'labels.offerButton',
  launchLabel: 'labels.launchLabel',
  pageTitleSuffix: 'labels.pageTitleSuffix',
  domainRegistration: 'note',
};

/**
 * Fields the countdown took with it. They are dropped without complaint rather
 * than rejected: an old stored row, or an admin form still offering the control,
 * must not fail to save over copy for a feature that no longer renders.
 */
const RETIRED = new Set(['daysLabel', 'hoursLabel', 'minutesLabel', 'secondsLabel', 'launchedText']);

/**
 * The parking stats row used to be six flat fields. It is a bounded list now, so
 * the pairs fold into entries — value first, because a label with nothing to
 * label is not a stat.
 */
const STAT_PAIRS = [
  ['domainAgeYears', 'domainAgeLabel', 'Domain age'],
  ['domainExtension', 'extensionLabel', 'Extension'],
  ['trustValue', 'trustLabel', ''],
];

/** Everything a config may contain, after aliases have been folded in. */
const KNOWN_FIELDS = new Set([
  'mode', ...Object.keys(TEXT),
  'contact_email', 'checkout_url', 'destination_url', 'avatar_url',
  'theme', 'seo', 'brand', 'labels', 'status_panel', 'capture', 'delivery', 'analytics',
  'stats', 'features', 'links', 'socials', 'footer_credit',
]);

const INDEXING = ['default', 'index', 'noindex'];
const REDIRECT_CODES = [301, 302, 307, 308];
const MAX_STATS = 4;
const MAX_FEATURES = 12;
const MAX_LINKS = 24;

export class ConfigError extends Error {
  constructor(message) {
    super(message);
    this.name = 'ConfigError';
  }
}

export function normalizeMode(value) {
  const mode = String(value || '').trim().toLowerCase().replace(/-/g, '_');
  return MODES.includes(mode) ? mode : '';
}

function setPath(target, path, value) {
  const parts = path.split('.');
  let node = target;
  while (parts.length > 1) {
    const key = parts.shift();
    // isPlainObject, not object(): object() returns a fresh {} for a non-object,
    // which is always truthy, so the guard would never fire and node would walk
    // off into undefined.
    if (!isPlainObject(node[key])) node[key] = {};
    node = node[key];
  }
  if (node[parts[0]] === undefined) node[parts[0]] = value;
}

/** Fold legacy keys into canonical ones. A canonical key already present wins. */
function applyAliases(raw) {
  const merged = { ...object(raw) };

  for (const key of RETIRED) delete merged[key];

  // Stat pairs before the flat aliases, so the six fields are gone by the time
  // unknown-field checking runs.
  const folded = [];
  for (const [valueKey, labelKey, fallbackLabel] of STAT_PAIRS) {
    const value = plainText(merged[valueKey], 80);
    const label = plainText(merged[labelKey], 80) || fallbackLabel;
    delete merged[valueKey];
    delete merged[labelKey];
    if (value) folded.push({ value, label });
  }
  if (folded.length && !Array.isArray(merged.stats)) merged.stats = folded;

  for (const [legacy, path] of Object.entries(ALIASES)) {
    if (merged[legacy] === undefined) continue;
    const value = merged[legacy];
    delete merged[legacy];
    setPath(merged, path, value);
  }
  // `noindex: true` predates the seo group.
  if (merged.noindex !== undefined) {
    const noindex = merged.noindex === true;
    delete merged.noindex;
    if (noindex) setPath(merged, 'seo.indexing', 'noindex');
  }
  return merged;
}

function fail(strict, message) {
  if (strict) throw new ConfigError(message);
  return undefined;
}

function textField(raw, field, strict) {
  const limit = TEXT[field];
  const value = raw[field];
  if (value === undefined || value === null || value === '') return '';
  if (strict && typeof value !== 'string') return fail(strict, `${field} must be text`) ?? '';
  if (strict && String(value).trim().length > limit) {
    throw new ConfigError(`${field} must be ${limit} characters or fewer`);
  }
  return plainText(value, limit);
}

function isoDate(value, field, strict) {
  if (!value) return '';
  if (Number.isNaN(new Date(value).getTime())) return fail(strict, `${field} must be a valid date`) ?? '';
  return value;
}

function assertItemKeys(field, index, item, allowed, strict) {
  if (!strict || !isPlainObject(item)) return;
  for (const key of Object.keys(item)) {
    if (!allowed.includes(key)) throw new ConfigError(`${field}[${index}] contains an unsupported field: ${key}`);
  }
}

function boundedList(raw, field, max, strict, itemFn) {
  const value = raw[field];
  if (value === undefined || value === null) return [];
  if (!Array.isArray(value)) return fail(strict, `${field} must be an array`) ?? [];
  if (strict && value.length > max) throw new ConfigError(`${field} can contain at most ${max} items`);
  const items = [];
  for (const [index, item] of value.slice(0, max).entries()) {
    const normalized = itemFn(item, index);
    if (normalized) items.push(normalized);
    else if (strict) throw new ConfigError(`${field}[${index}] is incomplete`);
  }
  return items;
}

function normalizeSocials(value, strict) {
  const source = object(value);
  const socials = {};
  for (const [platform, url] of Object.entries(source)) {
    const key = platform.toLowerCase();
    if (!SOCIAL_PLATFORMS.has(key)) {
      if (strict) throw new ConfigError(`Unsupported social platform: ${platform}`);
      continue;
    }
    const safe = safeSocialUrl(key, url);
    if (safe) socials[key] = safe;
    else if (strict) {
      throw new ConfigError(key === 'email'
        ? 'socials.email must be an email address'
        : `socials.${key} must be a safe HTTPS URL`);
    }
  }
  return socials;
}

function normalizeSeo(raw, strict) {
  const seo = object(raw.seo);
  const indexing = INDEXING.includes(seo.indexing) ? seo.indexing : 'default';
  if (strict && seo.indexing !== undefined && !INDEXING.includes(seo.indexing)) {
    throw new ConfigError(`seo.indexing must be one of ${INDEXING.join(', ')}`);
  }
  return {
    title: plainText(seo.title, 70),
    description: plainText(seo.description, 200),
    indexing,
    og_image_url: safeImageUrl(seo.og_image_url),
    og_image_alt: plainText(seo.og_image_alt, 200),
  };
}

function normalizeDelivery(raw, strict) {
  const delivery = object(raw.delivery);
  const redirect = object(delivery.redirect);
  const maintenance = object(delivery.maintenance);
  const code = Number(redirect.status_code);
  const showUi = redirect.show_ui;
  const countdown = Number(redirect.countdown_seconds);
  if (strict && redirect.status_code !== undefined && !REDIRECT_CODES.includes(code)) {
    throw new ConfigError(`delivery.redirect.status_code must be one of ${REDIRECT_CODES.join(', ')}`);
  }
  if (strict && showUi !== undefined && typeof showUi !== 'boolean') {
    throw new ConfigError('delivery.redirect.show_ui must be a boolean');
  }
  if (strict && redirect.countdown_seconds !== undefined
      && (!Number.isInteger(countdown) || countdown < 1 || countdown > 60)) {
    throw new ConfigError('delivery.redirect.countdown_seconds must be between 1 and 60');
  }
  const retry = Number(maintenance.retry_after_seconds);
  return {
    redirect: {
      target_url: safeHttpsUrl(redirect.target_url),
      status_code: REDIRECT_CODES.includes(code) ? code : 302,
      preserve_path: bool(redirect.preserve_path),
      preserve_query: bool(redirect.preserve_query),
      show_ui: bool(showUi),
      countdown_seconds: Number.isInteger(countdown) && countdown >= 1 && countdown <= 60 ? countdown : 5,
    },
    maintenance: {
      // 60s–7d. Below a minute it is noise; above a week no client will honour it.
      retry_after_seconds: Number.isInteger(retry) && retry >= 60 && retry <= 604800 ? retry : 0,
      help_url: safeHttpsUrl(maintenance.help_url),
    },
  };
}

/**
 * @param {unknown} raw
 * @param {{ mode?: string, strict?: boolean }} [options]
 * @returns {{ mode: string, config: object }}
 */
export function normalize(raw, { mode, strict = false } = {}) {
  if (!object(raw) && raw !== undefined && raw !== null && strict) {
    throw new ConfigError('config must be an object');
  }
  const source = applyAliases(raw);
  const resolvedMode = normalizeMode(mode || source.mode) || (strict ? '' : DEFAULT_MODE);
  if (strict && !resolvedMode) throw new ConfigError('mode is required');
  if (strict && mode && source.mode !== undefined && normalizeMode(source.mode) !== resolvedMode) {
    throw new ConfigError('config.mode must match mode');
  }

  // Strict callers are editors: a field they sent that we do not understand is a
  // typo or a stale client, and silently dropping it loses what someone typed.
  // The lenient path keeps ignoring them, because a stored row may predate a
  // field being removed and must still render.
  if (strict) {
    for (const key of Object.keys(source)) {
      if (!KNOWN_FIELDS.has(key)) throw new ConfigError(`Unsupported config field: ${key}`);
    }
  }

  const config = {};
  for (const field of Object.keys(TEXT)) {
    const text = textField(source, field, strict);
    if (text) config[field] = text;
  }
  if (config.launch_date) config.launch_date = isoDate(config.launch_date, 'launch_date', strict) || '';
  if (config.registration_date) {
    config.registration_date = isoDate(config.registration_date, 'registration_date', strict) || '';
  }

  const email = source.contact_email === undefined ? '' : safeEmail(source.contact_email);
  if (email) config.contact_email = email;
  else if (strict && source.contact_email) throw new ConfigError('contact_email must be a valid email address');

  for (const [field, coerce] of [
    ['checkout_url', safeHttpsUrl], ['destination_url', safeHttpsUrl], ['avatar_url', safeImageUrl],
  ]) {
    const value = coerce(source[field]);
    if (value) config[field] = value;
    else if (strict && source[field]) throw new ConfigError(`${field} must be a safe HTTPS URL`);
  }

  const accent = safeAccentColor(object(source.theme).accent);
  if (accent) config.theme = { accent };
  else if (strict && object(source.theme).accent) {
    throw new ConfigError('theme.accent must be a 3- or 6-digit hex color');
  }

  config.footer_credit = bool(source.footer_credit, true);

  const panel = object(source.status_panel);
  const statusPanel = {
    label: plainText(panel.label, 80),
    title: plainText(panel.title, 180),
    text: plainText(panel.text, 1000),
  };
  if (statusPanel.label || statusPanel.title || statusPanel.text) config.status_panel = statusPanel;

  const stats = boundedList(source, 'stats', MAX_STATS, strict, (item, index) => {
    assertItemKeys('stats', index, item, ['value', 'label'], strict);
    const value = plainText(object(item).value, 80);
    const label = plainText(object(item).label, 80);
    return value ? { value, label } : null;
  });
  if (stats.length) config.stats = stats;

  const features = boundedList(source, 'features', MAX_FEATURES, strict, (item, index) => {
    // A bare string was a valid feature in older OSS configs.
    const entry = typeof item === 'string' ? { title: item } : object(item);
    assertItemKeys('features', index, entry, ['title', 'description'], strict);
    const title = plainText(entry.title, 160);
    const description = plainText(entry.description, 800);
    return title ? (description ? { title, description } : { title }) : null;
  });
  if (features.length) config.features = features;

  const links = boundedList(source, 'links', MAX_LINKS, strict, (item, index) => {
    const entry = object(item);
    assertItemKeys('links', index, entry, ['title', 'url'], strict);
    const title = plainText(entry.title, 160);
    const url = safeLinkUrl(entry.url);
    if (strict) {
      if (!title) throw new ConfigError(`links[${index}] needs a title`);
      if (!url) throw new ConfigError(`links[${index}].url must be a safe HTTPS URL or an email address`);
    }
    return title && url ? { title, url } : null;
  });
  if (links.length) config.links = links;

  const socials = normalizeSocials(source.socials, strict);
  if (Object.keys(socials).length) config.socials = socials;

  const capture = object(source.capture);
  const captured = {
    offer: bool(capture.offer),
    waitlist: bool(capture.waitlist),
    survey_question: plainText(capture.survey_question, 180),
    consent: plainText(capture.consent, 240),
  };
  if (captured.offer || captured.waitlist || captured.survey_question) config.capture = captured;

  const labels = {};
  for (const [key, value] of Object.entries(object(source.labels))) {
    if (!OVERRIDABLE.includes(key)) {
      if (strict) throw new ConfigError(`labels.${key} is not an overridable label`);
      continue;
    }
    const text = plainText(value, 120);
    if (text) labels[key] = text;
  }
  if (Object.keys(labels).length) config.labels = labels;

  const favicon = safeImageUrl(object(source.brand).favicon_url);
  if (favicon) config.brand = { favicon_url: favicon };

  config.seo = normalizeSeo(source, strict);
  if (resolvedMode === 'redirect' || resolvedMode === 'maintenance' || object(source.delivery).redirect
      || object(source.delivery).maintenance) {
    config.delivery = normalizeDelivery(source, strict);
  }
  if (bool(object(source.analytics).enabled)) config.analytics = { enabled: true };

  if (strict && resolvedMode === 'redirect' && !config.delivery?.redirect?.target_url) {
    throw new ConfigError('A redirect needs delivery.redirect.target_url');
  }

  return { mode: resolvedMode || DEFAULT_MODE, config };
}

/** Strict entry point for anything a user just typed. Throws ConfigError. */
export function validate(raw, mode) {
  const resolved = normalizeMode(mode);
  if (!resolved) throw new ConfigError(`mode must be one of ${MODES.join(', ')}`);
  return normalize(raw, { mode: resolved, strict: true }).config;
}

/**
 * Derived display values. Kept out of `normalize` so what is stored stays
 * exactly what the owner typed, and what renders can still be smart.
 */
export function derive(hostname, mode, config) {
  const host = safeHostname(hostname);
  const title = config.domain_title || host || 'this domain';
  const stats = [...(config.stats || [])];

  // Derived stats fill gaps; they never duplicate one the owner set themselves.
  const has = (label) => stats.some((stat) => stat.label === label);

  if (stats.length < MAX_STATS && !has('Extension') && host && host.includes('.') && !/^\d/.test(host)) {
    stats.push({ value: `.${host.split('.').pop()}`, label: 'Extension' });
  }
  if (stats.length < MAX_STATS && !has('Domain age') && config.registration_date) {
    const registered = new Date(config.registration_date);
    if (!Number.isNaN(registered.getTime())) {
      const years = Math.floor((Date.now() - registered.getTime()) / 31557600000);
      if (years >= 1) stats.push({ value: `${years}+`, label: 'Domain age' });
    }
  }
  return { host, title, stats: stats.slice(0, MAX_STATS) };
}
