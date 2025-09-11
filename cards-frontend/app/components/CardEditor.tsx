import React from "react";
import { useNavigate } from "react-router";
import { initializeApp } from "firebase/app";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import type { CardData, CardEditorProps } from "../types/card";
import { Navbar } from "./ui/Navbar";
import { Footer } from "./ui/Footer";
import { LandingPageForm } from "./forms/LandingPageForm";
import { ARCardForm } from "./forms/ARCardForm";
import { CardLinkModal } from "./modals/CardLinkModal";
import { SharedStyles } from "./ui/SharedStyles";
import { getUnityConfig } from "../config/unity";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBIuTnTru0iILMqOyKRzu2mZtIBnxEhdug",
  authDomain: "fir-test-d319a.firebaseapp.com",
  projectId: "fir-test-d319a",
  storageBucket: "fir-test-d319a.firebasestorage.app",
  messagingSenderId: "913686234554",
  appId: "1:913686234554:android:0b20d5d7e441a710",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const storage = getStorage(app);

export function CardEditor({ unityUrl: propUnityUrl }: CardEditorProps) {
  const navigate = useNavigate();
  const unityConfig = getUnityConfig();

  console.log("🎨 CardEditor: Component initialized");
  console.log("🎨 CardEditor: Unity config loaded:", unityConfig);

  const [cardData, setCardData] = React.useState<CardData>({
    header: "Happy Birthday!",
    message: "Experience your AR card below.",
    cardImage: "birthday",
    cardTop: "Dear John,",
    cardMiddle: "Have a great birthday!",
    cardBottom: "Love Jane",
    unityUrl: unityConfig.unityUrl,
    buildName: unityConfig.buildName,
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
      unityUrl: unityConfig.unityUrl,
      buildName: unityConfig.buildName,
    });

    if (cardImage === "custom") {
      setShowCustomImageInput(true);
    }
  }, [unityConfig]);

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
      console.log("File available at", downloadURL);
    } catch (error) {
      console.error("Upload failed:", error);
      alert("Failed to upload image.");
    } finally {
      setIsUploading(false);
    }
  };

  const generateCardUrl = () => {
    console.log("🎨 CardEditor: Generating card URL");
    console.log("🎨 CardEditor: Card data:", cardData);
    console.log("🎨 CardEditor: Custom image URL:", customImageUrl);

    const params = new URLSearchParams();
    params.set("header", cardData.header);
    params.set("message", cardData.message);
    params.set("cardTop", cardData.cardTop);
    params.set("cardMiddle", cardData.cardMiddle);
    params.set("cardBottom", cardData.cardBottom);

    const imageValue =
      cardData.cardImage === "custom" ? customImageUrl : cardData.cardImage;
    params.set("cardImage", imageValue);

    const generatedUrl = `${window.location.origin}/view-card?${params.toString()}`;
    console.log("🎨 CardEditor: Generated URL:", generatedUrl);

    return generatedUrl;
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
        console.log("Successful share");
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

    navigate(`/view-card?${params.toString()}`);
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

          <LandingPageForm
            header={cardData.header}
            message={cardData.message}
            onHeaderChange={(value) => handleInputChange("header", value)}
            onMessageChange={(value) => handleInputChange("message", value)}
          />

          <ARCardForm
            selectedImage={cardData.cardImage}
            customImageUrl={customImageUrl}
            isUploading={isUploading}
            showCustomInput={showCustomImageInput}
            cardTop={cardData.cardTop}
            cardMiddle={cardData.cardMiddle}
            cardBottom={cardData.cardBottom}
            onImageChange={handleCardImageChange}
            onFileUpload={handleFileUpload}
            onTopChange={(value) => handleInputChange("cardTop", value)}
            onMiddleChange={(value) => handleInputChange("cardMiddle", value)}
            onBottomChange={(value) => handleInputChange("cardBottom", value)}
          />

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
