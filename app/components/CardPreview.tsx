import React from "react";
import type { UnityCardData } from "../types/card";
import { useARRenderer } from "../hooks/useARRenderer";

interface CardPreviewProps {
  isOpen: boolean;
  onClose?: () => void;
  mode?: "fullscreen" | "inline";
  cardData?: UnityCardData;
}

export function CardPreview({
  isOpen,
  onClose,
  mode = "fullscreen",
  cardData,
}: CardPreviewProps) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const cardDataRef = React.useRef<UnityCardData | undefined>(cardData);
  const { renderer, isLoaded } = useARRenderer();

  // Update ref whenever cardData changes
  React.useEffect(() => {
    cardDataRef.current = cardData;
  }, [cardData]);

  // Send data to renderer when cardData changes (inline mode only)
  React.useEffect(() => {
    if (mode === "inline" && isLoaded && renderer && isOpen && cardData) {
      console.log("Card data changed in preview, sending to renderer");
      setTimeout(() => {
        renderer.updateCardData(cardDataRef.current!);
      }, 100);
    }
  }, [cardData, isLoaded, renderer, isOpen, mode]);

  // Handle fullscreen mode
  React.useEffect(() => {
    if (mode !== "fullscreen" || !isOpen) return;

    const container = document.getElementById("unity-persistent-container");
    const canvas = document.getElementById("unity-canvas");

    if (!container || !canvas) return;

    // Make container visible and position it properly
    container.style.display = "block";
    container.style.position = "fixed";
    container.style.top = "0";
    container.style.left = "0";
    container.style.width = "100vw";
    container.style.height = "100vh";
    container.style.zIndex = "1050";
    container.style.backgroundColor = "rgba(0, 0, 0, 0.9)";

    // Ensure canvas is visible and properly sized
    canvas.style.display = "block";
    canvas.style.width = "100%";
    canvas.style.height = "100%";

    return () => {
      container.style.display = "none";
    };
  }, [isOpen, mode]);

  // Handle inline mode
  React.useEffect(() => {
    if (mode !== "inline" || !isOpen || !containerRef.current) return;

    const canvas = document.getElementById("unity-canvas") as HTMLCanvasElement;
    const persistentContainer = document.getElementById(
      "unity-persistent-container"
    );

    if (!canvas || !persistentContainer) return;

    // Show the persistent container but keep it in a specific location
    persistentContainer.style.display = "block";
    persistentContainer.style.position = "absolute";
    persistentContainer.style.width = "100%";
    persistentContainer.style.height = "100%";
    persistentContainer.style.top = "0";
    persistentContainer.style.left = "0";
    persistentContainer.style.zIndex = "1";
    persistentContainer.style.backgroundColor = "";

    canvas.style.display = "block";
    canvas.style.width = "100%";
    canvas.style.height = "100%";

    // Move the persistent container into our preview container
    if (
      containerRef.current &&
      persistentContainer.parentElement !== containerRef.current
    ) {
      containerRef.current.appendChild(persistentContainer);
    }

    return () => {
      // Move it back to body when unmounting
      if (persistentContainer.parentElement === containerRef.current) {
        document.body.appendChild(persistentContainer);
        persistentContainer.style.display = "none";
      }
    };
  }, [isOpen, mode]);

  if (!isOpen) return null;

  // Fullscreen mode with close button
  if (mode === "fullscreen") {
    return (
      <div
        style={{
          position: "fixed",
          top: "20px",
          right: "20px",
          zIndex: 1051,
        }}
      >
        <button
          type="button"
          className="btn btn-light"
          onClick={onClose}
          style={{
            width: "40px",
            height: "40px",
            borderRadius: "50%",
            fontSize: "24px",
            lineHeight: "1",
            padding: "0",
          }}
          aria-label="Close preview"
        >
          ×
        </button>
      </div>
    );
  }

  // Inline mode with container
  return (
    <div
      ref={containerRef}
      className="border rounded bg-dark"
      style={{
        width: "100%",
        height: "400px",
        position: "relative",
        overflow: "hidden",
      }}
    ></div>
  );
}
