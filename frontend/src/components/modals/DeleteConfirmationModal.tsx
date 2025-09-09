import { AlertTriangle } from "lucide-react";
import { Modal } from "./Modal";
import { Button } from "../ui/Button";

export interface DeleteConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmButtonText?: string;
  isLoading?: boolean;
  loadingText?: string;
}

export function DeleteConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmButtonText = "Delete",
  isLoading = false,
  loadingText,
}: DeleteConfirmationModalProps) {
  const handleConfirm = () => {
    onConfirm();
  };

  const getLoadingText = () => {
    if (loadingText) return loadingText;
    if (confirmButtonText === "Remove") return "Removing...";
    return "Deleting...";
  };

  const handleModalClose = () => {
    if (!isLoading) {
      onClose();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleModalClose} title={title}>
      <div className="space-y-3 max-w-sm mx-auto">
        {/* Warning Icon */}
        <div className="flex justify-center">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100">
            <AlertTriangle className="h-5 w-5 text-red-600" />
          </div>
        </div>

        {/* Message */}
        <div className="text-center">
          <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">
            {message}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 justify-end pt-2">
          <Button
            onClick={onClose}
            variant="secondary"
            disabled={isLoading}
            className="px-3 py-1.5 text-sm"
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            variant="danger"
            disabled={isLoading}
            className="px-3 py-1.5 text-sm"
          >
            {isLoading ? getLoadingText() : confirmButtonText}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
