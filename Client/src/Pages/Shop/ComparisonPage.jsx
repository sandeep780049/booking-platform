import { useContext } from 'react';
import { Link } from 'react-router-dom';
import { X, ShoppingCart } from 'lucide-react';
import { useComparison } from '../../contexts/ComparisonContext';
import MainHeader from '../../components/shop/MainHeader';
import Footer from '../../components/shop/Footer';
import { CartContext } from '../../Pages/Cart/CartContext';

export default function ComparisonPage() {
  const { comparedProducts, removeFromComparison, clearComparison } = useComparison();
  const { addToCart } = useContext(CartContext);
  
  const categories = ['Climbing Gear', 'Camping Equipment', 'Water Sports', 'High Altitude Wear', 'Safety & Protection'];

  if (comparedProducts.length === 0) {
    return (
      <div className="min-h-screen bg-neutral-50">
        <MainHeader categories={categories} />
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-neutral-900 mb-4">No products to compare</h2>
            <p className="text-neutral-600 mb-6">Add some products to comparison to see them side by side.</p>
            <Link to="/shop" className="text-orange-500 hover:text-orange-600 font-medium">
              Browse products →
            </Link>
          </div>
        </div>
        <Footer categories={categories} />
      </div>
    );
  }

  const features = [
    'Name',
    'Category',
    'Price',
    'Rental Price',
    'Description',
    'Stock Status'
  ];

  return (
    <div className="min-h-screen bg-neutral-50">
      <MainHeader categories={categories} />
      
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-neutral-900">Compare Products</h1>
          <button
            onClick={clearComparison}
            className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-colors"
          >
            Clear All
          </button>
        </div>

        {/* Comparison Table */}
        <div className="overflow-x-auto">
          <table className="w-full bg-white rounded-lg shadow-sm">
            <thead>
              <tr className="border-b border-neutral-200">
                <th className="text-left p-4 font-semibold text-neutral-900">Features</th>
                {comparedProducts.map((product) => (
                  <th key={product._id} className="p-4 min-w-[250px]">
                    <div className="relative">
                      <button
                        onClick={() => removeFromComparison(product._id)}
                        className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center text-xs"
                      >
                        <X className="h-3 w-3" />
                      </button>
                      
                      <Link to={`/product/${product._id}`} className="block">
                        <img
                          src={product.images?.[0] || '/placeholder-image.jpg'}
                          alt={product.name}
                          className="w-full h-32 object-cover rounded-lg mb-3"
                        />
                        <h3 className="font-medium text-neutral-900 text-sm line-clamp-2 hover:text-orange-500 transition-colors">
                          {product.name}
                        </h3>
                      </Link>
                      
                      <button
                        onClick={() => addToCart(product)}
                        className="w-full mt-3 px-3 py-2 bg-neutral-900 hover:bg-orange-500 text-white rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
                      >
                        <ShoppingCart className="h-4 w-4" />
                        Add to Cart
                      </button>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            
            <tbody>
              <tr className="border-b border-neutral-100">
                <td className="p-4 font-medium text-neutral-700">Name</td>
                {comparedProducts.map((product) => (
                  <td key={product._id} className="p-4 text-sm text-neutral-600">
                    {product.name}
                  </td>
                ))}
              </tr>
              
              <tr className="border-b border-neutral-100">
                <td className="p-4 font-medium text-neutral-700">Category</td>
                {comparedProducts.map((product) => (
                  <td key={product._id} className="p-4 text-sm text-neutral-600">
                    {product.category}
                  </td>
                ))}
              </tr>
              
              <tr className="border-b border-neutral-100">
                <td className="p-4 font-medium text-neutral-700">Price</td>
                {comparedProducts.map((product) => (
                  <td key={product._id} className="p-4 text-sm font-semibold text-neutral-900">
                    {product.price > 0 ? `€${product.price}` : 'N/A'}
                  </td>
                ))}
              </tr>
              
              <tr className="border-b border-neutral-100">
                <td className="p-4 font-medium text-neutral-700">Rental Price</td>
                {comparedProducts.map((product) => (
                  <td key={product._id} className="p-4 text-sm text-neutral-600">
                    {product.rentalPrice > 0 ? `€${product.rentalPrice}/day` : 'N/A'}
                  </td>
                ))}
              </tr>
              
              <tr className="border-b border-neutral-100">
                <td className="p-4 font-medium text-neutral-700">Description</td>
                {comparedProducts.map((product) => (
                  <td key={product._id} className="p-4 text-sm text-neutral-600">
                    <div className="line-clamp-3">{product.description}</div>
                  </td>
                ))}
              </tr>
              
              <tr className="border-b border-neutral-100">
                <td className="p-4 font-medium text-neutral-700">Stock Status</td>
                {comparedProducts.map((product) => (
                  <td key={product._id} className="p-4 text-sm">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      (product.purchaseStock > 0 || product.rentalStock > 0)
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {(product.purchaseStock > 0 || product.rentalStock > 0) ? 'In Stock' : 'Out of Stock'}
                    </span>
                  </td>
                ))}
              </tr>
              
              <tr>
                <td className="p-4 font-medium text-neutral-700">Rating</td>
                {comparedProducts.map((product) => (
                  <td key={product._id} className="p-4 text-sm text-neutral-600">
                    {product.avgRating ? `${product.avgRating.toFixed(1)} ⭐ (${product.totalReviews} reviews)` : 'No reviews yet'}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>

        {/* Add More Products Section */}
        {comparedProducts.length < 4 && (
          <div className="mt-8 text-center">
            <p className="text-neutral-600 mb-4">
              You can compare up to 4 products. Add more products to compare.
            </p>
            <Link
              to="/shop"
              className="inline-block px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-medium transition-colors"
            >
              Browse More Products
            </Link>
          </div>
        )}
      </div>

      <Footer categories={categories} />
    </div>
  );
}