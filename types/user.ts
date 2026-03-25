export interface User {
  id: string;
  email: string;
  name?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserSession {
  id: string;
  email: string;
  name?: string;
}
