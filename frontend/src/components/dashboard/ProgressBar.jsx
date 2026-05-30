import "./ProgressBar.css";

/**
 * Reusable progress bar component.
 * Props:
 *   percent  — 0 to 100
 *   label    — optional text below bar
 *   showPct  — show percentage number (default true)
 *   size     — "sm" | "md" | "lg"  (default "md")
 *   variant  — "sage" | "navy" | "coral" (default "sage")
 */
const ProgressBar = ({
  percent  = 0,
  label    = "",
  showPct  = true,
  size     = "md",
  variant  = "sage",
}) => {
  const clamped = Math.min(100, Math.max(0, percent));

  return (
    <div className={`pb-wrap pb-${size}`}>
      {(label || showPct) && (
        <div className="pb-header">
          {label  && <span className="pb-label">{label}</span>}
          {showPct && <span className={`pb-pct pb-pct-${variant}`}>{Math.round(clamped)}%</span>}
        </div>
      )}
      <div className={`pb-track pb-track-${size}`}>
        <div
          className={`pb-fill pb-fill-${variant}`}
          style={{ width: `${clamped}%` }}
        />
      </div>
      {clamped === 100 && (
        <div className="pb-complete">✅ Completed!</div>
      )}
    </div>
  );
};

export default ProgressBar;
