import { NextRequest, NextResponse } from "next/server";
import { google } from "googleapis";

const SHEET_ID = process.env.GOOGLE_SHEETS_ID!;

function getAuth() {
  const raw = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
  if (!raw) throw new Error("GOOGLE_SERVICE_ACCOUNT_JSON env var missing");
  const creds = JSON.parse(raw);
  return new google.auth.GoogleAuth({
    credentials: creds,
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });
}

async function getSheets() {
  const auth = getAuth();
  return google.sheets({ version: "v4", auth });
}

/* ── Ensure tabs exist ─────────────────────────────── */
async function ensureTabs(sheets: ReturnType<typeof google.sheets>) {
  const meta = await sheets.spreadsheets.get({ spreadsheetId: SHEET_ID });
  const existing = (meta.data.sheets || []).map((s: any) => s.properties?.title);
  const needed = ["Holders", "Coords"].filter(t => !existing.includes(t));
  if (needed.length === 0) return;
  await sheets.spreadsheets.batchUpdate({
    spreadsheetId: SHEET_ID,
    requestBody: {
      requests: needed.map(title => ({
        addSheet: { properties: { title } },
      })),
    },
  });
}

/* ── GET — read holders + coords ───────────────────── */
export async function GET() {
  try {
    if (!SHEET_ID) return NextResponse.json({ holders: [], coords: [] });
    const sheets = await getSheets();
    await ensureTabs(sheets);

    const [holdersRes, coordsRes] = await Promise.all([
      sheets.spreadsheets.values.get({
        spreadsheetId: SHEET_ID,
        range: "Holders!A:B",
      }),
      sheets.spreadsheets.values.get({
        spreadsheetId: SHEET_ID,
        range: "Coords!A:A",
      }),
    ]);

    const holderRows = holdersRes.data.values || [];
    const holders = holderRows
      .filter((r: string[]) => r[0] && r[1])
      .map((r: string[]) => {
        try { return JSON.parse(r[1]); } catch { return null; }
      })
      .filter(Boolean);

    const coordRows = coordsRes.data.values || [];
    const coords = coordRows.flat().filter(Boolean);

    return NextResponse.json({ holders, coords });
  } catch (err: any) {
    return NextResponse.json({ error: err.message, holders: [], coords: [] }, { status: 500 });
  }
}

/* ── POST — write / update ─────────────────────────── */
export async function POST(req: NextRequest) {
  try {
    if (!SHEET_ID) return NextResponse.json({ ok: false, error: "No sheet configured" });
    const body = await req.json();
    const sheets = await getSheets();
    await ensureTabs(sheets);

    if (body.type === "save_holder") {
      const holder = body.holder;
      const id = holder.id;

      // Read existing rows to find the right row to update
      const existing = await sheets.spreadsheets.values.get({
        spreadsheetId: SHEET_ID,
        range: "Holders!A:A",
      });
      const ids = (existing.data.values || []).flat();
      const rowIndex = ids.findIndex((r: string) => r === id);

      if (rowIndex >= 0) {
        // Update existing row (1-indexed, +1 for header offset if any)
        await sheets.spreadsheets.values.update({
          spreadsheetId: SHEET_ID,
          range: `Holders!A${rowIndex + 1}:B${rowIndex + 1}`,
          valueInputOption: "RAW",
          requestBody: { values: [[id, JSON.stringify(holder)]] },
        });
      } else {
        // Append new row
        await sheets.spreadsheets.values.append({
          spreadsheetId: SHEET_ID,
          range: "Holders!A:B",
          valueInputOption: "RAW",
          requestBody: { values: [[id, JSON.stringify(holder)]] },
        });
      }
      return NextResponse.json({ ok: true });
    }

    if (body.type === "save_coords") {
      const coords: string[] = body.coords;
      // Overwrite entire coords sheet
      await sheets.spreadsheets.values.clear({
        spreadsheetId: SHEET_ID,
        range: "Coords!A:A",
      });
      if (coords.length > 0) {
        await sheets.spreadsheets.values.update({
          spreadsheetId: SHEET_ID,
          range: "Coords!A1",
          valueInputOption: "RAW",
          requestBody: { values: coords.map(c => [c]) },
        });
      }
      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ ok: false, error: "Unknown type" }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}
