"use client";

import { useState } from "react";
import { TrendingUp, Zap, Crown, Star, Calendar, Clock, CheckCircle } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import BoostingModal from '@/shared/components/ui/BoostingModal'; // JC: Import the new modal component

// JC: Interface for boost plan options - different pricing tiers with duration and listing limits
interface BoostPlan {
  id: string;
  name: string;
  duration: string;
  durationDays: number; // JC: Number of days the boost lasts
  price: number;
  maxListings: number; // JC: Maximum number of listings that can be boosted with this plan
  features: string[];
  icon: any;
}

// JC: Interface for active boost data - tracks which listings are currently boosted
interface ActiveBoost {
  id: string;
  listingTitle: string;
  plan: string;
  startDate: string;
  endDate: string;
  status: 'active' | 'ending_soon' | 'expired';
}

export default function BoostingPage() {
  // JC: useState hook stores array of currently active boosts
  const [activeBoosts, setActiveBoosts] = useState<ActiveBoost[]>([]);
  // JC: useState hook stores the boost plan user selected (null when none selected)
  const [selectedPlan, setSelectedPlan] = useState<BoostPlan | null>(null);
  // JC: useState hook controls if payment modal is visible or hidden
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  // JC: useState hook stores total number of user's listings for statistics
  const [totalListings, setTotalListings] = useState(8);

  // JC: Mock data for boost plans with updated features
  const boostPlans: BoostPlan[] = [
    {
      id: 'basic',
      name: 'Basic Boost',
      duration: '7 days',
      durationDays: 7,
      price: 9.99,
      maxListings: 2, // JC: Can boost up to 2 listings
      features: ['Priority placement', 'Featured badge', 'Boost up to 2 listings', '7 days duration'],
      icon: TrendingUp
    },
    {
      id: 'premium',
      name: 'Premium Boost',
      duration: '14 days',
      durationDays: 14,
      price: 17.99,
      maxListings: 5, // JC: Can boost up to 5 listings
      features: ['Top priority placement', 'Premium badge', 'Boost up to 5 listings', '14 days duration'],
      icon: Zap
    },
    {
      id: 'ultimate',
      name: 'Ultimate Boost',
      duration: '30 days',
      durationDays: 30,
      price: 29.99,
      maxListings: 10, // JC: Can boost up to 10 listings
      features: ['Maximum priority', 'Crown badge', 'Boost up to 10 listings', '30 days duration'],
      icon: Crown
    }
  ];

  // JC: Mock data for active boosts - frontend display purposes
  const mockActiveBoosts: ActiveBoost[] = [
    {
      id: '1',
      listingTitle: 'Elegant Wedding Catering Service',
      plan: 'Premium Boost',
      startDate: '2025-01-01',
      endDate: '2025-01-15',
      status: 'active'
    },
    {
      id: '2',
      listingTitle: 'Corporate Event Planning',
      plan: 'Basic Boost',
      startDate: '2025-01-05',
      endDate: '2025-01-10',
      status: 'ending_soon'
    }
  ];

  // JC: Function handles when user clicks on a boost plan card
  const handleBoostPlan = (plan: BoostPlan) => {
    setSelectedPlan(plan); // JC: Store which plan user selected
    setShowPaymentModal(true); // JC: Show payment modal
  };

  // JC: Function handles payment confirmation from modal
  const handlePaymentConfirm = () => {
    // JC: Payment processing will be implemented by backend team
    alert('Payment processing would happen here!');
    setShowPaymentModal(false); // JC: Hide modal after payment
    setSelectedPlan(null); // JC: Clear selected plan
  };

  // JC: Function handles modal close
  const handleModalClose = () => {
    setShowPaymentModal(false); // JC: Hide payment modal
    setSelectedPlan(null); // JC: Clear selected plan
  };

  // JC: Function returns CSS classes for boost status colors
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-50'; // JC: Green for active boosts
      case 'ending_soon': return 'text-orange-600 bg-orange-50'; // JC: Orange for ending soon
      case 'expired': return 'text-red-600 bg-red-50'; // JC: Red for expired boosts
      default: return 'text-gray-600 bg-gray-50'; // JC: Gray for unknown status
    }
  };

  // JC: Function calculates remaining days for a boost
  const getDaysRemaining = (endDate: string) => {
    const end = new Date(endDate);
    const now = new Date();
    const diffTime = end.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); // JC: Convert milliseconds to days
    return diffDays;
  };

  // JC: Calculate statistics for display using mock data
  const boostedListings = mockActiveBoosts.filter(boost => boost.status === 'active').length;
  const unboostedListings = totalListings - boostedListings;

  return (
    <div className="min-h-screen w-full flex flex-col bg-gray-50">
      {/* JC: Enhanced header section matching other pages */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <div className="text-center">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-3">
              Boost Your Listings
            </h1>
            <p className="text-base sm:text-lg text-gray-600 max-w-3xl mx-auto mb-4 sm:mb-6">
              Increase your visibility and get more bookings with our premium boosting options
            </p>
            {/* JC: Decorative divider with teal accent bars */}
            <div className="flex items-center justify-center gap-4 mb-2">
              <div className="h-1 w-12 bg-teal-600 rounded-full"></div>
              <div className="h-2 w-2 bg-teal-600 rounded-full"></div>
              <div className="h-1 w-12 bg-teal-600 rounded-full"></div>
            </div>
          </div>
        </div>
      </div>

      {/* JC: Statistics cards section showing boost metrics */}
      <div className="py-6 sm:py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-8 sm:mb-12">
            {/* JC: Card showing total number of active boosts */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-4 sm:p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-teal-100 rounded-xl flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-teal-600" />
                </div>
                <div>
                  <p className="text-xl sm:text-2xl font-bold text-gray-900">{mockActiveBoosts.length}</p>
                  <p className="text-xs sm:text-sm text-gray-500">Active Boosts</p>
                </div>
              </div>
            </div>

            {/* JC: Card showing how many listings are currently boosted */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-4 sm:p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-teal-100 rounded-xl flex items-center justify-center">
                  <Star className="w-5 h-5 sm:w-6 sm:h-6 text-teal-600" />
                </div>
                <div>
                  <p className="text-xl sm:text-2xl font-bold text-gray-900">{boostedListings}</p>
                  <p className="text-xs sm:text-sm text-gray-500">Boosted Listings</p>
                </div>
              </div>
            </div>

            {/* JC: Card showing how many listings are not boosted */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-4 sm:p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 sm:col-span-2 lg:col-span-1">
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-teal-100 rounded-xl flex items-center justify-center">
                  <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-teal-600" />
                </div>
                <div>
                  <p className="text-xl sm:text-2xl font-bold text-gray-900">{unboostedListings}</p>
                  <p className="text-xs sm:text-sm text-gray-500">Unboosted Listings</p>
                </div>
              </div>
            </div>
          </div>

          {/* JC: Boost plans section showing available boost options */}
          <div className="mb-8 sm:mb-12">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
              <div className="bg-gray-50 px-4 sm:px-6 lg:px-8 py-4 sm:py-6 border-b border-gray-200">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">Choose Your Boost Plan</h2>
                <p className="text-sm sm:text-base text-gray-600">Select the perfect plan based on duration and number of listings</p>
              </div>

              <div className="p-4 sm:p-6 lg:p-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                  {/* JC: Map through each boost plan and create a card */}
                  {boostPlans.map((plan) => {
                    const IconComponent = plan.icon; // JC: Get the icon component for this plan
                    return (
                      <div
                        key={plan.id}
                        className="relative bg-white border-2 border-teal-600 rounded-2xl p-6 sm:p-8 transition-all duration-300 cursor-pointer hover:shadow-xl hover:-translate-y-2 hover:scale-105 hover:border-teal-700"
                        onClick={() => handleBoostPlan(plan)} // JC: Call handleBoostPlan when card is clicked
                      >
                        {/* JC: Plan icon and header information */}
                        <div className="text-center mb-4 sm:mb-6">
                          <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 bg-teal-100 rounded-2xl flex items-center justify-center">
                            <IconComponent className="w-6 h-6 sm:w-8 sm:h-8 text-teal-600" />
                          </div>
                          <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                          <p className="text-2xl sm:text-3xl font-bold text-gray-900">${plan.price}</p>
                          <p className="text-sm sm:text-base text-gray-500">for {plan.duration}</p>
                          <p className="text-xs sm:text-sm text-gray-600 mt-1">Up to {plan.maxListings} listings</p>
                        </div>

                        {/* JC: List of plan features */}
                        <div className="space-y-2 sm:space-y-3 mb-6 sm:mb-8">
                          {plan.features.map((feature, index) => (
                            <div key={index} className="flex items-center gap-2 sm:gap-3">
                              <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 flex-shrink-0" />
                              <span className="text-xs sm:text-sm text-gray-700">{feature}</span>
                            </div>
                          ))}
                        </div>

                        {/* JC: Button to start boosting with this plan */}
                        <Button 
                          className="w-full py-2 sm:py-3 text-sm sm:text-base font-semibold cursor-pointer bg-teal-600 hover:bg-teal-700 text-white transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
                          onClick={() => handleBoostPlan(plan)} // JC: Same click handler as card
                        >
                          Start Boosting
                        </Button>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* JC: Active boosts section showing current boosted listings */}
          <div className="mb-8 sm:mb-12">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
              <div className="bg-gray-50 px-4 sm:px-6 lg:px-8 py-4 sm:py-6 border-b border-gray-200">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">Your Active Boosts</h2>
                <p className="text-sm sm:text-base text-gray-600">Monitor your currently boosted listings and their remaining time</p>
              </div>

              <div className="p-4 sm:p-6 lg:p-8">
                {/* JC: Check if user has any active boosts using mock data */}
                {mockActiveBoosts.length === 0 ? (
                  // JC: Show empty state when no active boosts
                  <div className="text-center py-12 sm:py-16">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
                      <TrendingUp className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg sm:text-xl font-semibold text-gray-700 mb-2">No Active Boosts</h3>
                    <p className="text-sm sm:text-base text-gray-500 mb-4 sm:mb-6">Start boosting your listings to increase visibility and bookings</p>
                    <Button 
                      className="cursor-pointer bg-teal-600 hover:bg-teal-700 text-white transition-all duration-200 transform hover:scale-105 text-sm sm:text-base px-4 sm:px-6 py-2 sm:py-3"
                      onClick={() => window.scrollTo({ top: 400, behavior: 'smooth' })} // JC: Scroll to boost plans section
                    >
                      Choose a Boost Plan
                    </Button>
                  </div>
                ) : (
                  // JC: Show list of active boosts using mock data
                  <div className="space-y-4 sm:space-y-6">
                    {mockActiveBoosts.map((boost) => {
                      const daysRemaining = getDaysRemaining(boost.endDate); // JC: Calculate days left
                      return (
                        <div
                          key={boost.id}
                          className="bg-white border-2 border-gray-200 rounded-xl p-4 sm:p-6 hover:border-teal-600 hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
                        >
                          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                            <div className="flex-1">
                              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-2">
                                <h3 className="text-base sm:text-lg font-semibold text-gray-900">{boost.listingTitle}</h3>
                                <span className={`px-2 sm:px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(boost.status)} self-start sm:self-auto`}>
                                  {boost.status.replace('_', ' ').toUpperCase()}
                                </span>
                              </div>
                              <p className="text-sm sm:text-base text-gray-600 mb-2 sm:mb-3">{boost.plan}</p>
                              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6 text-xs sm:text-sm text-gray-500">
                                <div className="flex items-center gap-2">
                                  <Calendar className="w-3 h-3 sm:w-4 sm:h-4" />
                                  <span>{new Date(boost.startDate).toLocaleDateString()} - {new Date(boost.endDate).toLocaleDateString()}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Clock className="w-3 h-3 sm:w-4 sm:h-4" />
                                  <span>
                                    {daysRemaining > 0 ? `${daysRemaining} days remaining` : 'Expired'}
                                  </span>
                                </div>
                              </div>
                            </div>
                            <div className="flex gap-3">
                              {/* JC: Button to extend boost duration */}
                              <Button 
                                className="cursor-pointer bg-teal-600 hover:bg-teal-700 text-white transition-all duration-200 transform hover:scale-105 text-xs sm:text-sm px-3 sm:px-4 py-2 w-full sm:w-auto"
                                onClick={() => {
                                  // JC: Extend boost functionality placeholder for backend team
                                  alert('Extend boost functionality will be implemented by backend team!');
                                }}
                              >
                                Extend Boost
                              </Button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* JC: BoostingModal */}
      <BoostingModal
        isOpen={showPaymentModal}
        onClose={handleModalClose}
        selectedPlan={selectedPlan}
        onConfirm={handlePaymentConfirm}
      />
    </div>
  );
}