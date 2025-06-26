"use client";

import { useRef, useState } from "react";
import { Camera } from "lucide-react";
import { Button } from "@/shared/components/ui/button";

export default function SellerProfilePage() {
  // Dummy user data for UI
  const [profilePic, setProfilePic] = useState<string | null>(null);
  const [previewPic, setPreviewPic] = useState<string | null>(null);

  const [name, setName] = useState("John Seller");
  const [email, setEmail] = useState("seller@email.com");
  const [phone, setPhone] = useState("0912 345 6789");

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Handle image change
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setPreviewPic(url);
      setProfilePic(url);
    }
  };

  const handlePicClick = () => {
    fileInputRef.current?.click();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Save logic here later
  };

  return (
    <div className="min-h-screen flex flex-col items-center bg-gray-50 py-10">
      <div className="bg-white rounded-xl shadow max-w-md w-full p-6">
        <h1 className="text-xl font-bold mb-6 text-gray-900">Edit Profile</h1>
        <form onSubmit={handleSubmit} className="space-y-7">
          {/* Profile Picture */}
          <div className="flex flex-col items-center gap-2 mb-4">
            <div className="relative group">
              <img
                src={
                  previewPic ||
                  "https://ui-avatars.com/api/?name=" +
                    encodeURIComponent(name) +
                    "&background=0D8ABC&color=fff"
                }
                alt="Profile"
                className="w-20 h-20 rounded-full object-cover border-2 border-gray-200"
              />
              <button
                type="button"
                onClick={handlePicClick}
                className="absolute bottom-1 right-1 bg-white rounded-full p-1 shadow hover:bg-gray-100 border border-gray-200"
                aria-label="Change profile picture"
              >
                <Camera className="w-4 h-4 text-gray-700" />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageChange}
              />
            </div>
          </div>

          {/* Profile Info */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Name
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:border-teal-500"
            />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:border-teal-500"
            />
          </div>
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
              Phone
            </label>
            <input
              id="phone"
              type="tel"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:border-teal-500"
            />
          </div>

          <div className="flex justify-end">
            <Button type="submit" variant="default">
              Save Changes
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}