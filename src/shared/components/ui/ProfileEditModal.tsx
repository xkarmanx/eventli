"use client";

import { useRef, useState, useEffect } from "react";
import { Camera, User, Mail, Phone, MapPin, Award, Settings, X } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { updateProfile, updateProfileComplete } from "@/features/services/profile_crud";
import { createClient } from "@/shared/lib/supabase/client";
import { toast } from "sonner";

// JC: Define what data the modal expects to receive
interface ProfileEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  userType: 'seller' | 'customer';
  userId: string;
  userData?: {
    name: string;
    email: string;
    phone: string;
    location: string;
    bio: string;
    website: string;
    profilePic: string;
  };
  onSave?: () => void;
}

export interface ProfileUpdate {
  full_name: string;
  email: string;
  phone: string;
  location: string;
  bio: string;
  website: string;
  avatar_url: string | null;
}

const supabase = createClient();

export default function ProfileEditModal({ isOpen, onClose, userType, userId, userData, onSave }: ProfileEditModalProps) {
  // JC: State to store form data with initial values from props
  const [profilePic, setProfilePic] = useState<string | null>(userData?.profilePic || null);
  const [previewPic, setPreviewPic] = useState<string | null>(userData?.profilePic || null);

  // JC: Form fields with initial values from database
  const [name, setName] = useState(userData?.name || "");
  const [email, setEmail] = useState(userData?.email || "");
  const [phone, setPhone] = useState(userData?.phone || "");
  const [location, setLocation] = useState(userData?.location || "");
  const [bio, setBio] = useState(userData?.bio || "");
  
  // JC: Website field for business info
  const [website, setWebsite] = useState(userData?.website || "");

  // CT: stores the image file for upload
  const [imageFile, setImageFile] = useState<File | null>(null);

  // CT: Track if the user has edited their email so useEffect doesnt override it
  const [hasEditedEmail, setHasEditedEmail] = useState(false);
  
  // JC: Update form when new user data comes in
  useEffect(() => {
    if (userData) {
      setName(userData.name || "");
      if (!hasEditedEmail) 
        setEmail(userData.email || "");
      setPhone(userData.phone || "");
      setLocation(userData.location || "");
      setBio(userData.bio || "");
      setWebsite(userData.website || "");
      setProfilePic(userData.profilePic || null);
      setPreviewPic(userData.profilePic || null);
    }
  }, [userData, hasEditedEmail]);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // JC: Handle profile picture upload
  // CT: Updated url since the object only stays alive in memory but not after reload or close
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB limit
    const file = e.target.files?.[0];
    
    if (file) {
      if (file.size > MAX_FILE_SIZE) {
        alert("File size exceeds 2MB. Please choose a smaller image.");
        return;
      }
      const url = URL.createObjectURL(file);
      setPreviewPic(url);
      //setProfilePic(url);
      setImageFile(file);
    }
  };

  // JC: Open file picker when user clicks camera button
  const handlePicClick = () => {
    fileInputRef.current?.click();
  };

  // JC: Save form data when user submits
  const handleSubmit = async(e: React.FormEvent) => {
    e.preventDefault();

    // CT: Upload profile picture to storage if a new image is selected
    let uploadedUrl = profilePic;

    if (imageFile) {
      const fileExt = imageFile.name.split(".").pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `${userId}/${fileName}`;


      const { error: uploadError } = await supabase.storage
        .from("profile-avatar-images")
        .upload(filePath, imageFile, {
          upsert: true,
        });

      if (uploadError) {
        console.error("Image upload failed:", uploadError);
      } else {
        const { data: publicUrlData } = supabase.storage
          .from("profile-avatar-images")
          .getPublicUrl(filePath);
        uploadedUrl = publicUrlData?.publicUrl || null;
      }
    }

    const updatedData: ProfileUpdate = {
      full_name: name,
      email,
      phone,
      location,
      bio,
      website,
      avatar_url: uploadedUrl,
    };
  
    // CT: Logic to update profile in database
    try {
      await updateProfile(userId, updatedData);
      await updateProfileComplete(userId);
      toast.success("Profile updated successfully!");
    } 
    catch (error) {
      console.error("Failed to update profile:", error);
    }

    onSave?.();
    onClose();
  };

  // JC: Close modal when user presses escape key and prevent body scroll
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300"
        onClick={onClose}
      />
      
      {/* Modal Container */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto transform transition-all duration-300 scale-100">
          
          {/* Header */}
          <div className="sticky top-0 bg-white border-b border-gray-200 px-8 py-6 rounded-t-2xl z-10">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Edit Profile</h2>
                <p className="text-gray-600 mt-1">Update your {userType} profile information</p>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200"
                aria-label="Close modal"
              >
                <X className="w-6 h-6 text-gray-500" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-8">
            <form onSubmit={handleSubmit} className="space-y-8">
              
              {/* JC: Personal info form section */}
              <div className="bg-gray-50 rounded-2xl p-6 border border-gray-200">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-teal-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">Personal Information</h3>
                    <p className="text-sm text-gray-600">Update your personal details and profile picture</p>
                  </div>
                </div>
                
                {/* JC: Profile picture upload section */}
                <div className="flex flex-col items-center gap-4 mb-8">
                  <div className="relative group">
                    <img
                      src={
                        previewPic ||
                        userData?.profilePic ||
                        "https://ui-avatars.com/api/?name=" +
                          encodeURIComponent(name) +
                          "&background=0D8ABC&color=fff&size=120"
                      }
                      alt="Profile"
                      className="w-24 h-24 rounded-full object-cover border-4 border-gray-200 shadow-lg group-hover:border-teal-300 transition-colors duration-300"
                    />
                    <button
                      type="button"
                      onClick={handlePicClick}
                      className="absolute -bottom-2 -right-2 bg-teal-600 rounded-full p-3 shadow-lg hover:bg-teal-700 border-4 border-white transition-all duration-300 hover:scale-110"
                      aria-label="Change profile picture"
                    >
                      <Camera className="w-4 h-4 text-white" />
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageChange}
                    />
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-semibold text-gray-900">{name}</div>
                    <div className="text-sm text-gray-500 capitalize">Professional {userType}</div>
                  </div>
                </div>

                {/* JC: Form fields for personal info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-2">
                      Full Name
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                      <input
                        id="name"
                        type="text"
                        value={name}
                        onChange={e => setName(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200"
                        placeholder="Enter your full name"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                      <input
                        id="email"
                        type="email"
                        value={email}
                        onChange={e => {
                          setHasEditedEmail(true);
                          setEmail(e.target.value)}}
                        className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200"
                        placeholder="Enter your email"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="phone" className="block text-sm font-semibold text-gray-700 mb-2">
                      Phone Number
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                      <input
                        id="phone"
                        type="tel"
                        value={phone}
                        onChange={e => setPhone(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200"
                        placeholder="Enter your phone number"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="location" className="block text-sm font-semibold text-gray-700 mb-2">
                      Location
                    </label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                      <input
                        id="location"
                        type="text"
                        value={location}
                        onChange={e => setLocation(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200"
                        placeholder="Enter your city, province"
                      />
                    </div>
                  </div>
                </div>
                
                <div className="mt-6">
                  <label htmlFor="bio" className="block text-sm font-semibold text-gray-700 mb-2">
                    Professional Bio
                  </label>
                  <textarea
                    id="bio"
                    value={bio}
                    onChange={e => setBio(e.target.value)}
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200 resize-none"
                    placeholder="Tell potential clients about your experience and expertise..."
                  />
                </div>
              </div>

              {/* JC: Business info section - only for sellers */}
              {userType === 'seller' && (
                <div className="bg-gray-50 rounded-2xl p-6 border border-gray-200">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <Award className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">Business Information</h3>
                      <p className="text-sm text-gray-600">Add your business website</p>
                    </div>
                  </div>
                  
                  {/* JC: Website input field */}
                  <div>
                    <label htmlFor="website" className="block text-sm font-semibold text-gray-700 mb-2">
                      Website URL
                    </label>
                    <input
                      id="website"
                      type="url"
                      value={website}
                      onChange={e => setWebsite(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200"
                      placeholder="https://yourwebsite.com"
                    />
                  </div>
                </div>
              )}

              {/* JC: Save and cancel buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-end pt-6 border-t border-gray-200">
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={onClose}
                  className="px-8 py-3 text-gray-700 border-gray-300 hover:bg-gray-50 transition-all duration-200"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  className="px-8 py-3 bg-teal-600 text-white hover:bg-teal-700 transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
                >
                  Save Changes
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
