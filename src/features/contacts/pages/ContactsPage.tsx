import { ArrowRight, Plus, Search, Trash2 } from "lucide-react";
import { observer } from "mobx-react-lite";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { contactStore } from "../stores/ContactStore";
import "../contacts.css";

export const ContactsPage = observer(() => {
  const navigate = useNavigate();
  const [keyword, setKeyword] = useState("");

  useEffect(() => {
    void contactStore.loadContacts();
  }, []);

  const filteredContacts = useMemo(() => {
    const normalizedKeyword = keyword.trim().toLowerCase();

    if (!normalizedKeyword) {
      return contactStore.contacts;
    }

    return contactStore.contacts.filter((contact) => {
      return [
        contact.fullName,
        contact.company,
        contact.position,
        contact.email,
        contact.phone,
      ]
        .join(" ")
        .toLowerCase()
        .includes(normalizedKeyword);
    });
  }, [keyword, contactStore.contacts]);

  const handleDelete = async (contactId: string) => {
    const confirmed = window.confirm("Delete this contact?");

    if (!confirmed) {
      return;
    }

    await contactStore.deleteContact(contactId);
  };

  return (
    <section className="contacts-page">
      <div className="page-header">
        <div>
          <p className="page-eyebrow">Contacts</p>
          <h1>Saved Contacts</h1>
          <p>Search, view, and manage contacts extracted from business cards.</p>
        </div>

        <button
          type="button"
          className="primary-action-button"
          onClick={() => navigate("/contacts/new")}
        >
          <Plus size={18} />
          Add Contact
        </button>
      </div>

      <div className="toolbar-card">
        <div className="toolbar-search">
          <Search size={18} />
          <input
            placeholder="Search contact by name, company, email..."
            value={keyword}
            onChange={(event) => setKeyword(event.target.value)}
          />
        </div>
      </div>

      {contactStore.error ? (
        <p className="page-alert page-alert--error">{contactStore.error}</p>
      ) : null}

      {contactStore.success ? (
        <p className="page-alert page-alert--success">{contactStore.success}</p>
      ) : null}

      <div className="contacts-list-card">
        {contactStore.isLoading ? (
          <p className="muted-text">Loading contacts...</p>
        ) : filteredContacts.length > 0 ? (
          filteredContacts.map((contact) => (
            <article key={contact.id} className="contact-row">
              <button
                type="button"
                className="contact-row__main"
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
              </button>

              <span className="contact-row__meta">{contact.email}</span>

              <div className="contact-row__actions">
                <button
                  type="button"
                  onClick={() => navigate(`/contacts/${contact.id}`)}
                  aria-label="View contact detail"
                >
                  <ArrowRight size={18} />
                </button>

                <button
                  type="button"
                  onClick={() => handleDelete(contact.id)}
                  aria-label="Delete contact"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </article>
          ))
        ) : (
          <div className="mini-empty">
            <strong>No contacts found</strong>
            <p>Add a contact or upload a business card to create one.</p>
          </div>
        )}
      </div>
    </section>
  );
});