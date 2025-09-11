import React from "react";

interface UnityLoadingBarProps {
  progress: number;
}

export const UnityLoadingBar = React.forwardRef<
  HTMLDivElement,
  UnityLoadingBarProps
>(({ progress }, ref) => {
  return (
    <div id="unity-loading-bar" ref={ref}>
      <div id="unity-logo"></div>
      <div id="unity-progress-bar-empty">
        <div
          id="unity-progress-bar-full"
          style={{ width: `${progress * 100}%` }}
        />
      </div>
    </div>
  );
});
