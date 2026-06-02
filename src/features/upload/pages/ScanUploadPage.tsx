import {
  BadgeCheck,
  FileImage,
  Loader2,
  Save,
  UploadCloud,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { saveExtractedContactApi } from "../services/uploadApi";
import type { Contact } from "../../contacts/types/contact.types";
import "../upload.css";

type CardSide = "front" | "back";

const emptyExtractedContact: Omit<Contact, "id" | "createdAt" | "updatedAt"> = {
  fullName: "",
  position: "",
  company: "",
  phone: "",
  email: "",
  address: "",
  website: "",
  linkedIn: "",
  aiSummary: "",
  keywords: [],
  highlights: [],
  context: "",
};

export function ScanUploadPage() {
  const navigate = useNavigate();

  const [frontFile, setFrontFile] = useState<File | null>(null);
  const [backFile, setBackFile] = useState<File | null>(null);
  const [frontPreview, setFrontPreview] = useState("");
  const [backPreview, setBackPreview] = useState("");

  const [uploadId, setUploadId] = useState("");
  const [isExtracting, setIsExtracting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [extractedContact, setExtractedContact] = useState<
    Omit<Contact, "id" | "createdAt" | "updatedAt">
  >(emptyExtractedContact);

  const hasSelectedFile = Boolean(frontFile || backFile);

  const canSave = useMemo(() => {
    return Boolean(
      extractedContact.fullName.trim() && extractedContact.email.trim()
    );
  }, [extractedContact.fullName, extractedContact.email]);

  const handleFileChange = (side: CardSide, file?: File) => {
    setError("");
    setSuccess("");

    if (!file) return;

    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "application/pdf"];

    if (!allowedTypes.includes(file.type)) {
      setError("Only JPG, PNG, WEBP, or PDF files are supported.");
      return;
    }

    const previewUrl = file.type.startsWith("image/")
      ? URL.createObjectURL(file)
      : "";

    if (side === "front") {
      setFrontFile(file);
      setFrontPreview(previewUrl);
    } else {
      setBackFile(file);
      setBackPreview(previewUrl);
    }
  };

  const clearFile = (side: CardSide) => {
    setError("");
    setSuccess("");

    if (side === "front") {
      setFrontFile(null);
      setFrontPreview("");
      return;
    }

    setBackFile(null);
    setBackPreview("");
  };

  const updateExtractedField = (
    field: keyof typeof extractedContact,
    value: string
  ) => {
    setExtractedContact((current) => ({
      ...current,
      [field]:
        field === "keywords"
          ? value
              .split(",")
              .map((item) => item.trim())
              .filter(Boolean)
          : field === "highlights"
            ? value
                .split("\n")
                .map((item) => item.trim())
                .filter(Boolean)
            : value,
    }));
  };

  const handleExtract = async () => {
    if (!hasSelectedFile) {
      setError("Please upload at least one business card image.");
      return;
    }

    setIsExtracting(true);
    setError("");
    setSuccess("");

    try {
      /**
       * Khi backend sẵn sàng:
       * 1. Upload file qua /business-cards/upload
       * 2. Nhận uploadId
       * 3. Gọi /business-cards/extract
       *
       * Hiện tại chưa có backend nên form bên dưới cho phép nhập/chỉnh thông tin
       * để FE vẫn hoàn thiện flow chính thức.
       */

      setUploadId((current) => current || `local-${Date.now()}`);

      setExtractedContact((current) => ({
        ...current,
        fullName: current.fullName || "",
        position: current.position || "",
        company: current.company || "",
        email: current.email || "",
        phone: current.phone || "",
        address: current.address || "",
        keywords: current.keywords.length ? current.keywords : [],
        highlights: current.highlights.length ? current.highlights : [],
      }));

      setSuccess("Extraction form is ready. Please review and complete contact information.");
    } catch (extractError) {
      setError(
        extractError instanceof Error
          ? extractError.message
          : "Unable to extract information."
      );
    } finally {
      setIsExtracting(false);
    }
  };

  const handleSaveContact = async () => {
    if (!canSave) {
      setError("Full name and email are required before saving contact.");
      return;
    }

    setIsSaving(true);
    setError("");
    setSuccess("");

    try {
      const response = await saveExtractedContactApi({
        uploadId,
        contact: extractedContact,
      });

      setSuccess(response.message || "Contact has been saved successfully.");

      window.setTimeout(() => {
        navigate(`/contacts/${response.data.id}`, { replace: true });
      }, 800);
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : "Unable to save contact."
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <section className="upload-page">
      <div className="page-header">
        <div>
          <p className="page-eyebrow">Scan & Upload</p>
          <h1>Upload Business Card</h1>
          <p>
            Upload front and back images of a business card, review extracted
            OCR data, and save the contact.
          </p>
        </div>
      </div>

      {error ? <p className="page-alert page-alert--error">{error}</p> : null}
      {success ? (
        <p className="page-alert page-alert--success">{success}</p>
      ) : null}

      <div className="upload-grid">
        <article className="upload-card">
          <div className="section-heading">
            <div>
              <h2>Business Card Images</h2>
              <p>Upload the front side and optional back side.</p>
            </div>
          </div>

          <div className="card-side-grid">
            <label className="card-upload-box">
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp,application/pdf"
                onChange={(event) =>
                  handleFileChange("front", event.target.files?.[0])
                }
              />

              {frontPreview ? (
                <img src={frontPreview} alt="Front business card preview" />
              ) : (
                <span>
                  <UploadCloud size={32} />
                  <strong>Upload front side</strong>
                  <small>JPG, PNG, WEBP, or PDF</small>
                </span>
              )}
            </label>

            {frontFile ? (
              <div className="selected-file">
                <FileImage size={18} />
                <span>{frontFile.name}</span>
                <button type="button" onClick={() => clearFile("front")}>
                  <X size={16} />
                </button>
              </div>
            ) : null}

            <label className="card-upload-box">
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp,application/pdf"
                onChange={(event) =>
                  handleFileChange("back", event.target.files?.[0])
                }
              />

              {backPreview ? (
                <img src={backPreview} alt="Back business card preview" />
              ) : (
                <span>
                  <UploadCloud size={32} />
                  <strong>Upload back side</strong>
                  <small>Optional</small>
                </span>
              )}
            </label>

            {backFile ? (
              <div className="selected-file">
                <FileImage size={18} />
                <span>{backFile.name}</span>
                <button type="button" onClick={() => clearFile("back")}>
                  <X size={16} />
                </button>
              </div>
            ) : null}
          </div>

          <button
            type="button"
            className="primary-action-button upload-main-button"
            onClick={handleExtract}
            disabled={isExtracting || !hasSelectedFile}
          >
            {isExtracting ? <Loader2 size={18} className="spin-icon" /> : null}
            {isExtracting ? "Extracting..." : "Extract Information"}
          </button>
        </article>

        <article className="upload-card">
          <div className="section-heading">
            <div>
              <h2>OCR Result</h2>
              <p>Review and edit extracted information before saving.</p>
            </div>
          </div>

          <div className="ocr-form-grid">
            <label>
              Full name
              <input
                value={extractedContact.fullName}
                onChange={(event) =>
                  updateExtractedField("fullName", event.target.value)
                }
              />
            </label>

            <label>
              Position
              <input
                value={extractedContact.position}
                onChange={(event) =>
                  updateExtractedField("position", event.target.value)
                }
              />
            </label>

            <label>
              Company
              <input
                value={extractedContact.company}
                onChange={(event) =>
                  updateExtractedField("company", event.target.value)
                }
              />
            </label>

            <label>
              Phone
              <input
                value={extractedContact.phone}
                onChange={(event) =>
                  updateExtractedField("phone", event.target.value)
                }
              />
            </label>

            <label>
              Email
              <input
                value={extractedContact.email}
                onChange={(event) =>
                  updateExtractedField("email", event.target.value)
                }
              />
            </label>

            <label>
              Website
              <input
                value={extractedContact.website}
                onChange={(event) =>
                  updateExtractedField("website", event.target.value)
                }
              />
            </label>

            <label className="ocr-form-grid__full">
              Address
              <input
                value={extractedContact.address}
                onChange={(event) =>
                  updateExtractedField("address", event.target.value)
                }
              />
            </label>

            <label className="ocr-form-grid__full">
              AI Summary
              <textarea
                value={extractedContact.aiSummary}
                onChange={(event) =>
                  updateExtractedField("aiSummary", event.target.value)
                }
              />
            </label>

            <label>
              Keywords
              <input
                value={extractedContact.keywords.join(", ")}
                onChange={(event) =>
                  updateExtractedField("keywords", event.target.value)
                }
                placeholder="partner, sales, tech"
              />
            </label>

            <label>
              Highlights
              <textarea
                value={extractedContact.highlights.join("\n")}
                onChange={(event) =>
                  updateExtractedField("highlights", event.target.value)
                }
                placeholder="One highlight per line"
              />
            </label>

            <label className="ocr-form-grid__full">
              Context
              <textarea
                value={extractedContact.context}
                onChange={(event) =>
                  updateExtractedField("context", event.target.value)
                }
              />
            </label>
          </div>

          <button
            type="button"
            className="primary-action-button upload-main-button"
            onClick={handleSaveContact}
            disabled={isSaving || !canSave}
          >
            {isSaving ? (
              <Loader2 size={18} className="spin-icon" />
            ) : (
              <Save size={18} />
            )}
            {isSaving ? "Saving..." : "Save Contact"}
          </button>

          <div className="upload-note">
            <BadgeCheck size={18} />
            <span>
              This page is ready for backend OCR API integration. The result
              fields are editable before saving.
            </span>
          </div>
        </article>
      </div>
    </section>
  );
}