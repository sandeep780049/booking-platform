// Performance monitoring utilities

/**
 * Measure and log page load performance
 */
export const logPerformanceMetrics = () => {
  if (typeof window === 'undefined' || !window.performance) return;

  // Wait for page to fully load
  window.addEventListener('load', () => {
    setTimeout(() => {
      const perfData = window.performance.timing;
      const pageLoadTime = perfData.loadEventEnd - perfData.navigationStart;
      const connectTime = perfData.responseEnd - perfData.requestStart;
      const renderTime = perfData.domComplete - perfData.domLoading;
      const dnsTime = perfData.domainLookupEnd - perfData.domainLookupStart;
      
      console.log('Performance Metrics:');
      console.log(`Page Load Time: ${pageLoadTime}ms`);
      console.log(`Connect Time: ${connectTime}ms`);
      console.log(`Render Time: ${renderTime}ms`);
      console.log(`DNS Time: ${dnsTime}ms`);
      
      // Check for Web Vitals if available
      if ('PerformanceObserver' in window) {
        try {
          // Largest Contentful Paint
          const lcpObserver = new PerformanceObserver((list) => {
            const entries = list.getEntries();
            const lastEntry = entries[entries.length - 1];
            console.log(`LCP: ${lastEntry.renderTime || lastEntry.loadTime}ms`);
          });
          lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });

          // First Input Delay
          const fidObserver = new PerformanceObserver((list) => {
            const entries = list.getEntries();
            entries.forEach((entry) => {
              console.log(`FID: ${entry.processingStart - entry.startTime}ms`);
            });
          });
          fidObserver.observe({ entryTypes: ['first-input'] });
        } catch (e) {
          // Silently fail if observers aren't supported
        }
      }
    }, 0);
  });
};

/**
 * Report long tasks that block the main thread
 */
export const monitorLongTasks = () => {
  if (typeof window === 'undefined') return;
  
  if ('PerformanceObserver' in window) {
    try {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.duration > 50) { // Tasks longer than 50ms
            console.warn(`Long task detected: ${entry.duration}ms`, entry);
          }
        }
      });
      observer.observe({ entryTypes: ['longtask'] });
    } catch (e) {
      // Longtask observer not supported
    }
  }
};

/**
 * Measure API call performance
 */
export const measureApiCall = async (apiCall, label) => {
  const startTime = performance.now();
  try {
    const result = await apiCall();
    const endTime = performance.now();
    console.log(`${label} took ${(endTime - startTime).toFixed(2)}ms`);
    return result;
  } catch (error) {
    const endTime = performance.now();
    console.error(`${label} failed after ${(endTime - startTime).toFixed(2)}ms`, error);
    throw error;
  }
};

/**
 * Debounce function for performance optimization
 */
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

/**
 * Throttle function for performance optimization
 */
export const throttle = (func, limit) => {
  let inThrottle;
  return function executedFunction(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};

/**
 * Check if user is on slow connection
 */
export const isSlowConnection = () => {
  if (typeof navigator === 'undefined' || !navigator.connection) {
    return false;
  }
  
  const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
  return connection.effectiveType === 'slow-2g' || 
         connection.effectiveType === '2g' ||
         connection.saveData;
};

/**
 * Lazy load images with Intersection Observer
 */
export const lazyLoadImage = (imgElement) => {
  if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const img = entry.target;
          if (img.dataset.src) {
            img.src = img.dataset.src;
            img.removeAttribute('data-src');
          }
          observer.unobserve(img);
        }
      });
    });
    imageObserver.observe(imgElement);
  } else {
    // Fallback for browsers that don't support Intersection Observer
    if (imgElement.dataset.src) {
      imgElement.src = imgElement.dataset.src;
    }
  }
};
