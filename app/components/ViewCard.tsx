import React from "react";
import { useParams } from "react-router";
import type { UnityCardData } from "../types/card";
import { Navbar } from "./ui/Navbar";
import { Footer } from "./ui/Footer";
import { LandingPageDisplay } from "./ui/LandingPageDisplay";
import { ARInstructionsModal } from "./modals/ARInstructionsModal";
import { useARRenderer } from "../hooks/useARRenderer";
import { SharedStyles } from "./ui/SharedStyles";
import { getApi } from "../services/api/ApiProvider";

interface ViewCardProps {}

export function ViewCard({}: ViewCardProps) {
  const { id } = useParams<{ id: string }>();

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
  const [isLoadingCard, setIsLoadingCard] = React.useState(false);
  const [loadError, setLoadError] = React.useState<string | null>(null);

  const cardDataRef = React.useRef<UnityCardData>(cardData);

  // Update ref whenever cardData changes
  React.useEffect(() => {
    cardDataRef.current = cardData;
  }, [cardData]);

  const { renderer, isLoaded, isLoading, canvasRef, error } = useARRenderer();

  React.useEffect(() => {
    const loadCardData = async () => {
      if (!id) {
        setLoadError("No card ID provided");
        return;
      }

      setIsLoadingCard(true);
      setLoadError(null);

      try {
        const api = getApi();
        const loadedCardData = await api.getCard(id);

        if (!loadedCardData) {
          setLoadError("Card not found");
          return;
        }

        setHeader(loadedCardData.header);
        setMessage(loadedCardData.message);
        setCardData({
          cardImage: loadedCardData.cardImage,
          cardTop: loadedCardData.cardTop,
          cardMiddle: loadedCardData.cardMiddle,
          cardBottom: loadedCardData.cardBottom,
        });
      } catch (error) {
        console.error("Failed to load card data:", error);
        setLoadError("Failed to load card data");
      } finally {
        setIsLoadingCard(false);
      }
    };

    loadCardData();
  }, [id]);

  // Send data to renderer whenever cardData changes and renderer is loaded
  React.useEffect(() => {
    if (isLoaded && renderer) {
      console.log("Card data changed, sending to renderer");
      setTimeout(() => {
        renderer.updateCardData(cardDataRef.current);
      }, 100);
    }
  }, [cardData, isLoaded, renderer]);

  const handleViewCardClick = () => {
    setShowInstructions(true);
  };

  const handleGotItClick = () => {
    setShowInstructions(false);
    if (renderer) {
      renderer.toggleAR();
    }
  };

  const buttonText = isLoadingCard
    ? "Loading Card..."
    : isLoading
      ? "Loading..."
      : error || loadError
        ? "Load Error"
        : "View Card";

  return (
    <div className="d-flex flex-column min-h-screen">
      <div className="container-fluid flex-grow-1 d-flex flex-column justify-content-center align-items-center py-4">
        <LandingPageDisplay
          header={header}
          message={message}
          buttonText={buttonText}
          buttonDisabled={isLoading || !!error || isLoadingCard || !!loadError}
          onButtonClick={handleViewCardClick}
        />

        {loadError && (
          <div className="mt-3 alert alert-danger" role="alert">
            <h6>{loadError}</h6>
          </div>
        )}

        {!isLoading && !isLoaded && error && !loadError && (
          <div className="mt-3 alert alert-warning" role="alert">
            <h6>The AR experience couldn't be loaded.</h6>
          </div>
        )}

        <ARInstructionsModal
          isOpen={showInstructions}
          onClose={() => setShowInstructions(false)}
          onGotIt={handleGotItClick}
        />
      </div>

      <Footer />
      <SharedStyles />
    </div>
  );
}
