import React from "react";

type HandlePosition = "nw" | "n" | "ne" | "w" | "e" | "sw" | "s" | "se";

type SelectionHandlesProps = {
  bounds: {
    left: number;
    top: number;
    width: number;
    height: number;
  };
  onResizeStart: (handle: HandlePosition, e: React.MouseEvent) => void;
  showResizeHandles?: boolean;
  showBorder?: boolean;
};

export function SelectionHandles({
  bounds,
  onResizeStart,
  showResizeHandles = true,
  showBorder = true,
}: SelectionHandlesProps) {
  const handles: HandlePosition[] = ["nw", "n", "ne", "w", "e", "sw", "s", "se"];

  return (
    <>
      {/* Selection border */}
      {showBorder && (
        <div
          className="absolute border-2 border-blue-500 pointer-events-none"
          style={{
            left: bounds.left,
            top: bounds.top,
            width: bounds.width,
            height: bounds.height,
          }}
        />
      )}

      {/* Resize handles */}
      {showResizeHandles && handles.map((handle) => (
        <div
          key={handle}
          className="absolute w-3 h-3 bg-white border-2 border-blue-500 rounded-sm cursor-pointer hover:bg-blue-100 transition-colors"
          style={{
            left: handle === "n" || handle === "s"
              ? bounds.left + bounds.width / 2
              : handle.includes("w")
                ? bounds.left
                : bounds.left + bounds.width,
            top: handle === "w" || handle === "e"
              ? bounds.top + bounds.height / 2
              : handle.includes("n")
                ? bounds.top
                : bounds.top + bounds.height,
            transform: "translate(-50%, -50%)",
            cursor:
              handle === "n" || handle === "s"
                ? "ns-resize"
                : handle === "w" || handle === "e"
                  ? "ew-resize"
                  : handle === "nw" || handle === "se"
                    ? "nwse-resize"
                    : "nesw-resize",
          }}
          onMouseDown={(e) => {
            e.stopPropagation();
            onResizeStart(handle, e);
          }}
        />
      ))}
    </>
  );
}
