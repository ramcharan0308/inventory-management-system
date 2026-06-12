import { AlertTriangle, Info, CheckCircle, XCircle } from "lucide-react";

const icons = {
  warning: AlertTriangle,
  danger: XCircle,
  success: CheckCircle,
  info: Info,
};

export function Alert({ variant = "info", children }) {
  const Icon = icons[variant] || Info;
  return (
    <div className={`alert alert-${variant}`}>
      <Icon size={16} style={{ flexShrink: 0, marginTop: 2 }} />
      <div>{children}</div>
    </div>
  );
}
