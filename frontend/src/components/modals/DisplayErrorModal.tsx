import { AlertCircle } from "lucide-react";
import { Modal } from "./Modal";

interface DisplayErrorModalProps {
  isOpen: boolean;
  onClose: () => void;
  error: string;
}

export function DisplayErrorModal({
  isOpen,
  onClose,
  error,
}: DisplayErrorModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Error">
      <div className="flex items-start space-x-3">
        <AlertCircle className="h-6 w-6 text-red-500 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <p className="text-gray-900">{error}</p>
        </div>
      </div>
    </Modal>
  );
}
