import React from "react";
import { useParams } from "react-router";
import type { UnityCardData } from "../types/card";
import { Navbar } from "./ui/Navbar";
import { Footer } from "./ui/Footer";
import { LandingPageDisplay } from "./ui/LandingPageDisplay";
import { ARInstructionsModal } from "./modals/ARInstructionsModal";
import { CardPreview } from "./CardPreview";
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
  const [showInstructions, setShowInstructions] = React.useState(false);
  const [isLoadingCard, setIsLoadingCard] = React.useState(false);
  const [loadError, setLoadError] = React.useState<string | null>(null);
  const [showCardPreview, setShowCardPreview] = React.useState(false);

  const cardDataRef = React.useRef<UnityCardData>(cardData);

  // Update ref whenever cardData changes
  React.useEffect(() => {
    cardDataRef.current = cardData;
  }, [cardData]);

  const { renderer, isLoaded, isLoading, canvasRef, error } = useARRenderer();

  // New state: show a modal when device/browser doesn't support WebXR
  const [showWebXRModal, setShowWebXRModal] = React.useState(false);

  // Cache explicit WebXR availability check result (null = unknown)
  const [webXRAvailable, setWebXRAvailable] = React.useState<boolean | null>(
    null
  );

  // Helper to check WebXR 'immersive-ar' support
  const checkWebXRAvailability =
    React.useCallback(async (): Promise<boolean> => {
      if (typeof window === "undefined") return false;
      const nav = window.navigator as any;
      if (!nav || !nav.xr || typeof nav.xr.isSessionSupported !== "function") {
        return false;
      }
      try {
        return !!(await nav.xr.isSessionSupported("immersive-ar"));
      } catch {
        return false;
      }
    }, []);

  // Proactively check support on mount and cache result
  React.useEffect(() => {
    let mounted = true;
    (async () => {
      const ok = await checkWebXRAvailability();
      if (mounted) setWebXRAvailable(ok);
    })();
    return () => {
      mounted = false;
    };
  }, [checkWebXRAvailability]);

  // Detect WebXR-specific errors (case-insensitive)
  const webXRError = React.useMemo(
    () => (typeof error === "string" ? /webxr/i.test(error) : false),
    [error]
  );

  React.useEffect(() => {
    if (webXRError) setShowWebXRModal(true);
  }, [webXRError]);

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

  const handleViewCardClick = async () => {
    const ok =
      webXRAvailable === null ? await checkWebXRAvailability() : webXRAvailable;
    if (!ok) {
      setShowWebXRModal(true);
      return;
    }
    setShowInstructions(true);
  };

  const handleGotItClick = () => {
    setShowInstructions(false);
    if (renderer) {
      renderer.toggleAR();
    }
  };

  const handleViewWithoutAR = () => {
    setShowWebXRModal(false);
    setShowCardPreview(true);
  };

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

      {showCardPreview && (
        <CardPreview
          isOpen={showCardPreview}
          onClose={() => setShowCardPreview(false)}
        />
      )}

      {/* WebXR unsupported modal */}
      {showWebXRModal && (
        <>
          <div
            className="modal show"
            tabIndex={-1}
            role="dialog"
            style={{ display: "block", backgroundColor: "rgba(0,0,0,0.5)" }}
            aria-modal="true"
          >
            <div className="modal-dialog modal-dialog-centered" role="document">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">AR Not Supported</h5>
                  <button
                    type="button"
                    className="btn-close"
                    aria-label="Close"
                    onClick={() => setShowWebXRModal(false)}
                  />
                </div>
                <div className="modal-body">
                  <p>
                    Your device or browser does not appear to support WebXR. You
                    can still view the card in a regular 3D view, or try using a
                    different browser or supported device for AR.
                  </p>
                </div>
                <div className="modal-footer">
                  <a
                    className="btn btn-outline-secondary"
                    href="https://developers.google.com/ar"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Learn more
                  </a>
                  <button
                    type="button"
                    className="btn btn-outline-primary"
                    onClick={() => setShowWebXRModal(false)}
                  >
                    Close
                  </button>
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={handleViewWithoutAR}
                    disabled={!isLoaded}
                  >
                    View without AR
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
