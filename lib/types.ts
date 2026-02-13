export type PostType = "brief" | "discussion";
export type ReportStatus = "open" | "reviewed" | "actioned";

export interface Profile {
  id: string;
  username: string;
  display_name: string;
  bio: string | null;
  avatar_url: string | null;
  role: "user" | "moderator" | "admin";
  created_at: string;
}

export interface Topic {
  id: number;
  name: string;
  slug: string;
}

export interface Post {
  id: number;
  author_id: string;
  type: PostType;
  title: string;
  body: string;
  topic_id: number;
  created_at: string;
  deleted_at: string | null;
}
