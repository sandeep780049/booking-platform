"use client"

import { motion } from "framer-motion"
import { Nav_Landing } from "../components/Nav_Landing"
import { Button } from "../components/ui/button"
import { Card, CardContent } from "../components/ui/card"
import { ShieldCheck, Star, Users, Globe } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { useTranslation } from "react-i18next"

export default function MissionPage() {
  const navigate = useNavigate()
  const { t } = useTranslation()

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-slate-50">
      <Nav_Landing />

      <header
        className="relative bg-cover bg-center h-[420px] sm:h-[520px]"
        style={{
          backgroundImage: "url('https://images.unsplash.com/photo-1492963060540-65e3aae73127?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=2012')",
        }}
      >
        {/* Neutral overlay to remove green tint while keeping text readable */}
        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
        <div className="absolute inset-0 max-w-7xl mx-auto px-6 sm:px-8 flex flex-col justify-center z-20">
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-tight">Our Mission</h1>
            <p className="mt-3 text-lg sm:text-xl text-white/90 max-w-2xl">High-quality, safe, and sustainable adventures that connect people with the world.</p>
            <div className="mt-6 flex gap-3">
              <Button onClick={() => navigate('/browse?date=' + new Date().toISOString().split('T')[0] + '&q=adventure')} className="bg-white text-emerald-600">Explore Adventures</Button>
            </div>
          </motion.div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 sm:px-8 mt-12 pb-20">
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <Card className="p-6">
            <CardContent>
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-lg bg-emerald-50 text-emerald-600"><ShieldCheck /></div>
                <div>
                  <h3 className="text-lg font-semibold">Safety First</h3>
                  <p className="mt-2 text-sm text-gray-600">All experiences are vetted and run by verified partners with strict safety standards and insurance.</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="p-6">
            <CardContent>
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-lg bg-rose-50 text-rose-600"><Star /></div>
                <div>
                  <h3 className="text-lg font-semibold">Quality Experiences</h3>
                  <p className="mt-2 text-sm text-gray-600">We curate high-quality adventures — from guided hikes to immersive cultural activities — focusing on memorable, authentic moments.</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="p-6">
            <CardContent>
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-lg bg-blue-50 text-blue-600"><Users /></div>
                <div>
                  <h3 className="text-lg font-semibold">Community & Sustainability</h3>
                  <p className="mt-2 text-sm text-gray-600">We support local communities and promote low-impact travel that preserves destinations for future generations.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        <section className="bg-white rounded-2xl p-8 shadow-lg mb-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-center">
            <div>
              <h2 className="text-2xl font-bold">How we keep adventures high-quality and safe</h2>
              <ul className="mt-4 space-y-3 text-gray-700">
                <li>• Thorough partner verification and background checks</li>
                <li>• Clear safety briefings and equipment standards</li>
                <li>• 24/7 support and easy cancellation policies</li>
                <li>• Reviews and ratings from real travelers</li>
              </ul>
              <div className="mt-6">
                <Button onClick={() => navigate('/browse?date=' + new Date().toISOString().split('T')[0] + '&q=adventure')}>Find Adventures</Button>
              </div>
            </div>
            <div>
              {/* Use Unsplash source endpoint for a reliable skydiving image; if you prefer the exact photo, provide the direct images.unsplash.com URL */}
              <img src="https://images.unsplash.com/photo-1659221876406-31a3746f41b9?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1470" alt="adventure" className="rounded-xl shadow-md w-full h-60 object-cover" />
            </div>
          </div>
        </section>

        <section className="mb-10">
          <h3 className="text-xl font-semibold mb-4">Our commitments</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 bg-white rounded-lg shadow-sm">
              <h4 className="font-semibold">Transparent pricing</h4>
              <p className="text-sm text-gray-600 mt-2">No hidden fees — you see exactly what you pay for.</p>
            </div>
            <div className="p-4 bg-white rounded-lg shadow-sm">
              <h4 className="font-semibold">Verified partners</h4>
              <p className="text-sm text-gray-600 mt-2">All partners go through a verification process including identity and safety checks.</p>
            </div>
            <div className="p-4 bg-white rounded-lg shadow-sm">
              <h4 className="font-semibold">Sustainable practices</h4>
              <p className="text-sm text-gray-600 mt-2">We prioritize activities that minimize environmental impact.</p>
            </div>
            <div className="p-4 bg-white rounded-lg shadow-sm">
              <h4 className="font-semibold">Local benefit</h4>
              <p className="text-sm text-gray-600 mt-2">We work with hosts and guides who reinvest in their communities.</p>
            </div>
          </div>
        </section>

        <section className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-2xl p-8 shadow-lg">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="text-2xl font-bold">Ready to explore?</h3>
              <p className="mt-1 text-white/90">Start your next high-quality, safe adventure with us.</p>
            </div>
            <div className="flex gap-3">
              <Button onClick={() => navigate('/browse?date=' + new Date().toISOString().split('T')[0] + '&q=adventure')} className="bg-white text-emerald-600">Browse Adventures</Button>
              <Button variant="ghost" onClick={() => navigate('/contact')}>Contact Us</Button>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}
