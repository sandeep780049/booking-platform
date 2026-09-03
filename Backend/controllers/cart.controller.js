import ApiResponse from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Item } from "../models/item.model.js";
import { Cart } from "../models/cart.model.js";
import { translateObjectsFields } from "../utils/translation.js";
import { getLanguage } from "../middlewares/language.middleware.js";

const translateCartItems = async (cart, language) => {
  if (language === 'en' || !cart || !cart.items || cart.items.length === 0) {
    return cart;
  }
  const plainCart = cart.toJSON ? cart.toJSON() : cart;
  const validItems = plainCart.items.map(ci => ci.item).filter(Boolean);
  const translatedItems = await translateObjectsFields(validItems, ['name', 'description'], language);
  let idx = 0;
  return {
    ...plainCart,
    items: plainCart.items.map(ci => ({
      ...ci,
      item: ci.item ? translatedItems[idx++] : null,
    })),
  };
};

const calcTotal = (cartItems) => {
  const rawSubtotal = cartItems
    .filter(ci => ci.item != null)
    .reduce((total, ci) => {
      const item = ci.item;
      if (ci.purchase) {
        return total + (item.price || 0) * ci.quantity;
      }
      const start = ci.rentalPeriod?.startDate;
      const end = ci.rentalPeriod?.endDate;
      if (!start || !end) return total;
      const days = Math.max(1, Math.ceil((new Date(end) - new Date(start)) / (1000 * 60 * 60 * 24)));
      return total + (item.rentalPrice || 0) * ci.quantity * days;
    }, 0);
  return rawSubtotal + rawSubtotal * 0.12;
};

export const getCartItems = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const language = getLanguage(req);

  let cart = await Cart.findOne({ user: userId }).populate("items.item");
  if (!cart) {
    return res.status(200).json(new ApiResponse(200, { items: [], totalPrice: 0 }, "Cart is empty"));
  }

  if (cart.items.some(ci => !ci.item)) {
    cart.items = cart.items.filter(ci => ci.item != null);
    await cart.save();
  }

  const translatedCart = await translateCartItems(cart, language);
  const totalPrice = calcTotal(translatedCart.items);

  res.status(200).json(new ApiResponse(200, { cart: translatedCart, totalPrice }, "Cart fetched successfully"));
});

export const addToCart = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { item, quantity, rentalPeriod, purchase } = req.body;
  if (!item || !quantity) throw new ApiError(400, "Missing required fields");

  const foundItem = await Item.findById(item);
  if (!foundItem) throw new ApiError(404, "Item not found");

  let cart = await Cart.findOne({ user: userId });
  if (!cart) cart = await Cart.create({ user: userId, items: [] });

  const existing = cart.items.find(i => i.item.toString() === item && i.purchase === !!purchase);
  if (existing) {
    existing.quantity += quantity;
    existing.rentalPeriod = rentalPeriod;
  } else {
    cart.items.push({ item, quantity, rentalPeriod, purchase: !!purchase });
  }
  await cart.save();
  await cart.populate("items.item");

  cart.items = cart.items.filter(ci => ci.item != null);
  const totalPrice = calcTotal(cart.items);

  res.status(200).json(new ApiResponse(200, { cart, totalPrice }, "Item added to cart"));
});

export const updateCartItem = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { itemId, quantity, rentalPeriod, purchase } = req.body;
  if (!itemId) throw new ApiError(400, "Item id is required");

  let cart = await Cart.findOne({ user: userId });
  if (!cart) throw new ApiError(404, "Cart not found");

  const cartItem = cart.items.find(i => i.item.toString() === itemId && i.purchase === !!purchase);
  if (!cartItem) throw new ApiError(404, "Item not found in cart");

  if (quantity !== undefined) cartItem.quantity = quantity;
  if (rentalPeriod !== undefined) cartItem.rentalPeriod = rentalPeriod;
  if (purchase !== undefined) cartItem.purchase = !!purchase;
  await cart.save();

  await cart.populate("items.item");
  cart.items = cart.items.filter(ci => ci.item != null);
  const totalPrice = calcTotal(cart.items);

  res.status(200).json(new ApiResponse(200, { cart, totalPrice }, "Cart item updated"));
});

export const removeCartItem = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { itemId, purchase } = req.body;
  if (!itemId) throw new ApiError(400, "Item id is required");

  let cart = await Cart.findOne({ user: userId });
  if (!cart) throw new ApiError(404, "Cart not found");

  cart.items = cart.items.filter(i => !(i.item.toString() === itemId && i.purchase === !!purchase));
  await cart.save();
  await cart.populate("items.item");

  cart.items = cart.items.filter(ci => ci.item != null);
  const totalPrice = calcTotal(cart.items);

  res.status(200).json(new ApiResponse(200, { cart, totalPrice }, "Item removed from cart"));
});

export const clearCart = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  let cart = await Cart.findOne({ user: userId });
  if (!cart) throw new ApiError(404, "Cart not found");
  cart.items = [];
  await cart.save();
  res.status(200).json(new ApiResponse(200, { cart, totalPrice: 0 }, "Cart cleared"));
});
