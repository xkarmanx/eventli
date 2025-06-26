"use client";

import { useState } from "react";
import { PlusCircle, Edit, Trash2 } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import AddListingModal from "@/shared/components/ui/AddListingModal";
import EditListingModal from "@/shared/components/ui/EditListingModal";
import DeleteListingModal from "@/shared/components/ui/DeleteListingModal";

export default function ListingsPage() {
  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  return (
    <div className="min-h-screen w-full flex flex-col">
      {/* Title at the very top-left */}
      <h1 className="text-3xl font-bold mt-8 mb-16 ml-8">Manage your Listings</h1>
      {/* Center options vertically and horizontally */}
      <div className="flex-1 flex flex-col items-center justify-center">
        <div className="w-full max-w-md space-y-8">
          {/* Add a Listing */}
          <div
            tabIndex={0}
            role="button"
            onClick={() => setAddOpen(true)}
            className="flex items-center justify-between px-8 py-6 bg-white border border-gray-200 rounded-lg shadow transition-colors cursor-pointer hover:bg-gray-200 hover:border-gray-400 group"
          >
            <div className="flex items-center gap-3">
              <PlusCircle className="text-green-700 group-hover:text-green-900" size={28} />
              <span className="font-medium text-lg text-gray-800 group-hover:text-gray-900">Add a Listing</span>
            </div>
            <Button variant="default" className="pointer-events-none">Add</Button>
          </div>
          {/* Edit a Listing */}
          <div
            tabIndex={0}
            role="button"
            onClick={() => setEditOpen(true)}
            className="flex items-center justify-between px-8 py-6 bg-white border border-gray-200 rounded-lg shadow transition-colors cursor-pointer hover:bg-gray-200 hover:border-gray-400 group"
          >
            <div className="flex items-center gap-3">
              <Edit className="text-blue-700 group-hover:text-blue-900" size={28} />
              <span className="font-medium text-lg text-gray-800 group-hover:text-gray-900">Edit a Listing</span>
            </div>
            <Button variant="secondary" className="pointer-events-none">Edit</Button>
          </div>
          {/* Delete a Listing */}
          <div
            tabIndex={0}
            role="button"
            onClick={() => setDeleteOpen(true)}
            className="flex items-center justify-between px-8 py-6 bg-white border border-gray-200 rounded-lg shadow transition-colors cursor-pointer hover:bg-gray-200 hover:border-gray-400 group"
          >
            <div className="flex items-center gap-3">
              <Trash2 className="text-red-700 group-hover:text-red-900" size={28} />
              <span className="font-medium text-lg text-gray-800 group-hover:text-gray-900">Delete a Listing</span>
            </div>
            <Button variant="destructive" className="pointer-events-none">Delete</Button>
          </div>
        </div>
      </div>
      {/* Modals */}
      <AddListingModal isOpen={addOpen} onClose={() => setAddOpen(false)} />
      <EditListingModal isOpen={editOpen} onClose={() => setEditOpen(false)} />
      <DeleteListingModal isOpen={deleteOpen} onClose={() => setDeleteOpen(false)} />
    </div>
  );
}