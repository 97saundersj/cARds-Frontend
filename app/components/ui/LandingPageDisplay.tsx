import React from "react";
import { DecorativeElements } from "./DecorativeElements";

interface LandingPageDisplayProps {
  header: string;
  message: string;
  buttonText?: string;
  buttonDisabled?: boolean;
  onButtonClick?: () => void;
  isPreview?: boolean;
}

export function LandingPageDisplay({
  header,
  message,
  buttonText = "View Card",
  buttonDisabled = false,
  onButtonClick,
  isPreview = false,
}: LandingPageDisplayProps) {
  return (
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
        onClick={onButtonClick}
      >
        {buttonText}
      </button>
    </div>
  );
}
