// Bump whenever any generator in this module changes output (new slide, new
// DOCX section, a fixed calculation bug, a reworded template) so every cached
// artifact and idempotency key invalidates cleanly instead of silently
// serving stale documents under a content hash that no longer matches what
// the current code would produce.
export const GENERATOR_VERSION = "1.0.0";
