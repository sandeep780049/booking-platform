import { Button } from "../../components/ui/button";
import { useNavigate } from "react-router-dom";

const CATEGORY_IMAGES = {
  "Climbing Gear": {
    image: "https://images.unsplash.com/photo-1522163182402-834f871fd851?auto=format&fit=crop&w=1400&q=80",
    subtitle: "Harnesses, ropes, and everything to conquer the wall",
  },
  "Camping Equipment": {
    image: "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?auto=format&fit=crop&w=1400&q=80",
    subtitle: "Tents, stoves, and shelter for any terrain",
  },
  "Water Sports": {
    image: "https://images.unsplash.com/photo-1530053969600-caed2596d242?auto=format&fit=crop&w=1400&q=80",
    subtitle: "Dive deeper with premium wetsuits and fins",
  },
  "High Altitude Wear": {
    image: "https://images.unsplash.com/photo-1551632811-561732d1e306?auto=format&fit=crop&w=1400&q=80",
    subtitle: "Stay warm and protected at the peak",
  },
  "Safety & Protection": {
    image: "https://images.unsplash.com/photo-1587982041882-6d3a47c3c3ad?auto=format&fit=crop&w=1400&q=80",
    subtitle: "First aid, beacons, and rescue essentials",
  },
};

const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=1400&q=80";

export default function CategoryFeatureGrid({ categories = [] }) {
  const navigate = useNavigate();

  const handleShop = (categoryName) => {
    if (!categoryName) return;
    navigate(`/shop?category=${encodeURIComponent(categoryName)}`);
  };

  const displayCats = categories.length > 0 ? categories.slice(0, 4) : [];

  if (displayCats.length === 0) return null;

  return (
    <section className="max-w-7xl mx-auto px-6 py-20">
      <h2 className="text-center text-2xl md:text-3xl font-bold tracking-tight mb-14">Shop by Category</h2>
      <div className="grid grid-cols-2 gap-3 md:gap-8">
        {displayCats.map((catName, i) => {
          const meta = CATEGORY_IMAGES[catName] || {};
          const image = meta.image || FALLBACK_IMAGE;
          const subtitle = meta.subtitle || `Explore our ${catName} collection`;
          return (
            <div key={i} className="group relative h-[260px] md:h-[300px] overflow-hidden rounded-xl">
              <img src={image} alt={catName} className="absolute inset-0 w-full h-full object-cover transition-transform duration-[1200ms] group-hover:scale-110" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/10" />
              <div className="relative z-10 h-full flex flex-col justify-end p-8">
                <h3 className="text-white text-xl font-semibold drop-shadow-sm">{catName}</h3>
                <p className="text-neutral-200 text-sm mt-1 mb-4 opacity-0 group-hover:opacity-100 transition-opacity duration-500">{subtitle}</p>
                <Button
                  onClick={() => handleShop(catName)}
                  className="bg-white text-black hover:bg-orange-500 hover:text-white rounded-full h-9 px-5 text-xs font-semibold tracking-wide w-fit translate-y-3 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500"
                >
                  Shop Now
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
