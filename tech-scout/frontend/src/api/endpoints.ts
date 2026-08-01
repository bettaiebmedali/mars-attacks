import { api } from "./client";
import type {
  Badge,
  CurrentUser,
  EarnedBadge,
  IncomingBadgeRequest,
  MyBadgeRequest,
} from "../types";

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
}

export const authApi = {
  login: (payload: LoginPayload) =>
    api.post<{ access_token: string; token_type: string }>(
      "/api/auth/login",
      payload
    ),
  register: (payload: RegisterPayload) =>
    api.post("/api/auth/register", payload),
  me: () => api.get<CurrentUser>("/api/auth/me"),
};

export const badgesApi = {
  list: () => api.get<Badge[]>("/api/badges/"),
  myEarned: () => api.get<EarnedBadge[]>("/api/badges/me/earned"),
};

export const badgeRequestsApi = {
  create: (badge_id: number, comment: string) =>
    api.post<MyBadgeRequest>("/api/badge-requests/", { badge_id, comment }),
  mine: () => api.get<MyBadgeRequest[]>("/api/badge-requests/me"),
  pending: () => api.get<IncomingBadgeRequest[]>("/api/badge-requests/pending"),
  all: () => api.get<IncomingBadgeRequest[]>("/api/badge-requests/"),
  approve: (id: number) =>
    api.post<{ message: string }>(`/api/badge-requests/${id}/approve`),
  reject: (id: number) =>
    api.post<{ message: string }>(`/api/badge-requests/${id}/reject`),
};
