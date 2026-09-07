// Imported from its lib path, not the package root — pdf-parse's root index.js
// runs a `!module.parent` debug self-test at module-load time that tries to
// read a bundled sample PDF from disk. That check misfires under Next.js/
// Turbopack's bundling (module.parent isn't populated the same way there),
// breaking the production build with an ENOENT on the sample file. The lib
// file is the actual parser with no such self-test; it also has no type
// declarations of its own (only the package root does), hence the require+cast.
// eslint-disable-next-line @typescript-eslint/no-var-requires
const pdfParse = require("pdf-parse/lib/pdf-parse.js") as (buf: Buffer) => Promise<{ text: string }>;

import mammoth from "mammoth";

// Detected from the file's own magic bytes rather than trusting a client-supplied
// extension/mimetype, which is easy to get wrong or spoof. PDF: "%PDF". DOCX (a
// zip archive): starts with the "PK" local-file-header signature.
export function extractRawText(buffer: Buffer): Promise<string> {
  if (buffer.subarray(0, 4).toString("latin1") === "%PDF") {
    return pdfParse(buffer).then(d => d.text);
  }
  if (buffer[0] === 0x50 && buffer[1] === 0x4b) {
    return mammoth.extractRawText({ buffer }).then(d => d.value);
  }
  throw new Error("Unsupported file type — expected .docx or .pdf");
}
