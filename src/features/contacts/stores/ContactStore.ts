import { makeAutoObservable, runInAction } from "mobx";
import {
  createContactApi,
  deleteContactApi,
  getContactByIdApi,
  getContactsApi,
} from "../services/contactApi";
import type { Contact, CreateContactPayload } from "../types/contact.types";

class ContactStore {
  contacts: Contact[] = [];
  selectedContact: Contact | null = null;

  isLoading = false;
  isSaving = false;
  error = "";
  success = "";

  constructor() {
    makeAutoObservable(this);
  }

  get totalContacts() {
    return this.contacts.length;
  }

  get recentContacts() {
    return [...this.contacts]
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
      .slice(0, 5);
  }

  get savedCardsCount() {
    return this.contacts.length;
  }

  clearMessages() {
    this.error = "";
    this.success = "";
  }

  findContactById(contactId: string) {
    return this.contacts.find((contact) => contact.id === contactId) || null;
  }

  async loadContacts() {
    this.isLoading = true;
    this.clearMessages();

    try {
      const response = await getContactsApi();

      runInAction(() => {
        this.contacts = response.data;
      });
    } catch (error) {
      runInAction(() => {
        this.error =
          error instanceof Error
            ? error.message
            : "Unable to load contacts. Please try again.";
      });
    } finally {
      runInAction(() => {
        this.isLoading = false;
      });
    }
  }

  async loadContactById(contactId: string) {
    this.isLoading = true;
    this.clearMessages();

    const existingContact = this.findContactById(contactId);

    if (existingContact) {
      this.selectedContact = existingContact;
    }

    try {
      const response = await getContactByIdApi(contactId);

      runInAction(() => {
        this.selectedContact = response.data;

        const existingIndex = this.contacts.findIndex(
          (contact) => contact.id === response.data.id
        );

        if (existingIndex >= 0) {
          this.contacts[existingIndex] = response.data;
        } else {
          this.contacts.push(response.data);
        }
      });
    } catch (error) {
      runInAction(() => {
        if (!existingContact) {
          this.selectedContact = null;
        }

        this.error =
          error instanceof Error
            ? error.message
            : "Unable to load contact detail.";
      });
    } finally {
      runInAction(() => {
        this.isLoading = false;
      });
    }
  }

  async createContact(payload: CreateContactPayload) {
    this.isSaving = true;
    this.clearMessages();

    try {
      const response = await createContactApi(payload);

      runInAction(() => {
        this.contacts.unshift(response.data);
        this.selectedContact = response.data;
        this.success = "Contact has been saved successfully.";
      });

      return response.data;
    } catch (error) {
      runInAction(() => {
        this.error =
          error instanceof Error
            ? error.message
            : "Unable to save contact. Please try again.";
      });

      return null;
    } finally {
      runInAction(() => {
        this.isSaving = false;
      });
    }
  }

  async deleteContact(contactId: string) {
    this.isSaving = true;
    this.clearMessages();

    try {
      await deleteContactApi(contactId);

      runInAction(() => {
        this.contacts = this.contacts.filter(
          (contact) => contact.id !== contactId
        );

        if (this.selectedContact?.id === contactId) {
          this.selectedContact = null;
        }

        this.success = "Contact has been deleted successfully.";
      });

      return true;
    } catch (error) {
      runInAction(() => {
        this.error =
          error instanceof Error
            ? error.message
            : "Unable to delete contact. Please try again.";
      });

      return false;
    } finally {
      runInAction(() => {
        this.isSaving = false;
      });
    }
  }
}

export const contactStore = new ContactStore();