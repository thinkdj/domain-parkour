import test from "node:test";
import assert from "node:assert/strict";

import {
  deleteManagedAvatar,
  handleAssetRequest,
  storeProfileImage,
} from "../src/assets.js";

function pngFile(overrides = {}) {
  const bytes = new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10, 0]);
  return {
    name: "portrait.png",
    type: "image/png",
    size: bytes.byteLength,
    arrayBuffer: async () => bytes.buffer,
    ...overrides,
  };
}

test("profile upload stores a validated image with immutable metadata", async () => {
  let stored;
  const bucket = {
    put: async (key, bytes, options) => {
      stored = { key, bytes, options };
    },
  };

  const result = await storeProfileImage(bucket, pngFile(), "Ada.Example");
  assert.match(result.key, /^profiles\/ada\.example\/[0-9a-f-]+\.png$/);
  assert.equal(result.url, `/_assets/${result.key}`);
  assert.equal(stored.options.httpMetadata.contentType, "image/png");
  assert.match(stored.options.httpMetadata.cacheControl, /immutable/);
});

test("profile upload rejects mismatched image content", async () => {
  const bucket = { put: async () => assert.fail("invalid image should not be stored") };
  await assert.rejects(
    storeProfileImage(bucket, pngFile({ arrayBuffer: async () => new Uint8Array([1, 2, 3]).buffer }), "example.com"),
    /does not match/,
  );
});

test("managed avatar cleanup deletes only matching R2 objects", async () => {
  const deleted = [];
  const bucket = { delete: async (key) => deleted.push(key) };
  const key = "profiles/example.com/image.png";

  assert.equal(await deleteManagedAvatar(bucket, {
    avatarObjectKey: key,
    avatarUrl: `/_assets/${key}`,
  }), true);
  assert.deepEqual(deleted, [key]);

  assert.equal(await deleteManagedAvatar(bucket, {
    avatarObjectKey: key,
    avatarUrl: "https://example.com/image.png",
  }), false);
  assert.deepEqual(deleted, [key]);
});

test("asset route serves R2 objects with safe cache headers", async () => {
  const bucket = {
    get: async (key) => ({
      body: "image-bytes",
      httpEtag: '"etag"',
      writeHttpMetadata(headers) {
        headers.set("content-type", "image/png");
      },
    }),
  };
  const response = await handleAssetRequest(
    new Request("https://example.com/_assets/profiles/example.com/image.png"),
    { ASSETS: bucket },
  );
  assert.equal(response.status, 200);
  assert.equal(response.headers.get("content-type"), "image/png");
  assert.equal(response.headers.get("x-content-type-options"), "nosniff");
  assert.match(response.headers.get("cache-control"), /immutable/);
});
