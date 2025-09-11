import React from "react";

interface UnityCanvasProps {
  className?: string;
  isFullscreen?: boolean;
}

export const UnityCanvas = React.forwardRef<
  HTMLCanvasElement,
  UnityCanvasProps
>(({ className, isFullscreen = false }, ref) => {
  return (
    <div
      id="unity-canvas-container"
      style={{
        width: isFullscreen ? "100vw" : "100%",
        height: isFullscreen ? "100vh" : "auto",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <canvas
        id="unity-canvas"
        ref={ref}
        className={className}
        style={{
          width: isFullscreen ? "100vw" : "100%",
          height: isFullscreen ? "100vh" : "auto",
          maxWidth: "100%",
          maxHeight: "100%",
          objectFit: "contain",
        }}
      />
    </div>
  );
});
