import React from "react";

interface UnityContainerProps {
  isLoaded: boolean;
  isFullscreen?: boolean;
  children: React.ReactNode;
}

export const UnityContainer = React.forwardRef<
  HTMLDivElement,
  UnityContainerProps
>(({ isLoaded, isFullscreen = false, children }, ref) => {
  return (
    <div
      id="unity-container"
      ref={ref}
      className={`${isLoaded ? "d-block" : "d-none"} ${
        isFullscreen ? "unity-fullscreen" : ""
      }`}
      style={{
        position: isFullscreen ? "fixed" : "relative",
        top: isFullscreen ? "0" : "auto",
        left: isFullscreen ? "0" : "auto",
        width: isFullscreen ? "100vw" : "100%",
        height: isFullscreen ? "100vh" : "auto",
        zIndex: isFullscreen ? "9999" : "auto",
        backgroundColor: isFullscreen ? "#000" : "transparent",
      }}
    >
      {children}
    </div>
  );
});
