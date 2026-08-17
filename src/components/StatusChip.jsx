function StatusChip({ tone = "neutral", children, dot = false, className = "" }) {
  return (
    <span className={`status-chip status-chip--${tone} ${className}`.trim()}>
      {dot && <span className="status-chip__dot" aria-hidden="true" />}
      {children}
    </span>
  );
}

export default StatusChip;
