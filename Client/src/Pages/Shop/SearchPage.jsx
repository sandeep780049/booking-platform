import { useState, useEffect, useContext } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { Search, ChevronRight, Filter, X } from 'lucide-react';
import ProductsGrid from '../../components/shop/ProductsGrid';
import MainHeader from '../../components/shop/MainHeader';
import Footer from '../../components/shop/Footer';
import { CartContext } from '../Cart/CartContext';
import { getCategories } from '../../Api/category.api';

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { addToCart } = useContext(CartContext);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchInput, setSearchInput] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [adventures, setAdventures] = useState([]);
  const [selectedAdventure, setSelectedAdventure] = useState('');

  const [categories, setCategories] = useState([]);
  const searchQuery = searchParams.get('search') || '';
  const categoryParam = searchParams.get('category') || '';
  const baseUrl = import.meta.env.VITE_SERVER_URL;

  const limit = 12;

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

  useEffect(() => {
    setSearchInput(searchQuery);
    setSelectedCategory(categoryParam);
  }, [searchQuery, categoryParam]);

  useEffect(() => {
    getCategories()
      .then(res => {
        const data = res?.data?.message || [];
        const names = Array.isArray(data) ? data.map(c => c.name).filter(Boolean) : [];
        setCategories(names);
      })
      .catch(() => setCategories([]));
    fetchAdventures();
  }, []);

  // Shared fetch that ProductsGrid will call via onFilterChange
  const fetchItems = async (filters = {}) => {
    try {
      setLoading(true);
      setError(null);
      const params = new URLSearchParams();
      if (filters.search) params.set('search', filters.search);
      if (filters.category) params.set('category', filters.category);
      if (filters.page) params.set('page', filters.page);
      if (filters.limit) params.set('limit', filters.limit);
      if (filters.priceMin !== undefined && filters.priceMin !== '') params.set('priceMin', filters.priceMin);
      if (filters.priceMax !== undefined && filters.priceMax !== '') params.set('priceMax', filters.priceMax);
      if (filters.availability) params.set('availability', filters.availability);
      if (filters.minRating !== undefined && filters.minRating !== '') params.set('minRating', filters.minRating);
      if (filters.brand) params.set('brand', filters.brand);
      if (filters.sortBy) params.set('sortBy', filters.sortBy);

      const url = `${baseUrl}api/items${params.toString() ? `?${params.toString()}` : ''}`;

      const res = await fetch(url);

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const contentType = res.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Response is not valid JSON');
      }

      const data = await res.json();

      // API returns items in message field and metadata in data field
      if (data && Array.isArray(data.message)) {
        setItems(data.message);
        setTotalPages(Math.ceil((data.data?.total || 0) / limit));
      } else if (data && Array.isArray(data.data)) {
        // Fallback in case structure is different
        setItems(data.data);
        setTotalPages(Math.ceil((data.message?.total || 0) / limit));
      } else {
        setItems([]);
        setTotalPages(1);
      }
    } catch (err) {
      console.error('Error fetching items:', err);
      setError('Error loading search results');
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (searchQuery) {
      fetchItems({
        search: searchQuery,
        category: categoryParam,
        page: currentPage,
        limit
      });
    } else {
      setItems([]);
      setLoading(false);
    }
  }, [searchQuery, categoryParam, currentPage]);

  const handleSearch = (query) => {
    const params = new URLSearchParams();
    if (query) params.set('search', query);
    if (selectedCategory) params.set('category', selectedCategory);
    navigate(`/shop/search?${params.toString()}`);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    handleSearch(searchInput);
  };

  const handleCategoryFilter = (category) => {
    const params = new URLSearchParams();
    if (searchQuery) params.set('search', searchQuery);
    if (category) params.set('category', category);
    navigate(`/shop/search?${params.toString()}`);
  };

  const clearFilter = (filterType) => {
    const params = new URLSearchParams();
    if (filterType === 'search' && categoryParam) {
      params.set('category', categoryParam);
    } else if (filterType === 'category' && searchQuery) {
      params.set('search', searchQuery);
    }

    if (params.toString()) {
      navigate(`/shop/search?${params.toString()}`);
    } else {
      navigate('/shop');
    }
  };

  const clearAllFilters = () => {
    navigate('/shop');
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-neutral-50">
      <MainHeader
        categories={categories}
        onSearch={handleSearch}
        selectedCategory={selectedCategory}
      />

      {/* Breadcrumb */}
      <div className="max-w-7xl mx-auto px-6 py-4">
        <nav className="flex items-center space-x-2 text-sm text-neutral-600">
          <Link to="/shop" className="hover:text-neutral-900">Shop</Link>
          <ChevronRight className="h-4 w-4" />
          <span className="text-neutral-900 font-medium">Search Results</span>
        </nav>
      </div>

      {/* Search Header */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-neutral-900 mb-4">Search Products</h1>

          {/* Enhanced Search Form */}
          <form onSubmit={handleSearchSubmit} className="relative mb-6">
            <div className="flex gap-4">
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="Search for products..."
                  className="w-full px-4 py-3 pr-12 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
                <button
                  type="submit"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-orange-500"
                >
                  <Search className="h-5 w-5" />
                </button>
              </div>

              {/* Category Filter */}
              <select
                value={selectedCategory}
                onChange={(e) => handleCategoryFilter(e.target.value)}
                className="px-4 py-3 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              >
                <option value="">All Categories</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
          </form>

          {/* Active Filters */}
          {(searchQuery || categoryParam) && (
            <div className="flex items-center gap-3 mb-6">
              <span className="text-sm font-medium text-neutral-700">Active filters:</span>

              {searchQuery && (
                <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-full text-sm border">
                  <Search className="h-4 w-4 text-neutral-500" />
                  <span>"{searchQuery}"</span>
                  <button onClick={() => clearFilter('search')} className="text-neutral-500 hover:text-neutral-800">
                    <X className="h-4 w-4" />
                  </button>
                </div>
              )}

              {categoryParam && (
                <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-full text-sm border">
                  <Filter className="h-4 w-4 text-neutral-500" />
                  <span>{categoryParam}</span>
                  <button onClick={() => clearFilter('category')} className="text-neutral-500 hover:text-neutral-800">
                    <X className="h-4 w-4" />
                  </button>
                </div>
              )}

              <button
                onClick={clearAllFilters}
                className="text-sm text-orange-500 hover:text-orange-600 font-medium"
              >
                Clear all
              </button>
            </div>
          )}

          {/* Results Summary */}
          {searchQuery && (
            <p className="text-neutral-600">{loading ? 'Searching...' : `${items.length} results for "${searchQuery}"${categoryParam ? ` in ${categoryParam}` : ''}`}</p>
          )}
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-16">
            <div className="text-lg text-neutral-600">Searching products...</div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="flex items-center justify-center py-16">
            <div className="text-lg text-red-600">{error}</div>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && searchQuery && items.length === 0 && (
          <div className="text-center py-16">
            <Search className="h-16 w-16 text-neutral-300 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-neutral-900 mb-2">No results found</h3>
            <p className="text-neutral-600 mb-6">
              Try searching with different keywords or browse our categories
            </p>
            <Link to="/shop" className="text-orange-500 hover:text-orange-600 font-medium">
              Browse all products →
            </Link>
          </div>
        )}

        {/* No Search Query State */}
        {!loading && !searchQuery && (
          <div className="text-center py-16">
            <Search className="h-16 w-16 text-neutral-300 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-neutral-900 mb-2">Start your search</h3>
            <p className="text-neutral-600 mb-6">
              Enter keywords to find the perfect adventure gear
            </p>
          </div>
        )}

        {/* Use ProductsGrid for search results and filters */}
        <ProductsGrid items={items} categories={categories} selectedCategory={categoryParam} search={searchQuery} addToCart={addToCart} onCategorySelect={(c) => fetchItems({ search: searchQuery, category: c, page: 1, limit })} onSearch={(q) => fetchItems({ search: q, category: categoryParam, page: 1, limit })} onFilterChange={(f) => fetchItems({ ...f, search: searchQuery, category: categoryParam, page: 1, limit })} adventures={adventures} selectedAdventure={selectedAdventure} />
      </div>

      <Footer categories={categories} />
    </div>
  );
}