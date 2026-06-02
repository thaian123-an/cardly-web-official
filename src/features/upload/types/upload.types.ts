import type { Contact } from "../../contacts/types/contact.types";

export interface BusinessCardFile {
  frontFile?: File;
  backFile?: File;
}

export interface UploadBusinessCardResponse {
  uploadId: string;
  message: string;
}

export interface ExtractBusinessCardResponse {
  data: Contact;
  message?: string;
}

export interface SaveExtractedContactPayload {
  uploadId?: string;
  contact: Omit<Contact, "id" | "createdAt" | "updatedAt">;
}

export interface SaveExtractedContactResponse {
  data: Contact;
  message: string;
}