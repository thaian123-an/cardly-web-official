import {
  ArrowLeft,
  Copy,
  ExternalLink,
  Globe,
  Mail,
  Phone,
  QrCode,
  Share2,
} from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../profile.css";

const defaultProfile = {
  fullName: "Cardly User",
  title: "Business Contact Manager",
  company: "Cardly",
  mobile: "+84 000 000 000",
  email: "user@cardly.com",
  website: "https://cardly.app",
  linkedIn: "https://linkedin.com",
  cardUrl: "https://cardly.app/u/cardly-user",
  bio: "Manage and share business card information in one connected workspace.",
};

export function DigitalCardPage() {
  const navigate = useNavigate();
  const [showQr, setShowQr] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(defaultProfile.cardUrl);
    setCopied(true);

    window.setTimeout(() => {
      setCopied(false);
    }, 1800);
  };

  return (
    <section className="profile-page">
      <button
        type="button"
        className="back-button"
        onClick={() => navigate("/home")}
      >
        <ArrowLeft size={18} />
        Back to Dashboard
      </button>

      <div className="page-header">
        <div>
          <p className="page-eyebrow">Digital Card</p>
          <h1>My Digital Card</h1>
          <p>
            Share your professional profile with a public link or QR code.
          </p>
        </div>

        <button
          type="button"
          className="primary-action-button"
          onClick={() => navigate("/edit-profile")}
        >
          Edit Profile
        </button>
      </div>

      <div className="digital-card-grid">
        <article className="digital-card-preview">
          <div className="digital-card-top">
            <span className="digital-avatar">
              {defaultProfile.fullName.slice(0, 2).toUpperCase()}
            </span>

            <div>
              <h2>{defaultProfile.fullName}</h2>
              <p>{defaultProfile.title}</p>
            </div>
          </div>

          <div className="digital-company">{defaultProfile.company}</div>

          <p className="digital-bio">{defaultProfile.bio}</p>

          <div className="digital-info-list">
            <span>
              <Phone size={17} />
              {defaultProfile.mobile}
            </span>
            <span>
              <Mail size={17} />
              {defaultProfile.email}
            </span>
            <span>
              <Globe size={17} />
              {defaultProfile.website}
            </span>
          </div>
        </article>

        <article className="profile-card-panel">
          <h2>Share Card</h2>
          <p>Use this public card link to share your digital profile.</p>

          <div className="public-link-box">
            <span>{defaultProfile.cardUrl}</span>
            <button type="button" onClick={handleCopy}>
              <Copy size={18} />
            </button>
          </div>

          {copied ? (
            <p className="profile-success-message">Copied to clipboard.</p>
          ) : null}

          <div className="share-actions">
            <button type="button">
              <Share2 size={18} />
              Share
            </button>
            <button type="button" onClick={() => setShowQr((value) => !value)}>
              <QrCode size={18} />
              QR Code
            </button>
            <a href={defaultProfile.cardUrl} target="_blank" rel="noreferrer">
              <ExternalLink size={18} />
              Open
            </a>
          </div>

          {showQr ? (
            <div className="qr-preview">
              <QrCode size={96} />
              <span>QR preview</span>
            </div>
          ) : null}
        </article>
      </div>
    </section>
  );
}