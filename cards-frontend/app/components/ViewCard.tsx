import React from "react";
import { useSearchParams } from "react-router";
import type { UnityCardData } from "../types/card";
import { Navbar } from "./ui/Navbar";
import { Footer } from "./ui/Footer";
import { DecorativeElements } from "./ui/DecorativeElements";
import { ARInstructionsModal } from "./modals/ARInstructionsModal";
import { useUnity } from "../hooks/useUnity";
import { SharedStyles } from "./ui/SharedStyles";
import { getUnityConfig } from "../config/unity";

interface ViewCardProps {}

export function ViewCard({}: ViewCardProps) {
  const [searchParams] = useSearchParams();

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
  const [unityLoadError, setUnityLoadError] = React.useState(false);

  const unityConfig = getUnityConfig();

  const cardDataRef = React.useRef<UnityCardData>(cardData);

  // Update ref whenever cardData changes
  React.useEffect(() => {
    cardDataRef.current = cardData;
  }, [cardData]);

  const sendCardTextToUnity = React.useCallback((instance: any) => {
    const currentData = cardDataRef.current;
    console.log("Sending data to Unity:", currentData);
    if (
      instance &&
      (currentData.cardTop || currentData.cardMiddle || currentData.cardBottom)
    ) {
      try {
        instance.SendMessage(
          "Card",
          "UpdateCardText",
          JSON.stringify(currentData)
        );
        console.log("Data sent to Unity successfully");
      } catch (error) {
        console.error("Failed to send data to Unity:", error);
      }
    } else {
      console.log("No data to send to Unity or Unity instance not available");
    }
  }, []);

  const onUnityLoadedCallback = React.useCallback(
    (instance: any) => {
      console.log("Unity loaded, sending initial data");
      // Send data after a small delay to ensure Unity is fully ready
      setTimeout(() => {
        sendCardTextToUnity(instance);
      }, 100);
      setUnityLoadError(false);
    },
    [sendCardTextToUnity]
  );

  const { unityInstance, isUnityLoaded, isLoading, canvasRef } = useUnity({
    unityUrl: unityConfig.unityUrl,
    buildName: unityConfig.buildName,
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
    // Load data from URL parameters
    const urlHeader = searchParams.get("header") || "Happy Birthday!";
    const urlMessage =
      searchParams.get("message") || "Experience your AR card below.";
    const urlCardImage = searchParams.get("cardImage") || "birthday";
    const urlCardTop = searchParams.get("cardTop") || "";
    const urlCardMiddle = searchParams.get("cardMiddle") || "";
    const urlCardBottom = searchParams.get("cardBottom") || "";

    setHeader(urlHeader);
    setMessage(urlMessage);
    setCardData({
      cardImage: urlCardImage,
      cardTop: urlCardTop,
      cardMiddle: urlCardMiddle,
      cardBottom: urlCardBottom,
    });
  }, [searchParams]);

  // Send data to Unity whenever cardData changes and Unity is loaded
  React.useEffect(() => {
    if (isUnityLoaded && unityInstance) {
      console.log("Card data changed, sending to Unity");
      sendCardTextToUnity(unityInstance);
    }
  }, [cardData, isUnityLoaded, unityInstance, sendCardTextToUnity]);

  const handleViewCardClick = () => {
    setShowInstructions(true);
  };

  const handleGotItClick = () => {
    setShowInstructions(false);
    if (unityInstance && unityInstance.Module && unityInstance.Module.WebXR) {
      unityInstance.Module.WebXR.toggleAR();
    }
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
          <div
            id="unity-container"
            className={isUnityLoaded ? "d-block" : "d-none"}
          >
            <canvas id="unity-canvas" ref={canvasRef} />
          </div>
        </div>
      </div>

      <Footer />
      <SharedStyles />
    </div>
  );
}
