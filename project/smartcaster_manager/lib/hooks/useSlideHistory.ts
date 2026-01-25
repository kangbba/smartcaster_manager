import { useCallback, useRef, useState } from "react";
import { Slide } from "@/lib/types";

export type HistoryEntry = {
  slide: Slide;
  timestamp: number;
};

export function useSlideHistory(initialSlide: Slide | null) {
  const [currentSlide, setCurrentSlide] = useState<Slide | null>(initialSlide);
  const historyRef = useRef<HistoryEntry[]>([]);
  const currentIndexRef = useRef<number>(-1);

  // Initialize history with initial slide
  if (initialSlide && historyRef.current.length === 0) {
    historyRef.current = [{ slide: initialSlide, timestamp: Date.now() }];
    currentIndexRef.current = 0;
  }

  const canUndo = currentIndexRef.current > 0;
  const canRedo = currentIndexRef.current < historyRef.current.length - 1;

  const pushHistory = useCallback((slide: Slide) => {
    // Remove any future history if we're not at the end
    if (currentIndexRef.current < historyRef.current.length - 1) {
      historyRef.current = historyRef.current.slice(0, currentIndexRef.current + 1);
    }

    // Add new entry
    historyRef.current.push({ slide, timestamp: Date.now() });
    currentIndexRef.current = historyRef.current.length - 1;

    // Limit history to 50 entries
    if (historyRef.current.length > 50) {
      historyRef.current.shift();
      currentIndexRef.current--;
    }

    setCurrentSlide(slide);
  }, []);

  const undo = useCallback(() => {
    if (!canUndo) return null;

    currentIndexRef.current--;
    const entry = historyRef.current[currentIndexRef.current];
    setCurrentSlide(entry.slide);
    return entry.slide;
  }, [canUndo]);

  const redo = useCallback(() => {
    if (!canRedo) return null;

    currentIndexRef.current++;
    const entry = historyRef.current[currentIndexRef.current];
    setCurrentSlide(entry.slide);
    return entry.slide;
  }, [canRedo]);

  const resetHistory = useCallback((slide: Slide) => {
    historyRef.current = [{ slide, timestamp: Date.now() }];
    currentIndexRef.current = 0;
    setCurrentSlide(slide);
  }, []);

  return {
    currentSlide,
    pushHistory,
    undo,
    redo,
    canUndo,
    canRedo,
    resetHistory,
  };
}
