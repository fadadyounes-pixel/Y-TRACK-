/**
 * Shared stroke-based icon set for TalentMap — a consistent, professional
 * substitute for emoji-as-icon usage. Single currentColor stroke, 24x24
 * viewBox, ~1.75 stroke width. Add new names here rather than reaching for
 * an emoji or a one-off inline <svg> elsewhere in the app.
 */
export type IconName =
  | 'camera' | 'id-card' | 'phone' | 'map-pin' | 'graduation-cap' | 'briefcase'
  | 'globe' | 'chart-bar' | 'users' | 'target' | 'document' | 'robot' | 'mail'
  | 'check' | 'check-circle' | 'alert-triangle' | 'lightbulb' | 'download'
  | 'eye' | 'pencil' | 'trash' | 'plus' | 'arrow-right' | 'settings'
  | 'building' | 'star' | 'clock' | 'shield-check' | 'sparkles' | 'file-text'
  | 'user' | 'x'
  | 'folder' | 'book-open' | 'refresh' | 'zap' | 'award' | 'inbox' | 'send'
  | 'wallet' | 'message-circle' | 'heart' | 'calendar' | 'save' | 'copy'
  | 'megaphone' | 'circle' | 'palette';

const PATHS: Record<IconName, React.ReactNode> = {
  camera: <><path d="M4 8h3l1.5-2h7L17 8h3a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1Z"/><circle cx="12" cy="13" r="3.5"/></>,
  'id-card': <><rect x="3" y="5" width="18" height="14" rx="2"/><circle cx="9" cy="11" r="2"/><path d="M6 16c0-1.7 1.3-3 3-3s3 1.3 3 3"/><path d="M14 10h4M14 14h4"/></>,
  phone: <path d="M6.5 3h3l1.5 4.5-2 1.5a11 11 0 0 0 5.5 5.5l1.5-2 4.5 1.5v3a2 2 0 0 1-2.2 2A17 17 0 0 1 4.5 5.2 2 2 0 0 1 6.5 3Z"/>,
  'map-pin': <><path d="M12 21s7-6.5 7-12a7 7 0 1 0-14 0c0 5.5 7 12 7 12Z"/><circle cx="12" cy="9" r="2.5"/></>,
  'graduation-cap': <><path d="M2 8.5 12 4l10 4.5-10 4.5-10-4.5Z"/><path d="M6.5 10.6V15c0 1.4 2.5 3 5.5 3s5.5-1.6 5.5-3v-4.4"/><path d="M21 9v5.5"/></>,
  briefcase: <><rect x="3" y="7.5" width="18" height="12" rx="2"/><path d="M8 7.5V6a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v1.5"/><path d="M3 12.5h18"/></>,
  globe: <><circle cx="12" cy="12" r="9"/><path d="M3 12h18"/><path d="M12 3a14 14 0 0 1 0 18a14 14 0 0 1 0-18Z"/></>,
  'chart-bar': <><path d="M4 20V10M11 20V4M18 20v-7"/><path d="M2 20h20"/></>,
  users: <><circle cx="9" cy="8" r="3.2"/><path d="M3.5 19c0-3 2.5-5.5 5.5-5.5s5.5 2.5 5.5 5.5"/><circle cx="17" cy="9" r="2.6"/><path d="M15.8 13.6c2.4.4 4.2 2.5 4.2 5"/></>,
  target: <><circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="4.5"/><circle cx="12" cy="12" r="1"/></>,
  document: <><path d="M7 3h7l4 4v14H7z"/><path d="M14 3v4h4"/><path d="M9.5 12.5h5M9.5 16h5"/></>,
  robot: <><rect x="4" y="8" width="16" height="11" rx="2.5"/><circle cx="9" cy="13.5" r="1.3"/><circle cx="15" cy="13.5" r="1.3"/><path d="M12 8V5"/><circle cx="12" cy="3.5" r="1.3"/><path d="M2.5 12v3M21.5 12v3"/></>,
  mail: <><rect x="3" y="5.5" width="18" height="13" rx="2"/><path d="M4 7l8 6 8-6"/></>,
  check: <path d="M5 12.5 10 17l9-10"/>,
  'check-circle': <><circle cx="12" cy="12" r="9"/><path d="M8 12.5l2.5 2.5L16.5 9"/></>,
  'alert-triangle': <><path d="M12 4 2.5 20h19L12 4Z"/><path d="M12 10.5v4M12 17.5v.1"/></>,
  lightbulb: <><path d="M9 18h6M10 21h4"/><path d="M12 3a6.5 6.5 0 0 0-3.7 11.8c.6.4 1.2 1.4 1.2 2.2h5c0-.8.6-1.8 1.2-2.2A6.5 6.5 0 0 0 12 3Z"/></>,
  download: <><path d="M12 3v12M8 11l4 4 4-4"/><path d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2"/></>,
  eye: <><path d="M2 12s3.8-7 10-7 10 7 10 7-3.8 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></>,
  pencil: <><path d="M4 20l1-4.5L16 4.5l3.5 3.5L8.5 19 4 20Z"/><path d="M14 6.5 17.5 10"/></>,
  trash: <><path d="M4 7h16"/><path d="M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2"/><path d="M6 7l1 13a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-13"/><path d="M10 11v6M14 11v6"/></>,
  plus: <path d="M12 5v14M5 12h14"/>,
  'arrow-right': <path d="M4 12h15M13 6l6 6-6 6"/>,
  settings: <><circle cx="12" cy="12" r="3"/><path d="M19.4 13.5a1.7 1.7 0 0 0 .34 1.87l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.7 1.7 0 0 0-1.87-.34 1.7 1.7 0 0 0-1 1.55V19.5a2 2 0 1 1-4 0v-.09a1.7 1.7 0 0 0-1.1-1.55 1.7 1.7 0 0 0-1.87.34l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.7 1.7 0 0 0 .34-1.87 1.7 1.7 0 0 0-1.55-1H3a2 2 0 1 1 0-4h.09a1.7 1.7 0 0 0 1.55-1.1 1.7 1.7 0 0 0-.34-1.87l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.7 1.7 0 0 0 1.87.34H9a1.7 1.7 0 0 0 1-1.55V3a2 2 0 1 1 4 0v.09a1.7 1.7 0 0 0 1 1.55 1.7 1.7 0 0 0 1.87-.34l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.7 1.7 0 0 0-.34 1.87V9a1.7 1.7 0 0 0 1.55 1H21a2 2 0 1 1 0 4h-.09a1.7 1.7 0 0 0-1.55 1Z"/></>,
  building: <><rect x="4" y="3" width="16" height="18" rx="1"/><path d="M8 7h1M8 11h1M8 15h1M15 7h1M15 11h1M15 15h1"/><path d="M10 21v-4h4v4"/></>,
  star: <path d="m12 3 2.6 5.9 6.4.6-4.8 4.3 1.4 6.3L12 17l-5.6 3.1 1.4-6.3-4.8-4.3 6.4-.6L12 3Z"/>,
  clock: <><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3.5 2"/></>,
  'shield-check': <><path d="M12 3l8 3.5v5.4c0 4.9-3.4 8.3-8 9.6-4.6-1.3-8-4.7-8-9.6V6.5L12 3Z"/><path d="M8.5 12.2l2.3 2.3 4.7-4.9"/></>,
  sparkles: <><path d="M12 3l1.4 3.9L17 8.3l-3.6 1.4L12 13.6l-1.4-3.9L7 8.3l3.6-1.4L12 3Z"/><path d="M19 14.5l.7 2 2 .7-2 .7-.7 2-.7-2-2-.7 2-.7.7-2Z"/></>,
  'file-text': <><path d="M7 3h7l4 4v14H7z"/><path d="M14 3v4h4"/><path d="M9.5 12h5M9.5 15.5h5M9.5 8.5h2"/></>,
  user: <><circle cx="12" cy="8" r="3.6"/><path d="M5 20c0-3.9 3.1-7 7-7s7 3.1 7 7"/></>,
  x: <path d="M6 6l12 12M18 6 6 18"/>,
  folder: <path d="M3 6.5A1.5 1.5 0 0 1 4.5 5H9l2 2.5h8.5A1.5 1.5 0 0 1 21 9v9a1.5 1.5 0 0 1-1.5 1.5h-15A1.5 1.5 0 0 1 3 18Z"/>,
  'book-open': <><path d="M12 6.5c-1.8-1.3-4.2-2-7-2v13c2.8 0 5.2.7 7 2"/><path d="M12 6.5c1.8-1.3 4.2-2 7-2v13c-2.8 0-5.2.7-7 2Z"/></>,
  refresh: <><path d="M20 11a8 8 0 0 0-14.6-4.6M4 13a8 8 0 0 0 14.6 4.6"/><path d="M4.5 4v4.5H9M19.5 20v-4.5H15"/></>,
  zap: <path d="M13 3 5 13.5h5.5L11 21l8-10.5h-5.5Z"/>,
  award: <><circle cx="12" cy="8.5" r="5.5"/><path d="M8.3 13.2 6.5 21l5.5-3 5.5 3-1.8-7.8"/></>,
  inbox: <><path d="M3.5 12h4.4l1.6 3h5l1.6-3h4.4"/><path d="M5 5.5h14L21 12v6a1.5 1.5 0 0 1-1.5 1.5h-15A1.5 1.5 0 0 1 3 18v-6Z"/></>,
  send: <path d="M4 12 20.5 4 14 20.5l-3-7-7-1.5Z"/>,
  wallet: <><path d="M3 8a2 2 0 0 1 2-2h13a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z"/><path d="M15.5 12.5h3v2h-3a1 1 0 0 1 0-2Z"/><path d="M3 8.5 14 5h4"/></>,
  'message-circle': <path d="M4 12a8 8 0 1 1 3.3 6.5L4 20l1.3-3.5A7.96 7.96 0 0 1 4 12Z"/>,
  heart: <path d="M12 20.5s-7.5-4.6-9.7-9C.5 8 2 4.5 5.5 4c2.2-.3 4 .8 6.5 3.2C14.5 4.8 16.3 3.7 18.5 4 22 4.5 23.5 8 21.7 11.5c-2.2 4.4-9.7 9-9.7 9Z"/>,
  calendar: <><rect x="3.5" y="5" width="17" height="16" rx="2"/><path d="M8 3v4M16 3v4M3.5 10h17"/></>,
  save: <><path d="M5 3.5h11L20 8v12.5H5V3.5Z"/><path d="M8 3.5V9h7V3.5"/><path d="M8 14h8v6.5H8Z"/></>,
  copy: <><rect x="8.5" y="8.5" width="12" height="12" rx="2"/><path d="M15.5 8.5V5.5A2 2 0 0 0 13.5 3.5h-9a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h3"/></>,
  megaphone: <><path d="M3 10.5v3a1.5 1.5 0 0 0 1.5 1.5H6l1 5h2l-1-5h1l9 3.5v-13L9 9H4.5A1.5 1.5 0 0 0 3 10.5Z"/><path d="M19 8.5a4 4 0 0 1 0 7"/></>,
  circle: <circle cx="12" cy="12" r="6"/>,
  palette: <><path d="M12 3a9 9 0 1 0 0 18c1.1 0 1.8-.9 1.8-1.8 0-.5-.2-.9-.5-1.2-.3-.3-.5-.7-.5-1.2 0-.9.7-1.6 1.6-1.6h1.9A4.2 4.2 0 0 0 21 11 8.4 8.4 0 0 0 12 3Z"/><circle cx="7.5" cy="11" r="1.2"/><circle cx="10.5" cy="7.5" r="1.2"/><circle cx="15" cy="8" r="1.2"/></>,
};

export default function Icon({ name, size = 20, strokeWidth = 1.75, color = 'currentColor', style }: {
  name: IconName; size?: number; strokeWidth?: number; color?: string; style?: React.CSSProperties;
}) {
  return (
    <svg
      width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round"
      style={{ flexShrink: 0, ...style }}
      aria-hidden="true"
    >
      {PATHS[name]}
    </svg>
  );
}
