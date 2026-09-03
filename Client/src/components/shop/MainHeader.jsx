import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { Search, ShoppingCart, Heart, User, Menu, X, GitCompare, Mountain, Tent, Waves, Wind, ShieldCheck } from "lucide-react";

export default function MainHeader({ categories = [], onSearch, onCategorySelect, selectedCategory }) {
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const debounceRef = useRef(null);
  const inputRef = useRef(null);
  const baseUrl = import.meta.env.VITE_SERVER_URL;

  const categoryIcons = {
    "Climbing Gear": Mountain,
    "Camping Equipment": Tent,
    "Water Sports": Waves,
    "High Altitude Wear": Wind,
    "Safety & Protection": ShieldCheck,
  };

  const submit = (e) => {
    e.preventDefault();
    if (onSearch) {
      onSearch(query);
    } else {
      // fallback: navigate to the shared nav-results page so the nav-bar search uses the same Filters/Product grid
      navigate(`/shop/nav?search=${encodeURIComponent(query)}`);
    }
    if (mobileOpen) setMobileOpen(false);
  };

  // fetch suggestions (debounced)
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!query || query.length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`${baseUrl}api/items?search=${encodeURIComponent(query)}&limit=6`);
        const data = await res.json();
        const items = data?.message || data || [];
        setSuggestions(items.slice(0, 6));
        setShowSuggestions(true);
      } catch (err) {
        // ignore suggestions errors
        setSuggestions([]);
        setShowSuggestions(false);
      }
    }, 220);

    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [query]);

  // clicking outside should hide suggestions
  useEffect(() => {
    const onDoc = (e) => { if (inputRef.current && !inputRef.current.contains(e.target)) setShowSuggestions(false); };
    document.addEventListener('click', onDoc);
    return () => document.removeEventListener('click', onDoc);
  }, []);

  return (
    <header className="bg-black text-white sticky top-0 z-50 shadow-md">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link to="/" className="text-2xl font-bold tracking-tight">
          <span className="text-orange-400">Adventure</span>Shop
        </Link>
        {/* Desktop Nav (Categories Removed) */}
        {/* Actions */}
        <div className="hidden md:flex items-center gap-5">
          <form onSubmit={submit} className="relative" ref={inputRef} autoComplete="off">
            <input value={query} onChange={e => { setQuery(e.target.value); }} placeholder="Search products" className="bg-neutral-800 text-sm rounded-full px-4 py-2 pr-9 focus:outline-none focus:ring-2 focus:ring-orange-500" onFocus={() => { if (suggestions.length) setShowSuggestions(true); }} />
            <button type="submit" className="absolute top-1/2 -translate-y-1/2 right-3 text-neutral-400 hover:text-orange-400">
              <Search className="h-4 w-4" />
            </button>

            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute left-0 mt-2 w-96 bg-white text-black rounded-md shadow-lg overflow-hidden z-40">
                {suggestions.map((s, idx) => (
                  <button key={s._id || idx} type="button" onClick={() => { setQuery(s.name || ''); setShowSuggestions(false); if (onSearch) onSearch(s.name || ''); else navigate(`/shop/nav?search=${encodeURIComponent(s.name || '')}`); }} className="w-full text-left px-3 py-2 hover:bg-neutral-100 text-sm flex items-center gap-3">
                    <div className="w-10 h-10 bg-neutral-100 rounded overflow-hidden flex items-center justify-center">
                      {s.images?.[0] ? (
                        <img src={s.images[0]} alt={s.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="text-xs text-neutral-400">No Image</div>
                      )}
                    </div>
                    <div className="flex-1 text-left">
                      <div className="text-sm font-medium text-neutral-900">{s.name}</div>
                      <div className="text-xs text-neutral-500">{s.category || s.brand || ''}</div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </form>
          <Link to="/favorites" className="hover:text-orange-400"><Heart className="h-5 w-5" /></Link>
          <Link to="/shop/comparison" className="hover:text-orange-400"><GitCompare className="h-5 w-5" /></Link>
          <Link to="/cart" className="relative hover:text-orange-400">
            <ShoppingCart className="h-5 w-5" />
          </Link>
        </div>
        {/* Mobile toggle */}
        <button onClick={() => setMobileOpen(o => !o)} className="md:hidden p-2 rounded-md bg-neutral-800 hover:bg-neutral-700">
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>
      {mobileOpen && (
        <div className="md:hidden border-t border-neutral-800 px-6 pb-6 space-y-4 bg-black/95 backdrop-blur">
          <form onSubmit={submit} className="relative pt-4">
            <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search products" className="bg-neutral-800 w-full text-sm rounded-full px-4 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-orange-500" />
            <button type="submit" className="absolute top-1/2 -translate-y-1/2 right-4 text-neutral-400 hover:text-orange-400">
              <Search className="h-4 w-4" />
            </button>
          </form>
          {/* Mobile Nav Categories Removed */}
          <div className="flex gap-6 pt-2 text-sm">
            <Link to="/favorites" onClick={() => setMobileOpen(false)} className="hover:text-orange-400 flex items-center gap-1"><Heart className="h-4 w-4" /> Favorites</Link>
            <Link to="/shop/comparison" onClick={() => setMobileOpen(false)} className="hover:text-orange-400 flex items-center gap-1"><GitCompare className="h-4 w-4" /> Compare</Link>
            <Link to="/account" onClick={() => setMobileOpen(false)} className="hover:text-orange-400 flex items-center gap-1"><User className="h-4 w-4" /> Account</Link>
            <Link to="/cart" onClick={() => setMobileOpen(false)} className="hover:text-orange-400 flex items-center gap-1"><ShoppingCart className="h-4 w-4" /> Cart</Link>
          </div>
        </div>
      )}
    </header>
  );
}
