import React from "react";
import { DecorativeElements } from "./DecorativeElements";
import { ARInstructionsModal } from "../modals/ARInstructionsModal";
import { CardPreview } from "../CardPreview";
import type { UnityCardData } from "../../types/card";

interface LandingPageDisplayProps {
  header: string;
  message: string;
  buttonText?: string;
  buttonDisabled?: boolean;
  onButtonClick?: () => void;
  isPreview?: boolean;
  loadError?: string | null;
  renderError?: string | null;
  isLoading?: boolean;
  renderer?: any;
  cardData?: UnityCardData;
}

export function LandingPageDisplay({
  header,
  message,
  buttonText = "View Card",
  buttonDisabled = false,
  onButtonClick,
  isPreview = false,
  loadError,
  renderError,
  isLoading,
  renderer,
  cardData,
}: LandingPageDisplayProps) {
  const [showInstructions, setShowInstructions] = React.useState(false);
  const [showWebXRModal, setShowWebXRModal] = React.useState(false);
  const [showCardPreview, setShowCardPreview] = React.useState(false);
  const [webXRAvailable, setWebXRAvailable] = React.useState<boolean | null>(
    null
  );

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

  const webXRError = React.useMemo(
    () =>
      typeof renderError === "string" ? /webxr/i.test(renderError) : false,
    [renderError]
  );

  React.useEffect(() => {
    if (webXRError) setShowWebXRModal(true);
  }, [webXRError]);

  React.useEffect(() => {
    const tooltipTrigger = document.getElementById("viewCardButton");
    let tooltip: any = null;

    if (tooltipTrigger && typeof window !== "undefined") {
      const bootstrap = (window as any).bootstrap;
      if (bootstrap && bootstrap.Tooltip) {
        tooltip = new bootstrap.Tooltip(tooltipTrigger, {
          trigger: "hover focus",
        });
      }
    }

    return () => {
      if (tooltip) {
        tooltip.dispose();
      }
    };
  }, []);

  const handleViewCardClick = async () => {
    if (isPreview) {
      return;
    }

    const ok =
      webXRAvailable === null ? await checkWebXRAvailability() : webXRAvailable;
    if (!ok) {
      setShowWebXRModal(true);
      return;
    }

    if (onButtonClick) {
      onButtonClick();
    } else {
      setShowInstructions(true);
    }
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

  return (
    <>
      <div className="d-flex flex-column justify-content-center align-items-center text-center">
        <div id="message" className="mb-4">
          <h1 id="landingPageHeader" className="mb-3 text-primary">
            {header || (isPreview ? "Your header here..." : "")}
          </h1>
          <p id="landingPageMessage" className="mb-4">
            {message || (isPreview ? "Your message here..." : "")}
          </p>
        </div>

        <div className="mb-3">
          <DecorativeElements />
        </div>

        <button
          id="viewCardButton"
          className="btn btn-primary"
          disabled={buttonDisabled}
          onClick={handleViewCardClick}
          title={
            isPreview ? "This will display the card in AR" : "View your AR card"
          }
          data-bs-toggle="tooltip"
          data-bs-placement="top"
        >
          {buttonText}
        </button>

        {loadError && (
          <div className="mt-3 alert alert-danger" role="alert">
            <h6>{loadError}</h6>
          </div>
        )}

        {!isLoading && renderError && !loadError && (
          <div className="mt-3 alert alert-warning" role="alert">
            <h6>The AR experience couldn't be loaded.</h6>
          </div>
        )}
      </div>

      {!isPreview && (
        <>
          <ARInstructionsModal
            isOpen={showInstructions}
            onClose={() => setShowInstructions(false)}
            onGotIt={handleGotItClick}
          />

          {showCardPreview && cardData && (
            <CardPreview
              isOpen={showCardPreview}
              onClose={() => setShowCardPreview(false)}
              mode="fullscreen"
              cardData={cardData}
            />
          )}

          {showWebXRModal && (
            <>
              <div
                className="modal show"
                tabIndex={-1}
                role="dialog"
                style={{ display: "block", backgroundColor: "rgba(0,0,0,0.5)" }}
                aria-modal="true"
              >
                <div
                  className="modal-dialog modal-dialog-centered"
                  role="document"
                >
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
                        Your device or browser does not appear to support WebXR.
                        You can still view the card in a regular 3D view, or try
                        using a different browser or supported device for AR.
                      </p>
                    </div>
                    <div className="modal-footer justify-content-between">
                      <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={() => setShowWebXRModal(false)}
                      >
                        Close
                      </button>
                      <button
                        type="button"
                        className="btn btn-primary"
                        onClick={handleViewWithoutAR}
                        disabled={!renderer || !!renderError}
                      >
                        View without AR
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </>
      )}
    </>
  );
}
