import { createContext, useState, useEffect, useMemo } from "react"
import { useAuth } from "../AuthProvider"
import useCart from "../../hooks/useCart"

export const CartContext = createContext()

export const CartProvider = ({ children }) => {
  const { user } = useAuth()
  // local cart for unauthenticated users (store shape: { items: [] })
  const [localCart, setLocalCart] = useState({ items: [] })

  // server-side cart hook (for authenticated users)
  const serverCart = useCart()

  // Load local cart from localStorage on initial render
  useEffect(() => {
    const savedCart = localStorage.getItem("cart")
    if (savedCart) {
      try {
        const parsed = JSON.parse(savedCart)
        // Support both array and { items: [] } shapes
        if (Array.isArray(parsed)) setLocalCart({ items: parsed })
        else setLocalCart(parsed)
      } catch (error) {
        console.error("Failed to parse cart from localStorage:", error)
        setLocalCart({ items: [] })
      }
    }
  }, [])

  // Save local cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(localCart.items || localCart))
  }, [localCart])

  // Unified addToCart: accepts either a full product object (from listings) or a server payload
  const addToCart = async (productOrPayload) => {
    // If user is authenticated, forward to server hook
    if (user) {
      // If payload already contains `item` (server format), pass it through
      if (productOrPayload && productOrPayload.item) {
        return serverCart.addToCart(productOrPayload)
      }

      // If a product object was provided (has _id), convert to server payload
      if (productOrPayload && productOrPayload._id) {
        const payload = {
          item: productOrPayload._id,
          quantity: productOrPayload.quantity || 1,
          purchase: productOrPayload.purchase !== undefined ? productOrPayload.purchase : true,
          rentalPeriod: productOrPayload.rentalPeriod,
        }
        return serverCart.addToCart(payload)
      }

      // Otherwise, forward raw object
      return serverCart.addToCart(productOrPayload)
    }

    // Guest/local experience: manage local state
    setLocalCart((prev) => {
      const items = prev.items || []
      // If we received a payload, try to normalize to product-like
      let product = productOrPayload
      if (productOrPayload && productOrPayload.item) {
        product = { _id: productOrPayload.item, quantity: productOrPayload.quantity || 1, rentalPeriod: productOrPayload.rentalPeriod }
      }

      const existingIndex = items.findIndex((i) => i._id === product._id)
      if (existingIndex >= 0) {
        const updated = [...items]
        updated[existingIndex].quantity += product.quantity || 1
        return { items: updated }
      }
      return { items: [...items, { ...product, quantity: product.quantity || 1 }] }
    })
  }

  const removeFromCart = async (productId, purchase = false) => {
    if (user) {
      return serverCart.removeCartItem({ itemId: productId, purchase })
    }
    setLocalCart((prev) => ({ items: prev.items.filter((i) => i._id !== productId) }))
  }

  const updateQuantity = async (productId, newQuantity, purchase = false) => {
    if (newQuantity < 1) return
    if (user) {
      return serverCart.updateCartItem({ itemId: productId, quantity: newQuantity, purchase })
    }
    setLocalCart((prev) => ({ items: prev.items.map((i) => (i._id === productId ? { ...i, quantity: newQuantity } : i)) }))
  }

  const clearCart = async () => {
    if (user) return serverCart.clearCart()
    setLocalCart({ items: [] })
  }

  const getCartTotal = () => {
    const activeCart = user ? serverCart.cart?.items || [] : localCart.items || []
    return activeCart.reduce((total, entry) => {
      const price = entry.item ? (entry.purchase ? entry.item.price : entry.item.rentalPrice) : entry.price || 0
      const days = entry.rentalPeriod ? entry.rentalPeriod.days || 1 : 1
      const qty = entry.quantity || 1
      if (entry.item) {
        // server entry contains nested item object
        if (entry.purchase) return total + (entry.item.price || 0) * qty
        return total + (entry.item.rentalPrice || 0) * qty * days
      }
      return total + (price * qty * days)
    }, 0)
  }

  const getCartItemsCount = () => {
    const activeCart = user ? serverCart.cart?.items || [] : localCart.items || []
    return activeCart.reduce((count, item) => count + (item.quantity || 0), 0)
  }
  return (
    <CartContext.Provider
      value={{
        // expose unified cart in shape { items: [] }
        cart: user ? serverCart.cart || { items: [] } : localCart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getCartTotal,
        getCartItemsCount,
        // expose server hooks for advanced usage
        serverCart: user ? serverCart : null,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}
