import type { Metadata } from "next";

/**
 * Cookie Policy static page
 *
 * This page explains how Eventli uses cookies and similar technologies.
 * It should be replaced with a comprehensive policy compliant with applicable
 * privacy laws and cookie regulations before production. Metadata is defined for SEO.
 */
export const metadata: Metadata = {
  title: "Cookie Policy – Eventli",
  description: "Learn about how Eventli uses cookies and similar technologies.",
};

export default function CookiePolicyPage() {
  return (
    <section className="container mx-auto max-w-3xl py-12 px-4">
      <h1 className="text-3xl font-bold mb-6">Cookie Policy</h1>
      <p className="mb-4">
        This Cookie Policy explains how Eventli uses cookies and similar
        technologies when you visit our website. The content here is placeholder
        text and must be replaced with a comprehensive policy compliant with
        applicable cookie and privacy laws.
      </p>
      <p className="mb-4">
        <strong>What are Cookies?</strong> Cookies are small text files that are
        stored on your device when you visit a website. They help us provide you
        with a better experience by remembering your preferences and improving
        site functionality.
      </p>
      <p className="mb-4">
        <strong>Types of Cookies We Use:</strong>
      </p>
      <ul className="mb-4 list-disc list-inside space-y-2">
        <li><strong>Essential Cookies:</strong> Required for the website to function properly, including authentication and security.</li>
        <li><strong>Analytics Cookies:</strong> Help us understand how visitors interact with our website to improve performance.</li>
        <li><strong>Functional Cookies:</strong> Remember your preferences and provide enhanced features.</li>
      </ul>
      <p className="mb-4">
        <strong>Managing Cookies:</strong> You can control and manage cookies
        through your browser settings. Please note that disabling certain cookies
        may affect the functionality of our website.
      </p>
      <p className="mb-4">
        <strong>Third-Party Cookies:</strong> We may use third-party services
        such as Google Analytics and Stripe for payment processing, which may
        set their own cookies. Please refer to their respective privacy policies
        for more information.
      </p>
      <p className="mb-4">
        This policy may be updated periodically. We will notify you of
        significant changes by updating the date at the top of the policy.
      </p>
    </section>
  );
}
