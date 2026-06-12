export default function Button({
    children,
    onClick,
    type = "button",
    className = "",
    disabled = false,
  }) {
    return (
      <button
        type={type}
        onClick={onClick}
        disabled={disabled}
        className={`btn ${className}`}
      >
        {children}
      </button>
    );
  }