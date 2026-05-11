import type { Role } from "@/generated/prisma";

// ==========================================
// Extended NextAuth Session types
// ==========================================
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name: string;
      email: string;
      image?: string | null;
      role: Role;
      hasVoted: boolean;
    };
  }

  interface User {
    role?: Role;
    hasVoted?: boolean;
  }
}

declare module "@auth/core/jwt" {
  interface JWT {
    id: string;
    role: Role;
    hasVoted: boolean;
  }
}

// ==========================================
// API Response types
// ==========================================
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// ==========================================
// Candidate types for frontend
// ==========================================
export interface CandidatePublic {
  id: string;
  name: string;
  photo: string;
  faculty: string;
  major: string;
  vision: string;
  mission: string;
  programWork: string;
  order: number;
}

// ==========================================
// Voting result types
// ==========================================
export interface VoteResult {
  candidateId: string;
  candidateName: string;
  candidatePhoto: string;
  faculty: string;
  totalVotes: number;
  percentage: number;
  rank: number;
}

// ==========================================
// Transparency log types
// ==========================================
export interface TransparencyLogEntry {
  name: string;
  votedAt: string;
  status: "sudah memilih";
}

// ==========================================
// Admin types
// ==========================================
export interface AdminSession {
  id: string;
  username: string;
  name: string;
  role: "ADMIN";
}

export interface VotingSettingsPublic {
  isOpen: boolean;
  startTime: string;
  endTime: string;
  title: string;
  description: string | null;
}
