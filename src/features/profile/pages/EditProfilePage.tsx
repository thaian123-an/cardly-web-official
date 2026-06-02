import { ArrowLeft, Save } from "lucide-react";
import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { updateMyProfileApi } from "../services/profileApi";
import "../profile.css";

export function EditProfilePage() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: "Cardly User",
    title: "Business Contact Manager",
    company: "Cardly",
    mobile: "+84 000 000 000",
    email: "user@cardly.com",
    website: "https://cardly.app",
    linkedIn: "https://linkedin.com",
    cardUrl: "https://cardly.app/u/cardly-user",
    bio: "Manage and share business card information in one connected workspace.",
  });

  const [isSaving, setIsSaving] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const updateField = (field: keyof typeof formData, value: string) => {
    setFormData((current) => ({
      ...current,
      [field]: value,
    }));

    setSuccess("");
    setError("");
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    if (!formData.fullName.trim() || !formData.email.trim()) {
      setError("Full name and email are required.");
      return;
    }

    setIsSaving(true);
    setSuccess("");
    setError("");

    try {
      await updateMyProfileApi(formData);
      setSuccess("Profile has been updated successfully.");

      window.setTimeout(() => {
        setSuccess("");
      }, 2500);
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : "Unable to update profile."
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <section className="profile-page">
      <button
        type="button"
        className="back-button"
        onClick={() => navigate("/digital-card")}
      >
        <ArrowLeft size={18} />
        Back to Digital Card
      </button>

      <div className="page-header">
        <div>
          <p className="page-eyebrow">Profile</p>
          <h1>Edit Profile</h1>
          <p>Update your digital business card information.</p>
        </div>
      </div>

      {success ? (
        <p className="page-alert page-alert--success">{success}</p>
      ) : null}

      {error ? <p className="page-alert page-alert--error">{error}</p> : null}

      <form className="profile-form-card" onSubmit={handleSubmit}>
        <div className="profile-form-grid">
          <label>
            Full name
            <input
              value={formData.fullName}
              onChange={(event) => updateField("fullName", event.target.value)}
            />
          </label>

          <label>
            Title
            <input
              value={formData.title}
              onChange={(event) => updateField("title", event.target.value)}
            />
          </label>

          <label>
            Company
            <input
              value={formData.company}
              onChange={(event) => updateField("company", event.target.value)}
            />
          </label>

          <label>
            Mobile
            <input
              value={formData.mobile}
              onChange={(event) => updateField("mobile", event.target.value)}
            />
          </label>

          <label>
            Email
            <input
              value={formData.email}
              onChange={(event) => updateField("email", event.target.value)}
            />
          </label>

          <label>
            Website
            <input
              value={formData.website}
              onChange={(event) => updateField("website", event.target.value)}
            />
          </label>

          <label>
            LinkedIn
            <input
              value={formData.linkedIn}
              onChange={(event) => updateField("linkedIn", event.target.value)}
            />
          </label>

          <label>
            Card URL
            <input
              value={formData.cardUrl}
              onChange={(event) => updateField("cardUrl", event.target.value)}
            />
          </label>

          <label className="profile-form-grid__full">
            Bio
            <textarea
              value={formData.bio}
              onChange={(event) => updateField("bio", event.target.value)}
            />
          </label>
        </div>

        <button
          type="submit"
          className="primary-action-button"
          disabled={isSaving}
        >
          <Save size={18} />
          {isSaving ? "Saving..." : "Save Changes"}
        </button>
      </form>
    </section>
  );
}