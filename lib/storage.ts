import { put, del, type PutBlobResult } from "@vercel/blob";

// Private object storage for the Dossier Factory's generated files (source
// Excel uploads, per-dossier PPTX/DOCX, consolidated committee Excel, ZIP
// bundles) — IDEAMAP_DOSSIER_FACTORY_PROMPT.md §7.2. Not imported by any
// route yet; adding this file is inert until a later phase wires an upload
// or generator endpoint to call it.
//
// Setup: in the Vercel dashboard, Storage → Create → Blob, attach it to this
// project. That sets BLOB_READ_WRITE_TOKEN automatically for Vercel deploys;
// for local dev, copy it into .env.local.
//
// Key convention (§7.2): callers pass a fully-formed key, e.g.
//   imports/{scope}/{importId}/source.xlsx
//   dossiers/{dossierId}/{kind}-{generatorVersion}.{ext}
//   imports/{importId}/bundle.zip
// Never store generated files in the database — only their storage key.

export function isStorageConfigured(): boolean {
  return !!process.env.BLOB_READ_WRITE_TOKEN;
}

export async function putPrivateFile(key: string, body: Buffer | Blob | ArrayBuffer): Promise<PutBlobResult> {
  if (!isStorageConfigured()) {
    throw new Error(
      "BLOB_READ_WRITE_TOKEN is not set — see lib/storage.ts for setup instructions."
    );
  }
  // access: "public" is Vercel Blob's only mode as of this writing, but the
  // URL is unguessable (random suffix) and downloads should always go
  // through a signed, expiring URL generated at request time (§4.5) rather
  // than this raw blob URL being handed to a client directly.
  return put(key, body, { access: "public", addRandomSuffix: false });
}

export async function deleteFile(key: string): Promise<void> {
  if (!isStorageConfigured()) return;
  await del(key);
}
