/**
 * Direct PDF download for any styled HTML document — no popup, no new tab.
 * Injects a hidden iframe with the document, then invokes the browser's
 * print dialog pointed at it; picking "Save as PDF" (the default print
 * destination in Chromium-based browsers after it's been used once) writes
 * a real PDF file. This is the same mechanism the candidate CV builder's
 * own `downloadPDF()` already relies on — pulled out here so every other
 * document on the site (admin reports, coordinator CV/job lists) can
 * trigger a direct PDF the same way instead of handing back a plain
 * download-only HTML file.
 */
export function printHtmlAsPdf(html: string) {
  const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const iframe = document.createElement('iframe');
  iframe.style.cssText = 'position:fixed;top:0;left:0;width:0;height:0;border:0;opacity:0;pointer-events:none';
  iframe.src = url;
  document.body.appendChild(iframe);
  const cleanup = () => {
    if (document.body.contains(iframe)) document.body.removeChild(iframe);
    URL.revokeObjectURL(url);
  };
  iframe.onload = () => {
    try { iframe.contentWindow?.focus(); iframe.contentWindow?.print(); } catch { cleanup(); }
    setTimeout(cleanup, 60000);
  };
  // Safety fallback if onload never fires
  setTimeout(() => {
    try { iframe.contentWindow?.focus(); iframe.contentWindow?.print(); } catch {}
    setTimeout(cleanup, 60000);
  }, 1500);
}
