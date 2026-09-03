import { useRef } from "react";
import { ChevronLeft, ChevronRight, Heart, ShoppingCart } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "../../components/ui/button";

export default function RecommendedSlider({ items = [], addToCart }) {
  const ref = useRef(null);
  const scroll = (dir) => {
    const el = ref.current;
    if (!el) return;
    el.scrollBy({ left: dir === 'left' ? -800 : 800, behavior: 'smooth' });
  };
  return (
    <section className="max-w-7xl mx-auto px-6 py-20">
      <div className="flex items-center justify-between mb-10">
        <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Recommended</h2>
        <Link to="/all-products" className="text-orange-500 hover:text-orange-600 font-medium text-sm">View All →</Link>
      </div>
      <div className="relative">
        <div ref={ref} className="flex gap-6 overflow-x-auto pb-6 scroll-smooth snap-x snap-mandatory hide-scrollbar">
          {items.map((item, i) => (
            <div key={item._id || i} className="min-w-[250px] max-w-[250px] bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 snap-start group">
              <Link to={`/product/${item._id}`} className="block h-48 bg-neutral-100 relative overflow-hidden">
                {item.images?.[0] ? (
                  <img src={item.images[0]} alt={item.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-xs text-neutral-500">No Image</div>
                )}
                {i < 3 && <span className="absolute top-2 left-2 text-[10px] font-bold bg-orange-500 text-white px-2 py-1 rounded">NEW</span>}
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button size="icon" variant="ghost" className="bg-white/80 hover:bg-white rounded-full h-8 w-8 shadow">
                    <Heart className="h-4 w-4 text-neutral-700" />
                  </Button>
                </div>
              </Link>
              <div className="p-4 space-y-2">
                <p className="text-[11px] uppercase font-semibold tracking-wide text-neutral-500">{item.brand}</p>
                <Link to={`/product/${item._id}`} className="block">
                  <h3 className="text-sm font-medium line-clamp-2 h-10 group-hover:text-orange-500 transition-colors">{item.name}</h3>
                </Link>
                <div className="flex items-center justify-between pt-1">
                  <p className="font-bold text-neutral-900">€{item.price}</p>
                  <Button onClick={() => {
                    addToCart(item)
                  }} size="sm" className="bg-black hover:bg-orange-500 text-white rounded-full h-8 px-3 text-xs font-medium">
                    <ShoppingCart className="h-4 w-4 mr-1" /> Add
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
        <button onClick={()=>scroll('left')} className="absolute left-0 top-1/2 -translate-y-1/2 bg-white p-3 rounded-full shadow hover:bg-orange-500 hover:text-white transition-colors"><ChevronLeft className="h-5 w-5" /></button>
        <button onClick={()=>scroll('right')} className="absolute right-0 top-1/2 -translate-y-1/2 bg-white p-3 rounded-full shadow hover:bg-orange-500 hover:text-white transition-colors"><ChevronRight className="h-5 w-5" /></button>
      </div>
    </section>
  );
}
