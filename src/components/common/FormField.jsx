export default function FormField({ label, error, hint, children, required }) {
  return (
    <div className="form-field">
      {label && (
        <label>
          {label}
          {required && <span className="required"> *</span>}
        </label>
      )}
      {children}
      {hint && !error && <span className="form-hint">{hint}</span>}
      {error && <span className="form-error">{error}</span>}
    </div>
  );
}
