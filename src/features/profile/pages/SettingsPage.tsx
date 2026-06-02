import {
  Bell,
  ChevronRight,
  HelpCircle,
  Lock,
  Pencil,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import "../profile.css";

export function SettingsPage() {
  const navigate = useNavigate();

  const settings = [
    {
      icon: Bell,
      title: "Notifications",
      description: "Manage contact review and upload notifications.",
    },
    {
      icon: ShieldCheck,
      title: "Privacy",
      description: "Control how your data and digital card are shared.",
    },
    {
      icon: Lock,
      title: "Security",
      description: "Password and account security settings.",
    },
    {
      icon: HelpCircle,
      title: "Help",
      description: "Get support and view frequently asked questions.",
    },
  ];

  return (
    <section className="profile-page">
      <div className="page-header">
        <div>
          <p className="page-eyebrow">Settings</p>
          <h1>Account Settings</h1>
          <p>Manage your Cardly profile, privacy, and app preferences.</p>
        </div>
      </div>

      <article className="settings-profile-card">
        <div className="settings-profile-main">
          <span className="settings-avatar">
            <UserRound size={26} />
          </span>

          <div>
            <h2>Cardly User</h2>
            <p>user@cardly.com</p>
          </div>
        </div>

        <button
          type="button"
          className="settings-edit-button"
          onClick={() => navigate("/edit-profile")}
        >
          <Pencil size={18} />
        </button>
      </article>

      <div className="settings-list">
        {settings.map((setting) => {
          const Icon = setting.icon;

          return (
            <button type="button" key={setting.title} className="settings-row">
              <span className="settings-row__icon">
                <Icon size={20} />
              </span>

              <span>
                <strong>{setting.title}</strong>
                <small>{setting.description}</small>
              </span>

              <ChevronRight size={20} />
            </button>
          );
        })}
      </div>

      <p className="version-text">Cardly Web v1.0.0</p>
    </section>
  );
}