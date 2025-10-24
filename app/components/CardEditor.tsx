import React from "react";
import { useNavigate } from "react-router";
import StepWizard from "react-step-wizard";
import type { CardData } from "../types/card";
import { Navbar } from "./ui/Navbar";
import { Footer } from "./ui/Footer";
import { CardLinkModal } from "./modals/CardLinkModal";
import { getApi } from "../services/api/ApiProvider";
import { sessionCards } from "../services/storage/sessionCards";
import { WizardNav } from "./ui/WizardNav";
import { CardManagementStep } from "./steps/CardManagementStep";
import { LandingPageStep } from "./steps/LandingPageStep";
import { ARCardStep } from "./steps/ARCardStep";

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

      window.open(`/view-card/${result.id}`, "_blank");
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
    <div className="d-flex flex-column min-vh-100 bg-light">
      <Navbar />

      <div
        className="container-fluid d-flex flex-column align-items-center py-4"
        style={{ overflow: "hidden" }}
      >
        <h5 className="text-muted mb-4">
          Create your own web based Augmented Reality greeting cards for any
          occasion!
        </h5>

        <StepWizard nav={<WizardNav />} className="step-wizard">
          <CardManagementStep
            cardName={cardName}
            setCardName={setCardName}
            selectedSessionCardId={selectedSessionCardId}
            sessionCardsList={sessionCardsList}
            handleSelectSessionCard={handleSelectSessionCard}
            handleDeleteFromSession={handleDeleteFromSession}
          />

          <LandingPageStep
            cardData={cardData}
            handleInputChange={handleInputChange}
          />

          <ARCardStep
            cardData={cardData}
            customImageUrl={customImageUrl}
            showCustomImageInput={showCustomImageInput}
            isUploading={isUploading}
            isSavingCard={isSavingCard}
            handleInputChange={handleInputChange}
            handleCardImageChange={handleCardImageChange}
            handleFileUpload={handleFileUpload}
            handleGenerateCard={handleGenerateCard}
          />
        </StepWizard>

        <CardLinkModal
          isOpen={showModal}
          onClose={handleCloseModal}
          onViewCard={handleViewCard}
          generatedUrl={generatedUrl}
          onCopyLink={handleCopyLink}
          onShareLink={handleShareLink}
        />
      </div>

      <div className="mt-auto">
        <Footer />
      </div>
    </div>
  );
}
