import React from "react";
import { arRenderer } from "../services/renderer/UnityRenderer";

export function useARRenderer() {
  const [isLoaded, setIsLoaded] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<Error | null>(null);

  const canvasRef = React.useRef<HTMLCanvasElement | null>(null);
  const isInitializingRef = React.useRef(false);

  React.useEffect(() => {
    // Use the persistent canvas from the root layout
    const persistentCanvas = document.getElementById(
      "unity-canvas"
    ) as HTMLCanvasElement;

    if (!persistentCanvas) {
      console.error("Persistent Unity canvas not found");
      setError(new Error("Unity canvas not found"));
      setIsLoading(false);
      return;
    }

    canvasRef.current = persistentCanvas;

    // Check if Unity is already loaded
    if (arRenderer.isLoaded()) {
      console.log("Unity already loaded, reusing instance");
      setIsLoaded(true);
      setIsLoading(false);
      return;
    }

    if (isInitializingRef.current) {
      return;
    }

    isInitializingRef.current = true;

    arRenderer
      .initialize(persistentCanvas, {
        onLoaded: () => {
          setIsLoaded(true);
          setIsLoading(false);
          setError(null);
        },
        onError: (err: Error) => {
          setError(err);
          setIsLoading(false);
          isInitializingRef.current = false;
        },
      })
      .catch((err) => {
        setError(err);
        setIsLoading(false);
        isInitializingRef.current = false;
      });

    return () => {
      // Don't destroy Unity - it's persistent across navigations
      isInitializingRef.current = false;
    };
  }, []);

  return {
    renderer: arRenderer,
    isLoaded,
    isLoading,
    error,
    canvasRef,
  };
}
