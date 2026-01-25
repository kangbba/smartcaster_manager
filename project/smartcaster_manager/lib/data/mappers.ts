/**
 * Data Mappers
 * Database row 타입을 Domain 타입으로 변환하는 단일 진실 공급원
 */

import type { Slide, MediaFile } from "@/lib/types";
import type { SlideRow, MediaRow } from "@/lib/types/database";

/**
 * MediaRow → MediaFile 변환
 */
export function mapDbMediaToMediaFile(row: MediaRow): MediaFile {
  return {
    id: row.id,
    name: row.name,
    type: row.type === "video" ? "video" : row.type === "image" ? "image" : "audio",
    size: formatFileSize(row.size_bytes || 0),
    durationSeconds: row.duration_seconds ?? undefined,
    uploadDate: row.created_at?.slice(0, 10) || "",
    url: row.url || undefined,
    bucket: row.bucket,
    path: row.path,
  };
}

/**
 * SlideRow → Slide 변환
 *
 * @param row - Database row
 * @param mediaById - Media lookup map
 * @param projectName - Project name for display
 */
export function mapDbSlideToSlide(
  row: SlideRow,
  mediaById: Map<string, MediaRow>,
  projectName: string
): Slide {
  const content = (row.content || {}) as Record<string, unknown>;
  const mediaItem = row.media_id ? mediaById.get(row.media_id) : null;
  const audioItem = row.audio_media_id ? mediaById.get(row.audio_media_id) : null;

  return {
    id: row.id,
    name: row.name || "슬라이드",
    projectId: row.project_id,
    projectName,
    backgroundColor: row.background_color,

    // Media
    image: mediaItem?.type === "image" ? mediaItem.name : undefined,
    video: mediaItem?.type === "video" ? mediaItem.name : undefined,
    mediaId: row.media_id || undefined,
    audio: audioItem?.type === "audio" ? audioItem.name : undefined,
    audioMediaId: row.audio_media_id || undefined,

    // Media Transform
    mediaScaleX: typeof content.mediaScaleX === "number" ? content.mediaScaleX : undefined,
    mediaScaleY: typeof content.mediaScaleY === "number" ? content.mediaScaleY : undefined,
    mediaOffsetX: typeof content.mediaOffsetX === "number" ? content.mediaOffsetX : undefined,
    mediaOffsetY: typeof content.mediaOffsetY === "number" ? content.mediaOffsetY : undefined,

    // Text
    text: typeof content.text === "string" ? content.text : undefined,
    textColor: typeof content.textColor === "string" ? content.textColor : undefined,
    fontSize: typeof content.fontSize === "number" ? content.fontSize : undefined,
    textPositionX: typeof content.textPositionX === "number" ? content.textPositionX : undefined,
    textPositionY: typeof content.textPositionY === "number" ? content.textPositionY : undefined,

    // Text Animation
    textAnimation:
      typeof content.textAnimation === "string"
        ? (content.textAnimation as Slide["textAnimation"])
        : undefined,
    textAnimationDuration:
      typeof content.textAnimationDuration === "number"
        ? content.textAnimationDuration
        : undefined,
    textAnimationDelay:
      typeof content.textAnimationDelay === "number" ? content.textAnimationDelay : undefined,
    textAnimationRepeat:
      typeof content.textAnimationRepeat === "number"
        ? content.textAnimationRepeat
        : undefined,
    textAnimationGap:
      typeof content.textAnimationGap === "number" ? content.textAnimationGap : undefined,
    textFadeInDuration:
      typeof content.textFadeInDuration === "number"
        ? content.textFadeInDuration
        : undefined,
    textFadeOutDuration:
      typeof content.textFadeOutDuration === "number"
        ? content.textFadeOutDuration
        : undefined,

    // Resolution & Duration
    resolutionWidth: row.resolution_width,
    resolutionHeight: row.resolution_height,
    duration: row.duration_seconds,
  };
}

/**
 * Slide → SlideRow content 변환 (저장용)
 */
export function buildSlideContent(slide: Slide) {
  return {
    text: slide.text ?? null,
    textColor: slide.textColor ?? null,
    fontSize: slide.fontSize ?? null,
    textPositionX: slide.textPositionX ?? null,
    textPositionY: slide.textPositionY ?? null,

    textAnimation: slide.textAnimation ?? null,
    textAnimationDuration: slide.textAnimationDuration ?? null,
    textAnimationDelay: slide.textAnimationDelay ?? null,
    textAnimationRepeat: slide.textAnimationRepeat ?? null,
    textAnimationGap: slide.textAnimationGap ?? null,
    textFadeInDuration: slide.textFadeInDuration ?? null,
    textFadeOutDuration: slide.textFadeOutDuration ?? null,

    mediaScaleX: slide.mediaScaleX ?? null,
    mediaScaleY: slide.mediaScaleY ?? null,
    mediaOffsetX: slide.mediaOffsetX ?? null,
    mediaOffsetY: slide.mediaOffsetY ?? null,
  };
}

// Helper
function formatFileSize(sizeBytes: number): string {
  if (!Number.isFinite(sizeBytes)) return "0 MB";
  const mb = sizeBytes / (1024 * 1024);
  return `${mb.toFixed(1)} MB`;
}
