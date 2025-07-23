"use client";

import { useState, useEffect } from "react";
import { PlusCircle, Edit, Trash2 } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import AddListingModal from "@/shared/components/ui/AddListingModal";
import EditListingModal from "@/shared/components/ui/EditListingModal";
import DeleteListingModal from "@/shared/components/ui/DeleteListingModal";
import ListingCardSeller from "@/shared/components/ui/ListingCardSeller";
import { getListings } from "@/features/services/listing_crud";
import { createClient } from '@/shared/lib/supabase/client';
// kvs: Removed react-toastify imports - no longer needed as all modals use Sonner toast

import BoostingModal from "@/shared/components/ui/BoostingModal"; // ✅ ADD: Import BoostingModal

export default function ListingsPage() {
  // JC: State to manage modals and listings data
  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [boostOpen, setBoostOpen] = useState(false); // ✅ ADD: State for boost modal
  const [selectedListing, setSelectedListing] = useState<any>(null); // JC: Track which listing is being edited/deleted
  const [listings, setListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState(true);

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

  useEffect(() => {
    if (user?.id && !authLoading) {
      fetchListings();
    }
  }, [user?.id, authLoading]);

  const fetchListings = async () => {
    if (!user?.id) return;
    
    setLoading(true);
    try {
      const userListings = await getListings(user.id);
      setListings(userListings);
    } catch (error) {
      console.error('Error fetching listings:', error);
      setListings([]);
    } finally {
      setLoading(false);
    }
  };

  const handleListingUpdate = (updatedListing: any) => {
    setListings(prev => 
      prev.map(listing => 
        listing.id === updatedListing.id ? updatedListing : listing
      )
    );
  };

  const handleListingDelete = (listingId: string) => {
    setListings(prev => prev.filter(listing => listing.id !== listingId));
  };

  // JC: Close add modal and refresh listings to show new listing
  const handleAddModalClose = () => {
    setAddOpen(false);
    // Refresh listings after adding
    fetchListings();
  };

  // JC: Handle edit button click from card - open modal with selected listing
  const handleEditRequest = (listing: any) => {
    setSelectedListing(listing);
    setEditOpen(true);
  };

  // JC: Handle delete button click from card - open modal with selected listing
  const handleDeleteRequest = (listing: any) => {
    setSelectedListing(listing);
    setDeleteOpen(true);
  };

  // JC: Close edit modal and clear selected listing
  const handleEditModalClose = () => {
    setEditOpen(false);
    setSelectedListing(null);
  };

    // ✅ ADD: Handle boost button click from card - open boosting modal

  const handleBoostRequest = (listing: any) => {

    setSelectedListing(listing);

    setBoostOpen(true);

  };

  // JC: Close delete modal and clear selected listing
  const handleDeleteModalClose = () => {
    setDeleteOpen(false);
    setSelectedListing(null);
  };

    // ✅ ADD: Close boosting modal and clear selected listing

  const handleBoostModalClose = () => {

    setBoostOpen(false);

    setSelectedListing(null);

  };

  if (authLoading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-lg font-medium text-gray-600">Loading...</div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-lg font-medium text-red-600">Please log in to access this page.</div>
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
              Manage Your Listings
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
              Create, edit, and manage your event listings. Showcase your services to potential clients and grow your business.
            </p>
            <div className="mt-6 flex items-center justify-center gap-2">
              <div className="w-12 h-1 bg-teal-600 rounded-full"></div>
              <div className="w-2 h-2 bg-teal-300 rounded-full"></div>
              <div className="w-12 h-1 bg-teal-600 rounded-full"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 py-8 px-6 sm:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Enhanced Action Cards Section */}
          <div className="mb-12">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">Quick Actions</h2>
              <p className="text-gray-600">Choose an action to get started with your listings</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Add a Listing */}
              <div
                tabIndex={0}
                role="button"
                onClick={() => setAddOpen(true)}
                className="group relative overflow-hidden flex flex-col items-center justify-center px-8 py-10 bg-white border border-gray-200 rounded-2xl shadow-md transition-all duration-300 cursor-pointer hover:shadow-xl hover:border-green-200 hover:-translate-y-2 hover:scale-105"
              >
                <div className="absolute top-0 left-0 w-full h-1 bg-green-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></div>
                <div className="p-4 bg-green-50 rounded-2xl group-hover:bg-green-100 transition-all duration-300 mb-6 group-hover:scale-110">
                  <PlusCircle className="text-green-600 group-hover:text-green-700 transition-colors duration-300" size={32} />
                </div>
                <h3 className="font-bold text-xl text-gray-900 group-hover:text-green-800 transition-colors duration-300 text-center mb-2">
                  Add a Listing
                </h3>
                <p className="text-sm text-gray-500 group-hover:text-green-600 transition-colors duration-300 text-center leading-relaxed">
                  Create a new event listing to showcase your services
                </p>
                <div className="absolute bottom-0 right-0 w-20 h-20 bg-green-50 rounded-full transform translate-x-10 translate-y-10 group-hover:scale-150 transition-transform duration-500 opacity-20"></div>
              </div>

              {/* Edit a Listing */}
              <div
                tabIndex={0}
                role="button"
                onClick={() => setEditOpen(true)}
                className="group relative overflow-hidden flex flex-col items-center justify-center px-8 py-10 bg-white border border-gray-200 rounded-2xl shadow-md transition-all duration-300 cursor-pointer hover:shadow-xl hover:border-blue-200 hover:-translate-y-2 hover:scale-105"
              >
                <div className="absolute top-0 left-0 w-full h-1 bg-blue-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></div>
                <div className="p-4 bg-blue-50 rounded-2xl group-hover:bg-blue-100 transition-all duration-300 mb-6 group-hover:scale-110">
                  <Edit className="text-blue-600 group-hover:text-blue-700 transition-colors duration-300" size={32} />
                </div>
                <h3 className="font-bold text-xl text-gray-900 group-hover:text-blue-800 transition-colors duration-300 text-center mb-2">
                  Edit a Listing
                </h3>
                <p className="text-sm text-gray-500 group-hover:text-blue-600 transition-colors duration-300 text-center leading-relaxed">
                  Update and modify your existing event listings
                </p>
                <div className="absolute bottom-0 right-0 w-20 h-20 bg-blue-50 rounded-full transform translate-x-10 translate-y-10 group-hover:scale-150 transition-transform duration-500 opacity-20"></div>
              </div>

              {/* Delete a Listing */}
              <div
                tabIndex={0}
                role="button"
                onClick={() => setDeleteOpen(true)}
                className="group relative overflow-hidden flex flex-col items-center justify-center px-8 py-10 bg-white border border-gray-200 rounded-2xl shadow-md transition-all duration-300 cursor-pointer hover:shadow-xl hover:border-red-200 hover:-translate-y-2 hover:scale-105"
              >
                <div className="absolute top-0 left-0 w-full h-1 bg-red-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></div>
                <div className="p-4 bg-red-50 rounded-2xl group-hover:bg-red-100 transition-all duration-300 mb-6 group-hover:scale-110">
                  <Trash2 className="text-red-600 group-hover:text-red-700 transition-colors duration-300" size={32} />
                </div>
                <h3 className="font-bold text-xl text-gray-900 group-hover:text-red-800 transition-colors duration-300 text-center mb-2">
                  Delete a Listing
                </h3>
                <p className="text-sm text-gray-500 group-hover:text-red-600 transition-colors duration-300 text-center leading-relaxed">
                  Permanently remove listings you no longer need
                </p>
                <div className="absolute bottom-0 right-0 w-20 h-20 bg-red-50 rounded-full transform translate-x-10 translate-y-10 group-hover:scale-150 transition-transform duration-500 opacity-20"></div>
              </div>
            </div>
          </div>

          {/* Enhanced Listings Section */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
            {/* Section Header */}
            <div className="bg-gray-50 px-8 py-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-1">Your Event Listings</h2>
                  <p className="text-gray-600">Manage and monitor your active listings</p>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-teal-600">
                    {loading ? '...' : listings.length}
                  </div>
                  <div className="text-sm text-gray-500">
                    {loading ? 'Loading...' : `Active listing${listings.length !== 1 ? 's' : ''}`}
                  </div>
                </div>
              </div>
            </div>

            {/* Content Area */}
            <div className="p-8">
              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="bg-gray-50 rounded-xl p-6 animate-pulse">
                      <div className="h-48 bg-gray-200 rounded-lg mb-4"></div>
                      <div className="space-y-3">
                        <div className="h-4 bg-gray-200 rounded"></div>
                        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : listings.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 px-6">
                  <div className="w-24 h-24 bg-teal-50 rounded-full flex items-center justify-center mb-6">
                    <PlusCircle className="w-12 h-12 text-teal-400" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-700 mb-3">No listings yet</h3>
                  <p className="text-gray-500 text-center max-w-md mb-8 leading-relaxed">
                    You haven't created any listings yet. Start showcasing your events and services to potential clients by creating your first listing.
                  </p>
                  <Button 
                    onClick={() => setAddOpen(true)}
                    className="cursor-pointer bg-teal-600 text-white border-teal-600 hover:bg-teal-700 hover:border-teal-700 transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl px-8 py-3 text-lg font-semibold rounded-xl"
                  >
                    <PlusCircle className="w-5 h-5 mr-3" />
                    Create Your First Listing
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {listings.map((listing) => (
                    <div key={listing.id} className="transform transition-all duration-300 hover:scale-105">
                      <ListingCardSeller
                        listing={listing}
                        onUpdate={handleListingUpdate}
                        onDelete={handleListingDelete}
                        onEdit={handleEditRequest}
                        onDeleteRequest={handleDeleteRequest}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modals - JC: Now at page level to avoid card transform conflicts */}
      <AddListingModal isOpen={addOpen} onClose={handleAddModalClose} />
      <EditListingModal 
        isOpen={editOpen} 
        onClose={handleEditModalClose} 
        listing={selectedListing}
        onUpdate={handleListingUpdate}
      />
      <DeleteListingModal 
        isOpen={deleteOpen} 
        onClose={handleDeleteModalClose} 
        listing={selectedListing}
        onDelete={handleListingDelete}
      />

            {/* ✅ ADD: Render the BoostingModal */}

      <BoostingModal

        isOpen={boostOpen}

        onClose={handleBoostModalClose}

        listing={selectedListing}

      />

      {/* kvs: Removed ToastContainer as all toast notifications now use Sonner which is globally configured in layout.tsx */}
    </div>
  );
}