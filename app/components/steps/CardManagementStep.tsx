import React from "react";
import type { SavedCard } from "../../services/storage/sessionCards";

interface CardManagementStepProps {
  cardName: string;
  setCardName: (name: string) => void;
  selectedSessionCardId: string;
  sessionCardsList: SavedCard[];
  handleSelectSessionCard: (cardId: string) => void;
  handleDeleteFromSession: () => void;
  nextStep?: () => void;
}

export function CardManagementStep({
  cardName,
  setCardName,
  selectedSessionCardId,
  sessionCardsList,
  handleSelectSessionCard,
  handleDeleteFromSession,
  nextStep,
}: CardManagementStepProps) {
  const isCreatingNewCard = selectedSessionCardId === "";
  const canProceed = isCreatingNewCard ? cardName.trim() !== "" : true;

  return (
    <div>
      <h6 className="fw-bold">Card Management</h6>
      <p className="text-muted">Name your card and manage existing cards</p>
      <div className="border p-3 rounded bg-light">
        <div className="mb-3">
          <label htmlFor="selectExistingCard" className="form-label">
            Load Existing Card
          </label>
          <select
            className="form-select"
            id="selectExistingCard"
            value={selectedSessionCardId}
            onChange={(e) => handleSelectSessionCard(e.target.value)}
          >
            <option value="">-- Create New Card --</option>
            {sessionCardsList.map((card) => (
              <option key={card.id} value={card.id}>
                {card.name}
              </option>
            ))}
          </select>
        </div>

        <div className="mb-3">
          <label htmlFor="cardNameInput" className="form-label">
            Card Name
          </label>
          <input
            type="text"
            className="form-control"
            id="cardNameInput"
            placeholder="Name your card (e.g., Mom's Birthday Card)"
            value={cardName}
            onChange={(e) => setCardName(e.target.value)}
          />
        </div>
      </div>

      <div className="d-flex justify-content-between mt-4">
        <button
          className="btn btn-danger"
          onClick={handleDeleteFromSession}
          disabled={!selectedSessionCardId}
        >
          Delete Card
        </button>
        <button
          className="btn btn-primary"
          onClick={nextStep}
          disabled={!canProceed}
        >
          Next <i className="fas fa-arrow-right ms-1" />
        </button>
      </div>
    </div>
  );
}
