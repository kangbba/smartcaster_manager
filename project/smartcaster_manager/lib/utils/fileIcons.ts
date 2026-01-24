/**
 * 파일 타입별 아이콘 유틸리티
 */

export function getFileIcon(type: string): string {
  if (type.startsWith("image") || type === "image") return "🖼️";
  if (type.startsWith("video") || type === "video") return "🎥";
  return "📄";
}

/**
 * 총 재생 시간 계산
 * @param durations - 재생 시간 배열 (초 단위)
 * @returns "X분 Y초" 형식의 문자열
 */
export function formatTotalDuration(durations: number[]): string {
  const totalSeconds = durations.reduce((sum, duration) => sum + duration, 0);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}분 ${seconds}초`;
}

export function formatDurationSeconds(seconds: number): string {
  const safe = Math.max(0, Math.floor(seconds));
  const mins = Math.floor(safe / 60);
  const secs = safe % 60;
  return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
}
