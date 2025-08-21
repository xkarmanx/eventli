import type { Metadata } from "next";

/**
 * Support static page
 *
 * This page provides users with ways to get in touch with the Eventli team. It
 * includes a short description and an email link. The metadata helps search
 * engines identify the page.
 */
export const metadata: Metadata = {
  title: "Support – Eventli",
  description: "Get in touch with the Eventli support team for assistance.",
};

export default function SupportPage() {
  return (
    <section className="container mx-auto max-w-3xl py-12 px-4">
      <h1 className="text-3xl font-bold mb-6">Support</h1>
      <p className="mb-4">
        We&apos;re here to help! If you have any questions, issues, or feedback,
        please reach out to our support team and we&apos;ll respond as soon as
        possible.
      </p>
      <p className="mb-4">
        You can contact us by sending an email to{" "}
        <a
          href="mailto:support@eventli.com"
          className="text-blue-600 underline hover:text-blue-800"
        >
          support@eventli.com
        </a>
        . We look forward to assisting you.
      </p>
      <p className="mb-4">
        For more immediate help, be sure to check our Help Center for answers to
        commonly asked questions.
      </p>
    </section>
  );
}
