const paths = {
  home: <><path d="M3 10.8 12 3l9 7.8"/><path d="M5.5 9.8V21h13V9.8M9.5 21v-6h5v6"/></>,
  pet: <><circle cx="8" cy="7" r="2"/><circle cx="16" cy="7" r="2"/><circle cx="5.5" cy="12" r="2"/><circle cx="18.5" cy="12" r="2"/><path d="M8.2 19.4c-1.5-1.4-.9-4.1.2-5.7 1.8-2.6 5.4-2.6 7.2 0 1.1 1.6 1.7 4.3.2 5.7-1.1 1-2.5.2-3.8.2s-2.7.8-3.8-.2Z"/></>,
  health: <><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z"/><path d="M7 12h3l1.2-2.5 2 5L14.5 12H17"/></>,
  play: <><rect x="3" y="5" width="18" height="14" rx="3"/><path d="m10 9 5 3-5 3Z"/></>,
  report: <><path d="M6 3h9l4 4v14H6Z"/><path d="M14 3v5h5M9 13h6M9 17h6"/></>,
  cage: <><rect x="3" y="4" width="18" height="16" rx="3"/><path d="M8 4v16M16 4v16M3 10h18"/></>,
  admission: <><path d="M4 6h16v14H4Z"/><path d="M8 3v6M16 3v6M8 14h8M12 11v6"/></>,
  device: <><rect x="5" y="3" width="14" height="18" rx="3"/><path d="M9 7h6M10 17h4"/></>,
  log: <><path d="M5 4h14v17H5Z"/><path d="M8 9h8M8 13h8M8 17h5"/></>,
  facility: <><path d="M4 21V7l8-4 8 4v14M8 10h2M14 10h2M8 14h2M14 14h2M10 21v-4h4v4"/></>,
  users: <><circle cx="9" cy="8" r="3"/><path d="M3.5 20c.4-4 2.2-6 5.5-6s5.1 2 5.5 6M15 6.5a3 3 0 0 1 0 5.5M16 14c2.8.4 4.2 2.4 4.5 6"/></>,
  logout: <><path d="M10 4H5v16h5M14 8l4 4-4 4M8 12h10"/></>,
  check: <path d="m5 12 4 4L19 6" />,
};

function UiIcon({ name, size = 20, className = "" }) {
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {paths[name] || paths.home}
    </svg>
  );
}

export default UiIcon;
