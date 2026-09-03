import React from 'react'
import { Nav_Landing } from '../components/Nav_Landing'
import { Footer } from '../components/Footer'

export default function FAQ() {
  return (
    <div className="min-h-screen flex flex-col">
      <Nav_Landing />
      <div className="max-w-5xl mx-auto px-4 pt-24 pb-16">
        <h1 className="text-4xl font-bold mb-6">Frequently Asked Questions</h1>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-2">Account & Authentication</h2>
          <div className="prose text-gray-700">
            <h3>How do I create an account?</h3>
            <p>Click Sign Up on the login page and follow the registration form. You'll receive an email to verify your account.</p>
            <h3>Can I sign in with Google, Facebook or LinkedIn?</h3>
            <p>Yes—use the social sign-in buttons on the login form. We authenticate with the provider and create an account if one doesn't exist.</p>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-2">Bookings & Payments</h2>
          <div className="prose text-gray-700">
            <h3>How do I book an activity?</h3>
            <p>Find an activity on the Browse page, select a date and participants, then proceed to checkout.</p>
            <h3>What payment methods are supported?</h3>
            <p>We support card payments and PayPal where available. Payment providers are listed on the checkout page.</p>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-2">Support & Tickets</h2>
          <div className="prose text-gray-700">
            <h3>How do I contact support?</h3>
            <p>Use the Customer Support link in the footer or go to <a className="text-blue-600" href="/support">/support</a> to create a ticket.</p>
            <h3>How long does it take to get a reply?</h3>
            <p>We typically respond within 24–48 hours depending on volume.</p>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-2">Privacy & Safety</h2>
          <div className="prose text-gray-700">
            <h3>Where can I find the privacy policy?</h3>
            <p>Our Privacy Policy is available at <a className="text-blue-600" href="/privacy">/privacy</a>.</p>
            <h3>Is my payment information stored?</h3>
            <p>We use third-party payment processors—card details are handled by them, not stored on our servers.</p>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-2">Other</h2>
          <div className="prose text-gray-700">
            <h3>How do I become an instructor or list a hotel?</h3>
            <p>Visit the Instructor or Hotel registration pages from the top navigation and follow the application steps.</p>
          </div>
        </section>
      </div>
      <Footer />
    </div>
  )
}
