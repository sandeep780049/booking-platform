import { createContext, useContext, useState, useEffect } from 'react';

const ComparisonContext = createContext();

export const useComparison = () => {
  const context = useContext(ComparisonContext);
  if (!context) {
    throw new Error('useComparison must be used within a ComparisonProvider');
  }
  return context;
};

export const ComparisonProvider = ({ children }) => {
  const [comparedProducts, setComparedProducts] = useState([]);

  useEffect(() => {
    // Load from localStorage on mount
    const saved = localStorage.getItem('comparedProducts');
    if (saved) {
      try {
        setComparedProducts(JSON.parse(saved));
      } catch (error) {
        console.error('Error loading compared products:', error);
      }
    }
  }, []);

  useEffect(() => {
    // Save to localStorage whenever comparedProducts changes
    localStorage.setItem('comparedProducts', JSON.stringify(comparedProducts));
  }, [comparedProducts]);

  const addToComparison = (product) => {
    if (comparedProducts.length >= 4) {
      alert('You can compare up to 4 products at a time');
      return;
    }
    
    if (!comparedProducts.find(p => p._id === product._id)) {
      setComparedProducts(prev => [...prev, product]);
    }
  };

  const removeFromComparison = (productId) => {
    setComparedProducts(prev => prev.filter(p => p._id !== productId));
  };

  const clearComparison = () => {
    setComparedProducts([]);
  };

  const isInComparison = (productId) => {
    return comparedProducts.some(p => p._id === productId);
  };

  return (
    <ComparisonContext.Provider value={{
      comparedProducts,
      addToComparison,
      removeFromComparison,
      clearComparison,
      isInComparison
    }}>
      {children}
    </ComparisonContext.Provider>
  );
};