import type { Metadata } from "next";

/**
 * Privacy Policy static page
 *
 * This page contains a placeholder privacy policy explaining how Eventli
 * collects, uses, and safeguards user information. A full policy should be
 * provided by legal counsel before launch. Metadata is defined for SEO.
 */
export const metadata: Metadata = {
  title: "Privacy Policy – Eventli",
  description:
    "Learn how Eventli collects, uses, and protects your personal information.",
};

export default function PrivacyPolicyPage() {
  return (
    <section className="container mx-auto max-w-3xl py-12 px-4">
      <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>
      <p className="mb-4">
        This Privacy Policy explains how Eventli collects, uses, and protects
        your personal information. The content here is placeholder text and
        must be replaced with a comprehensive policy tailored to your
        operations and compliant with applicable privacy laws.
      </p>
      <p className="mb-4">
        <strong>Information Collection</strong>: We collect information you
        provide directly when creating an account or listing, as well as
        information collected automatically through your interactions with the
        platform.
      </p>
      <p className="mb-4">
        <strong>Use of Information</strong>: We use your information to
        facilitate bookings, process payments, provide customer support, and
        improve our services. We do not sell your personal information to
        third parties.
      </p>
      <p className="mb-4">
        <strong>Data Security</strong>: We implement industry-standard security
        measures to protect your information. However, no method of
        transmission over the internet or electronic storage is 100% secure.
      </p>
      <p className="mb-4">
        <strong>Your Rights</strong>: You may have rights under relevant
        privacy laws to access, correct, or delete your data. Please contact
        us if you wish to exercise these rights.
      </p>
      <p className="mb-4">
        This policy may be updated periodically. We will notify you of
        significant changes by updating the date at the top of the policy.
      </p>
    </section>
  );
}
