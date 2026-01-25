/**
 * Database Row Types
 * Supabase에서 반환되는 raw 데이터 타입 정의
 */

export type ProjectRow = {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
};

export type MediaRow = {
  id: string;
  name: string;
  type: "video" | "image" | "audio" | "other";
  bucket: string;
  path: string;
  url: string;
  size_bytes: number;
  duration_seconds: number | null;
  mime_type: string | null;
  width: number | null;
  height: number | null;
  created_at: string;
};

export type SlideRow = {
  id: string;
  project_id: string;
  name: string | null;
  type: "color" | "image" | "video";
  media_id: string | null;
  audio_media_id: string | null;
  duration_seconds: number;
  background_color: string;
  resolution_width: number;
  resolution_height: number;
  order_index: number;
  content: Record<string, unknown> | null;
  created_at: string;
};

export type PlaylistRow = {
  id: string;
  name: string;
  description: string | null;
  slide_ids: string[];
  status: "active" | "draft";
  created_at: string;
};

export type AssignmentRow = {
  id: string;
  device_id: string;
  playlist_id: string | null;
  created_at: string;
  updated_at: string;
};
