import React from "react";
import type { UnityConfig } from "../types/card";

declare global {
  interface Window {
    createUnityInstance: any;
    UnityInstance: any;
  }
}

interface UseUnityOptions {
  onUnityLoaded?: (instance: any) => void;
}

export function useUnity({ onUnityLoaded }: UseUnityOptions = {}) {
  const [unityInstance, setUnityInstance] = React.useState<any>(null);
  const [isUnityLoaded, setIsUnityLoaded] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(true);
  const [progress, setProgress] = React.useState(0);

  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const loadingBarRef = React.useRef<HTMLDivElement>(null);
  const isInitializingRef = React.useRef(false);
  const instanceRef = React.useRef<any>(null);

  React.useEffect(() => {
    if (!canvasRef.current) {
      return;
    }

    // Prevent multiple instances - use ref to persist across re-renders
    if (isInitializingRef.current || instanceRef.current) {
      return;
    }

    isInitializingRef.current = true;

    // Determine the build URL and name from env or props
    const buildUrl = import.meta.env.VITE_UNITY_BUILD_URL;
    const buildFileName = import.meta.env.VITE_UNITY_BUILD_NAME;

    // Construct the loader URL
    const normalizedBuildUrl = buildUrl.endsWith("/")
      ? buildUrl.slice(0, -1)
      : buildUrl;
    const loaderUrl = `${normalizedBuildUrl}/${buildFileName}.loader.js`;

    // Check if script already exists
    const existingScript = document.querySelector(`script[src="${loaderUrl}"]`);
    if (existingScript) {
      console.log("Unity loader script already exists, skipping...");
      isInitializingRef.current = false;
      return;
    }

    const config: UnityConfig = {
      dataUrl: `${normalizedBuildUrl}/${buildFileName}.data.unityweb`,
      frameworkUrl: `${normalizedBuildUrl}/${buildFileName}.framework.js.unityweb`,
      codeUrl: `${normalizedBuildUrl}/${buildFileName}.wasm.unityweb`,
      streamingAssetsUrl: buildUrl
        ? `${normalizedBuildUrl}/StreamingAssets`
        : "StreamingAssets",
      companyName: "DefaultCompany",
      productName: "WebXR",
      productVersion: "0.1",
    };

    // Create script element and load Unity
    const script = document.createElement("script");
    script.src = loaderUrl;

    script.onload = () => {
      if (window.createUnityInstance && canvasRef.current) {
        try {
          window
            .createUnityInstance(
              canvasRef.current,
              config,
              (progressValue: number) => {
                setProgress(progressValue);
              }
            )
            .then((instance: any) => {
              instanceRef.current = instance;
              setUnityInstance(instance);
              setIsUnityLoaded(true);
              setIsLoading(false);
              onUnityLoaded?.(instance);
            })
            .catch((error: any) => {
              console.error("Unity initialization failed:", error);
              isInitializingRef.current = false;
              setIsLoading(false);
              alert("Failed to load AR card viewer.");
            });
        } catch (error) {
          console.error("Error during Unity initialization:", error);
          isInitializingRef.current = false;
          setIsLoading(false);
          alert("Failed to load AR card viewer.");
        }
      }
    };

    script.onerror = (error) => {
      console.error("Failed to load Unity loader script:", error);
      isInitializingRef.current = false;
      setIsLoading(false);
      alert("Failed to load AR card viewer.");
    };

    document.body.appendChild(script);

    return () => {
      // Cleanup: Destroy Unity instance if it exists
      if (instanceRef.current) {
        try {
          if (instanceRef.current.Quit) {
            instanceRef.current.Quit(() => {
              console.log("Unity instance destroyed");
            });
          }
        } catch (error) {
          console.error("Error destroying Unity instance:", error);
        }
        instanceRef.current = null;
      }

      // Don't remove script on cleanup to prevent reload issues
      // The script can be reused if component remounts

      // Reset initialization flag for potential remount
      isInitializingRef.current = false;
    };
  }, [onUnityLoaded]);

  return {
    unityInstance,
    isUnityLoaded,
    isLoading,
    progress,
    canvasRef,
  };
}
