import type { Metadata } from "next";

/**
 * About Us static page
 *
 * This page explains the purpose of Eventli and provides a brief overview
 * about the team and mission. It uses the application's global layout and
 * Tailwind classes for basic styling. The Metadata export defines the
 * document title and description for SEO.
 */
export const metadata: Metadata = {
  title: "About Us – Eventli",
  description: "Learn more about Eventli, our mission, and the team behind the platform.",
};

export default function AboutUsPage() {
  return (
    <section className="container mx-auto max-w-3xl py-12 px-4">
      <h1 className="text-3xl font-bold mb-6">About Eventli</h1>
      <p className="mb-4">
        Eventli is a platform that connects people hosting events with those
        seeking unique experiences. Our mission is to make it easy for anyone to
        discover, host, and enjoy memorable gatherings—whether they are
        workshops, parties, or community meetups.
      </p>
      <p className="mb-4">
        Our team is passionate about building a vibrant marketplace where
        creativity and community flourish. We believe that sharing experiences
        brings people together, and we strive to empower hosts and guests by
        providing reliable tools, secure payments, and an intuitive interface.
      </p>
      <p className="mb-4">
        Thank you for being part of our journey. If you have any questions or
        feedback, don&apos;t hesitate to reach out through our support page.
      </p>
    </section>
  );
}
