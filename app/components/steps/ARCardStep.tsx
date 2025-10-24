import React from "react";
import type { CardData } from "../../types/card";
import { CardPreview } from "../CardPreview";

interface ARCardStepProps {
  cardData: CardData;
  customImageUrl: string;
  showCustomImageInput: boolean;
  isUploading: boolean;
  isSavingCard: boolean;
  handleInputChange: (field: keyof CardData, value: string) => void;
  handleCardImageChange: (value: string) => void;
  handleFileUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  handleGenerateCard: () => void;
  previousStep?: () => void;
}

export function ARCardStep({
  cardData,
  customImageUrl,
  showCustomImageInput,
  isUploading,
  isSavingCard,
  handleInputChange,
  handleCardImageChange,
  handleFileUpload,
  handleGenerateCard,
  previousStep,
}: ARCardStepProps) {
  return (
    <div>
      <h6 className="fw-bold">AR Card</h6>
      <p className="text-muted">Customize your AR card</p>

      <div className="row">
        <div className="col-md-6">
          <div className="border p-3 rounded bg-light">
            {/* Card Image Selector */}
            <div className="mb-3">
              <label htmlFor="cardImageInput" className="form-label">
                Card Image
              </label>
              <select
                className="form-select"
                id="cardImageInput"
                value={cardData.cardImage}
                onChange={(e) => handleCardImageChange(e.target.value)}
              >
                <option value="birthday">Birthday</option>
                <option value="valentine">Valentine's Day</option>
                <option value="halloween">Halloween</option>
                <option value="christmas">Christmas</option>
                <option value="custom">Custom</option>
              </select>
            </div>

            {showCustomImageInput && (
              <div className="mb-3">
                <label htmlFor="customImageFile" className="form-label">
                  Image
                </label>
                <div style={{ display: "flex", alignItems: "center" }}>
                  <input
                    type="file"
                    className="form-control"
                    id="customImageFile"
                    accept="image/*"
                    onChange={handleFileUpload}
                    disabled={isUploading}
                  />
                  {isUploading && (
                    <i
                      className="fas fa-spinner fa-spin"
                      style={{ marginLeft: "10px" }}
                    />
                  )}
                </div>
                {customImageUrl && (
                  <div className="mt-3">
                    <div className="border rounded p-2 bg-white d-inline-block">
                      <img
                        src={customImageUrl}
                        alt="Custom card preview"
                        style={{
                          maxWidth: "200px",
                          maxHeight: "200px",
                          display: "block",
                        }}
                      />
                    </div>

                    <small className="text-muted d-block mb-2">
                      Image uploaded successfully!
                    </small>
                  </div>
                )}
              </div>
            )}

            {/* Card Text Form */}
            <div className="mb-3">
              <label htmlFor="cardTopInput" className="form-label">
                Top Text
              </label>
              <input
                type="text"
                className="form-control"
                id="cardTopInput"
                placeholder="Enter top text"
                value={cardData.cardTop}
                onChange={(e) => handleInputChange("cardTop", e.target.value)}
              />
            </div>
            <div className="mb-3">
              <label htmlFor="cardMiddleInput" className="form-label">
                Middle Text
              </label>
              <textarea
                className="form-control"
                id="cardMiddleInput"
                placeholder="Enter middle text"
                value={cardData.cardMiddle}
                onChange={(e) =>
                  handleInputChange("cardMiddle", e.target.value)
                }
              />
            </div>
            <div className="mb-3">
              <label htmlFor="cardBottomInput" className="form-label">
                Bottom Text
              </label>
              <textarea
                className="form-control"
                id="cardBottomInput"
                placeholder="Enter bottom text"
                value={cardData.cardBottom}
                onChange={(e) =>
                  handleInputChange("cardBottom", e.target.value)
                }
              />
            </div>
          </div>
        </div>

        <div className="col-md-6 mt-4 mt-md-0">
          <div
            className="border p-3 rounded bg-white"
            style={{ minHeight: "300px" }}
          >
            <h6 className="fw-bold mb-3 text-muted">3D Preview</h6>
            <CardPreview
              isOpen={true}
              mode="inline"
              cardData={{
                cardImage:
                  cardData.cardImage === "custom"
                    ? customImageUrl
                    : cardData.cardImage,
                cardTop: cardData.cardTop,
                cardMiddle: cardData.cardMiddle,
                cardBottom: cardData.cardBottom,
              }}
            />
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
