import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingCart, Heart, SlidersHorizontal, X, Search, Star, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { toast } from 'sonner';
import { useFavorites } from '../../contexts/FavoritesContext';

function FilterSection({ title, defaultOpen = true, children }) {
    const [open, setOpen] = useState(defaultOpen);
    return (
        <div className="border-b border-neutral-100 last:border-b-0">
            <button
                type="button"
                onClick={() => setOpen(o => !o)}
                className="w-full flex items-center justify-between py-3 text-sm font-semibold text-neutral-800 hover:text-neutral-950 transition-colors"
            >
                {title}
                {open ? <ChevronUp className="h-4 w-4 text-neutral-400" /> : <ChevronDown className="h-4 w-4 text-neutral-400" />}
            </button>
            <div className={`overflow-hidden transition-all duration-300 ${open ? 'max-h-96 pb-4' : 'max-h-0'}`}>
                {children}
            </div>
        </div>
    );
}

export default function ProductsGrid({ items = [], categories = [], selectedCategory = '', search = '', addToCart, onCategorySelect, onSearch, onFilterChange, adventures = [], selectedAdventure = '' }) {
    const navigate = useNavigate();
    const [localCategory, setLocalCategory] = useState(selectedCategory || '');
    const [localSearch, setLocalSearch] = useState(search || '');
    const [appliedSearch, setAppliedSearch] = useState(search || '');
    const [appliedCategory, setAppliedCategory] = useState(selectedCategory || '');
    const [appliedPriceMin, setAppliedPriceMin] = useState('');
    const [appliedPriceMax, setAppliedPriceMax] = useState('');
    const [appliedAvailability, setAppliedAvailability] = useState('any');
    const [appliedMinRating, setAppliedMinRating] = useState(0);
    const [appliedSortBy, setAppliedSortBy] = useState('relevance');
    const [appliedAdventure, setAppliedAdventure] = useState('');
    const [priceMin, setPriceMin] = useState('');
    const [priceMax, setPriceMax] = useState('');
    const [availability, setAvailability] = useState('any');
    const [minRating, setMinRating] = useState(0);
    const [localAdventure, setLocalAdventure] = useState(selectedAdventure || '');
    const [sortBy, setSortBy] = useState('relevance');
    const [suggestions, setSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
    const debounceRef = useRef(null);
    const baseUrl = import.meta.env.VITE_SERVER_URL;

    useEffect(() => { setLocalCategory(selectedCategory || ''); setAppliedCategory(selectedCategory || ''); }, [selectedCategory]);
    useEffect(() => { setLocalSearch(search || ''); setAppliedSearch(search || ''); }, [search]);
    useEffect(() => { setLocalAdventure(selectedAdventure || ''); setAppliedAdventure(selectedAdventure || ''); }, [selectedAdventure]);

    useEffect(() => {
        if (debounceRef.current) clearTimeout(debounceRef.current);
        if (!localSearch || localSearch.length < 2) {
            setSuggestions([]);
            setShowSuggestions(false);
            return;
        }
        debounceRef.current = setTimeout(async () => {
            try {
                const res = await fetch(`${baseUrl}api/items?search=${encodeURIComponent(localSearch)}&limit=6`);
                const data = await res.json();
                const list = data?.message || data || [];
                setSuggestions(list.slice(0, 6));
                setShowSuggestions(true);
            } catch {
                setSuggestions([]);
                setShowSuggestions(false);
            }
        }, 220);
        return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
    }, [localSearch]);

    useEffect(() => {
        const onDoc = (e) => { if (e.target && !e.target.closest('.products-left-search')) setShowSuggestions(false); };
        document.addEventListener('click', onDoc);
        return () => document.removeEventListener('click', onDoc);
    }, []);

    useEffect(() => {
        onFilterChange?.({
            search: appliedSearch,
            category: appliedCategory,
            priceMin: appliedPriceMin,
            priceMax: appliedPriceMax,
            availability: appliedAvailability,
            minRating: appliedMinRating,
            adventure: appliedAdventure,
            sortBy: appliedSortBy,
        });
    }, [appliedSearch, appliedCategory, appliedPriceMin, appliedPriceMax, appliedAvailability, appliedMinRating, appliedSortBy]);

    useEffect(() => {
        if (mobileFiltersOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => { document.body.style.overflow = ''; };
    }, [mobileFiltersOpen]);

    const filtered = items.filter(it => {
        if (localCategory && it.category && it.category.toLowerCase() !== localCategory.toLowerCase()) return false;
        if (priceMin !== '' && typeof it.price === 'number' && it.price < parseFloat(priceMin)) return false;
        if (priceMax !== '' && typeof it.price === 'number' && it.price > parseFloat(priceMax)) return false;
        if (availability === 'purchase' && (!it.purchase || it.purchaseStock <= 0)) return false;
        if (availability === 'rent' && (!it.rent || it.rentalStock <= 0)) return false;
        if (minRating && it.avgRating < minRating) return false;
        return true;
    }).sort((a, b) => {
        if (sortBy === 'price-asc') return (a.price || 0) - (b.price || 0);
        if (sortBy === 'price-desc') return (b.price || 0) - (a.price || 0);
        if (sortBy === 'rating-desc') return (b.avgRating || 0) - (a.avgRating || 0);
        return 0;
    });

    const activeFilterCount = [
        appliedCategory,
        appliedSearch,
        appliedPriceMin,
        appliedPriceMax,
        appliedAvailability !== 'any' ? appliedAvailability : '',
        appliedMinRating > 0 ? String(appliedMinRating) : '',
        appliedAdventure,
    ].filter(Boolean).length;

    const applyFilters = () => {
        onSearch?.(localSearch, { skipFetch: true });
        setAppliedSearch(localSearch);
        setAppliedCategory(localCategory);
        setAppliedPriceMin(priceMin);
        setAppliedPriceMax(priceMax);
        setAppliedAvailability(availability);
        setAppliedMinRating(minRating);
        setAppliedSortBy(sortBy);
        setAppliedAdventure(localAdventure);
        setShowSuggestions(false);
        setMobileFiltersOpen(false);
    };

    const clearAllFilters = () => {
        setLocalSearch(''); setAppliedSearch('');
        setLocalCategory(''); setAppliedCategory('');
        setPriceMin(''); setAppliedPriceMin('');
        setPriceMax(''); setAppliedPriceMax('');
        setAvailability('any'); setAppliedAvailability('any');
        setMinRating(0); setAppliedMinRating(0);
        setSortBy('relevance'); setAppliedSortBy('relevance');
        setLocalAdventure(''); setAppliedAdventure('');
        onSearch?.('', { skipFetch: true });
        setShowSuggestions(false);
    };

    const filterContent = (
        <div className="flex flex-col h-full">
            <FilterSection title="Search">
                <div className="relative products-left-search">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                        <input
                            value={localSearch}
                            onChange={e => { setLocalSearch(e.target.value); setShowSuggestions(true); }}
                            onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); setShowSuggestions(false); } }}
                            className="w-full pl-9 pr-3 py-2.5 border border-neutral-200 rounded-lg text-sm bg-neutral-50 focus:bg-white focus:border-orange-400 focus:ring-1 focus:ring-orange-400/20 outline-none transition-all"
                            placeholder="Search products..."
                        />
                    </div>
                    {showSuggestions && suggestions.length > 0 && (
                        <div className="absolute left-0 mt-1 w-full bg-white rounded-lg shadow-lg border border-neutral-100 z-20 overflow-hidden">
                            {suggestions.map((s, idx) => (
                                <button key={s._id || idx} type="button" onClick={() => { setLocalSearch(s.name || ''); setAppliedSearch(s.name || ''); onSearch?.(s.name || '', { skipFetch: true }); setShowSuggestions(false); }} className="w-full text-left px-3 py-2.5 hover:bg-orange-50 text-sm flex items-center gap-3 transition-colors">
                                    <div className="w-9 h-9 bg-neutral-100 rounded-lg overflow-hidden flex-shrink-0 flex items-center justify-center">
                                        {s.images?.[0] ? (
                                            <img src={s.images[0]} alt={s.name} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="text-[10px] text-neutral-400">N/A</div>
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="text-sm font-medium text-neutral-900 truncate">{s.name}</div>
                                        <div className="text-xs text-neutral-500">{s.category || s.brand || ''}</div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </FilterSection>

            <FilterSection title="Categories">
                <div className="flex flex-col gap-0.5">
                    <button
                        onClick={() => { setLocalCategory(''); onCategorySelect?.(''); }}
                        className={`text-left text-sm px-3 py-2 rounded-lg transition-all ${!localCategory ? 'bg-orange-50 text-orange-600 font-semibold' : 'text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900'}`}
                    >
                        All Categories
                    </button>
                    {categories.map(c => (
                        <button
                            key={c}
                            onClick={() => { setLocalCategory(c); onCategorySelect?.(c); }}
                            className={`text-left text-sm px-3 py-2 rounded-lg transition-all ${localCategory === c ? 'bg-orange-50 text-orange-600 font-semibold' : 'text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900'}`}
                        >
                            {c}
                        </button>
                    ))}
                </div>
            </FilterSection>

            <FilterSection title="Price Range" defaultOpen={false}>
                <div className="flex items-center gap-2">
                    <div className="relative flex-1">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-neutral-400">€</span>
                        <input
                            value={priceMin}
                            onChange={e => setPriceMin(e.target.value)}
                            className="w-full pl-7 pr-2 py-2.5 border border-neutral-200 rounded-lg text-sm bg-neutral-50 focus:bg-white focus:border-orange-400 focus:ring-1 focus:ring-orange-400/20 outline-none transition-all"
                            placeholder="Min"
                            type="number"
                        />
                    </div>
                    <span className="text-neutral-300 text-sm">—</span>
                    <div className="relative flex-1">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-neutral-400">€</span>
                        <input
                            value={priceMax}
                            onChange={e => setPriceMax(e.target.value)}
                            className="w-full pl-7 pr-2 py-2.5 border border-neutral-200 rounded-lg text-sm bg-neutral-50 focus:bg-white focus:border-orange-400 focus:ring-1 focus:ring-orange-400/20 outline-none transition-all"
                            placeholder="Max"
                            type="number"
                        />
                    </div>
                </div>
            </FilterSection>

            <FilterSection title="Availability" defaultOpen={false}>
                <div className="flex flex-col gap-1">
                    {[
                        { value: 'any', label: 'All Items' },
                        { value: 'purchase', label: 'For Purchase' },
                        { value: 'rent', label: 'For Rent' },
                    ].map(opt => (
                        <button
                            key={opt.value}
                            onClick={() => setAvailability(opt.value)}
                            className={`text-left text-sm px-3 py-2 rounded-lg transition-all ${availability === opt.value ? 'bg-orange-50 text-orange-600 font-semibold' : 'text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900'}`}
                        >
                            {opt.label}
                        </button>
                    ))}
                </div>
            </FilterSection>

            <FilterSection title="Rating" defaultOpen={false}>
                <div className="flex flex-col gap-1">
                    {[
                        { value: 0, label: 'Any Rating' },
                        { value: 4, label: '4 Stars & Up' },
                        { value: 3, label: '3 Stars & Up' },
                        { value: 2, label: '2 Stars & Up' },
                        { value: 1, label: '1 Star & Up' },
                    ].map(opt => (
                        <button
                            key={opt.value}
                            onClick={() => setMinRating(opt.value)}
                            className={`text-left text-sm px-3 py-2 rounded-lg transition-all flex items-center gap-2 ${minRating === opt.value ? 'bg-orange-50 text-orange-600 font-semibold' : 'text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900'}`}
                        >
                            {opt.value > 0 && (
                                <span className="flex items-center gap-0.5">
                                    {Array.from({ length: opt.value }).map((_, si) => (
                                        <Star key={si} className="h-3.5 w-3.5 fill-orange-400 text-orange-400" />
                                    ))}
                                </span>
                            )}
                            <span>{opt.label}</span>
                        </button>
                    ))}
                </div>
            </FilterSection>

            {adventures.length > 0 && (
                <FilterSection title="Adventure" defaultOpen={false}>
                    <select
                        value={localAdventure}
                        onChange={e => setLocalAdventure(e.target.value)}
                        className="w-full px-3 py-2.5 border border-neutral-200 rounded-lg text-sm bg-neutral-50 focus:bg-white focus:border-orange-400 focus:ring-1 focus:ring-orange-400/20 outline-none transition-all"
                    >
                        <option value="">Any Adventure</option>
                        {adventures.map(adv => (
                            <option key={adv._id} value={adv._id}>{adv.name}</option>
                        ))}
                    </select>
                </FilterSection>
            )}

            <FilterSection title="Sort By">
                <div className="flex flex-col gap-1">
                    {[
                        { value: 'relevance', label: 'Relevance' },
                        { value: 'price-asc', label: 'Price: Low to High' },
                        { value: 'price-desc', label: 'Price: High to Low' },
                        { value: 'rating-desc', label: 'Top Rated' },
                    ].map(opt => (
                        <button
                            key={opt.value}
                            onClick={() => setSortBy(opt.value)}
                            className={`text-left text-sm px-3 py-2 rounded-lg transition-all ${sortBy === opt.value ? 'bg-orange-50 text-orange-600 font-semibold' : 'text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900'}`}
                        >
                            {opt.label}
                        </button>
                    ))}
                </div>
            </FilterSection>

            <div className="pt-4 mt-auto flex gap-2">
                <Button onClick={applyFilters} className="flex-1 bg-orange-500 hover:bg-orange-600 text-white rounded-lg h-10 text-sm font-semibold">
                    Apply Filters
                </Button>
                <Button onClick={clearAllFilters} variant="outline" className="flex-1 border-neutral-200 text-neutral-700 hover:bg-neutral-50 rounded-lg h-10 text-sm font-semibold">
                    Clear All
                </Button>
            </div>
        </div>
    );

    return (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 pt-6 pb-16">
            <div className="mb-8">
                <div className="flex items-center gap-3 mb-2">
                    <div className="w-1 h-8 bg-orange-500 rounded-full" />
                    <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Our Products</h2>
                </div>
                <p className="text-neutral-500 text-sm md:text-base ml-4 pl-3">
                    Browse our curated collection of adventure gear
                </p>
            </div>

            <div className="lg:hidden mb-4 flex items-center gap-3">
                <button
                    onClick={() => setMobileFiltersOpen(true)}
                    className="flex items-center gap-2 px-4 py-2.5 bg-white border border-neutral-200 rounded-xl text-sm font-medium text-neutral-700 hover:border-orange-400 hover:text-orange-600 transition-all shadow-sm"
                >
                    <SlidersHorizontal className="h-4 w-4" />
                    Filters
                    {activeFilterCount > 0 && (
                        <span className="ml-1 bg-orange-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                            {activeFilterCount}
                        </span>
                    )}
                </button>
                <div className="flex-1" />
                <select
                    value={sortBy}
                    onChange={e => { setSortBy(e.target.value); setAppliedSortBy(e.target.value); }}
                    className="px-3 py-2.5 bg-white border border-neutral-200 rounded-xl text-sm text-neutral-700 outline-none focus:border-orange-400 transition-all shadow-sm"
                >
                    <option value="relevance">Relevance</option>
                    <option value="price-asc">Price: Low to High</option>
                    <option value="price-desc">Price: High to Low</option>
                    <option value="rating-desc">Top Rated</option>
                </select>
            </div>

            {mobileFiltersOpen && (
                <div className="fixed inset-0 z-50 lg:hidden">
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setMobileFiltersOpen(false)} />
                    <div className="absolute inset-y-0 left-0 w-full max-w-sm bg-white shadow-2xl flex flex-col animate-in slide-in-from-left duration-300">
                        <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-100">
                            <div className="flex items-center gap-2">
                                <SlidersHorizontal className="h-5 w-5 text-orange-500" />
                                <h3 className="text-lg font-bold text-neutral-900">Filters</h3>
                            </div>
                            <button
                                onClick={() => setMobileFiltersOpen(false)}
                                className="p-2 rounded-lg hover:bg-neutral-100 transition-colors"
                            >
                                <X className="h-5 w-5 text-neutral-500" />
                            </button>
                        </div>
                        <div className="flex-1 overflow-y-auto px-5 py-2">
                            {filterContent}
                        </div>
                    </div>
                </div>
            )}

            <div className="flex gap-8">
                <aside className="hidden lg:block w-72 flex-shrink-0">
                    <div className="sticky top-24 bg-white rounded-2xl border border-neutral-100 shadow-sm p-5 max-h-[calc(100vh-7rem)] overflow-y-auto">
                        <div className="flex items-center gap-2 mb-4 pb-3 border-b border-neutral-100">
                            <SlidersHorizontal className="h-4.5 w-4.5 text-orange-500" />
                            <h3 className="text-base font-bold text-neutral-900">Filters</h3>
                            {activeFilterCount > 0 && (
                                <span className="ml-auto bg-orange-100 text-orange-600 text-xs font-bold rounded-full px-2 py-0.5">
                                    {activeFilterCount} active
                                </span>
                            )}
                        </div>
                        {filterContent}
                    </div>
                </aside>

                <div className="flex-1 min-w-0">
                    <div className="hidden lg:flex items-center justify-between mb-6">
                        <p className="text-sm text-neutral-500">
                            Showing <span className="font-semibold text-neutral-800">{filtered.length}</span> {filtered.length === 1 ? 'product' : 'products'}
                        </p>
                        <select
                            value={sortBy}
                            onChange={e => { setSortBy(e.target.value); setAppliedSortBy(e.target.value); }}
                            className="px-3 py-2 bg-white border border-neutral-200 rounded-xl text-sm text-neutral-700 outline-none focus:border-orange-400 transition-all"
                        >
                            <option value="relevance">Sort by: Relevance</option>
                            <option value="price-asc">Sort by: Price Low to High</option>
                            <option value="price-desc">Sort by: Price High to Low</option>
                            <option value="rating-desc">Sort by: Top Rated</option>
                        </select>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-5">
                        {filtered.map((item, i) => (
                            <div
                                key={item._id || i}
                                className="group bg-white rounded-xl overflow-hidden border border-neutral-100 hover:border-orange-200 hover:shadow-lg transition-all duration-300 cursor-pointer"
                                onClick={() => { if (item._id) navigate(`/product/${item._id}`); }}
                            >
                                <div className="relative aspect-[4/3] bg-neutral-100 overflow-hidden">
                                    {item.images?.[0] ? (
                                        <img src={item.images[0]} alt={item.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-sm text-neutral-400">No Image</div>
                                    )}
                                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                        <FavoriteButton item={item} />
                                    </div>
                                    {item.rent && (
                                        <span className="absolute top-2 left-2 bg-orange-500 text-white text-[10px] sm:text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-md">
                                            Rental
                                        </span>
                                    )}
                                </div>
                                <div className="p-3 sm:p-4">
                                    {item.brand && (
                                        <p className="text-[10px] sm:text-xs uppercase tracking-wider text-neutral-400 font-medium mb-1">{item.brand}</p>
                                    )}
                                    <h3 className="text-xs sm:text-sm font-semibold text-neutral-900 leading-snug line-clamp-2 mb-1.5">{item.name}</h3>
                                    {item.avgRating > 0 && (
                                        <div className="flex items-center gap-1 mb-2">
                                            <Star className="h-3 w-3 sm:h-3.5 sm:w-3.5 fill-orange-400 text-orange-400" />
                                            <span className="text-[10px] sm:text-xs font-medium text-neutral-600">{item.avgRating?.toFixed(1)}</span>
                                        </div>
                                    )}
                                    <div className="flex items-center justify-between gap-2">
                                        <p className="text-sm sm:text-lg font-bold text-neutral-900">€{item.price}</p>
                                        <Button
                                            type="button"
                                            size="sm"
                                            className="bg-neutral-900 hover:bg-orange-500 text-white h-7 sm:h-8 px-2 sm:px-3 rounded-lg text-[10px] sm:text-xs font-medium relative z-10 pointer-events-auto transition-colors duration-200"
                                            onClick={async (e) => {
                                                e.stopPropagation();
                                                e.preventDefault();
                                                try {
                                                    await addToCart?.(item);
                                                    toast.success(`${item.name} added to cart`);
                                                } catch (err) {
                                                    toast.error('Failed to add to cart');
                                                }
                                            }}
                                        >
                                            <ShoppingCart className="h-3 w-3 sm:h-3.5 sm:w-3.5 mr-1" />
                                            <span className="hidden sm:inline">Add</span>
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {filtered.length === 0 && (
                        <div className="mt-16 flex flex-col items-center justify-center text-center">
                            <div className="w-20 h-20 rounded-full bg-neutral-100 flex items-center justify-center mb-4">
                                <Search className="h-8 w-8 text-neutral-300" />
                            </div>
                            <h3 className="text-lg font-semibold text-neutral-700 mb-1">No products found</h3>
                            <p className="text-sm text-neutral-500 max-w-xs">Try adjusting your filters or search terms to find what you're looking for.</p>
                            <Button onClick={clearAllFilters} className="mt-4 bg-orange-500 hover:bg-orange-600 text-white rounded-lg h-9 px-5 text-sm font-medium">
                                Clear All Filters
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
}

function FavoriteButton({ item }) {
    const { addToFavorites, removeFromFavorites, isInFavorites } = useFavorites();
    const inFav = isInFavorites(item._id);

    return (
        <button
            type="button"
            onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                try {
                    if (inFav) {
                        removeFromFavorites(item._id);
                        toast.success('Removed from favorites');
                    } else {
                        addToFavorites(item);
                        toast.success('Added to favorites');
                    }
                } catch {
                    toast.error('Failed to update favorites');
                }
            }}
            className={`p-1.5 sm:p-2 rounded-full backdrop-blur-sm transition-all duration-200 relative z-10 pointer-events-auto ${inFav ? 'bg-red-500/90 text-white' : 'bg-white/80 text-neutral-600 hover:bg-white hover:text-red-500'}`}
            title={inFav ? 'Remove from favorites' : 'Add to favorites'}
        >
            <Heart className="h-3.5 w-3.5 sm:h-4 sm:w-4" fill={inFav ? 'currentColor' : 'none'} />
        </button>
    );
}
