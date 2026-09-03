import { Facebook, Instagram, MapPin, Phone, Mail } from "lucide-react";

export default function Footer({ categories = [] }) {
  return (
    <footer className="bg-neutral-950 text-white pt-20">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-14 pb-16">
        <div className="space-y-4">
          <h4 className="font-bold text-xl text-orange-400 tracking-tight">Adventure Shop</h4>
            <p className="text-neutral-400 text-sm leading-relaxed">Active leisure & tourism goods for your next adventure. Quality equipment for unforgettable experiences.</p>
            <p className="text-neutral-300 font-medium text-sm">Gear up for new stories.</p>
            <div className="flex gap-3 pt-2">
              <a href="#" className="bg-neutral-800 hover:bg-orange-500 transition-colors p-2 rounded-full"><Facebook className="h-4 w-4" /></a>
              <a href="#" className="bg-neutral-800 hover:bg-orange-500 transition-colors p-2 rounded-full"><Instagram className="h-4 w-4" /></a>
            </div>
        </div>
        <div>
          <h4 className="font-semibold mb-4 tracking-wide">Shop</h4>
          <ul className="space-y-2 text-sm text-neutral-400">
            {categories.map(c => <li key={c}><a href={`/shop/category/${c.toLowerCase()}`} className="hover:text-orange-400 transition-colors">{c}</a></li>)}
          </ul>
        </div>
        <div>
          <h4 className="font-semibold mb-4 tracking-wide">Information</h4>
          <ul className="space-y-2 text-sm text-neutral-400">
            <li><a href="/faq" className="hover:text-orange-400">FAQ</a></li>
            <li><a href="/terms" className="hover:text-orange-400">Terms & Conditions</a></li>
            <li><a href="/privacy" className="hover:text-orange-400">Privacy Policy</a></li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold mb-4 tracking-wide">Contact</h4>
          <ul className="space-y-4 text-sm text-neutral-400">
            <li className="flex items-start gap-3"><MapPin className="h-5 w-5 text-orange-400" /><span>123 Adventure Street\nOutdoorville, OD 12345</span></li>
            <li className="flex items-center gap-3"><Phone className="h-5 w-5 text-orange-400" /><span>+1 (123) 456-7890</span></li>
            <li className="flex items-center gap-3"><Mail className="h-5 w-5 text-orange-400" /><a href="mailto:info@adventureshop.com" className="hover:text-orange-400">info@adventureshop.com</a></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-neutral-900">
        <div className="max-w-7xl mx-auto px-6 py-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-neutral-600 text-xs">© 2025 Adventure Shop. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
