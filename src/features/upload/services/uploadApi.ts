import type {
  ExtractBusinessCardResponse,
  SaveExtractedContactPayload,
  SaveExtractedContactResponse,
  UploadBusinessCardResponse,
} from "../types/upload.types";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "";

function buildUrl(endpoint: string) {
  const normalizedBaseUrl = API_BASE_URL.replace(/\/$/, "");
  const normalizedEndpoint = endpoint.startsWith("/")
    ? endpoint
    : `/${endpoint}`;

  return `${normalizedBaseUrl}${normalizedEndpoint}`;
}

async function parseResponse(response: Response) {
  const contentType = response.headers.get("content-type");

  if (contentType?.includes("application/json")) {
    return response.json();
  }

  return response.text();
}

export async function uploadBusinessCardApi(files: {
  frontFile?: File;
  backFile?: File;
}) {
  const formData = new FormData();

  if (files.frontFile) {
    formData.append("frontFile", files.frontFile);
  }

  if (files.backFile) {
    formData.append("backFile", files.backFile);
  }

  const response = await fetch(buildUrl("/business-cards/upload"), {
    method: "POST",
    credentials: "include",
    body: formData,
  });

  const data = await parseResponse(response).catch(() => null);

  if (!response.ok) {
    throw new Error(
      typeof data === "object" &&
        data !== null &&
        "message" in data &&
        typeof data.message === "string"
        ? data.message
        : "Unable to upload business card."
    );
  }

  return data as UploadBusinessCardResponse;
}

export async function extractBusinessCardApi(uploadId: string) {
  const response = await fetch(buildUrl("/business-cards/extract"), {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ uploadId }),
  });

  const data = await parseResponse(response).catch(() => null);

  if (!response.ok) {
    throw new Error(
      typeof data === "object" &&
        data !== null &&
        "message" in data &&
        typeof data.message === "string"
        ? data.message
        : "Unable to extract business card information."
    );
  }

  return data as ExtractBusinessCardResponse;
}

export async function saveExtractedContactApi(
  payload: SaveExtractedContactPayload
) {
  const response = await fetch(buildUrl("/business-cards/save-contact"), {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const data = await parseResponse(response).catch(() => null);

  if (!response.ok) {
    throw new Error(
      typeof data === "object" &&
        data !== null &&
        "message" in data &&
        typeof data.message === "string"
        ? data.message
        : "Unable to save extracted contact."
    );
  }

  return data as SaveExtractedContactResponse;
}