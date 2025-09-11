import React from "react";
import type { UnityConfig } from "../types/card";
import { findUnityBuildName } from "../config/unity";

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
}: UseUnityOptions) {
  const [unityInstance, setUnityInstance] = React.useState<any>(null);
  const [isUnityLoaded, setIsUnityLoaded] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(true);
  const [progress, setProgress] = React.useState(0);

  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const loadingBarRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    console.log("🎮 Unity Hook: Starting Unity initialization");
    console.log("🎮 Unity Hook: Input parameters:", { unityUrl, buildName });

    if (!canvasRef.current) {
      console.error("🎮 Unity Hook: Canvas ref is not available");
      return;
    }

    // Prevent multiple instances
    if (unityInstance) {
      console.log(
        "🎮 Unity Hook: Unity instance already exists, skipping initialization"
      );
      return;
    }

    // Check for WebXR polyfill conflicts before initializing
    const hasWebXRPolyfill =
      document.querySelector('script[src*="webxr-polyfill"]') ||
      window.navigator.userAgent.includes("WebXR") ||
      (window as any).WebXRPolyfill;

    if (hasWebXRPolyfill) {
      console.warn(
        "⚠️ Unity Hook: WebXR polyfill detected - this may cause stack overflow issues"
      );
      console.warn(
        "⚠️ Unity Hook: Consider disabling the WebXR polyfill or using a different Unity build"
      );

      // Add a delay to allow the polyfill to stabilize
      setTimeout(() => {
        console.log(
          "🎮 Unity Hook: Proceeding with Unity initialization after polyfill delay"
        );
      }, 1000);
    }

    // Determine the build URL and name
    const buildUrl = unityUrl || "Build";
    let buildFileName = buildName || "Build";

    console.log("🎮 Unity Hook: Build configuration:", {
      buildUrl,
      buildFileName,
    });

    // If no buildName is provided, try to find it automatically
    if (!buildName) {
      console.log(
        "🎮 Unity Hook: No build name provided, attempting to find it automatically..."
      );
      findUnityBuildName()
        .then((foundName) => {
          if (foundName) {
            buildFileName = foundName;
            console.log("🎮 Unity Hook: Using found build name:", foundName);
          } else {
            console.warn(
              "🎮 Unity Hook: No build name found, using default:",
              buildFileName
            );
          }
        })
        .catch((error) => {
          console.error("🎮 Unity Hook: Error finding build name:", error);
        });
    }

    // Construct the loader URL - handle trailing slashes properly
    const normalizedBuildUrl = buildUrl.endsWith("/")
      ? buildUrl.slice(0, -1)
      : buildUrl;
    const loaderUrl = `${normalizedBuildUrl}/${buildFileName}.loader.js`;
    console.log("🎮 Unity Hook: Loader URL:", loaderUrl);

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

    console.log("🎮 Unity Hook: Unity config:", config);

    if (loadingBarRef.current) {
      loadingBarRef.current.style.display = "block";
      console.log("🎮 Unity Hook: Loading bar displayed");
    }

    // Create script element and load Unity
    const script = document.createElement("script");
    script.src = loaderUrl;

    console.log("🎮 Unity Hook: Attempting to load script from:", script.src);

    script.onload = () => {
      console.log("✅ Unity Hook: Loader script loaded successfully");
      console.log(
        "🎮 Unity Hook: createUnityInstance available:",
        !!window.createUnityInstance
      );
      console.log(
        "🎮 Unity Hook: Canvas element available:",
        !!canvasRef.current
      );

      if (window.createUnityInstance && canvasRef.current) {
        console.log("🎮 Unity Hook: Creating Unity instance...");

        try {
          window
            .createUnityInstance(
              canvasRef.current,
              config,
              (progressValue: number) => {
                console.log(
                  "🎮 Unity Hook: Loading progress:",
                  Math.round(progressValue * 100) + "%"
                );
                setProgress(progressValue);
              }
            )
            .then((instance: any) => {
              console.log("✅ Unity Hook: Unity instance created successfully");
              setUnityInstance(instance);
              setIsUnityLoaded(true);
              setIsLoading(false);

              if (loadingBarRef.current) {
                loadingBarRef.current.style.display = "none";
                console.log("🎮 Unity Hook: Loading bar hidden");
              }

              onUnityLoaded?.(instance);
            })
            .catch((error: any) => {
              console.error(
                "❌ Unity Hook: Unity initialization failed:",
                error
              );
              console.error("❌ Unity Hook: Error details:", {
                message: error.message,
                stack: error.stack,
                name: error.name,
              });
              setIsLoading(false);

              // Check if it's a stack overflow error
              if (
                error.message &&
                error.message.includes("Maximum call stack size exceeded")
              ) {
                console.error(
                  "❌ Unity Hook: Stack overflow detected - likely WebXR polyfill issue"
                );
                alert(
                  "Unity application encountered a stack overflow error. This is likely due to WebXR polyfill conflicts. Try refreshing the page or disabling WebXR polyfill extensions."
                );
              } else {
                // More user-friendly error message
                const errorMessage = `Failed to load Unity application. This might be because:
1. Unity server is not running (check if http://192.168.0.182:8001 is accessible)
2. Unity build files are missing
3. CORS issues with Unity server
4. WebXR polyfill conflicts

Check the browser console for more details.`;

                alert(errorMessage);
              }
            });
        } catch (error) {
          console.error(
            "❌ Unity Hook: Error during Unity initialization:",
            error
          );
          setIsLoading(false);
          alert(
            "Failed to initialize Unity application. Check console for details."
          );
        }
      } else {
        console.error(
          "❌ Unity Hook: Missing requirements for Unity initialization"
        );
        console.error(
          "❌ Unity Hook: createUnityInstance available:",
          !!window.createUnityInstance
        );
        console.error("❌ Unity Hook: Canvas available:", !!canvasRef.current);
      }
    };

    script.onerror = (error) => {
      console.error("❌ Unity Hook: Failed to load Unity loader script");
      console.error("❌ Unity Hook: Script error details:", error);
      console.error("❌ Unity Hook: Attempted URL:", script.src);
      console.error(
        "❌ Unity Hook: Network status:",
        navigator.onLine ? "Online" : "Offline"
      );

      // Try to fetch the URL to see what the actual error is
      fetch(script.src)
        .then((response) => {
          console.log("🔍 Unity Hook: Fetch response status:", response.status);
          console.log(
            "🔍 Unity Hook: Fetch response headers:",
            response.headers
          );
          return response.text();
        })
        .then((text) => {
          console.log(
            "🔍 Unity Hook: Response content preview:",
            text.substring(0, 200)
          );
        })
        .catch((fetchError) => {
          console.error("🔍 Unity Hook: Fetch failed:", fetchError);
        });

      setIsLoading(false);

      // More user-friendly error message for script loading
      const errorMessage = `Failed to load Unity application from ${script.src}. 

This usually means:
1. Unity server is not running at http://127.0.0.1:8001
2. Unity build files are missing from the server
3. Network connectivity issues

To fix this:
1. Make sure the Unity server is running (run start-unity-cors.ps1)
2. Check that Unity build files exist in the server directory
3. Verify the server is accessible in your browser

Check the browser console for more technical details.`;

      alert(errorMessage);
    };

    console.log("🎮 Unity Hook: Adding script to document body");
    document.body.appendChild(script);

    return () => {
      console.log("🎮 Unity Hook: Cleaning up Unity script");
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
    loadingBarRef,
  };
}
