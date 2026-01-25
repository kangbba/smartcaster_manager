import React from "react";

export type ToolbarAction =
  | "undo"
  | "redo"
  | "copy"
  | "cut"
  | "paste"
  | "delete"
  | "duplicate";

type ToolbarButton = {
  action: ToolbarAction;
  icon: string;
  label: string;
  disabled?: boolean;
  shortcut?: string;
};

type SlideEditorToolbarProps = {
  canUndo: boolean;
  canRedo: boolean;
  hasSelection: boolean;
  hasClipboard: boolean;
  onAction: (action: ToolbarAction) => void;
};

export function SlideEditorToolbar({
  canUndo,
  canRedo,
  hasSelection,
  hasClipboard,
  onAction,
}: SlideEditorToolbarProps) {
  const buttons: ToolbarButton[] = [
    {
      action: "undo",
      icon: "↶",
      label: "실행 취소",
      disabled: !canUndo,
      shortcut: "Ctrl+Z",
    },
    {
      action: "redo",
      icon: "↷",
      label: "다시 실행",
      disabled: !canRedo,
      shortcut: "Ctrl+Y",
    },
    {
      action: "copy",
      icon: "📋",
      label: "복사",
      disabled: !hasSelection,
      shortcut: "Ctrl+C",
    },
    {
      action: "cut",
      icon: "✂",
      label: "잘라내기",
      disabled: !hasSelection,
      shortcut: "Ctrl+X",
    },
    {
      action: "paste",
      icon: "📌",
      label: "붙여넣기",
      disabled: !hasClipboard,
      shortcut: "Ctrl+V",
    },
    {
      action: "duplicate",
      icon: "⎘",
      label: "복제",
      disabled: !hasSelection,
      shortcut: "Ctrl+D",
    },
    {
      action: "delete",
      icon: "🗑",
      label: "삭제",
      disabled: !hasSelection,
      shortcut: "Del",
    },
  ];

  return (
    <div className="bg-gray-100 border-b border-gray-300 px-4 py-2 flex items-center gap-1">
      {buttons.map((button, index) => (
        <React.Fragment key={button.action}>
          {(index === 2 || index === 5) && (
            <div className="w-px h-6 bg-gray-300 mx-1" />
          )}
          <button
            onClick={() => !button.disabled && onAction(button.action)}
            disabled={button.disabled}
            title={`${button.label}${button.shortcut ? ` (${button.shortcut})` : ""}`}
            className={`
              relative group w-8 h-8 flex items-center justify-center rounded
              transition-all
              ${
                button.disabled
                  ? "text-gray-400 cursor-not-allowed"
                  : "text-gray-700 hover:bg-gray-200 active:bg-gray-300 cursor-pointer"
              }
            `}
          >
            <span className="text-lg">{button.icon}</span>
            {!button.disabled && (
              <div className="absolute top-full mt-1 left-1/2 -translate-x-1/2 hidden group-hover:block z-50">
                <div className="bg-gray-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                  {button.label}
                  {button.shortcut && (
                    <span className="ml-2 text-gray-400">{button.shortcut}</span>
                  )}
                </div>
              </div>
            )}
          </button>
        </React.Fragment>
      ))}
    </div>
  );
}
