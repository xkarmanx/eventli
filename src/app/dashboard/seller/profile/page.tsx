"use client";

import { Award, Building, Calendar, Edit, Globe, Mail, MapPin, Phone, Settings, Star, User } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { updateProfile, updateProfileComplete } from "@/features/services/profile_crud";
import { Button } from "@/shared/components/ui/button";
import ProfileEditModal from "@/shared/components/ui/ProfileEditModal";
import { createClient } from '@/shared/lib/supabase/client'; // JC: Get real user data from database
import { toast } from "sonner";

const supabase = createClient();

export default function SellerProfilePage() {
  // JC: State to control edit modal open/close
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // JC: State to store real user data from database instead of mock data
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [authLoading, setAuthLoading] = useState(true);

  // CT: hold timer for resend cooldown
  const [resendCooldown, setResendCooldown] = useState(0);

  // JC: Get user login info when page loads
  useEffect(() => {
    (async () => { // KSch: For simplicity, this should be an anonymous arrow function.
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
    })();

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

  // JC: Function to get user profile from database
  const fetchProfile = useCallback(async () => {
    if (!user?.id) return;

    setLoading(true);
    try {
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
        await updateProfileComplete(user.id);
      }
    } catch (error) {
      console.error('Error in fetchProfile:', error);
      setProfile(null);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  // JC: Get user profile data from database when user is logged in
  useEffect(() => {
    if (user?.id && !authLoading)
      fetchProfile();
  }, [user?.id, authLoading, fetchProfile]);

  // CT: Countdown timer for resend verification email
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  // JC: Function to refresh profile data after user saves changes
  function handleProfileUpdate() {
    // Refresh profile data after update
    fetchProfile();

    console.log("Profile Data:", profile);
    console.log("Profile complete?:", profile.is_setup_complete);
  }

  //CT: Hold the time period for pending email validity
  const SEVEN_DAYS = 1000 * 60 * 60 * 24 * 7; //7 days
  const now = new Date();
  const pendingDate = new Date(profile?.pending_email_requested_at || 0);
  const isPendingStillValid = profile?.pending_email && (now.getTime() - pendingDate.getTime()) < SEVEN_DAYS;
  const displayEmail = isPendingStillValid ? profile.pending_email : user?.email;

  // CT: Resend email verification function
  async function handleResendVerificationEmail() {
    try {
      if (!user) return;

      if (!profile.pending_email) {
        alert("No pending email to resend verification.");
        return;
      }

      await updateProfile(profile.id, { email: profile.pending_email });

      setResendCooldown(60);
      toast.success("Verification email resent! Please check your inbox.");
    } catch (err) {
      console.error("Resend error:", err);
    }
  }

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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <div className="text-center">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-3">
              Manage Your Profile
            </h1>
            <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
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
      <div className="flex-1 py-6 sm:py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">

          {/* JC: Simple stats cards using real data */}
          {/*<div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
            <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-4 sm:p-6 text-center hover:shadow-lg transition-shadow duration-300">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <Star className="w-5 h-5 sm:w-6 sm:h-6 text-teal-600" />
              </div>
              <div className="text-xl sm:text-2xl font-bold text-gray-900 mb-1">4.9</div>
              <div className="text-xs sm:text-sm text-gray-600">Average Rating</div>
            </div>

            
            <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-4 sm:p-6 text-center hover:shadow-lg transition-shadow duration-300">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <Calendar className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />

              </div>
              <div className="text-xl sm:text-2xl font-bold text-gray-900 mb-1">0</div>
              <div className="text-xs sm:text-sm text-gray-600">Events Completed</div>
            </div>
          </div>*/}

          <div className="space-y-6 sm:space-y-8">
            

            {/* JC: Personal info section with real user data from database */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
              <div className="bg-gray-50 px-4 sm:px-6 lg:px-8 py-4 sm:py-6 border-b border-gray-200">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-teal-100 rounded-full flex items-center justify-center mx-auto sm:mx-0">
                      <User className="w-4 h-4 sm:w-5 sm:h-5 text-teal-600" />
                    </div>
                    <div className="text-center sm:text-left">
                      <h2 className="text-lg sm:text-xl font-bold text-gray-900">Personal Information</h2>
                      <p className="text-xs sm:text-sm text-gray-600">Your profile details and contact information</p>
                    </div>
                  </div>
                  {/* JC: Button to open edit modal */}
                  <Button
                    onClick={() => setIsEditModalOpen(true)}
                    className="bg-teal-600 text-white hover:bg-teal-700 transition-all duration-200 transform hover:scale-105 w-full sm:w-auto"
                  >
                    <Edit className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                    Edit Profile
                  </Button>
                </div>
              </div>
              
              <div className="p-4 sm:p-6 lg:p-8">

                {/* JC: Show user profile picture and basic info using real data */}
                <div className="flex flex-col items-center text-center md:flex-row md:items-start md:text-left gap-6 sm:gap-8 mb-6 sm:mb-8">
                  <div className="relative">
                    {/* Change from img to Image if actually needed */}
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={
                        profile.avatar_url ||
                        "https://ui-avatars.com/api/?name=" +
                          encodeURIComponent(profile.full_name || "User") +
                          "&background=0D8ABC&color=fff&size=120"
                      }
                      alt="Profile"
                      className="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover border-4 border-teal-700 shadow-lg"
                    />
                  </div>
                  <div className="flex-1">
                    <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">{profile.full_name || "No name provided"}</h1>
                    <p className="text-sm sm:text-base text-gray-600 mb-3 sm:mb-4">{profile.bio || "No bio provided"}</p>
                    <div className="text-xs sm:text-sm text-gray-500">
                      Member since {profile.created_at ? new Date(profile.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long' }) : "Unknown"}
                    </div>
                  </div>
                </div>

                {/* JC: Contact info cards showing real user data */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  <div className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-gray-50 rounded-xl border border-gray-200">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <Mail className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-xs sm:text-sm font-semibold text-gray-700">Email Address</div>
                      {/* CT: Displays unverified email status if updated email is unverified */}
                      <div className="text-sm sm:text-base text-gray-900 flex items-center gap-2 relative">
                        <span className="truncate">{displayEmail || "No email"}</span>
                        {isPendingStillValid && (
                          <div className="group inline-block relative">
                            <span className="bg-yellow-100 text-yellow-800 text-xs font-medium px-2 py-0.5 rounded cursor-default whitespace-nowrap">
                              Unverified
                            </span>
                            <div className="absolute left-0 top-full mt-1 w-max max-w-xs whitespace-normal 
                              bg-gray-800 text-white text-xs px-3 py-1.5 rounded-md shadow-lg 
                              opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 
                              border border-gray-700">

                              <p className="mb-2">
                                A confirmation email was sent to both emails. 
                                <br/><br/>
                                Please verify this email by clicking the link in both inboxes.
                              </p>

                              <p className="mb-2">
                                This link expires in 30 minutes. 
                              </p>

                              {resendCooldown > 0 ? (
                                <p className="text-yellow-300">
                                  You can resend the verification email in {resendCooldown}s.

                                </p>
                              ) : (
                                <button
                                  onClick={handleResendVerificationEmail}
                                  className="text-blue-300 hover:text-blue-200 underline mt-2"
                                >
                                  Resend Verification Email
                                </button>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>                  
                  <div className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-gray-50 rounded-xl border border-gray-200">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-green-100 rounded-full flex items-center justify-center">
                      <Phone className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />

                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-xs sm:text-sm font-semibold text-gray-700">Phone Number</div>
                      <div className="text-sm sm:text-base text-gray-900 truncate">{profile.phone || "No phone provided"}</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-gray-50 rounded-xl border border-gray-200">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-purple-100 rounded-full flex items-center justify-center">
                      <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600" />

                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-xs sm:text-sm font-semibold text-gray-700">Location</div>
                      <div className="text-sm sm:text-base text-gray-900 truncate">{profile.location || "No location provided"}</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-gray-50 rounded-xl border border-gray-200">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-orange-100 rounded-full flex items-center justify-center">
                      <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-orange-600" />

                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-xs sm:text-sm font-semibold text-gray-700">Role</div>
                      <div className="text-sm sm:text-base text-gray-900 capitalize truncate">{profile.role || "No role"}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* JC: Business info section - only shows website from database */}
            {/*<div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
              <div className="bg-gray-50 px-4 sm:px-6 lg:px-8 py-4 sm:py-6 border-b border-gray-200">
                <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-100 rounded-full flex items-center justify-center mx-auto sm:mx-0">
                    <Building className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                  </div>
                  <div className="text-center sm:text-left">
                    <h2 className="text-lg sm:text-xl font-bold text-gray-900">Business Information</h2>
                    <p className="text-xs sm:text-sm text-gray-600">Your business details and website</p>
                  </div>
                </div>
              </div>*/}
              
              {/*<div className="p-4 sm:p-6 lg:p-8">
                <div className="grid grid-cols-1 gap-4 sm:gap-6">*/}

                  {/* JC: Show website if user has one */}
                  {/*{profile.website && (
                    <div className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-gray-50 rounded-xl border border-gray-200">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <Globe className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-xs sm:text-sm font-semibold text-gray-700">Website</div>
                        <div className="text-sm sm:text-base text-gray-900">
                          <a 
                            href={profile.website.startsWith('http') ? profile.website : `https://${profile.website}`} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="text-blue-600 hover:text-blue-700 hover:underline truncate inline-block max-w-full"

                          >
                            {profile.website}
                          </a>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* JC: Show message if no website provided */}
                  {/*{!profile.website && (
                    <div className="text-center py-6 sm:py-8 text-gray-500">
                      <Globe className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-3 sm:mb-4 text-gray-300" />
                      <p className="text-sm sm:text-base">No website information provided</p>
                      <p className="text-xs sm:text-sm">Click "Edit Profile" to add your website</p>

                    </div>
                  )}
                </div>
              </div>
            </div>*/}

            {/* JC: Account settings section showing real user data from database */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
              <div className="bg-gray-50 px-4 sm:px-6 lg:px-8 py-4 sm:py-6 border-b border-gray-200">
                <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-green-100 rounded-full flex items-center justify-center mx-auto sm:mx-0">
                    <Settings className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
                  </div>
                  <div className="text-center sm:text-left">
                    <h2 className="text-lg sm:text-xl font-bold text-gray-900">Account Settings</h2>
                    <p className="text-xs sm:text-sm text-gray-600">Your account information and status</p>
                  </div>
                </div>
              </div>
              
              <div className="p-4 sm:p-6 lg:p-8">
                <div className="space-y-4 sm:space-y-6">

                  {/* JC: Show user role from database */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 p-3 sm:p-4 bg-gray-50 rounded-xl border border-gray-200">
                    <div className="text-center sm:text-left">
                      <h3 className="text-sm sm:text-base font-semibold text-gray-900">Account Role</h3>
                      <p className="text-xs sm:text-sm text-gray-600">Your current account type</p>
                    </div>
                    <div className="flex items-center justify-center sm:justify-end">
                      <span className="px-3 py-1 rounded-full text-xs sm:text-sm font-medium bg-teal-100 text-teal-700 capitalize">
                        {profile.role}
                      </span>
                    </div>
                  </div>

                  {/* JC: Show if profile setup is complete */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 p-3 sm:p-4 bg-gray-50 rounded-xl border border-gray-200">
                    <div className="text-center sm:text-left">
                      <h3 className="text-sm sm:text-base font-semibold text-gray-900">Profile Setup</h3>
                      <p className="text-xs sm:text-sm text-gray-600">Whether your profile setup is complete</p>
                    </div>
                    <div className="flex items-center justify-center sm:justify-end">
                      <span className={`px-3 py-1 rounded-full text-xs sm:text-sm font-medium ${
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
        onCloseAction={() => setIsEditModalOpen(false)}
        userType="seller"
        userId={profile.id}
        userData={{
          name: profile.full_name || "",
          email: displayEmail || "",
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
