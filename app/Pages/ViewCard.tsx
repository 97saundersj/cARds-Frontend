import React from "react";
import { useParams } from "react-router";
import type { UnityCardData } from "../types/card";
import { Footer } from "../components/ui/Footer";
import { LandingPageDisplay } from "../components/ui/LandingPageDisplay";
import { useARRenderer } from "../hooks/useARRenderer";
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
  const [isLoadingCard, setIsLoadingCard] = React.useState(false);
  const [loadError, setLoadError] = React.useState<string | null>(null);

  const cardDataRef = React.useRef<UnityCardData>(cardData);

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

  React.useEffect(() => {
    if (isLoaded && renderer) {
      console.log("Card data changed, sending to renderer");
      setTimeout(() => {
        renderer.updateCardData(cardDataRef.current);
      }, 100);
    }
  }, [cardData, isLoaded, renderer]);

  const buttonText = isLoadingCard
    ? "Loading Card..."
    : isLoading
      ? "Loading..."
      : error || loadError
        ? "Load Error"
        : "View Card";

  return (
    <div className="d-flex flex-column vh-100">
      <div className="container-fluid flex-grow-1 d-flex flex-column justify-content-center align-items-center py-4">
        <LandingPageDisplay
          header={header}
          message={message}
          buttonText={buttonText}
          buttonDisabled={isLoading || !!error || isLoadingCard || !!loadError}
          loadError={loadError}
          renderError={
            !isLoaded && error ? error.message || String(error) : null
          }
          isLoading={isLoading}
          renderer={renderer}
          cardData={cardData}
        />
      </div>

      <Footer />
    </div>
  );
}
