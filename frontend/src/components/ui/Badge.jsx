export function Badge({ variant = "muted", children, dot }) {
  return (
    <span className={`badge badge-${variant}`}>
      {dot && (
        <span
          style={{
            width: 6,
            height: 6,
            borderRadius: "50%",
            background: "currentColor",
            flexShrink: 0,
          }}
        />
      )}
      {children}
    </span>
  );
}

export function StatusBadge({ status }) {
  const map = {
    pending: "warning",
    confirmed: "info",
    shipped: "accent",
    delivered: "success",
    cancelled: "danger",
  };
  return (
    <Badge variant={map[status] || "muted"} dot>
      {status}
    </Badge>
  );
}
