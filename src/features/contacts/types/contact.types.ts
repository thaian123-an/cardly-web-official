export interface Contact {
  id: string;
  fullName: string;
  position: string;
  company: string;
  phone: string;
  email: string;
  address: string;
  website?: string;
  linkedIn?: string;
  avatarUrl?: string;
  aiSummary?: string;
  keywords: string[];
  highlights: string[];
  context?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface CreateContactPayload {
  fullName: string;
  position: string;
  company: string;
  phone: string;
  email: string;
  address: string;
  website?: string;
  linkedIn?: string;
  aiSummary?: string;
  keywords?: string[];
  highlights?: string[];
  context?: string;
}

export interface UpdateContactPayload extends Partial<CreateContactPayload> {}

export interface ContactsResponse {
  data: Contact[];
}

export interface ContactResponse {
  data: Contact;
}