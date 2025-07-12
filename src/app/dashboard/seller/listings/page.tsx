"use client";

import { useState } from "react";
import { PlusCircle, Edit, Trash2 } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import AddListingModal from "@/shared/components/ui/AddListingModal";
import EditListingModal from "@/shared/components/ui/EditListingModal";
import DeleteListingModal from "@/shared/components/ui/DeleteListingModal";
// kvs: Removed react-toastify imports - no longer needed as all modals use Sonner toast

export default function ListingsPage() {
  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  return (
    <div className="min-h-screen w-full flex flex-col bg-gray-50">
      {/* Header Section */}
      <div className="px-8 pt-8 pb-6">
        <div className="max-w-4xl">
          <h1 className="text-4xl font-bold text-gray-900 mb-3">Manage your Listings</h1>
          <p className="text-lg text-gray-600 font-medium">Keep your listings organized and up to date</p>
        </div>
      </div>

      {/* Center options vertically and horizontally */}
      <div className="flex-1 flex flex-col items-center justify-center px-8 pb-16">
        <div className="w-full max-w-2xl space-y-6">
          {/* Add a Listing */}
          <div
            tabIndex={0}
            role="button"
            onClick={() => setAddOpen(true)}
            className="group relative overflow-hidden flex items-center justify-between px-8 py-8 bg-white border-2 border-gray-100 rounded-xl shadow-sm transition-all duration-300 cursor-pointer hover:shadow-lg hover:border-green-200 hover:-translate-y-1"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-50 rounded-full group-hover:bg-green-100 transition-colors duration-300">
                <PlusCircle className="text-green-600 group-hover:text-green-700 transition-colors duration-300" size={28} />
              </div>
              <div>
                <span className="font-semibold text-xl text-gray-900 group-hover:text-green-800 transition-colors duration-300 block">
                  Add a Listing
                </span>
                <span className="text-sm text-gray-500 group-hover:text-green-600 transition-colors duration-300">
                  Create a new event listing
                </span>
              </div>
            </div>
            <Button variant="default" className="pointer-events-none shadow-sm">Add</Button>
            {/* Subtle accent line */}
            <div className="absolute bottom-0 left-0 w-full h-1 bg-green-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
          </div>

          {/* Edit a Listing */}
          <div
            tabIndex={0}
            role="button"
            onClick={() => setEditOpen(true)}
            className="group relative overflow-hidden flex items-center justify-between px-8 py-8 bg-white border-2 border-gray-100 rounded-xl shadow-sm transition-all duration-300 cursor-pointer hover:shadow-lg hover:border-blue-200 hover:-translate-y-1"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-50 rounded-full group-hover:bg-blue-100 transition-colors duration-300">
                <Edit className="text-blue-600 group-hover:text-blue-700 transition-colors duration-300" size={28} />
              </div>
              <div>
                <span className="font-semibold text-xl text-gray-900 group-hover:text-blue-800 transition-colors duration-300 block">
                  Edit a Listing
                </span>
                <span className="text-sm text-gray-500 group-hover:text-blue-600 transition-colors duration-300">
                  Update existing event details
                </span>
              </div>
            </div>
            <Button variant="secondary" className="pointer-events-none shadow-sm">Edit</Button>
            {/* Subtle accent line */}
            <div className="absolute bottom-0 left-0 w-full h-1 bg-blue-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
          </div>

          {/* Delete a Listing */}
          <div
            tabIndex={0}
            role="button"
            onClick={() => setDeleteOpen(true)}
            className="group relative overflow-hidden flex items-center justify-between px-8 py-8 bg-white border-2 border-gray-100 rounded-xl shadow-sm transition-all duration-300 cursor-pointer hover:shadow-lg hover:border-red-200 hover:-translate-y-1"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 bg-red-50 rounded-full group-hover:bg-red-100 transition-colors duration-300">
                <Trash2 className="text-red-600 group-hover:text-red-700 transition-colors duration-300" size={28} />
              </div>
              <div>
                <span className="font-semibold text-xl text-gray-900 group-hover:text-red-800 transition-colors duration-300 block">
                  Delete a Listing
                </span>
                <span className="text-sm text-gray-500 group-hover:text-red-600 transition-colors duration-300">
                  Remove listings permanently
                </span>
              </div>
            </div>
            <Button variant="destructive" className="pointer-events-none shadow-sm">Delete</Button>
            {/* Subtle accent line */}
            <div className="absolute bottom-0 left-0 w-full h-1 bg-red-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <AddListingModal isOpen={addOpen} onClose={() => setAddOpen(false)} />
      <EditListingModal isOpen={editOpen} onClose={() => setEditOpen(false)} />
      <DeleteListingModal isOpen={deleteOpen} onClose={() => setDeleteOpen(false)} />

      {/* kvs: Removed ToastContainer as all toast notifications now use Sonner which is globally configured in layout.tsx */}
    </div>
  );
}