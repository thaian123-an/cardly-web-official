import { api } from "../../../services/httpClient";
import type {
  ProfileResponse,
  UpdateProfilePayload,
} from "../types/profile.types";

export function getMyProfileApi() {
  return api.get<ProfileResponse>("/profile/me");
}

export function updateMyProfileApi(payload: UpdateProfilePayload) {
  return api.put<ProfileResponse>("/profile/me", payload);
}