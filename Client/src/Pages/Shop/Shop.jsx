import { useContext, useState, useEffect, useRef } from "react";
import { CartContext } from "../Cart/CartContext";
import { useLocation, useNavigate } from 'react-router-dom';
import MainHeader from "../../components/shop/MainHeader";
import HeroCarousel from "../../components/shop/HeroCarousel";
import CategoryFeatureGrid from "../../components/shop/CategoryFeatureGrid";
import ProductsGrid from "../../components/shop/ProductsGrid";
import PromoBanners from "../../components/shop/PromoBanners";
import BrandStrip from "../../components/shop/BrandStrip";
import Footer from "../../components/shop/Footer";
import { getCategories } from "../../Api/category.api";

export default function AdventureShop() {
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [adventures, setAdventures] = useState([]);
  const [selectedAdventure, setSelectedAdventure] = useState("");
  const { addToCart } = useContext(CartContext);
  const location = useLocation();

  const baseUrl = import.meta.env.VITE_SERVER_URL;
  const productsRef = useRef(null);
  const navigate = useNavigate();

  // Fetch categories from API
  useEffect(() => {
    getCategories()
      .then(res => {
        const data = res?.data?.message || [];
        const names = Array.isArray(data) ? data.map(c => c.name).filter(Boolean) : [];
        setCategories(names);
      })
      .catch(() => setCategories([]));
  }, []);

  // Fetch adventures from API
  const fetchAdventures = async () => {
    try {
      const response = await fetch(`${baseUrl}api/adventure/all`);
      const data = await response.json();
      setAdventures(data.adventures || []);
    } catch (error) {
      console.error("Error fetching adventures:", error);
    }
  };

  // Fetch items (supports extended filters)
  const fetchItems = async (filters = {}) => {
    try {
      const params = new URLSearchParams();
      if (typeof filters === 'string') {
        if (filters) params.append('search', filters);
      } else {
        const { search, category, page, limit, priceMin, priceMax, availability, minRating, brand, sortBy } = filters;
        if (search) params.append('search', search);
        if (category) params.append('category', category);
        if (page) params.append('page', page);
        if (limit) params.append('limit', limit);
        if (priceMin !== undefined && priceMin !== '') params.append('priceMin', priceMin);
        if (priceMax !== undefined && priceMax !== '') params.append('priceMax', priceMax);
        if (availability) params.append('availability', availability);
        if (minRating !== undefined && minRating !== '') params.append('minRating', minRating);
        if (brand) params.append('brand', brand);
        if (sortBy) params.append('sortBy', sortBy);
      }

      const url = `${baseUrl}api/items/discover${params.toString() ? `?${params.toString()}` : ''}`;

      const response = await fetch(url);
      const data = await response.json();
      // Backend returns items in `message` for compatibility
      setItems(data.message || []);
    } catch (error) {
      console.error("Error fetching items:", error);
    }
  };

  useEffect(() => { fetchItems({ category: selectedCategory }); }, [selectedCategory]);

  // Fetch adventures on mount
  useEffect(() => { fetchAdventures(); }, []);

  // On mount, read URL to set initial category/search state
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const q = params.get('search') || "";
    const cat = params.get('category') || "";
    setSearchQuery(q);
    if (cat) {
      setSelectedCategory(cat);
      fetchItems({ search: q, category: cat });
    } else {
      fetchItems({ search: q });
    }
  }, []);

  const handleSearch = (q, opts = {}) => {
    // Redirect to search page when search is performed
    if (q && q.trim()) {
      const params = new URLSearchParams();
      params.set('search', q);
      if (selectedCategory) params.set('category', selectedCategory);
      navigate(`/shop/search?${params.toString()}`);
    }
  };

  const handleCategorySelect = (category) => {
    // Do not redirect. Toggle selection and fetch items accordingly.
    const currentSearch = searchQuery || new URLSearchParams(location.search).get('search') || "";
    if (selectedCategory === category) {
      setSelectedCategory("");
      fetchItems({ search: currentSearch });
    } else {
      setSelectedCategory(category);
      fetchItems({ search: currentSearch, category });
      // scroll to products area after layout updates
      setTimeout(() => {
        try {
          const el = productsRef.current;
          if (!el) return;
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
          // adjust for sticky header if present
          const header = document.querySelector('header');
          const headerHeight = header ? header.clientHeight : 80;
          window.scrollBy({ top: -headerHeight + 8, behavior: 'smooth' });
        } catch (err) {
          // ignore
        }
      }, 100);
    }
  };

  const removeFilter = (filter) => {
    if (filter === 'category') {
      setSelectedCategory("");
      fetchItems(searchQuery || "", "");
    }
    if (filter === 'search') {
      setSearchQuery("");
      fetchItems("", selectedCategory);
    }
  };

  const clearFilters = () => {
    setSelectedCategory("");
    setSearchQuery("");
    fetchItems("", "");
  };

  return (
    <div className="w-full font-sans bg-neutral-50 text-neutral-900">
      {/* <AnnouncementBar /> */}
      <MainHeader categories={categories} selectedCategory={selectedCategory} onSearch={handleSearch} onCategorySelect={handleCategorySelect} />
      <HeroCarousel />
      <CategoryFeatureGrid categories={categories} />
      {/* Products grid: replaces separate product page navigation; shows all products with left filters */}
      <ProductsGrid items={items} categories={categories} selectedCategory={selectedCategory} search={searchQuery} addToCart={addToCart} onCategorySelect={handleCategorySelect} onSearch={handleSearch} onFilterChange={fetchItems} adventures={adventures} selectedAdventure={selectedAdventure} />
      <PromoBanners />
      <BrandStrip />
      <Footer categories={categories} />
    </div>
  );
}