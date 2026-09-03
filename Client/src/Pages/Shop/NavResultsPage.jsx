import { useState, useEffect, useContext } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { Search, ChevronRight, Filter, X } from 'lucide-react';
import ProductsGrid from '../../components/shop/ProductsGrid';
import { axiosClient } from '../../AxiosClient/axios';
import MainHeader from '../../components/shop/MainHeader';
import Footer from '../../components/shop/Footer';
import { CartContext } from '../Cart/CartContext';
import { useComparison } from '../../contexts/ComparisonContext';
import { useFavorites } from '../../contexts/FavoritesContext';
import { getCategories } from '../../Api/category.api';

export default function NavResultsPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { addToCart } = useContext(CartContext);
  const { addToComparison, removeFromComparison, isInComparison } = useComparison();
  const { addToFavorites, removeFromFavorites, isInFavorites } = useFavorites();
  
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [categories, setCategories] = useState([]);
  const searchQuery = searchParams.get('search') || '';
  const categoryParam = searchParams.get('category') || '';

  const limit = 12;

  useEffect(() => {
    getCategories()
      .then(res => {
        const data = res?.data?.message || [];
        const names = Array.isArray(data) ? data.map(c => c.name).filter(Boolean) : [];
        setCategories(names);
      })
      .catch(() => setCategories([]));
  }, []);

  // Shared fetch that ProductsGrid will call via onFilterChange (uses axios client)
  const fetchItems = async (filters = {}) => {
    try {
      setLoading(true);
      const params = {};
      if (filters.search) params.search = filters.search;
      if (filters.category) params.category = filters.category;
      if (filters.page) params.page = filters.page;
      if (filters.limit) params.limit = filters.limit;
      if (filters.priceMin !== undefined && filters.priceMin !== '') params.priceMin = filters.priceMin;
      if (filters.priceMax !== undefined && filters.priceMax !== '') params.priceMax = filters.priceMax;
      if (filters.availability) params.availability = filters.availability;
      if (filters.minRating !== undefined && filters.minRating !== '') params.minRating = filters.minRating;
      if (filters.brand) params.brand = filters.brand;
      if (filters.sortBy) params.sortBy = filters.sortBy;

      const res = await axiosClient.get('/api/items', { params });
      const data = res.data;
      if (data && data.message) {
        setItems(data.message || []);
        setTotalPages(Math.ceil((data.data?.total || 0) / limit));
      } else {
        setItems([]);
      }
    } catch (err) {
      console.error('Error fetching items:', err);
      setError('Error loading products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (searchQuery || categoryParam) {
      fetchItems({ page: currentPage, limit, search: searchQuery, category: categoryParam });
    } else {
      // If there's no query/category, this page shouldn't be open — redirect to /shop
      navigate('/shop');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery, categoryParam, currentPage]);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-neutral-50">
      <MainHeader 
        categories={categories} 
        onSearch={(q) => navigate(`/shop/nav?search=${encodeURIComponent(q)}`)}
        selectedCategory={categoryParam}
      />

      {/* Breadcrumb */}
      <div className="max-w-7xl mx-auto px-6 py-4">
        <nav className="flex items-center space-x-2 text-sm text-neutral-600">
          <Link to="/shop" className="hover:text-neutral-900">Shop</Link>
          <ChevronRight className="h-4 w-4" />
          <span className="text-neutral-900 font-medium">Results</span>
        </nav>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-neutral-900 mb-4">{searchQuery ? `Search: "${searchQuery}"` : `Category: ${categoryParam}`}</h1>
          { (searchQuery || categoryParam) && (
            <p className="text-neutral-600">{loading ? 'Loading...' : `${items.length} results${categoryParam ? ` in ${categoryParam}` : ''}`}</p>
          )}
        </div>

        <ProductsGrid items={items} categories={categories} selectedCategory={categoryParam} search={searchQuery} addToCart={addToCart} onCategorySelect={(c) => fetchItems({ category: c })} onSearch={(q) => fetchItems({ search: q })} onFilterChange={(f) => fetchItems({ ...f, search: searchQuery, category: categoryParam })} />

        {/* You can add pagination UI here if desired, using handlePageChange and totalPages */}
      </div>

      <Footer categories={categories} />
    </div>
  );
}
