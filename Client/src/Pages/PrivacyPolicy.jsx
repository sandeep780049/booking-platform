import React from 'react'
import { Footer } from '../components/Footer'
import { Nav_Landing } from '../components/Nav_Landing'

export default function PrivacyPolicy() {
  const effectiveDate = 'October 25, 2025'

  return (
    <div className="min-h-screen flex flex-col">
      <Nav_Landing />
  <div className="max-w-5xl mx-auto px-4 pt-24 pb-16">
        <h1 className="text-4xl font-bold mb-4">Privacy Policy</h1>
        <p className="text-gray-600 mb-6">Effective date: {effectiveDate}</p>

        <section className="mb-6">
          <h2 className="text-2xl font-semibold mb-2">Introduction</h2>
          <p className="text-gray-700">Welcome to our platform. We respect your privacy and are committed to protecting your personal data. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website or use our services.</p>
        </section>

        <section className="mb-6">
          <h2 className="text-2xl font-semibold mb-2">Information We Collect</h2>
          <p className="text-gray-700">We collect information to provide and improve our services. Types of information we may collect include:</p>
          <ul className="list-disc list-inside text-gray-700 mt-2">
            <li>Account data: name, email address, phone number, profile picture.</li>
            <li>Authentication data: passwords, OAuth tokens (when you sign in with third-party providers).</li>
            <li>Transactional data: bookings, purchases, tickets, and related payment metadata.</li>
            <li>Communications: messages you send to other users or support, and support tickets.</li>
            <li>Device and usage data: IP address, browser type, device identifiers, pages visited, and interaction data.</li>
            <li>Location data: if you provide it for a booking or profile.</li>
          </ul>
        </section>

        <section className="mb-6">
          <h2 className="text-2xl font-semibold mb-2">How We Use Your Information</h2>
          <p className="text-gray-700">We use your information to:</p>
          <ul className="list-disc list-inside text-gray-700 mt-2">
            <li>Provide, operate, and maintain our services.</li>
            <li>Process transactions and send related information such as booking confirmations.</li>
            <li>Communicate with you, respond to inquiries and provide customer support.</li>
            <li>Personalize content and improve the user experience.</li>
            <li>Detect, prevent and address technical issues and security incidents.</li>
            <li>Comply with legal obligations.</li>
          </ul>
        </section>

        <section className="mb-6">
          <h2 className="text-2xl font-semibold mb-2">Cookies and Tracking Technologies</h2>
          <p className="text-gray-700">We use cookies and similar tracking technologies to track activity on our service and hold certain information. Cookies may be used to remember your preferences and improve site functionality.</p>
        </section>

        <section className="mb-6">
          <h2 className="text-2xl font-semibold mb-2">Third-Party Services</h2>
          <p className="text-gray-700">We may share your information with service providers to perform services on our behalf, such as payment processors, analytics providers, email providers, and cloud hosting providers. When you sign in with third-party providers (Google, Facebook, LinkedIn), we receive profile information in accordance with the provider's consent screen and policies.</p>
        </section>

        <section className="mb-6">
          <h2 className="text-2xl font-semibold mb-2">Data Retention</h2>
          <p className="text-gray-700">We retain your personal data only for as long as necessary to fulfill the purposes described in this policy, unless a longer retention period is required or permitted by law.</p>
        </section>

        <section className="mb-6">
          <h2 className="text-2xl font-semibold mb-2">Security</h2>
          <p className="text-gray-700">We implement reasonable technical and organizational measures to protect your personal data. However, no online service can be completely secure—please take care to protect your account credentials.</p>
        </section>

        <section className="mb-6">
          <h2 className="text-2xl font-semibold mb-2">Your Rights</h2>
          <p className="text-gray-700">Depending on your jurisdiction, you may have rights regarding your personal data, including the right to access, correct, update, or delete your information. To exercise these rights, please contact us using the details below.</p>
        </section>

        <section className="mb-6">
          <h2 className="text-2xl font-semibold mb-2">Children's Privacy</h2>
          <p className="text-gray-700">Our services are not intended for children under the age of 13. We do not knowingly collect personal information from children under 13. If you believe we have collected such data, please contact us to request removal.</p>
        </section>

        <section className="mb-6">
          <h2 className="text-2xl font-semibold mb-2">Changes to This Policy</h2>
          <p className="text-gray-700">We may update this Privacy Policy from time to time. We will notify you of any material changes by posting the new policy on this page and updating the effective date.</p>
        </section>

        <section className="mb-6">
          <h2 className="text-2xl font-semibold mb-2">Contact Us</h2>
          <p className="text-gray-700">If you have questions about this Privacy Policy or want to exercise your rights, please contact us at:</p>
          <p className="text-gray-700 mt-2">support@example.com</p>
        </section>
      </div>

      <Footer />
    </div>
  )
}
