import React from "react";
import { useSearchParams } from "react-router";
import type { UnityCardData } from "../types/card";
import { Navbar } from "./ui/Navbar";
import { Footer } from "./ui/Footer";
import { DecorativeElements } from "./ui/DecorativeElements";
import { ARInstructionsModal } from "./modals/ARInstructionsModal";
import { UnityContainer } from "./unity/UnityContainer";
import { UnityCanvas } from "./unity/UnityCanvas";
import { UnityLoadingBar } from "./unity/UnityLoadingBar";
import { useUnity } from "../hooks/useUnity";
import { SharedStyles } from "./ui/SharedStyles";
import { getUnityConfig, testUnityUrl } from "../config/unity";

interface ViewCardProps {}

export function ViewCard({}: ViewCardProps) {
  const [searchParams] = useSearchParams();

  console.log("🎯 ViewCard: Component initialized");

  const [header, setHeader] = React.useState("Happy Birthday!");
  const [message, setMessage] = React.useState(
    "Experience your AR card below."
  );
  const [cardData, setCardData] = React.useState<UnityCardData>({
    cardImage: "birthday",
    cardTop: "",
    cardMiddle: "",
    cardBottom: "",
  });
  const [showInstructions, setShowInstructions] = React.useState(false);
  const [arSupported, setArSupported] = React.useState(true);
  const [unityLoadError, setUnityLoadError] = React.useState(false);

  // Memoize the Unity config to prevent unnecessary re-renders
  const memoizedUnityConfig = React.useMemo(() => getUnityConfig(), []);

  // Memoize the onUnityLoaded callback to prevent re-renders
  const onUnityLoadedCallback = React.useCallback((instance: any) => {
    sendCardTextToUnity(instance);
    checkARSupport();
    setUnityLoadError(false);
  }, []);

  const {
    unityInstance,
    isUnityLoaded,
    isLoading,
    progress,
    canvasRef,
    loadingBarRef,
  } = useUnity({
    unityUrl: memoizedUnityConfig.unityUrl,
    buildName: memoizedUnityConfig.buildName,
    onUnityLoaded: onUnityLoadedCallback,
  });

  // Monitor Unity loading state for errors
  React.useEffect(() => {
    if (!isLoading && !isUnityLoaded) {
      // If loading finished but Unity didn't load, there was an error
      setUnityLoadError(true);
    }
  }, [isLoading, isUnityLoaded]);

  React.useEffect(() => {
    console.log("🎯 ViewCard: Loading data from URL parameters");
    console.log("🎯 ViewCard: Current URL:", window.location.href);
    console.log(
      "🎯 ViewCard: Search params:",
      Object.fromEntries(searchParams.entries())
    );

    // Load data from URL parameters
    const urlHeader = searchParams.get("header") || "Happy Birthday!";
    const urlMessage =
      searchParams.get("message") || "Experience your AR card below.";
    const urlCardImage = searchParams.get("cardImage") || "birthday";
    const urlCardTop = searchParams.get("cardTop") || "";
    const urlCardMiddle = searchParams.get("cardMiddle") || "";
    const urlCardBottom = searchParams.get("cardBottom") || "";

    console.log("🎯 ViewCard: Parsed card data:", {
      header: urlHeader,
      message: urlMessage,
      cardImage: urlCardImage,
      cardTop: urlCardTop,
      cardMiddle: urlCardMiddle,
      cardBottom: urlCardBottom,
    });

    setHeader(urlHeader);
    setMessage(urlMessage);
    setCardData({
      cardImage: urlCardImage,
      cardTop: urlCardTop,
      cardMiddle: urlCardMiddle,
      cardBottom: urlCardBottom,
    });
  }, [searchParams]);

  // Test Unity URL accessibility on component mount
  React.useEffect(() => {
    console.log("🎯 ViewCard: Testing Unity URL accessibility");
    testUnityUrl().then((isAccessible) => {
      if (!isAccessible) {
        console.warn(
          "⚠️ ViewCard: Unity URL is not accessible - Unity may not load properly"
        );
      }
    });
  }, []);

  // Check for WebXR polyfill conflicts and add safeguards
  React.useEffect(() => {
    const hasWebXRPolyfill =
      document.querySelector('script[src*="webxr-polyfill"]') ||
      window.navigator.userAgent.includes("WebXR") ||
      (window as any).WebXRPolyfill;

    if (hasWebXRPolyfill) {
      console.warn(
        "⚠️ ViewCard: WebXR polyfill detected - this may cause stack overflow issues with Unity WebXR"
      );

      // Add a global error handler for stack overflow
      const originalErrorHandler = window.onerror;
      window.onerror = (message, source, lineno, colno, error) => {
        if (
          message &&
          message.toString().includes("Maximum call stack size exceeded")
        ) {
          console.error(
            "🚨 ViewCard: Stack overflow detected - likely WebXR polyfill issue"
          );
          setUnityLoadError(true);
          return true; // Prevent default error handling
        }
        if (originalErrorHandler) {
          return originalErrorHandler(message, source, lineno, colno, error);
        }
        return false;
      };

      // Try to temporarily disable WebXR polyfill during Unity loading
      const disableWebXRPolyfill = () => {
        try {
          if ((window as any).WebXRPolyfill) {
            console.log("🔧 ViewCard: Temporarily disabling WebXR polyfill");
            (window as any).WebXRPolyfill = null;
          }
        } catch (error) {
          console.warn("⚠️ ViewCard: Could not disable WebXR polyfill:", error);
        }
      };

      // Disable polyfill when Unity starts loading
      if (isLoading) {
        disableWebXRPolyfill();
      }

      // Cleanup function
      return () => {
        window.onerror = originalErrorHandler;
      };
    }
  }, [isLoading]);

  const sendCardTextToUnity = (instance: any) => {
    if (
      instance &&
      (cardData.cardTop || cardData.cardMiddle || cardData.cardBottom)
    ) {
      instance.SendMessage("Card", "UpdateCardText", JSON.stringify(cardData));
    }
  };

  const checkARSupport = () => {
    // Check for WebXR support
    if ("xr" in navigator) {
      (navigator as any).xr
        ?.isSessionSupported("immersive-ar")
        .then((supported: boolean) => {
          console.log("🎯 ViewCard: AR support check result:", supported);
          setArSupported(supported);
        })
        .catch((error: any) => {
          console.warn("🎯 ViewCard: AR support check failed:", error);
          // Fallback to true for development/testing
          setArSupported(true);
        });
    } else {
      console.log("🎯 ViewCard: WebXR not supported, using fallback");
      // Fallback to true for development/testing
      setArSupported(true);
    }
  };

  const handleViewCardClick = () => {
    setShowInstructions(true);
  };

  const handleGotItClick = () => {
    setShowInstructions(false);
    if (unityInstance && unityInstance.Module && unityInstance.Module.WebXR) {
      unityInstance.Module.WebXR.toggleAR();
    }
  };

  const handleCustomizeClick = () => {
    // Navigate back to editor with current parameters
    const currentParams = new URLSearchParams(searchParams);
    window.location.href = `/?${currentParams.toString()}`;
  };

  return (
    <div className="d-flex flex-column min-h-screen">
      <div className="container-fluid flex-grow-1 d-flex flex-column justify-content-center align-items-center py-4">
        <div id="message" className="text-center mb-4">
          <h1 id="landingPageHeader">{header}</h1>
          <p id="landingPageMessage" className="mb-4">
            {message}
          </p>
        </div>

        <DecorativeElements />

        <button
          id="viewCardButton"
          className="mt-4 btn btn-primary"
          disabled={isLoading || unityLoadError}
          onClick={handleViewCardClick}
        >
          {isLoading
            ? "Loading..."
            : unityLoadError
              ? "Unity Load Error"
              : "View Card"}
        </button>

        {unityLoadError && (
          <div className="mt-3 alert alert-warning" role="alert">
            <h6>The AR experience couldn't be loaded.</h6>
          </div>
        )}

        <ARInstructionsModal
          isOpen={showInstructions}
          onClose={() => setShowInstructions(false)}
          onGotIt={handleGotItClick}
        />

        <div className="d-none">
          <UnityContainer isLoaded={isUnityLoaded}>
            <UnityCanvas ref={canvasRef} />
            <UnityLoadingBar progress={progress} ref={loadingBarRef} />
            <div id="unity-footer"></div>
          </UnityContainer>
        </div>
      </div>

      <Footer />
      <SharedStyles />
    </div>
  );
}
