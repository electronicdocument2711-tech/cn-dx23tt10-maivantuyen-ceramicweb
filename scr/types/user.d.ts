export interface User {
  id: number;
  documentId: string;
  username: string;
  email: string;
  provider: string;
  confirmed: boolean;
  blocked: boolean;
  createdAt: Date;
  updatedAt: Date;
  publishedAt: Date;
  user_profile: UserProfile;
}
