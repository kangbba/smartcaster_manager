/**
 * Formatting Utilities
 * 파일 크기, 시간, 날짜 등의 포맷팅 함수
 */

/**
 * 파일 크기를 MB 단위로 포맷팅
 * @example formatFileSize(1048576) // "1.0 MB"
 */
export function formatFileSize(sizeBytes: number): string {
  if (!Number.isFinite(sizeBytes)) return "0 MB";
  const mb = sizeBytes / (1024 * 1024);
  return `${mb.toFixed(1)} MB`;
}

/**
 * 초를 "분:초" 형식으로 포맷팅
 * @example formatDurationSeconds(125) // "2:05"
 */
export function formatDurationSeconds(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

/**
 * 여러 시간의 총합을 "분 초" 형식으로 포맷팅
 * @example formatTotalDuration([60, 45, 30]) // "2분 15초"
 */
export function formatTotalDuration(durations: number[]): string {
  const totalSeconds = durations.reduce((sum, duration) => sum + duration, 0);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}분 ${seconds}초`;
}

/**
 * 파일명을 안전한 경로 세그먼트로 변환
 * @example sanitizeFileName("파일 이름!@#.jpg") // "파일_이름___.jpg"
 */
export function sanitizeFileName(name: string): string {
  const normalized = name.normalize("NFKD").replace(/[^a-zA-Z0-9._-]/g, "_");
  return normalized.replace(/_+/g, "_").replace(/^_+|_+$/g, "") || "file";
}

/**
 * 날짜를 YYYY-MM-DD 형식으로 포맷팅
 * @example formatDate("2024-01-15T10:30:00Z") // "2024-01-15"
 */
export function formatDate(dateString: string): string {
  return dateString.slice(0, 10);
}
