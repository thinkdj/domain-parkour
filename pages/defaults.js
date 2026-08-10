/**
 * Copy the renderer owns.
 *
 * The OSS config had nineteen separately validated label fields ("Asking price",
 * "Domain age", "Days"…). Twelve of them are gone for good: the countdown labels
 * went with the countdown, and the stat labels are derived now. The seven a user
 * might genuinely want to change survive as one `labels` object (see
 * OVERRIDABLE), which is one schema entry instead of nineteen.
 *
 * Everything here is the fallback. Localisation, when it arrives, swaps this
 * object for a per-language one — one seam rather than nineteen.
 */

export const LABELS = {
  statsRegion: 'Domain details',
  socialsRegion: 'Social links',
  linksRegion: 'Links',
  featuresRegion: 'What to expect',
  offerRegion: 'Purchase inquiry',

  priceLabel: 'Asking price',
  inquiryLabel: 'Purchase inquiries',
  noPriceTitle: 'Price on request',
  availabilityCopy: 'This domain is available for purchase.',
  contactCopy: 'Make an offer directly to the owner.',
  offerButton: 'Send offer',
  checkoutButton: 'Buy securely',

  pageTitleSuffix: '',

  launchLabel: 'Launching',
  waitlistCopy: 'Get a note when it goes live.',
  waitlistButton: 'Join waitlist',

  continueButton: 'Continue',
  surveyButton: 'Send answer',

  maintenanceTitle: 'We are making a careful update.',
  maintenanceCopy: 'Please try again shortly.',
  maintenanceHelp: 'Status or help',

  thanksTitle: 'Thank you',
  thanksOffer: 'Your offer is with the owner.',
  thanksWaitlist: 'You are on the list.',
  thanksSurvey: 'Thank you for sharing your answer.',
};

/**
 * The labels an owner may override through `config.labels`. Anything outside this
 * list is renderer copy, not configuration — the aria-labels on landmark regions
 * in particular, which are accessibility contract rather than voice.
 */
export const OVERRIDABLE = [
  'priceLabel', 'inquiryLabel', 'noPriceTitle', 'contactCopy', 'availabilityCopy',
  'offerButton', 'launchLabel', 'pageTitleSuffix',
];

/** The owner's word for something, or ours. */
export function label(config, key) {
  return config?.labels?.[key] || LABELS[key];
}

/** The status badge each mode shows when the owner has not set one. */
export const STATUS = {
  parking: 'Available',
  coming_soon: 'In progress',
  landing: 'Online',
  profile: 'Profile',
  maintenance: 'Maintenance',
  redirect: 'Redirecting',
};

/** The eyebrow each mode shows when the owner has not set one. */
export const EYEBROW = {
  parking: 'Premium domain',
  coming_soon: 'Coming soon',
  landing: '',
  profile: '',
  maintenance: '',
  redirect: '',
};

export const ACCENT = '#e8590c';
