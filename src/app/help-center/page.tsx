import type { Metadata } from "next";

/**
 * Help Center static page
 *
 * This page offers placeholder content for a help center. It can be expanded
 * with FAQs, troubleshooting guides, and links to contact support. Metadata
 * defines page title and description to improve SEO.
 */
export const metadata: Metadata = {
  title: "Help Center – Eventli",
  description: "Find answers to common questions and get help with using Eventli.",
};

export default function HelpCenterPage() {
  return (
    <section className="container mx-auto max-w-3xl py-12 px-4">
      <h1 className="text-3xl font-bold mb-6">Help Center</h1>
      <p className="mb-4">
        Welcome to the Eventli Help Center! Here you&apos;ll find answers to common
        questions about creating and managing listings, booking events, and
        using our platform. For more detailed support, please contact our
        support team.
      </p>
      <p className="mb-4"><strong>Frequently Asked Questions (FAQs)</strong></p>
      <p className="mb-2">
        – How do I create a new listing? Use the &quot;Create Listing&quot; button in
        your dashboard and follow the guided steps to add details, photos, and
        pricing.
      </p>
      <p className="mb-2">
        – How can I edit or delete a listing? Visit your listings page and
        select the listing you wish to edit or remove. You can update the
        details or deactivate the listing at any time.
      </p>
      <p className="mb-2">
        – What if I forget my password? Use the &quot;Forgot Password&quot; link on the
        login page to reset your password via email.
      </p>
      <p className="mb-4">
        If you don&apos;t find the answer you&apos;re looking for, please submit a
        request through our support form and we&apos;ll be happy to assist you.
      </p>
    </section>
  );
}
