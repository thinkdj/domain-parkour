/**
 * HTTP Basic Auth for the admin panel.
 * Credentials come from worker secrets/.dev.vars: ADMIN_USER, ADMIN_PASSWORD.
 *
 * If either is missing, the admin panel is disabled everywhere reachable from
 * the internet. Only loopback requests fall back to "admin"/"admin", with a
 * visible warning surfaced by the UI.
 *
 * `*.workers.dev` is deliberately NOT local here: it is a public hostname, and
 * a fresh deploy lands on one before any custom domain is attached. Compare
 * isLocalHost() in ../config.js, which does treat it as development — that one
 * only selects demo page content and is not a trust boundary.
 */

const REALM = 'Domain Parkour Admin';

function isLocal(hostname) {
  return (
    hostname === 'localhost' ||
    hostname === '127.0.0.1' ||
    hostname === '0.0.0.0'
  );
}

export function adminCredentials(env, hostname) {
  const user = env.ADMIN_USER;
  const pass = env.ADMIN_PASSWORD;
  if (user && pass) return { user, pass, isDefault: false, configured: true };
  if (isLocal(hostname)) return { user: 'admin', pass: 'admin', isDefault: true, configured: false };
  return null;
}

function unauthorized(message = 'Authentication required') {
  return new Response(message, {
    status: 401,
    headers: {
      'WWW-Authenticate': `Basic realm="${REALM}", charset="UTF-8"`,
      'content-type': 'text/plain;charset=UTF-8',
    },
  });
}

function constantTimeEqual(a, b) {
  if (a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i++) result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return result === 0;
}

/**
 * Returns null when authorized; a Response (401) when not.
 */
export function requireAdmin(request, env) {
  const url = new URL(request.url);
  const creds = adminCredentials(env, url.hostname);
  if (!creds) {
    return new Response(
      'Admin panel is disabled. Set ADMIN_USER and ADMIN_PASSWORD secrets to enable.',
      { status: 503, headers: { 'content-type': 'text/plain;charset=UTF-8' } },
    );
  }

  const header = request.headers.get('authorization') || '';
  if (!header.toLowerCase().startsWith('basic ')) return unauthorized();

  let decoded;
  try {
    decoded = atob(header.slice(6).trim());
  } catch {
    return unauthorized('Malformed credentials');
  }
  const sep = decoded.indexOf(':');
  if (sep < 0) return unauthorized('Malformed credentials');
  const user = decoded.slice(0, sep);
  const pass = decoded.slice(sep + 1);

  if (constantTimeEqual(user, creds.user) && constantTimeEqual(pass, creds.pass)) return null;
  return unauthorized('Invalid credentials');
}
