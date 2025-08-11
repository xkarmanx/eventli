"use client";

import { ExternalLink, Phone, Mail, CreditCard, History, Settings, MessageSquare, AlertCircle } from "lucide-react";

export default function SupportSection() {
  const paymentInfo = {
    cardHolder: "John Due",
    cardNumber: "1234 - 5678 - 9101",
    expiryDate: "06/26",
    emailAddress: "example@test.com",
  };

  const boostingHistory = [
    { boostedAt: "2025/12/10 to 2025/12/15" },
    { boostedAt: "2026/01/11 to 2026/01/16" },
    { boostedAt: "2026/07/21 to 2026/07/26" },
    { boostedAt: "2026/07/27 to 2026/08/01" },
  ];

  const cancellationPolicies = [
    "Providers must inform customers directly if they require any modifications.",
    "If the customer does not accept the modification, they may cancel based on the provider's terms.",
    "If a provider fails to appear for the service, the customer may report it, but any compensation is at the discretion of the service provider.",
    "Any penalties or compensation for cancellations are determined between the service provider and the customer.",
  ];

  return (
    <div className="p-6 md:p-8 bg-gray-50 min-h-screen font-sans">
      {/* Header Section */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-3">Support Center</h1>
        <p className="text-lg text-gray-600 font-medium">Get help with your account, payments, and technical issues</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Payment Options Card */}
        <div className="bg-white border-2 border-gray-100 p-6 rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group flex flex-col">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-blue-50 rounded-full group-hover:bg-blue-100 transition-colors duration-300">
              <CreditCard className="w-6 h-6 text-blue-600 group-hover:text-blue-700 transition-colors duration-300" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800">Payment Options</h3>
          </div>
          <div className="text-sm text-gray-600 space-y-4 mb-6 flex-grow">
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="font-medium text-gray-700 mb-1">Card Holder:</p>
              <p className="text-gray-900">{paymentInfo.cardHolder}</p>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="font-medium text-gray-700 mb-1">Card Number:</p>
              <p className="text-gray-900">{paymentInfo.cardNumber}</p>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="font-medium text-gray-700 mb-1">Expiry Date:</p>
              <p className="text-gray-900">{paymentInfo.expiryDate}</p>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="font-medium text-gray-700 mb-1">Email Address:</p>
              <p className="text-gray-900">{paymentInfo.emailAddress}</p>
            </div>
          </div>
          <button
            className="self-end p-2 rounded-lg text-gray-500 hover:text-blue-600 hover:bg-blue-50 transition-all duration-200"
            aria-label="External payment info"
          >
            <ExternalLink size={20} />
          </button>
        </div>

        {/* Boosting History Card */}
        <div className="bg-white border-2 border-gray-100 p-6 rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-green-50 rounded-full group-hover:bg-green-100 transition-colors duration-300">
              <History className="w-6 h-6 text-green-600 group-hover:text-green-700 transition-colors duration-300" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800">Boosting History</h3>
          </div>
          <div className="text-sm text-gray-600 space-y-3">
            {boostingHistory.map((item, index) => (
              <div key={index} className="p-3 bg-gray-50 rounded-lg hover:bg-green-50 transition-colors duration-200">
                <p className="font-medium text-gray-700 mb-1">Boosted at:</p>
                <p className="text-gray-900">{item.boostedAt}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Technical Issues Card */}
        <div className="bg-white border-2 border-gray-100 p-6 rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-red-50 rounded-full group-hover:bg-red-100 transition-colors duration-300">
              <Settings className="w-6 h-6 text-red-600 group-hover:text-red-700 transition-colors duration-300" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800">Technical Issues</h3>
          </div>
          <p className="text-sm text-gray-600 mb-6">
            Contact us, and we&apos;ll promptly resolve your problem.
          </p>
          <div className="text-sm space-y-3">
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-red-50 transition-colors duration-200">
              <div className="p-1 bg-red-100 rounded-full">
                <Phone className="w-4 h-4 text-red-600" />
              </div>
              <span className="text-gray-700">Call us at:</span>
              <a href="tel:123-456-789" className="text-red-600 hover:text-red-700 font-medium hover:underline ml-auto">123 - 456 - 789</a>
            </div>
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-red-50 transition-colors duration-200">
              <div className="p-1 bg-red-100 rounded-full">
                <Mail className="w-4 h-4 text-red-600" />
              </div>
              <span className="text-gray-700">Email us at:</span>
              <a href="mailto:support@evintli.com" className="text-red-600 hover:text-red-700 font-medium hover:underline ml-auto">support@evintli.com</a>
            </div>
          </div>
        </div>

        {/* Cancelations & edition for events Card */}
        <div className="bg-white border-2 border-gray-100 p-6 rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group md:col-span-2 lg:col-span-2">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-orange-50 rounded-full group-hover:bg-orange-100 transition-colors duration-300">
              <AlertCircle className="w-6 h-6 text-orange-600 group-hover:text-orange-700 transition-colors duration-300" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800">Cancelations & Edition for Events</h3>
          </div>
          <div className="bg-orange-50 rounded-lg p-4">
            <ul className="text-sm text-gray-700 space-y-3">
              {cancellationPolicies.map((policy, index) => (
                <li key={index} className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                  <span>{policy}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Feedback Card */}
        <div className="bg-white border-2 border-gray-100 p-6 rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group lg:col-start-3">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-purple-50 rounded-full group-hover:bg-purple-100 transition-colors duration-300">
              <MessageSquare className="w-6 h-6 text-purple-600 group-hover:text-purple-700 transition-colors duration-300" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800">Feedback</h3>
          </div>
          <p className="text-sm text-gray-600 mb-6">
            We would be more than happy to hear from you. Your feedback helps us create better services for you and your team.
          </p>
          <div className="p-3 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors duration-200">
            <div className="text-sm flex items-center gap-3">
              <div className="p-1 bg-purple-100 rounded-full">
                <Mail className="w-4 h-4 text-purple-600" />
              </div>
              <span className="text-gray-700">Email us at:</span>
              <a href="mailto:feedback@evintli.com" className="text-purple-600 hover:text-purple-700 font-medium hover:underline ml-auto">feedback@evintli.com</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}