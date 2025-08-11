"use client";

import { ExternalLink, Phone, Mail, CreditCard, History, Settings, MessageSquare, AlertCircle, HelpCircle, Shield, Clock } from "lucide-react";

export default function SupportSection() {
  // JC: Mock payment data for display - replace with real data later
  const paymentInfo = {
    cardHolder: "John Due",
    cardNumber: "1234 - 5678 - 9101",
    expiryDate: "06/26",
    emailAddress: "example@test.com",
  };

  // JC: Mock boosting history data for display - replace with real data later
  const boostingHistory = [
    { boostedAt: "2025/12/10 to 2025/12/15" },
    { boostedAt: "2026/01/11 to 2026/01/16" },
    { boostedAt: "2026/07/21 to 2026/07/26" },
    { boostedAt: "2026/07/27 to 2026/08/01" },
  ];

  // JC: Cancellation policy text for user reference
  const cancellationPolicies = [
    "Providers must inform customers directly if they require any modifications.",
    "If the customer does not accept the modification, they may cancel based on the provider's terms.",
    "If a provider fails to appear for the service, the customer may report it, but any compensation is at the discretion of the service provider.",
    "Any penalties or compensation for cancellations are determined between the service provider and the customer.",
  ];

  return (
    <div className="min-h-screen w-full flex flex-col bg-gray-50">
      {/* Enhanced Header Section */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <div className="text-center">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-black mb-3">
              Support Center
            </h1>
            <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
              Get comprehensive help with your account, payments, technical issues, and business operations. We are here to support your success.
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
        <div className="max-w-7xl mx-auto">
          
          {/* Quick Help Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
            <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-4 sm:p-6 text-center hover:shadow-lg transition-shadow duration-300">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-teal-600" />
              </div>
              <div className="text-xl sm:text-2xl font-bold text-black mb-1">&lt; 2 hrs</div>
              <div className="text-xs sm:text-sm text-gray-600">Average Response Time</div>
            </div>
            
            <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-4 sm:p-6 text-center hover:shadow-lg transition-shadow duration-300">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <Shield className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
              </div>
              <div className="text-xl sm:text-2xl font-bold text-black mb-1">24/7</div>
              <div className="text-xs sm:text-sm text-gray-600">Support Available</div>
            </div>
            
            <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-4 sm:p-6 text-center hover:shadow-lg transition-shadow duration-300 sm:col-span-2 lg:col-span-1">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <HelpCircle className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
              </div>
              <div className="text-xl sm:text-2xl font-bold text-black mb-1">98%</div>
              <div className="text-xs sm:text-sm text-gray-600">Issue Resolution Rate</div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 sm:gap-8">
            {/* Enhanced Payment Options Card */}
            <div className="bg-white border border-gray-200 p-6 sm:p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2 hover:scale-105 group flex flex-col relative">
              <div className="absolute top-0 left-0 w-full h-1 bg-blue-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 rounded-t-2xl"></div>
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
                <div className="p-2 sm:p-3 bg-blue-50 rounded-2xl group-hover:bg-blue-100 transition-all duration-300 group-hover:scale-110 mx-auto sm:mx-0">
                  <CreditCard className="w-6 h-6 sm:w-7 sm:h-7 text-blue-600 group-hover:text-blue-700 transition-colors duration-300" />
                </div>
                <div className="text-center sm:text-left">
                  <h3 className="text-lg sm:text-xl font-bold text-black group-hover:text-blue-800 transition-colors duration-300">Payment Options</h3>
                  <p className="text-xs sm:text-sm text-gray-500">Manage your billing information</p>
                </div>
              </div>
              <div className="space-y-3 sm:space-y-4 mb-6 sm:mb-8 flex-grow">
                <div className="p-3 sm:p-4 bg-gray-50 rounded-xl border border-gray-100 hover:border-blue-200 transition-colors duration-200">
                  <p className="font-semibold text-gray-700 mb-1 sm:mb-2 text-xs sm:text-sm">Card Holder</p>
                  <p className="text-sm sm:text-base text-black font-medium break-words">{paymentInfo.cardHolder}</p>
                </div>
                <div className="p-3 sm:p-4 bg-gray-50 rounded-xl border border-gray-100 hover:border-blue-200 transition-colors duration-200">
                  <p className="font-semibold text-gray-700 mb-1 sm:mb-2 text-xs sm:text-sm">Card Number</p>
                  <p className="text-sm sm:text-base text-black font-medium break-all">{paymentInfo.cardNumber}</p>
                </div>
                <div className="p-3 sm:p-4 bg-gray-50 rounded-xl border border-gray-100 hover:border-blue-200 transition-colors duration-200">
                  <p className="font-semibold text-gray-700 mb-1 sm:mb-2 text-xs sm:text-sm">Expiry Date</p>
                  <p className="text-sm sm:text-base text-black font-medium">{paymentInfo.expiryDate}</p>
                </div>
                <div className="p-3 sm:p-4 bg-gray-50 rounded-xl border border-gray-100 hover:border-blue-200 transition-colors duration-200">
                  <p className="font-semibold text-gray-700 mb-1 sm:mb-2 text-xs sm:text-sm">Email Address</p>
                  <p className="text-sm sm:text-base text-black font-medium break-words">{paymentInfo.emailAddress}</p>
                </div>
              </div>
              <div className="flex justify-center sm:justify-end">
                <button
                  className="p-2 sm:p-3 rounded-xl text-gray-500 hover:text-blue-600 hover:bg-blue-50 transition-all duration-200 transform hover:scale-110"
                  aria-label="External payment info"
                >
                  <ExternalLink size={18} className="sm:w-[22px] sm:h-[22px]" />
                </button>
              </div>
            </div>

            {/* Enhanced Boosting History Card */}
            <div className="bg-white border border-gray-200 p-6 sm:p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2 hover:scale-105 group relative">
              <div className="absolute top-0 left-0 w-full h-1 bg-green-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 rounded-t-2xl"></div>
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
                <div className="p-2 sm:p-3 bg-green-50 rounded-2xl group-hover:bg-green-100 transition-all duration-300 group-hover:scale-110 mx-auto sm:mx-0">
                  <History className="w-6 h-6 sm:w-7 sm:h-7 text-green-600 group-hover:text-green-700 transition-colors duration-300" />
                </div>
                <div className="text-center sm:text-left">
                  <h3 className="text-lg sm:text-xl font-bold text-black group-hover:text-green-800 transition-colors duration-300">Boosting History</h3>
                  <p className="text-xs sm:text-sm text-gray-500">Track your listing promotions</p>
                </div>
              </div>
              <div className="space-y-3 sm:space-y-4">
                {boostingHistory.map((item, index) => (
                  <div key={index} className="p-3 sm:p-4 bg-gray-50 rounded-xl border border-gray-100 hover:bg-green-50 hover:border-green-200 transition-all duration-200">
                    <p className="font-semibold text-gray-700 mb-1 sm:mb-2 text-xs sm:text-sm">Boosted Period</p>
                    <p className="text-sm sm:text-base text-black font-medium break-words">{item.boostedAt}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Enhanced Technical Issues Card */}
            <div className="bg-white border border-gray-200 p-6 sm:p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2 hover:scale-105 group relative">
              <div className="absolute top-0 left-0 w-full h-1 bg-red-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 rounded-t-2xl"></div>
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
                <div className="p-2 sm:p-3 bg-red-50 rounded-2xl group-hover:bg-red-100 transition-all duration-300 group-hover:scale-110 mx-auto sm:mx-0">
                  <Settings className="w-6 h-6 sm:w-7 sm:h-7 text-red-600 group-hover:text-red-700 transition-colors duration-300" />
                </div>
                <div className="text-center sm:text-left">
                  <h3 className="text-lg sm:text-xl font-bold text-black group-hover:text-red-800 transition-colors duration-300">Technical Support</h3>
                  <p className="text-xs sm:text-sm text-gray-500">Get immediate technical help</p>
                </div>
              </div>
              <p className="text-sm sm:text-base text-gray-600 mb-6 sm:mb-8 leading-relaxed text-center sm:text-left">
                Experiencing technical difficulties? Our support team is ready to help you resolve any issues quickly and efficiently.
              </p>
              <div className="space-y-3 sm:space-y-4">
                <div className="flex flex-col gap-2 p-3 sm:p-4 bg-gray-50 rounded-xl border border-gray-100 hover:bg-red-50 hover:border-red-200 transition-all duration-200 group/item">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-red-100 rounded-xl group-hover/item:bg-red-200 transition-colors duration-200">
                      <Phone className="w-4 h-4 sm:w-5 sm:h-5 text-red-600" />
                    </div>
                    <span className="text-sm sm:text-base text-gray-700 font-medium">Call us directly</span>
                  </div>
                  <a href="tel:123-456-789" className="text-sm sm:text-base text-red-600 hover:text-red-700 font-bold hover:underline transition-all duration-200 ml-11 sm:ml-12">
                    123-456-789
                  </a>
                </div>
                <div className="flex flex-col gap-2 p-3 sm:p-4 bg-gray-50 rounded-xl border border-gray-100 hover:bg-red-50 hover:border-red-200 transition-all duration-200 group/item">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-red-100 rounded-xl group-hover/item:bg-red-200 transition-colors duration-200">
                      <Mail className="w-4 h-4 sm:w-5 sm:h-5 text-red-600" />
                    </div>
                    <span className="text-sm sm:text-base text-gray-700 font-medium">Email support</span>
                  </div>
                  <a href="mailto:support@evintli.com" className="text-sm sm:text-base text-red-600 hover:text-red-700 font-bold hover:underline transition-all duration-200 ml-11 sm:ml-12 break-all">
                    support@evintli.com
                  </a>
                </div>
              </div>
            </div>

            {/* Enhanced Cancellations & Edition Card */}
            <div className="bg-white border border-gray-200 p-6 sm:p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2 hover:scale-105 group lg:col-span-2 xl:col-span-2 relative">
              <div className="absolute top-0 left-0 w-full h-1 bg-orange-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 rounded-t-2xl"></div>
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
                <div className="p-2 sm:p-3 bg-orange-50 rounded-2xl group-hover:bg-orange-100 transition-all duration-300 group-hover:scale-110 mx-auto sm:mx-0">
                  <AlertCircle className="w-6 h-6 sm:w-7 sm:h-7 text-orange-600 group-hover:text-orange-700 transition-colors duration-300" />
                </div>
                <div className="text-center sm:text-left">
                  <h3 className="text-lg sm:text-xl font-bold text-black group-hover:text-orange-800 transition-colors duration-300">Cancellations & Event Modifications</h3>
                  <p className="text-xs sm:text-sm text-gray-500">Important policies and guidelines</p>
                </div>
              </div>
              <div className="bg-orange-50 rounded-2xl p-4 sm:p-6 border border-orange-100">
                <h4 className="font-semibold text-orange-800 mb-3 sm:mb-4 text-base sm:text-lg text-center sm:text-left">Policy Guidelines</h4>
                <ul className="space-y-3 sm:space-y-4">
                  {cancellationPolicies.map((policy, index) => (
                    <li key={index} className="flex items-start gap-3 sm:gap-4 text-gray-700 leading-relaxed">
                      <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 sm:mt-3 flex-shrink-0"></div>
                      <span className="text-xs sm:text-sm">{policy}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Enhanced Feedback Card */}
            <div className="bg-white border border-gray-200 p-6 sm:p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2 hover:scale-105 group lg:col-start-3 xl:col-start-3 relative">
              <div className="absolute top-0 left-0 w-full h-1 bg-purple-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 rounded-t-2xl"></div>
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
                <div className="p-2 sm:p-3 bg-purple-50 rounded-2xl group-hover:bg-purple-100 transition-all duration-300 group-hover:scale-110 mx-auto sm:mx-0">
                  <MessageSquare className="w-6 h-6 sm:w-7 sm:h-7 text-purple-600 group-hover:text-purple-700 transition-colors duration-300" />
                </div>
                <div className="text-center sm:text-left">
                  <h3 className="text-lg sm:text-xl font-bold text-black group-hover:text-purple-800 transition-colors duration-300">Share Feedback</h3>
                  <p className="text-xs sm:text-sm text-gray-500">Help us improve our services</p>
                </div>
              </div>
              <p className="text-sm sm:text-base text-gray-600 mb-6 sm:mb-8 leading-relaxed text-center sm:text-left">
                We value your input! Your feedback helps us create better services and enhance your experience on our platform.
              </p>
              <div className="p-3 sm:p-4 bg-purple-50 rounded-xl border border-purple-100 hover:bg-purple-100 hover:border-purple-200 transition-all duration-200 group/item">
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-100 rounded-xl group-hover/item:bg-purple-200 transition-colors duration-200">
                      <Mail className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600" />
                    </div>
                    <span className="text-sm sm:text-base text-gray-700 font-medium">Send us feedback</span>
                  </div>
                  <a href="mailto:feedback@evintli.com" className="text-sm sm:text-base text-purple-600 hover:text-purple-700 font-bold hover:underline transition-all duration-200 ml-11 sm:ml-12 break-all">
                    feedback@evintli.com
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
