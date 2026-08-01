export type Role = "ADMIN" | "MENTOR" | "PARTICIPANT";

export interface CurrentUser {
  id: number;
  email: string;
  role_id: number;
  role: Role;
}

export interface Badge {
  id: number;
  name: string;
  description: string | null;
  level: string;
}

export type RequestStatus = "PENDING" | "APPROVED" | "REJECTED";

export interface MyBadgeRequest {
  id: number;
  badge_id: number;
  badge: string;
  badge_level: string;
  status: RequestStatus;
  comment: string | null;
  requested_at: string;
}

export interface IncomingBadgeRequest {
  id: number;
  user: string;
  user_name: string;
  badge: string;
  badge_level: string;
  status: RequestStatus;
  comment: string | null;
  requested_at: string;
  validated_by?: string | null;
}

export interface EarnedBadge {
  id: number;
  badge_id: number;
  name: string;
  description: string | null;
  level: string;
  comment: string | null;
  assigned_at: string;
}
