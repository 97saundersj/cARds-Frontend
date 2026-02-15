import { useEffect, useRef, useState } from "react";
import { setupDragCardScene } from "~/components/DragCardScene";

export function ThreeJSTest() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isARSupported, setIsARSupported] = useState(true);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return undefined;
    const { cleanup } = setupDragCardScene(container, setIsARSupported);
    return cleanup;
  }, []);

  return (
    <div
      ref={containerRef}
      style={{ width: "100vw", height: "100vh", position: "relative" }}
    >
      {!isARSupported && (
        <div
          style={{
            position: "absolute",
            top: "80px",
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 1000,
            padding: "12px 24px",
            backgroundColor: "#ff9800",
            color: "white",
            borderRadius: "8px",
            fontSize: "14px",
          }}
        >
          WebXR not supported on this device
        </div>
      )}

      <div
        style={{
          position: "absolute",
          bottom: "20px",
          left: "50%",
          transform: "translateX(-50%)",
          padding: "12px 24px",
          background: "rgba(0, 0, 0, 0.7)",
          color: "white",
          borderRadius: "8px",
          fontSize: "14px",
          zIndex: 100,
          pointerEvents: "none",
        }}
      >
        Point at the card, touch and hold to drag
      </div>
    </div>
  );
}