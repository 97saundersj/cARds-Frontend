import React from "react";
import { useNavigate } from "react-router";
import { initializeApp } from "firebase/app";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import type { CardData } from "../types/card";
import { Navbar } from "./ui/Navbar";
import { Footer } from "./ui/Footer";
import { CardLinkModal } from "./modals/CardLinkModal";
import { SharedStyles } from "./ui/SharedStyles";

// Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const storage = getStorage(app);

export function CardEditor() {
  const navigate = useNavigate();

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

  // Load data from URL parameters on component mount
  React.useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const header = urlParams.get("header") || "Happy Birthday!";
    const message =
      urlParams.get("message") || "Experience your AR card below.";
    const cardImage = urlParams.get("cardImage") || "birthday";
    const cardTop = urlParams.get("cardTop") || "Dear John,";
    const cardMiddle = urlParams.get("cardMiddle") || "Have a great birthday!";
    const cardBottom = urlParams.get("cardBottom") || "Love Jane";

    setCardData({
      header,
      message,
      cardImage,
      cardTop,
      cardMiddle,
      cardBottom,
    });

    if (cardImage === "custom") {
      setShowCustomImageInput(true);
    }
  }, []);

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
      const storageRef = ref(storage, `images/${file.name}`);
      const snapshot = await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);
      setCustomImageUrl(downloadURL);
    } catch (error) {
      console.error("Upload failed:", error);
      alert("Failed to upload image.");
    } finally {
      setIsUploading(false);
    }
  };

  const generateCardUrl = () => {
    const params = new URLSearchParams();
    params.set("header", cardData.header);
    params.set("message", cardData.message);
    params.set("cardTop", cardData.cardTop);
    params.set("cardMiddle", cardData.cardMiddle);
    params.set("cardBottom", cardData.cardBottom);

    const imageValue =
      cardData.cardImage === "custom" ? customImageUrl : cardData.cardImage;
    params.set("cardImage", imageValue);

    return `${window.location.origin}/view-card?${params.toString()}`;
  };

  const handleGenerateCard = () => {
    const url = generateCardUrl();
    setGeneratedUrl(url);
    setShowModal(true);
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

  const handleViewCard = () => {
    const params = new URLSearchParams({
      header: cardData.header,
      message: cardData.message,
      cardTop: cardData.cardTop,
      cardMiddle: cardData.cardMiddle,
      cardBottom: cardData.cardBottom,
      cardImage:
        cardData.cardImage === "custom" ? customImageUrl : cardData.cardImage,
    });

    window.open(
      `/view-card?${params.toString()}`,
      "_blank",
      "noopener,noreferrer"
    );
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
                    <div className="mt-2">
                      <small className="text-muted">
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

          <div className="footer text-end">
            <button
              className="btn btn-primary"
              onClick={handleGenerateCard}
              disabled={isUploading}
            >
              Generate Card
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
