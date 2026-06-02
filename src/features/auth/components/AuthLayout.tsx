import type { ReactNode } from "react";
import { Activity } from "lucide-react";
import "../auth.css";

type AuthLayoutProps = {
  title: string;
  description: string;
  bullets?: string[];
  note?: string;
  children: ReactNode;
};

export function AuthLayout({
  title,
  description,
  bullets = [],
  note,
  children,
}: AuthLayoutProps) {
  return (
    <main className="auth-page">
      <section className="auth-panel">
        <div className="auth-brand">
          <span className="auth-brand__icon">
            <Activity size={24} strokeWidth={2.6} />
          </span>
          <span>Cardly</span>
        </div>

        <div className="auth-panel__content">
          <h1>{title}</h1>
          <p>{description}</p>

          {bullets.length > 0 ? (
            <ul className="auth-bullets">
              {bullets.map((bullet) => (
                <li key={bullet}>
                  <span>✓</span>
                  {bullet}
                </li>
              ))}
            </ul>
          ) : null}
        </div>

        {note ? <p className="auth-panel__note">{note}</p> : null}
      </section>

      <section className="auth-form-area">{children}</section>
    </main>
  );
}