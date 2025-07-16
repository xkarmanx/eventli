"use client";

import { Button } from "@/shared/components/ui/button";

// JC: Interface for the modal props - receives plan data and control functions
interface BoostingModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedPlan: {
    name: string;
    duration: string;
    maxListings: number;
    price: number;
  } | null;
  onConfirm: () => void;
}

export default function BoostingModal({ isOpen, onClose, selectedPlan, onConfirm }: BoostingModalProps) {
  // JC: Don't render anything if modal is closed or no plan selected
  if (!isOpen || !selectedPlan) return null;

  // JC: Function handles backdrop clicks to close modal
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose(); // JC: Close modal only if clicked on backdrop, not modal content
    }
  };

  // JC: Function handles escape key press to close modal
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose(); // JC: Close modal when escape key is pressed
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={handleBackdropClick} // JC: Close modal when clicking outside
      onKeyDown={handleKeyDown} // JC: Handle escape key
      tabIndex={-1}
    >
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 transform transition-all duration-300 scale-100">
        {/* JC: Modal header with plan name */}
        <div className="text-center mb-6">
          <h3 className="text-2xl font-bold text-gray-900 mb-2">
            Boost with {selectedPlan.name}
          </h3>
          <p className="text-gray-600">
            Confirm your boost plan selection
          </p>
        </div>

        {/* JC: Plan details display */}
        <div className="bg-gray-50 rounded-xl p-6 mb-6">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Duration:</span>
              <span className="font-semibold text-gray-900">{selectedPlan.duration}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Max listings:</span>
              <span className="font-semibold text-gray-900">{selectedPlan.maxListings} listings</span>
            </div>
            <div className="border-t border-gray-200 pt-4">
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold text-gray-900">Total Price:</span>
                <span className="text-2xl font-bold text-teal-600">${selectedPlan.price}</span>
              </div>
            </div>
          </div>
        </div>

        {/* JC: Action buttons */}
        <div className="flex gap-3">
          <Button 
            variant="outline"
            className="flex-1 cursor-pointer border-gray-300 hover:bg-gray-50 transition-all duration-200"
            onClick={onClose} // JC: Close modal without processing payment
          >
            Cancel
          </Button>
          <Button 
            className="flex-1 cursor-pointer bg-teal-600 hover:bg-teal-700 text-white transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
            onClick={onConfirm} // JC: Process payment and close modal
          >
            Continue to Payment
          </Button>
        </div>

        {/* JC: Additional info */}
        <p className="text-xs text-gray-500 text-center mt-4">
          Payment processing will redirect you to our secure payment gateway
        </p>
      </div>
    </div>
  );
}