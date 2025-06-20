import { FiExternalLink } from 'react-icons/fi';

export default function SupportSection() {
    const paymentInfo = {
        cardHolder: "John Due",
        cardNumber: "1234 - 5678 - 9101",
        expiryDate: "06/26",
        emailAddress: "example@test.com"
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
        "Any penalties or compensation for cancellations are determined between the service provider and the customer."
    ];

    return(
        <div className="p-6 md:p-8 bg-gray-100 min-h-screen font-sans">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Payment Options Card */}
                <div className="bg-white p-6 rounded-lg shadow-md flex flex-col">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Payment Options</h3>
                    <div className="text-sm text-gray-600 space-y-3 mb-4 flex-grow">
                        <div>
                            <p className="font-medium text-gray-700">Card Holder:</p>
                            <p>{paymentInfo.cardHolder}</p>
                        </div>
                        <div>
                            <p className="font-medium text-gray-700">Card Number:</p>
                            <p>{paymentInfo.cardNumber}</p>
                        </div>
                        <div>
                            <p className="font-medium text-gray-700">Expiry Date:</p>
                            <p>{paymentInfo.expiryDate}</p>
                        </div>
                        <div>
                            <p className="font-medium text-gray-700">Email Address:</p>
                            <p>{paymentInfo.emailAddress}</p>
                        </div>
                    </div>
                    <button className="self-end text-gray-500 hover:text-blue-600 transition-colors">
                        <FiExternalLink size={20} />
                    </button>
                </div>

                {/* Boosting History Card */}
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Boosting History</h3>
                    <div className="text-sm text-gray-600 space-y-2">
                        {boostingHistory.map((item, index) => (
                            <div key={index}>
                                <p className="font-medium text-gray-700">Boosted at:</p>
                                <p>{item.boostedAt}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Technical Issues Card */}
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Technical issues</h3>
                    <p className="text-sm text-gray-600 mb-4">
                        Contact us, and we&apos;ll promptly resolve your problem.
                    </p>
                    <div className="text-sm space-y-2">
                        <div>
                            <p className="text-gray-700">Call us at:</p>
                            <a href="tel:123-456-789" className="text-blue-600 hover:underline">123 - 456 - 789</a>
                        </div>
                        <div>
                            <p className="text-gray-700">Email us at:</p>
                            <a href="mailto:support@evintli.com" className="text-blue-600 hover:underline">support@evintli.com</a>
                        </div>
                    </div>
                </div>

                {/* Cancelations & edition for events Card */}
                <div className="bg-white p-6 rounded-lg shadow-md md:col-span-2 lg:col-span-2">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Cancelations & edition for events</h3>
                    <ul className="text-sm text-gray-600 space-y-2 list-disc list-inside">
                        {cancellationPolicies.map((policy, index) => (
                            <li key={index}>{policy}</li>
                        ))}
                    </ul>
                </div>
                
                {/* Feedback Card */}
                <div className="bg-white p-6 rounded-lg shadow-md lg:col-start-3">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Feedback</h3>
                    <p className="text-sm text-gray-600 mb-4">
                        We would be more than happy to hear from you. Your feedback helps us create better services for you and your team.
                    </p>
                    <div className="text-sm">
                        <p className="text-gray-700">Email us at:</p>
                        <a href="mailto:feedback@evintli.com" className="text-blue-600 hover:underline">feedback@evintli.com</a>
                    </div>
                </div>
            </div>
        </div>
    );
}
