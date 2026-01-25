import { useLayoutEffect, useState, type RefObject } from "react";

/**
 * Element 크기 변화를 추적하는 커스텀 훅
 *
 * ResizeObserver를 사용하여 요소의 크기가 변할 때마다
 * width와 height를 업데이트합니다.
 *
 * @param ref - 추적할 HTMLElement의 ref
 * @returns { width, height } 객체
 *
 * @example
 * const containerRef = useRef<HTMLDivElement>(null);
 * const { width, height } = useElementSize(containerRef);
 */
export function useElementSize<T extends HTMLElement = HTMLElement>(
  ref: RefObject<T | null>
) {
  const [size, setSize] = useState({ width: 0, height: 0 });

  useLayoutEffect(() => {
    const element = ref.current;
    if (!element) return;

    const updateSize = () => {
      const rect = element.getBoundingClientRect();
      setSize({
        width: rect.width || 0,
        height: rect.height || 0,
      });
    };

    // 초기 크기 측정
    updateSize();

    // ResizeObserver로 크기 변화 감지
    const observer = new ResizeObserver(updateSize);
    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [ref]);

  return size;
}
