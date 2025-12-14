// src/types/UserType.ts

export interface UserType {
  id?: number;
  loginId?: string;
  nickname: string;
  level: number;
  points: number;
  profileImage?: string;
  profileBackground?: string;
  avatarIcon?: string;
  profileFrame?: string;
  profileBadge?: string;
  role: "USER" | "ADMIN" | "SUPER_ADMIN";
}