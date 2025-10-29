import React from "react";
import type { CardData } from "../../types/card";
import { CardPreview } from "../CardPreview";

interface ARCardStepProps {
  cardData: CardData;
  frontPageCanvasImage: string;
  handleInputChange: (field: keyof CardData, value: string) => void;
  previousStep?: () => void;
  nextStep?: () => void;
}

export function ARCardStep({
  cardData,
  frontPageCanvasImage,
  handleInputChange,
  previousStep,
  nextStep,
}: ARCardStepProps) {
  return (
    <div>
      <h6 className="fw-bold">AR Card</h6>
      <p className="text-muted">Customize your AR card</p>

      <div className="row">
        <div className="col-md-6">
          <div className="border p-3 rounded bg-light">
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
                  cardData.cardImage === "custom" && frontPageCanvasImage
                    ? frontPageCanvasImage
                    : cardData.cardImage,
                cardTop: cardData.cardTop || "Top Text",
                cardMiddle: cardData.cardMiddle || "Middle Text",
                cardBottom: cardData.cardBottom || "Bottom Text",
              }}
            />
          </div>
        </div>
      </div>

      <div className="d-flex justify-content-between mt-4">
        <button className="btn btn-secondary" onClick={previousStep}>
          <i className="fas fa-arrow-left me-1" /> Back
        </button>
        <button className="btn btn-primary" onClick={nextStep}>
          Next <i className="fas fa-arrow-right ms-1" />
        </button>
      </div>
    </div>
  );
}
