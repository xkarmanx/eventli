"use client";

import { useState } from "react";
import { Button } from "@/shared/components/ui/button";
import { AlertTriangle, Trash2, X } from "lucide-react";
import { deleteUserProfile } from "@/features/services/profile_deletion";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface DeleteProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  userRole: string;
}

export default function DeleteProfileModal({ isOpen, onClose, userId, userRole }: DeleteProfileModalProps) {
  const [loading, setLoading] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const router = useRouter();

  const handleDelete = async () => {
    if (confirmText !== "DELETE") {
      toast.error("Please type 'DELETE' to confirm");
      return;
    }

    setLoading(true);
    try {
      await deleteUserProfile(userId);
      toast.success("Profile deleted successfully");
      
      // Redirect to home page after successful deletion
      router.push("/");
    } catch (error: any) {
      toast.error(error.message || "Failed to delete profile");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md transform transition-all duration-300 scale-100">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Delete Profile</h2>
              <p className="text-sm text-gray-600">This action cannot be undone</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200"
            disabled={loading}
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="mb-6">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
              <h3 className="font-semibold text-red-800 mb-2">Warning: This will permanently delete:</h3>
              <ul className="text-sm text-red-700 space-y-1">
                <li>• Your profile and account data</li>
                {userRole === "seller" && (
                  <>
                    <li>• All your listings and media</li>
                    <li>• Your booking requests and analytics</li>
                    <li>• Your active boosts and plans</li>
                  </>
                )}
                {userRole === "customer" && (
                  <li>• Your booking requests and history</li>
                )}
                <li>• Your login credentials</li>
              </ul>
            </div>

            <p className="text-gray-700 mb-4">
              Once you delete your profile, there is no going back. Please be certain.
            </p>

            <div>
              <label htmlFor="confirmText" className="block text-sm font-medium text-gray-700 mb-2">
                Type <span className="font-bold text-red-600">DELETE</span> to confirm:
              </label>
              <input
                id="confirmText"
                type="text"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                placeholder="Type DELETE here"
                disabled={loading}
              />
            </div>
          </div>

          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleDelete}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white"
              disabled={loading || confirmText !== "DELETE"}
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Deleting...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Trash2 className="w-4 h-4" />
                  Delete Profile
                </div>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
