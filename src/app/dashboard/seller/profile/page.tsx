"use client";

import { useState, useEffect } from "react";
import { User, Mail, Phone, MapPin, Calendar, Star, Award, Settings, Edit, Globe, Building } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import ProfileEditModal from "@/shared/components/ui/ProfileEditModal";
import { createClient } from '@/shared/lib/supabase/client'; // JC: Get real user data from database

export default function SellerProfilePage() {
  // JC: State to control edit modal open/close
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  
  // JC: State to store real user data from database instead of mock data
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [authLoading, setAuthLoading] = useState(true);

  // JC: Get user login info when page loads
  useEffect(() => {
    const supabase = createClient();
    
    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
          console.error('Error getting session:', error);
          setUser(null);
        } else {
          setUser(session?.user || null);
        }
      } catch (error) {
        console.error('Error in getInitialSession:', error);
        setUser(null);
      } finally {
        setAuthLoading(false);
      }
    };

    getInitialSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user || null);
        setAuthLoading(false);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // JC: Get user profile data from database when user is logged in
  useEffect(() => {
    if (user?.id && !authLoading) {
      fetchProfile();
    }
  }, [user?.id, authLoading]);

  // JC: Function to get user profile from database
  const fetchProfile = async () => {
    if (!user?.id) return;
    
    setLoading(true);
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        setProfile(null);
      } else {
        setProfile(data);
      }
    } catch (error) {
      console.error('Error in fetchProfile:', error);
      setProfile(null);
    } finally {
      setLoading(false);
    }
  };

  // JC: Function to refresh profile data after user saves changes
  const handleProfileUpdate = () => {
    // Refresh profile data after update
    fetchProfile();
  };

  // JC: Show loading screen while getting user data
  if (authLoading || loading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  // JC: Show error message if user data not found
  if (!user || !profile) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-gray-600">Unable to load profile data</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full flex flex-col bg-gray-50">
      {/* Enhanced Header Section */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 py-8">
          <div className="text-center">
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">
              Manage Your Profile
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
              Update your personal information, business details, and account preferences to showcase your services professionally.
            </p>
            <div className="mt-6 flex items-center justify-center gap-2">
              <div className="w-12 h-1 bg-teal-600 rounded-full"></div>
              <div className="w-3 h-1 bg-teal-300 rounded-full"></div>
              <div className="w-3 h-1 bg-teal-300 rounded-full"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 py-8 px-6 sm:px-8">
        <div className="max-w-4xl mx-auto">
          
          {/* JC: Simple stats cards using real data */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-6 text-center hover:shadow-lg transition-shadow duration-300">
              <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="w-6 h-6 text-teal-600" />
              </div>
              <div className="text-2xl font-bold text-gray-900 mb-1">4.9</div>
              <div className="text-sm text-gray-600">Average Rating</div>
            </div>
            
            <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-6 text-center hover:shadow-lg transition-shadow duration-300">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar className="w-6 h-6 text-blue-600" />
              </div>
              <div className="text-2xl font-bold text-gray-900 mb-1">0</div>
              <div className="text-sm text-gray-600">Events Completed</div>
            </div>
          </div>

          <div className="space-y-8">
            
            {/* JC: Personal info section with real user data from database */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
              <div className="bg-gray-50 px-8 py-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-teal-600" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-gray-900">Personal Information</h2>
                      <p className="text-sm text-gray-600">Your profile details and contact information</p>
                    </div>
                  </div>
                  {/* JC: Button to open edit modal */}
                  <Button
                    onClick={() => setIsEditModalOpen(true)}
                    className="bg-teal-600 text-white hover:bg-teal-700 transition-all duration-200 transform hover:scale-105"
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Profile
                  </Button>
                </div>
              </div>
              
              <div className="p-8">
                {/* JC: Show user profile picture and basic info using real data */}
                <div className="flex flex-col md:flex-row items-center md:items-start gap-8 mb-8">
                  <div className="relative">
                    <img
                      src={
                        profile.avatar_url ||
                        "https://ui-avatars.com/api/?name=" +
                          encodeURIComponent(profile.full_name || "User") +
                          "&background=0D8ABC&color=fff&size=120"
                      }
                      alt="Profile"
                      className="w-24 h-24 rounded-full object-cover border-4 border-gray-200 shadow-lg"
                    />
                    <div className="absolute bottom-0 right-0 w-6 h-6 bg-green-500 border-2 border-white rounded-full"></div>
                  </div>
                  <div className="flex-1 text-center md:text-left">
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">{profile.full_name || "No name provided"}</h1>
                    <p className="text-gray-600 mb-4">{profile.bio || "No bio provided"}</p>
                    <div className="text-sm text-gray-500">
                      Member since {profile.created_at ? new Date(profile.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long' }) : "Unknown"}
                    </div>
                  </div>
                </div>

                {/* JC: Contact info cards showing real user data */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl border border-gray-200">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <Mail className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      {/* CT: Displays unverified email status if updated email is unverified */}
                      <div className="text-gray-900 flex items-center gap-2">
                        {user.email || "No email"}
                        {!user.email_confirmed_at && (
                          <span className="ml-2 px-2 py-0.5 rounded bg-yellow-100 text-yellow-800 text-xs font-medium">
                            Unverified
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl border border-gray-200">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                      <Phone className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-gray-700">Phone Number</div>
                      <div className="text-gray-900">{profile.phone || "No phone provided"}</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl border border-gray-200">
                    <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                      <MapPin className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-gray-700">Location</div>
                      <div className="text-gray-900">{profile.location || "No location provided"}</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl border border-gray-200">
                    <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                      <Calendar className="w-5 h-5 text-orange-600" />
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-gray-700">Role</div>
                      <div className="text-gray-900 capitalize">{profile.role || "No role"}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* JC: Business info section - only shows website from database */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
              <div className="bg-gray-50 px-8 py-6 border-b border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <Building className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">Business Information</h2>
                    <p className="text-sm text-gray-600">Your business details and website</p>
                  </div>
                </div>
              </div>
              
              <div className="p-8">
                <div className="grid grid-cols-1 gap-6">
                  {/* JC: Show website if user has one */}
                  {profile.website && (
                    <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl border border-gray-200">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <Globe className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-gray-700">Website</div>
                        <div className="text-gray-900">
                          <a 
                            href={profile.website.startsWith('http') ? profile.website : `https://${profile.website}`} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="text-blue-600 hover:text-blue-700 hover:underline"
                          >
                            {profile.website}
                          </a>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* JC: Show message if no website provided */}
                  {!profile.website && (
                    <div className="text-center py-8 text-gray-500">
                      <Globe className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                      <p>No website information provided</p>
                      <p className="text-sm">Click "Edit Profile" to add your website</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* JC: Account settings section showing real user data from database */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
              <div className="bg-gray-50 px-8 py-6 border-b border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <Settings className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">Account Settings</h2>
                    <p className="text-sm text-gray-600">Your account information and status</p>
                  </div>
                </div>
              </div>
              
              <div className="p-8">
                <div className="space-y-6">
                  {/* JC: Show user role from database */}
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200">
                    <div>
                      <h3 className="font-semibold text-gray-900">Account Role</h3>
                      <p className="text-sm text-gray-600">Your current account type</p>
                    </div>
                    <div className="flex items-center">
                      <span className="px-3 py-1 rounded-full text-sm font-medium bg-teal-100 text-teal-700 capitalize">
                        {profile.role}
                      </span>
                    </div>
                  </div>
                  
                  {/* JC: Show if profile setup is complete */}
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200">
                    <div>
                      <h3 className="font-semibold text-gray-900">Profile Setup</h3>
                      <p className="text-sm text-gray-600">Whether your profile setup is complete</p>
                    </div>
                    <div className="flex items-center">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        profile.is_setup_complete 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-orange-100 text-orange-700'
                      }`}>
                        {profile.is_setup_complete ? 'Complete' : 'Incomplete'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* JC: Edit modal with real user data passed to it */}
      <ProfileEditModal 
        isOpen={isEditModalOpen} 
        onClose={() => setIsEditModalOpen(false)}
        userType="seller"
        userId={profile.id}
        userData={{
          name: profile.full_name || "",
          email: user.email || "",
          phone: profile.phone || "",
          location: profile.location || "",
          bio: profile.bio || "",
          website: profile.website || "",
          profilePic: profile.avatar_url || ""
        }}
        onSave={handleProfileUpdate}
      />
    </div>
  );
}