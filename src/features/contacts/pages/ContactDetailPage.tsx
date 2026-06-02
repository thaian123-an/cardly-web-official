import {
  ArrowLeft,
  Building2,
  Globe,
  LinkIcon,
  Mail,
  MapPin,
  Phone,
  Trash2,
} from "lucide-react";
import { observer } from "mobx-react-lite";
import { useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { contactStore } from "../stores/ContactStore";
import "../contacts.css";

export const ContactDetailPage = observer(() => {
  const navigate = useNavigate();
  const { contactId } = useParams();

  useEffect(() => {
    if (contactId) {
      void contactStore.loadContactById(contactId);
    }
  }, [contactId]);

  const contact = contactStore.selectedContact;

  const handleDelete = async () => {
    if (!contact) return;

    const confirmed = window.confirm("Delete this contact?");

    if (!confirmed) {
      return;
    }

    const success = await contactStore.deleteContact(contact.id);

    if (success) {
      navigate("/contacts", { replace: true });
    }
  };

  if (contactStore.isLoading && !contact) {
    return <p className="muted-text">Loading contact detail...</p>;
  }

  if (!contact) {
    return (
      <section className="contacts-page">
        <button
          type="button"
          className="back-button"
          onClick={() => navigate("/contacts")}
        >
          <ArrowLeft size={18} />
          Back to Contacts
        </button>

        <div className="mini-empty">
          <strong>Contact not found</strong>
          <p>This contact may have been deleted or is unavailable.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="contact-detail-page">
      <button
        type="button"
        className="back-button"
        onClick={() => navigate("/contacts")}
      >
        <ArrowLeft size={18} />
        Back to Contacts
      </button>

      {contactStore.error ? (
        <p className="page-alert page-alert--error">{contactStore.error}</p>
      ) : null}

      <div className="contact-detail-grid">
        <article className="contact-profile-card">
          <span className="contact-profile-avatar">
            {contact.fullName.slice(0, 2).toUpperCase()}
          </span>

          <h1>{contact.fullName}</h1>
          <p>{contact.position}</p>

          <div className="company-pill">
            <Building2 size={16} />
            {contact.company}
          </div>

          <div className="quick-actions">
            <a href={`tel:${contact.phone}`}>
              <Phone size={18} />
            </a>
            <a href={`mailto:${contact.email}`}>
              <Mail size={18} />
            </a>
            {contact.linkedIn ? (
              <a href={contact.linkedIn} target="_blank" rel="noreferrer">
                <LinkIcon size={18} />
              </a>
            ) : null}
            {contact.website ? (
              <a href={contact.website} target="_blank" rel="noreferrer">
                <Globe size={18} />
              </a>
            ) : null}
          </div>

          <button
            type="button"
            className="delete-full-button"
            onClick={handleDelete}
            disabled={contactStore.isSaving}
          >
            <Trash2 size={18} />
            Delete Contact
          </button>
        </article>

        <article className="contact-info-card">
          <h2>Contact Information</h2>

          <div className="info-list">
            <div>
              <Phone size={18} />
              <span>
                <small>Phone</small>
                <strong>{contact.phone || "Not provided"}</strong>
              </span>
            </div>
            <div>
              <Mail size={18} />
              <span>
                <small>Email</small>
                <strong>{contact.email || "Not provided"}</strong>
              </span>
            </div>
            <div>
              <MapPin size={18} />
              <span>
                <small>Address</small>
                <strong>{contact.address || "Not provided"}</strong>
              </span>
            </div>
            {contact.website ? (
              <div>
                <Globe size={18} />
                <span>
                  <small>Website</small>
                  <Link to={contact.website}>{contact.website}</Link>
                </span>
              </div>
            ) : null}
          </div>

          <div className="detail-section">
            <h3>AI Summary</h3>
            <p>{contact.aiSummary || "No AI summary available yet."}</p>
          </div>

          <div className="detail-section">
            <h3>Keywords</h3>
            <div className="tag-list">
              {contact.keywords.length > 0 ? (
                contact.keywords.map((keyword) => (
                  <span key={keyword}>{keyword}</span>
                ))
              ) : (
                <span>No keywords</span>
              )}
            </div>
          </div>

          <div className="detail-section">
            <h3>Highlights</h3>
            <ul className="highlight-list">
              {contact.highlights.length > 0 ? (
                contact.highlights.map((highlight) => (
                  <li key={highlight}>{highlight}</li>
                ))
              ) : (
                <li>No highlights available.</li>
              )}
            </ul>
          </div>

          <div className="detail-section">
            <h3>Context</h3>
            <p>{contact.context || "No context information available."}</p>
          </div>
        </article>
      </div>
    </section>
  );
});