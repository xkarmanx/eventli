import type { Metadata } from "next";

/**
 * Terms of Service static page
 *
 * This placeholder outlines the basic terms and conditions for using Eventli. It
 * should be replaced with the full legal document before production. The
 * metadata helps with search engine indexing.
 */
export const metadata: Metadata = {
  title: "Terms of Service – Eventli",
  description: "Read the terms and conditions for using Eventli.",
};

export default function TermsOfServicePage() {
  return (
    <section className="container mx-auto max-w-3xl py-12 px-4">
      <h1 className="text-3xl font-bold mb-6">Terms of Service</h1>
      <p className="mb-4">
        The following Terms of Service govern your use of Eventli. By accessing
        or using our platform, you agree to be bound by these terms. These
        terms are provided as a placeholder and should be replaced with a
        comprehensive agreement drafted or reviewed by legal counsel before
        launching the site.
      </p>
      <p className="mb-4">
        <strong>Use of the Service</strong>: Eventli provides a platform to
        connect hosts and guests. You agree to use the service responsibly
        and comply with all applicable laws.
      </p>
      <p className="mb-4">
        <strong>Content Responsibility</strong>: Hosts are responsible for the
        accuracy and legality of their listings. Eventli reserves the right to
        remove content that violates our policies or applicable laws.
      </p>
      <p className="mb-4">
        <strong>Payments</strong>: All payments are processed securely through
        Stripe. By booking or hosting an event, you agree to the payment
        terms and applicable fees.
      </p>
      <p className="mb-4">
        <strong>Limitation of Liability</strong>: Eventli is not liable for
        damages arising from the use of the service. Use the platform at your
        own risk.
      </p>
      <p className="mb-4">
        These terms may be updated periodically. Continued use of Eventli after
        changes constitutes acceptance of the revised terms.
      </p>
    </section>
  );
}
