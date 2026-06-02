import { ArrowLeft, Save } from "lucide-react";
import { observer } from "mobx-react-lite";
import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { contactStore } from "../stores/ContactStore";
import "../contacts.css";

export const AddContactPage = observer(() => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: "",
    position: "",
    company: "",
    phone: "",
    email: "",
    address: "",
    website: "",
    linkedIn: "",
    aiSummary: "",
    keywords: "",
    highlights: "",
    context: "",
  });

  const updateField = (field: keyof typeof formData, value: string) => {
    setFormData((current) => ({
      ...current,
      [field]: value,
    }));

    contactStore.clearMessages();
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    if (!formData.fullName.trim() || !formData.email.trim()) {
      contactStore.error = "Full name and email are required.";
      return;
    }

    const contact = await contactStore.createContact({
      fullName: formData.fullName.trim(),
      position: formData.position.trim(),
      company: formData.company.trim(),
      phone: formData.phone.trim(),
      email: formData.email.trim(),
      address: formData.address.trim(),
      website: formData.website.trim() || undefined,
      linkedIn: formData.linkedIn.trim() || undefined,
      aiSummary: formData.aiSummary.trim() || undefined,
      keywords: formData.keywords
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
      highlights: formData.highlights
        .split("\n")
        .map((item) => item.trim())
        .filter(Boolean),
      context: formData.context.trim() || undefined,
    });

    if (contact) {
      navigate(`/contacts/${contact.id}`, { replace: true });
    }
  };

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

      <div className="page-header">
        <div>
          <p className="page-eyebrow">New Contact</p>
          <h1>Add Contact</h1>
          <p>Create a contact manually when business card data is unavailable.</p>
        </div>
      </div>

      {contactStore.error ? (
        <p className="page-alert page-alert--error">{contactStore.error}</p>
      ) : null}

      <form className="contact-form-card" onSubmit={handleSubmit}>
        <div className="form-grid">
          <label>
            Full name
            <input
              value={formData.fullName}
              onChange={(event) => updateField("fullName", event.target.value)}
              placeholder="Nguyen Van A"
            />
          </label>

          <label>
            Position
            <input
              value={formData.position}
              onChange={(event) => updateField("position", event.target.value)}
              placeholder="Frontend Developer"
            />
          </label>

          <label>
            Company
            <input
              value={formData.company}
              onChange={(event) => updateField("company", event.target.value)}
              placeholder="Cardly"
            />
          </label>

          <label>
            Phone
            <input
              value={formData.phone}
              onChange={(event) => updateField("phone", event.target.value)}
              placeholder="+84..."
            />
          </label>

          <label>
            Email
            <input
              value={formData.email}
              onChange={(event) => updateField("email", event.target.value)}
              placeholder="name@company.com"
            />
          </label>

          <label>
            Website
            <input
              value={formData.website}
              onChange={(event) => updateField("website", event.target.value)}
              placeholder="https://company.com"
            />
          </label>

          <label className="form-grid__full">
            LinkedIn
            <input
              value={formData.linkedIn}
              onChange={(event) => updateField("linkedIn", event.target.value)}
              placeholder="https://linkedin.com/in/..."
            />
          </label>

          <label className="form-grid__full">
            Address
            <input
              value={formData.address}
              onChange={(event) => updateField("address", event.target.value)}
              placeholder="Company address"
            />
          </label>

          <label className="form-grid__full">
            AI Summary
            <textarea
              value={formData.aiSummary}
              onChange={(event) => updateField("aiSummary", event.target.value)}
              placeholder="Short summary about this contact"
            />
          </label>

          <label>
            Keywords
            <input
              value={formData.keywords}
              onChange={(event) => updateField("keywords", event.target.value)}
              placeholder="sales, tech, partner"
            />
          </label>

          <label>
            Highlights
            <textarea
              value={formData.highlights}
              onChange={(event) => updateField("highlights", event.target.value)}
              placeholder="One highlight per line"
            />
          </label>

          <label className="form-grid__full">
            Context
            <textarea
              value={formData.context}
              onChange={(event) => updateField("context", event.target.value)}
              placeholder="Where this contact was met or why it matters"
            />
          </label>
        </div>

        <button
          type="submit"
          className="primary-action-button"
          disabled={contactStore.isSaving}
        >
          <Save size={18} />
          {contactStore.isSaving ? "Saving..." : "Save Contact"}
        </button>
      </form>
    </section>
  );
});