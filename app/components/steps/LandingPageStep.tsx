import type { CardData } from "../../types/card";
import { LandingPageDisplay } from "../ui/LandingPageDisplay";

interface LandingPageStepProps {
  cardData: CardData;
  customImageUrl: string;
  handleInputChange: (field: keyof CardData, value: string) => void;
  previousStep?: () => void;
  isUploading: boolean;
  isSavingCard: boolean;
  handleGenerateCard: () => void;
}

export function LandingPageStep({
  cardData,
  customImageUrl,
  handleInputChange,
  previousStep,
  isUploading,
  isSavingCard,
  handleGenerateCard,
}: LandingPageStepProps) {
  return (
    <div>
      <h6 className="fw-bold">Landing Page</h6>
      <p className="text-muted">
        Customize the landing page for your greeting card
      </p>

      <div className="row">
        <div className="col-md-6">
          <div className="border p-3 rounded bg-light">
            <div className="mb-3">
              <label htmlFor="landingPageHeaderInput" className="form-label">
                Header
              </label>
              <input
                type="text"
                className="form-control"
                id="landingPageHeaderInput"
                placeholder="Enter header text"
                value={cardData.header}
                onChange={(e) => handleInputChange("header", e.target.value)}
              />
            </div>
            <div className="mb-3">
              <label htmlFor="landingPageMessageInput" className="form-label">
                Message
              </label>
              <textarea
                className="form-control"
                id="landingPageMessageInput"
                rows={3}
                placeholder="Enter message text"
                value={cardData.message}
                onChange={(e) => handleInputChange("message", e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="col-md-6 mt-4 mt-md-0">
          <div
            className="border p-3 rounded bg-white"
            style={{ minHeight: "300px" }}
          >
            <h6 className="fw-bold mb-3 text-muted">Preview</h6>
            <div style={{ minHeight: "250px" }}>
              <LandingPageDisplay
                header={cardData.header}
                message={cardData.message}
                isPreview={true}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="d-flex justify-content-between mt-4">
        <button className="btn btn-secondary" onClick={previousStep}>
          <i className="fas fa-arrow-left me-1" /> Back
        </button>
        <button
          className="btn btn-primary"
          onClick={handleGenerateCard}
          disabled={isUploading || isSavingCard}
        >
          {isSavingCard ? "Generating..." : "Generate Card"}
        </button>
      </div>
    </div>
  );
}
