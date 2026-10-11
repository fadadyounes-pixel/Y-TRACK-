import { NextRequest, NextResponse } from "next/server";
import { putPrivateFile, isStorageConfigured } from "@/lib/storage";

// A coordinator's own letterhead/logo (CoordDash settings), stamped onto
// the dossier files their holders' documents get generated with. One blob
// per coordinator code; re-uploading overwrites the previous one (a new
// timestamped key, since Vercel Blob doesn't support in-place overwrite
// cleanly for this helper's access:"public"/addRandomSuffix:false mode).
export async function POST(req: NextRequest) {
  try {
    if (!isStorageConfigured()) {
      return NextResponse.json({ error: "Storage not configured" }, { status: 503 });
    }
    const { fileBase64, coordCode, contentType } = await req.json() as
      { fileBase64: string; coordCode: string; contentType?: string };
    if (!fileBase64 || !coordCode) return NextResponse.json({ error: "Missing file or coordinator code" }, { status: 400 });
    if (!/^@[A-Za-z0-9_-]{2,40}$/.test(coordCode)) return NextResponse.json({ error: "Invalid coordinator code" }, { status: 400 });

    const buffer = Buffer.from(fileBase64, "base64");
    if (buffer.length > 2 * 1024 * 1024) return NextResponse.json({ error: "File too large (max 2 MB)" }, { status: 400 });
    const ext = (contentType || "").includes("png") ? "png" : (contentType || "").includes("jpeg") || (contentType || "").includes("jpg") ? "jpg" : "png";
    const key = `coord-logos/${coordCode.replace(/^@/, "")}-${Date.now()}.${ext}`;
    const result = await putPrivateFile(key, buffer);
    return NextResponse.json({ url: result.url });
  } catch (err) {
    console.error("upload-logo: failed", err);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
