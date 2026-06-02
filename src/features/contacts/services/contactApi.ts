import { api } from "../../../services/httpClient";
import type {
  ContactResponse,
  ContactsResponse,
  CreateContactPayload,
  UpdateContactPayload,
} from "../types/contact.types";

export function getContactsApi() {
  return api.get<ContactsResponse>("/contacts");
}

export function getContactByIdApi(contactId: string) {
  return api.get<ContactResponse>(`/contacts/${contactId}`);
}

export function createContactApi(payload: CreateContactPayload) {
  return api.post<ContactResponse>("/contacts", payload);
}

export function updateContactApi(contactId: string, payload: UpdateContactPayload) {
  return api.put<ContactResponse>(`/contacts/${contactId}`, payload);
}

export function deleteContactApi(contactId: string) {
  return api.delete<{ message: string }>(`/contacts/${contactId}`);
}