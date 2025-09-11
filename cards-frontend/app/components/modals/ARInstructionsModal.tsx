import { Modal } from "../ui/Modal";

interface ARInstructionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGotIt: () => void;
}

export function ARInstructionsModal({
  isOpen,
  onClose,
  onGotIt,
}: ARInstructionsModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="How to Use the AR Card">
      <ol>
        <li>Ensure that you're using an Android Phone or XR Device</li>
        <li>Stand up</li>
        <li>Move your phone around to scan the floor</li>
        <li>Tap to place the card</li>
      </ol>

      <div className="modal-footer">
        <button type="button" className="btn btn-primary" onClick={onGotIt}>
          Got it!
        </button>
      </div>
    </Modal>
  );
}
