import { Button } from "../../components/ui/button";
import { useNavigate } from "react-router-dom";

const promos = [
  {
    title: "Summer Sale",
    highlight: "Up to 40% Off",
    copy: "Premium camping gear and trail essentials",
    badge: "Limited Time",
    image: "https://images.unsplash.com/photo-1455496231601-e6195da1f841?auto=format&fit=crop&w=1400&q=80",
    slug: "clothing"
  },
  {
    title: "Care & Maintenance",
    highlight: "Extend Gear Life",
    copy: "Cleaning & waterproofing treatments",
    badge: "Gear Care",
    image: "https://images.unsplash.com/photo-1516914589923-f105f1535f88?auto=format&fit=crop&w=1400&q=80",
    slug: "accessories"
  },
  {
    title: "Premium Camping Stoves",
    highlight: "Cook Anywhere",
    copy: "Fuel efficient stoves for fast meals",
    badge: "New Arrival",
    image: "https://images.unsplash.com/photo-1478131143081-80f7f84ca84d?auto=format&fit=crop&w=1400&q=80",
    slug: "stoves"
  },
  {
    title: "Trail Running Gear",
    highlight: "Go Further",
    copy: "Lightweight gear for serious runners",
    badge: "Best Sellers",
    image: "https://images.unsplash.com/photo-1551698618-1dfe5d97d256?auto=format&fit=crop&w=1400&q=80",
    slug: "footwear"
  }
];

export default function PromoBanners() {
  const navigate = useNavigate();

  const handleExplore = (slug) => {
    if (!slug) return;
    const params = new URLSearchParams();
    params.set('search', slug);
    navigate(`/shop/search?${params.toString()}`);
  };

  return (
    <section className="max-w-7xl mx-auto px-6 pt-4 pb-20">
      <div className="grid grid-cols-2 md:grid-cols-2 gap-3 md:gap-8">
        {promos.map((p, i) => (
          <div key={i} className="relative h-[160px] md:h-[240px] rounded-xl overflow-hidden group">
            <img src={p.image} alt={p.title} className="absolute inset-0 w-full h-full object-cover transition-transform duration-[1200ms] group-hover:scale-110" />
            <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-black/30 group-hover:from-black/80 group-hover:to-black/40 transition-colors" />
            <div className="relative z-10 h-full flex flex-col justify-center p-3 md:p-8">
              <span className="text-[9px] md:text-[10px] font-bold uppercase tracking-wider px-1.5 md:px-2 py-0.5 md:py-1 bg-orange-500 text-white w-fit rounded-sm mb-1 md:mb-2">{p.badge}</span>
              <h3 className="text-base md:text-3xl font-bold text-white tracking-tight leading-tight"><span className="text-orange-400">{p.highlight}</span></h3>
              <p className="text-neutral-200 text-xs md:text-sm font-medium hidden md:block">{p.copy}</p>
              <Button onClick={() => handleExplore(p.slug)} aria-label={`Explore ${p.slug}`} className="mt-2 md:mt-4 bg-white text-black hover:bg-orange-500 hover:text-white rounded-full h-7 md:h-9 px-3 md:px-6 text-[10px] md:text-xs font-semibold tracking-wide w-fit">Explore</Button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
