import { AlertTriangle } from "lucide-react";

const LOW_STOCK_THRESHOLD = 10;

export function LowStockBadge({ quantity }) {
  if (quantity > LOW_STOCK_THRESHOLD) return null;
  const isOut = quantity === 0;
  return (
    <span className="low-stock-badge">
      <AlertTriangle size={10} />
      {isOut ? "Out of stock" : "Low stock"}
    </span>
  );
}

export function StockCell({ quantity }) {
  const isOut = quantity === 0;
  const isLow = quantity > 0 && quantity <= LOW_STOCK_THRESHOLD;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <span
        className="mono"
        style={{
          color: isOut
            ? "var(--color-danger)"
            : isLow
            ? "var(--color-warning)"
            : "var(--color-text)",
        }}
      >
        {quantity}
      </span>
      <LowStockBadge quantity={quantity} />
    </div>
  );
}
