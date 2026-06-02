import {
  ArrowRight,
  CheckCircle2,
  Clock3,
  ContactRound,
  FileText,
  UploadCloud,
} from "lucide-react";
import { observer } from "mobx-react-lite";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { contactStore } from "../../contacts/stores/ContactStore";
import "../../contacts/contacts.css";

export const DashboardPage = observer(() => {
  const navigate = useNavigate();

  useEffect(() => {
    void contactStore.loadContacts();
  }, []);

  const stats = [
    {
      label: "Total contacts",
      value: contactStore.totalContacts,
      icon: ContactRound,
    },
    {
      label: "Pending reviews",
      value: 0,
      icon: Clock3,
    },
    {
      label: "Uploaded this week",
      value: 0,
      icon: UploadCloud,
    },
    {
      label: "Saved cards",
      value: contactStore.savedCardsCount,
      icon: FileText,
    },
  ];

  return (
    <section className="dashboard-page">
      <div className="dashboard-hero">
        <div>
          <p className="page-eyebrow">Business Card Management</p>
          <h1>Welcome back</h1>
          <p>
            Review extracted business card data, manage saved contacts, and keep
            your networking workspace organized.
          </p>
        </div>

        <button
          type="button"
          className="primary-action-button"
          onClick={() => navigate("/scan-upload")}
        >
          Scan & Upload
          <ArrowRight size={18} />
        </button>
      </div>

      {contactStore.error ? (
        <p className="page-alert page-alert--error">{contactStore.error}</p>
      ) : null}

      <div className="stats-grid">
        {stats.map((stat) => {
          const Icon = stat.icon;

          return (
            <article key={stat.label} className="stat-card">
              <span className="stat-card__icon">
                <Icon size={22} />
              </span>

              <div>
                <strong>{stat.value}</strong>
                <p>{stat.label}</p>
              </div>
            </article>
          );
        })}
      </div>

      <div className="dashboard-grid">
        <article className="content-card">
          <div className="section-heading">
            <div>
              <h2>Recent Contacts</h2>
              <p>Latest contacts saved from scanned business cards.</p>
            </div>

            <button
              type="button"
              className="text-action-button"
              onClick={() => navigate("/contacts")}
            >
              View all
            </button>
          </div>

          {contactStore.isLoading ? (
            <p className="muted-text">Loading contacts...</p>
          ) : contactStore.recentContacts.length > 0 ? (
            <div className="recent-list">
              {contactStore.recentContacts.map((contact) => (
                <button
                  type="button"
                  key={contact.id}
                  className="recent-contact"
                  onClick={() => navigate(`/contacts/${contact.id}`)}
                >
                  <span className="contact-avatar">
                    {contact.fullName.slice(0, 2).toUpperCase()}
                  </span>

                  <span>
                    <strong>{contact.fullName}</strong>
                    <small>
                      {contact.position} · {contact.company}
                    </small>
                  </span>

                  <ArrowRight size={17} />
                </button>
              ))}
            </div>
          ) : (
            <div className="mini-empty">
              <CheckCircle2 size={24} />
              <strong>No contacts yet</strong>
              <p>Upload a business card to save your first contact.</p>
            </div>
          )}
        </article>

        <article className="content-card">
          <div className="section-heading">
            <div>
              <h2>Review Status</h2>
              <p>Overview of extraction and contact review progress.</p>
            </div>
          </div>

          <div className="status-list">
            <div>
              <span>Reviewed contacts</span>
              <strong>{contactStore.totalContacts}</strong>
            </div>
            <div>
              <span>Pending OCR review</span>
              <strong>0</strong>
            </div>
            <div>
              <span>Failed extractions</span>
              <strong>0</strong>
            </div>
          </div>
        </article>
      </div>
    </section>
  );
});