import { Phone, Mail, MapPin } from "lucide-react";

export default function AnnouncementBar() {
  return (
    <div className="w-full bg-neutral-900 text-white text-xs hidden md:block border-b border-neutral-800">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-2">
        <div className="flex gap-6">
          <span className="flex items-center gap-1"><Phone className="h-3 w-3" /> +123 456 7890</span>
          <span className="flex items-center gap-1"><Mail className="h-3 w-3" /> support@adventureshop.com</span>
          <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> Outdoorville, USA</span>
        </div>
        <div className="flex gap-4 font-medium tracking-wide">
          <span className="text-orange-400">Free shipping over €50</span>
          <span className="hidden lg:inline text-neutral-400">New season arrivals in stock</span>
        </div>
      </div>
    </div>
  );
}
