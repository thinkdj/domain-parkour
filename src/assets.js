/** Managed object storage shared by profile uploads and future page assets. */
const ASSET_PREFIX = "/_assets/";
const MAX_PROFILE_IMAGE_BYTES = 5 * 1024 * 1024;

const IMAGE_TYPES = {
  "image/gif": "gif",
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

function hasImageSignature(bytes, type) {
  if (type === "image/png") {
    return bytes.length >= 8 && [137, 80, 78, 71, 13, 10, 26, 10].every((value, i) => bytes[i] === value);
  }
  if (type === "image/jpeg") {
    return bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  }
  if (type === "image/gif") {
    const header = String.fromCharCode(...bytes.slice(0, 6));
    return header === "GIF87a" || header === "GIF89a";
  }
  if (type === "image/webp") {
    return bytes.length >= 12
      && String.fromCharCode(...bytes.slice(0, 4)) === "RIFF"
      && String.fromCharCode(...bytes.slice(8, 12)) === "WEBP";
  }
  return false;
}

function safeHostname(hostname) {
  return String(hostname || "unassigned")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, "-")
    .replace(/^-+|-+$/g, "") || "unassigned";
}

export async function storeProfileImage(bucket, file, hostname) {
  if (!bucket) throw new Error("R2 binding `ASSETS` is not configured.");
  if (!file || typeof file.arrayBuffer !== "function") throw new Error("Choose an image to upload.");
  if (!file.size) throw new Error("The selected image is empty.");
  if (file.size > MAX_PROFILE_IMAGE_BYTES) throw new Error("Profile images must be 5 MB or smaller.");

  const contentType = String(file.type || "").toLowerCase();
  const extension = IMAGE_TYPES[contentType];
  if (!extension) throw new Error("Use a PNG, JPEG, WebP, or GIF image.");

  const bytes = new Uint8Array(await file.arrayBuffer());
  if (!hasImageSignature(bytes, contentType)) throw new Error("The file content does not match its image type.");

  const key = `profiles/${safeHostname(hostname)}/${crypto.randomUUID()}.${extension}`;
  await bucket.put(key, bytes, {
    httpMetadata: {
      contentType,
      cacheControl: "public, max-age=31536000, immutable",
    },
    customMetadata: {
      hostname: String(hostname || ""),
      originalName: String(file.name || "profile-image").slice(0, 200),
    },
  });

  return { key, url: `${ASSET_PREFIX}${key}` };
}

export async function deleteManagedAvatar(bucket, config) {
  const key = config?.avatarObjectKey;
  if (!bucket || !key || !String(key).startsWith("profiles/")) return false;
  if (config.avatarUrl !== `${ASSET_PREFIX}${key}`) return false;
  await bucket.delete(key);
  return true;
}

export async function handleAssetRequest(request, env) {
  const url = new URL(request.url);
  if (!url.pathname.startsWith(ASSET_PREFIX)) return null;
  if (request.method !== "GET" && request.method !== "HEAD") {
    return new Response("Method not allowed", { status: 405, headers: { allow: "GET, HEAD" } });
  }
  if (!env.ASSETS) return new Response("Asset storage is not configured", { status: 503 });

  let key;
  try {
    key = decodeURIComponent(url.pathname.slice(ASSET_PREFIX.length));
  } catch {
    return new Response("Invalid asset path", { status: 400 });
  }
  if (!key || key.startsWith("/") || key.split("/").includes("..")) {
    return new Response("Invalid asset path", { status: 400 });
  }

  const object = request.method === "HEAD" ? await env.ASSETS.head(key) : await env.ASSETS.get(key);
  if (!object) return new Response("Not found", { status: 404 });

  const headers = new Headers();
  object.writeHttpMetadata(headers);
  headers.set("cache-control", headers.get("cache-control") || "public, max-age=31536000, immutable");
  headers.set("etag", object.httpEtag);
  headers.set("x-content-type-options", "nosniff");
  headers.set("content-disposition", "inline");
  return new Response(request.method === "HEAD" ? null : object.body, { headers });
}
