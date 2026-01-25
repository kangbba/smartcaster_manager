import { useState, useEffect } from "react";
import { TIMELINE_PLAYBACK } from "@/lib/config";

/**
 * 타임라인 재생 상태를 관리하는 커스텀 훅
 *
 * @param duration - 총 재생 시간 (초)
 * @param isPlaying - 재생 중 여부
 * @returns [position, setPosition] - 현재 위치와 setter
 *
 * @example
 * const [isPlaying, setIsPlaying] = useState(false);
 * const [position, setPosition] = useTimelinePlayback(10, isPlaying);
 */
export function useTimelinePlayback(duration: number, isPlaying: boolean) {
  const [position, setPosition] = useState(0);

  useEffect(() => {
    if (!isPlaying) return;

    const tickMs = TIMELINE_PLAYBACK.TICK_INTERVAL_MS;
    const step = tickMs / 1000;

    const intervalId = window.setInterval(() => {
      setPosition((prev) => {
        const next = prev + step;
        if (next >= duration) {
          return duration;
        }
        return next;
      });
    }, tickMs);

    return () => window.clearInterval(intervalId);
  }, [duration, isPlaying]);

  // duration이 변경되면 position을 조정
  useEffect(() => {
    setPosition((prev) => Math.min(prev, duration));
  }, [duration]);

  return [position, setPosition] as const;
}
