/**
 * 파일 타입별 아이콘 유틸리티
 */

export function getFileIcon(type: string): string {
  if (type.startsWith("image") || type === "image") return "🖼️";
  if (type.startsWith("video") || type === "video") return "🎥";
  if (type.startsWith("audio") || type === "audio") return "🎵";
  return "📄";
}

/**
 * @deprecated Use formatTotalDuration from @/lib/utils/formatting instead
 */
export { formatTotalDuration } from "./formatting";

/**
 * @deprecated Use formatDurationSeconds from @/lib/utils/formatting instead
 */
export { formatDurationSeconds } from "./formatting";
