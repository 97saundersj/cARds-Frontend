import React from "react";
import type { UnityConfig } from "../types/card";

declare global {
  interface Window {
    createUnityInstance: any;
    UnityInstance: any;
  }
}

interface UseUnityOptions {
  unityUrl?: string;
  buildName?: string;
  onUnityLoaded?: (instance: any) => void;
}

export function useUnity({
  unityUrl,
  buildName,
  onUnityLoaded,
}: UseUnityOptions = {}) {
  const [unityInstance, setUnityInstance] = React.useState<any>(null);
  const [isUnityLoaded, setIsUnityLoaded] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(true);
  const [progress, setProgress] = React.useState(0);

  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const loadingBarRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!canvasRef.current) {
      return;
    }

    // Prevent multiple instances
    if (unityInstance) {
      return;
    }

    // Determine the build URL and name from env or props
    const buildUrl =
      unityUrl ||
      import.meta.env.VITE_UNITY_BUILD_URL ||
      "http://localhost:8000";
    const buildFileName =
      buildName || import.meta.env.VITE_UNITY_BUILD_NAME || "WebXR-gh-pages";

    // Construct the loader URL
    const normalizedBuildUrl = buildUrl.endsWith("/")
      ? buildUrl.slice(0, -1)
      : buildUrl;
    const loaderUrl = `${normalizedBuildUrl}/${buildFileName}.loader.js`;

    const config: UnityConfig = {
      dataUrl: `${normalizedBuildUrl}/${buildFileName}.data.unityweb`,
      frameworkUrl: `${normalizedBuildUrl}/${buildFileName}.framework.js.unityweb`,
      codeUrl: `${normalizedBuildUrl}/${buildFileName}.wasm.unityweb`,
      streamingAssetsUrl: unityUrl
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
              setUnityInstance(instance);
              setIsUnityLoaded(true);
              setIsLoading(false);
              onUnityLoaded?.(instance);
            })
            .catch((error: any) => {
              console.error("Unity initialization failed:", error);
              setIsLoading(false);
              alert(
                "Failed to load Unity application. Check console for details."
              );
            });
        } catch (error) {
          console.error("Error during Unity initialization:", error);
          setIsLoading(false);
          alert(
            "Failed to initialize Unity application. Check console for details."
          );
        }
      }
    };

    script.onerror = (error) => {
      console.error("Failed to load Unity loader script:", error);
      setIsLoading(false);
      alert(
        `Failed to load Unity application from ${script.src}. Check console for details.`
      );
    };

    document.body.appendChild(script);

    return () => {
      // Cleanup script if component unmounts
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
      // Reset state to prevent memory leaks
      setUnityInstance(null);
      setIsUnityLoaded(false);
      setIsLoading(true);
      setProgress(0);
    };
  }, [unityUrl, buildName, onUnityLoaded]);

  return {
    unityInstance,
    isUnityLoaded,
    isLoading,
    progress,
    canvasRef,
  };
}
