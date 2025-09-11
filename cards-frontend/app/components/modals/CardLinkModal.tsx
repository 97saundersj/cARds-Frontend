import { Modal } from "../ui/Modal";

interface CardLinkModalProps {
  isOpen: boolean;
  onClose: () => void;
  onViewCard: () => void;
  generatedUrl: string;
  onCopyLink: () => void;
  onShareLink: () => void;
}

export function CardLinkModal({
  isOpen,
  onClose,
  onViewCard,
  generatedUrl,
  onCopyLink,
  onShareLink,
}: CardLinkModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Your Custom Card Link"
      size="lg"
    >
      <p className="text-muted">
        Here is the link to your custom greeting card
      </p>

      <div className="card bg-light p-3 mb-3 position-relative">
        <div className="position-absolute top-0 end-0 p-2">
          <i
            className="fas fa-copy copy-icon me-2"
            onClick={onCopyLink}
            title="Copy Link"
            style={{ cursor: "pointer" }}
          />
          <i
            className="fas fa-share-alt share-icon"
            onClick={onShareLink}
            title="Share Link"
            style={{ cursor: "pointer" }}
          />
        </div>
        <div className="text-center p-3">
          <a
            href={generatedUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-break fw-bold"
          >
            {generatedUrl}
          </a>
        </div>
      </div>

      <p className="text-muted">
        You can copy the link or share it directly with your friends and family!
      </p>

      <div className="modal-footer d-flex justify-content-between">
        <button type="button" className="btn btn-secondary" onClick={onClose}>
          Keep Editing
        </button>
        <button type="button" className="btn btn-primary" onClick={onViewCard}>
          Try it out
        </button>
      </div>
    </Modal>
  );
}
