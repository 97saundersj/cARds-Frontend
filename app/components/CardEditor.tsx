import React from "react";
import { useNavigate } from "react-router";
import type { CardData } from "../types/card";
import { Navbar } from "./ui/Navbar";
import { Footer } from "./ui/Footer";
import { CardLinkModal } from "./modals/CardLinkModal";
import { SharedStyles } from "./ui/SharedStyles";
import { getApi } from "../services/api/ApiProvider";
import { sessionCards } from "../services/storage/sessionCards";

export function CardEditor() {
  const navigate = useNavigate();

  const [cardName, setCardName] = React.useState("");
  const [selectedSessionCardId, setSelectedSessionCardId] =
    React.useState<string>("");
  const [sessionCardsList, setSessionCardsList] = React.useState(
    sessionCards.getAll()
  );
  const [cardData, setCardData] = React.useState<CardData>({
    header: "Happy Birthday!",
    message: "Experience your AR card below.",
    cardImage: "birthday",
    cardTop: "Dear John,",
    cardMiddle: "Have a great birthday!",
    cardBottom: "Love Jane",
  });
  const [customImageUrl, setCustomImageUrl] = React.useState("");
  const [showCustomImageInput, setShowCustomImageInput] = React.useState(false);
  const [isUploading, setIsUploading] = React.useState(false);
  const [showModal, setShowModal] = React.useState(false);
  const [generatedUrl, setGeneratedUrl] = React.useState("");
  const [isSavingCard, setIsSavingCard] = React.useState(false);
  const [currentCardId, setCurrentCardId] = React.useState<
    string | undefined
  >();

  // Load data from Firebase using card ID if present
  React.useEffect(() => {
    const loadCardData = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const cardId = urlParams.get("cardId");

      if (cardId) {
        try {
          const api = getApi();
          const savedCardData = await api.getCard(cardId);

          if (savedCardData) {
            setCurrentCardId(cardId);
            if (savedCardData.cardName) {
              setCardName(savedCardData.cardName);
            }
            const standardImages = [
              "birthday",
              "valentine",
              "halloween",
              "christmas",
            ];
            const isCustomImage = !standardImages.includes(
              savedCardData.cardImage
            );

            if (isCustomImage) {
              setCustomImageUrl(savedCardData.cardImage);
              setCardData({
                ...savedCardData,
                cardImage: "custom",
              });
              setShowCustomImageInput(true);
            } else {
              setCardData(savedCardData);
            }
          }
        } catch (error) {
          console.error("Failed to load card data:", error);
        }
      }
    };

    loadCardData();
  }, []);

  const handleSelectSessionCard = (cardId: string) => {
    setSelectedSessionCardId(cardId);

    if (!cardId) {
      setCardName("");
      setCardData({
        header: "Happy Birthday!",
        message: "Experience your AR card below.",
        cardImage: "birthday",
        cardTop: "Dear John,",
        cardMiddle: "Have a great birthday!",
        cardBottom: "Love Jane",
      });
      setCustomImageUrl("");
      setShowCustomImageInput(false);
      return;
    }

    const savedCard = sessionCards.getById(cardId);
    if (savedCard) {
      setCardName(savedCard.name);
      setCardData(savedCard.data);

      const standardImages = [
        "birthday",
        "valentine",
        "halloween",
        "christmas",
      ];
      const isCustomImage = !standardImages.includes(savedCard.data.cardImage);

      if (isCustomImage) {
        setCustomImageUrl(savedCard.data.cardImage);
        setCardData({
          ...savedCard.data,
          cardImage: "custom",
        });
        setShowCustomImageInput(true);
      } else {
        setShowCustomImageInput(false);
      }
    }
  };

  const handleDeleteFromSession = () => {
    if (!selectedSessionCardId) {
      alert("Please select a card to delete");
      return;
    }

    const cardToDelete = sessionCards.getById(selectedSessionCardId);
    if (
      cardToDelete &&
      confirm(`Are you sure you want to delete "${cardToDelete.name}"?`)
    ) {
      sessionCards.delete(selectedSessionCardId);
      setSessionCardsList(sessionCards.getAll());
      setSelectedSessionCardId("");
      setCardName("");
      setCardData({
        header: "Happy Birthday!",
        message: "Experience your AR card below.",
        cardImage: "birthday",
        cardTop: "Dear John,",
        cardMiddle: "Have a great birthday!",
        cardBottom: "Love Jane",
      });
      setCustomImageUrl("");
      setShowCustomImageInput(false);
    }
  };

  const handleInputChange = (field: keyof CardData, value: string) => {
    setCardData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleCardImageChange = (value: string) => {
    setCardData((prev) => ({
      ...prev,
      cardImage: value,
    }));
    setShowCustomImageInput(value === "custom");
  };

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) {
      alert("Please select an image file to upload.");
      return;
    }

    setIsUploading(true);

    try {
      const api = getApi();
      const result = await api.uploadImage(file);
      setCustomImageUrl(result.url);
    } catch (error) {
      console.error("Upload failed:", error);
      alert("Failed to upload image.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleGenerateCard = async () => {
    setIsSavingCard(true);
    try {
      const api = getApi();

      const cardDataToSave: CardData = {
        ...cardData,
        cardName: cardName || undefined,
        cardImage:
          cardData.cardImage === "custom" ? customImageUrl : cardData.cardImage,
      };

      // Save to session if card has a name
      if (cardName.trim()) {
        const savedCard = sessionCards.save(
          cardName,
          cardDataToSave,
          selectedSessionCardId || undefined
        );
        setSelectedSessionCardId(savedCard.id);
        setSessionCardsList(sessionCards.getAll());
      }

      const result = await api.saveCard(cardDataToSave, currentCardId);

      const basePath =
        window.location.pathname.split("/").slice(0, -1).join("/") || "";
      const url = `${window.location.origin}${basePath}/view-card/${result.id}`;

      setGeneratedUrl(url);
      setShowModal(true);
    } catch (error) {
      console.error("Failed to generate card:", error);
      alert("Failed to generate card. Please try again.");
    } finally {
      setIsSavingCard(false);
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(generatedUrl);
      alert("Shareable link copied to clipboard!");
    } catch (err) {
      console.error("Failed to copy link: ", err);
      alert("Failed to copy link to clipboard");
    }
  };

  const handleShareLink = async () => {
    const description =
      "Check out this custom greeting card created just for you!";

    if (navigator.share) {
      try {
        await navigator.share({
          title: "Check out this custom greeting card!",
          text: description,
          url: generatedUrl,
        });
      } catch (error) {
        console.error("Error sharing:", error);
      }
    } else {
      alert("Sharing not supported on this device.");
    }
  };

  const handleViewCard = async () => {
    setIsSavingCard(true);
    try {
      const api = getApi();

      const cardDataToSave: CardData = {
        ...cardData,
        cardName: cardName || undefined,
        cardImage:
          cardData.cardImage === "custom" ? customImageUrl : cardData.cardImage,
      };

      const result = await api.saveCard(cardDataToSave, currentCardId);

      navigate(`/view-card/${result.id}`);
    } catch (error) {
      console.error("Failed to save card:", error);
      alert("Failed to save card. Please try again.");
    } finally {
      setIsSavingCard(false);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  return (
    <div className="min-h-screen bg-light">
      <Navbar />

      <div className="container-fluid flex-grow-1 d-flex flex-column align-items-center py-4">
        <div className="container">
          <h5 className="text-muted mb-4">
            Create your own web based Augmented Reality greeting cards for any
            occasion!
          </h5>

          {/* Card Name and Selection */}
          <div className="mb-4">
            <h6 className="fw-bold">Card Management</h6>
            <p className="text-muted">
              Name your card and manage existing cards
            </p>
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
                      {card.name} (Last modified:{" "}
                      {new Date(card.lastModified).toLocaleString()})
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
                  placeholder="Enter a name for your card (e.g., Mom's Birthday Card)"
                  value={cardName}
                  onChange={(e) => setCardName(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Landing Page Form */}
          <div className="mb-4">
            <h6 className="fw-bold">Landing Page</h6>
            <p className="text-muted">
              Customize the landing page for your greeting card
            </p>
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

          {/* AR Card Form */}
          <div className="mb-4">
            <h6 className="fw-bold">AR Card</h6>
            <p className="text-muted">Customize your AR card</p>
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

          <div className="footer d-flex justify-content-between">
            <button
              className="btn btn-danger"
              onClick={handleDeleteFromSession}
              disabled={!selectedSessionCardId}
            >
              Delete Card
            </button>
            <button
              className="btn btn-primary"
              onClick={handleGenerateCard}
              disabled={isUploading || isSavingCard}
            >
              {isSavingCard ? "Generating..." : "Generate Card"}
            </button>
          </div>

          <CardLinkModal
            isOpen={showModal}
            onClose={handleCloseModal}
            onViewCard={handleViewCard}
            generatedUrl={generatedUrl}
            onCopyLink={handleCopyLink}
            onShareLink={handleShareLink}
          />
        </div>
      </div>

      <Footer />
      <SharedStyles />
    </div>
  );
}
