import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "../../components/ui/button";
import { useNavigate } from "react-router-dom";

const slides = [
  {
    id: 1,
    title: "Lightweight Rain Jackets",
    subtitle: "Protection for every trail condition",
    ctas: ["Women", "Men"],
    image: "https://images.unsplash.com/photo-1508873696983-2dfd5898f375?auto=format&fit=crop&w=1800&q=80"
  },
  {
    id: 2,
    title: "Ultralight Tents",
    subtitle: "Big comfort, small pack size",
    ctas: ["Shop Tents"],
    image: "https://images.unsplash.com/photo-1526481280698-8fcc1ddfc1f8?auto=format&fit=crop&w=1800&q=80"
  },
  {
    id: 3,
    title: "Compact Cooking Systems",
    subtitle: "Fuel efficient stoves for fast meals",
    ctas: ["Jetboil", "Accessories"],
    image: "https://images.unsplash.com/photo-1470240731273-7821a6eeb6bd?auto=format&fit=crop&w=1800&q=80"
  }
];

export default function HeroCarousel() {
  const [index, setIndex] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const id = setInterval(() => setIndex(i => (i + 1) % slides.length), 7000);
    return () => clearInterval(id);
  }, []);

  const current = slides[index];

  const handleCtaClick = (cta) => {
    const params = new URLSearchParams();
    params.set('search', cta);
    navigate(`/shop/search?${params.toString()}`);
  };

  return (
    <section className="relative h-[480px] md:h-[560px] w-full overflow-hidden group">
      {slides.map((s, i) => (
        <div key={s.id} className={`absolute inset-0 transition-opacity duration-[1200ms] ease-out ${i === index ? 'opacity-100' : 'opacity-0'}`}
          style={{ backgroundImage: `url(${s.image})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
      ))}
      <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-black/20" />
      <div className="relative z-10 max-w-7xl mx-auto h-full flex flex-col justify-center px-6">
        <div className="max-w-xl">
          <h1 className="text-4xl md:text-5xl font-bold text-white leading-tight tracking-tight">
            {current.title}
          </h1>
          <p className="text-neutral-200 mt-4 text-lg font-light">
            {current.subtitle}
          </p>
          <div className="flex flex-wrap gap-4 mt-8">
            {current.ctas.map(c => (
              <Button key={c} onClick={() => handleCtaClick(c)} className="bg-orange-500 hover:bg-orange-600 text-white rounded-full px-6 py-2 text-sm font-medium tracking-wide cursor-pointer">
                {c}
              </Button>
            ))}
          </div>
        </div>
      </div>
      {/* Controls */}
      <button onClick={() => setIndex(i => (i - 1 + slides.length) % slides.length)} className="opacity-0 group-hover:opacity-100 transition-opacity absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full">
        <ChevronLeft className="h-5 w-5" />
      </button>
      <button onClick={() => setIndex(i => (i + 1) % slides.length)} className="opacity-0 group-hover:opacity-100 transition-opacity absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full">
        <ChevronRight className="h-5 w-5" />
      </button>
      {/* Progress dots */}
      <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex gap-3 z-10">
        {slides.map((s, i) => (
          <button key={s.id} onClick={() => setIndex(i)} aria-label={`Go to slide ${i + 1}`} className={`h-2.5 rounded-full transition-all duration-500 ${i === index ? 'w-8 bg-orange-500' : 'w-2.5 bg-white/50 hover:bg-white/70'}`} />
        ))}
      </div>
    </section>
  );
}
