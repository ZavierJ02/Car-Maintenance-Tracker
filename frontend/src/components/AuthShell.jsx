import { Link } from "react-router-dom";
import Alert from "./Alert";

function AuthShell({
  title,
  copy,
  successMessage,
  errorMessage,
  footerText,
  footerLinkTo,
  footerLinkLabel,
  children,
}) {
  return (
    <main className="auth-shell">
      <section className="auth-card">
        <div className="auth-card__body">
          <p className="auth-eyebrow">Car Maintenance Tracker</p>
          <h1>{title}</h1>
          <p className="auth-copy">{copy}</p>

          {children}

          <Alert type="success">{successMessage}</Alert>
          <Alert type="error">{errorMessage}</Alert>

          <p className="auth-footer">
            {footerText}{" "}
            <Link className="auth-link" to={footerLinkTo}>
              {footerLinkLabel}
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
}

export default AuthShell;
