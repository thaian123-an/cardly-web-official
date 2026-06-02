export interface UserProfile {
  id: string;
  fullName: string;
  title: string;
  company: string;
  mobile: string;
  email: string;
  website: string;
  linkedIn: string;
  cardUrl: string;
  bio: string;
}

export interface ProfileResponse {
  data: UserProfile;
}

export interface UpdateProfilePayload {
  fullName: string;
  title: string;
  company: string;
  mobile: string;
  email: string;
  website: string;
  linkedIn: string;
  cardUrl: string;
  bio: string;
}