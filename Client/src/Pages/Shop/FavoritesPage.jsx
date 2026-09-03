import { useContext, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingCart, X } from 'lucide-react';
import { useFavorites } from '../../contexts/FavoritesContext';
import MainHeader from '../../components/shop/MainHeader';
import Footer from '../../components/shop/Footer';
import { CartContext } from '../../Pages/Cart/CartContext';
import { getCategories } from '../../Api/category.api';

export default function FavoritesPage() {
  const { favorites, removeFromFavorites, clearFavorites } = useFavorites();
  const { addToCart } = useContext(CartContext);

  const [categories, setCategories] = useState([]);

  useEffect(() => {
    getCategories()
      .then(res => {
        const data = res?.data?.message || [];
        const names = Array.isArray(data) ? data.map(c => c.name).filter(Boolean) : [];
        setCategories(names);
      })
      .catch(() => setCategories([]));
  }, []);

  if (favorites.length === 0) {
    return (
      <div className="min-h-screen bg-neutral-50">
        <MainHeader categories={categories} />
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Heart className="h-16 w-16 text-neutral-300 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-neutral-900 mb-4">Your favorites list is empty</h2>
            <p className="text-neutral-600 mb-6">Add items to your favorites to keep track of products you love.</p>
            <Link to="/shop" className="inline-block px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-medium transition-colors">
              Browse Products
            </Link>
          </div>
        </div>
        <Footer categories={categories} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <MainHeader categories={categories} />

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-neutral-900 mb-2">My Favorites</h1>
            <p className="text-neutral-600">{favorites.length} favorite{favorites.length !== 1 ? 's' : ''}</p>
          </div>
          <button
            onClick={clearFavorites}
            className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-colors"
          >
            Clear All
          </button>
        </div>

        {/* Favorites Grid */}
        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {favorites.map((item) => (
            <div key={item._id} className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 group">
              <div className="relative">
                <Link to={`/product/${item._id}`} className="block relative overflow-hidden h-64">
                  {item.images?.[0] ? (
                    <img
                      src={item.images[0]}
                      alt={item.name}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                  ) : (
                    <div className="w-full h-full bg-neutral-100 flex items-center justify-center text-neutral-500">
                      No Image
                    </div>
                  )}
                </Link>

                {/* Remove from favorites button */}
                <button
                  onClick={() => removeFromFavorites(item._id)}
                  className="absolute top-3 right-3 w-8 h-8 bg-white hover:bg-red-50 rounded-full flex items-center justify-center shadow-md transition-colors"
                  title="Remove from favorites"
                >
                  <X className="h-4 w-4 text-red-500" />
                </button>
              </div>

              <div className="p-4">
                <Link to={`/product/${item._id}`}>
                  <h3 className="font-medium text-neutral-900 mb-2 group-hover:text-orange-500 transition-colors line-clamp-2">
                    {item.name}
                  </h3>
                </Link>

                <p className="text-sm text-neutral-600 mb-3 line-clamp-2">{item.description}</p>

                <div className="flex items-center justify-between">
                  <div>
                    {item.price > 0 && (
                      <p className="font-bold text-neutral-900">€{item.price}</p>
                    )}
                    {item.rentalPrice > 0 && (
                      <p className="text-sm text-neutral-600">Rent: €{item.rentalPrice}/day</p>
                    )}
                  </div>

                  <button
                    onClick={() => addToCart(item)}
                    className="bg-neutral-900 hover:bg-orange-500 text-white px-4 py-2 rounded-full text-sm font-medium transition-colors flex items-center gap-2"
                  >
                    <ShoppingCart className="h-4 w-4" />
                    Add to Cart
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Browse More Section */}
        <div className="mt-12 text-center">
          <p className="text-neutral-600 mb-4">
            Looking for more products to add to your favorites?
          </p>
          <Link
            to="/shop"
            className="inline-block px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-medium transition-colors"
          >
            Browse All Products
          </Link>
        </div>
      </div>

      <Footer categories={categories} />
    </div>
  );
}