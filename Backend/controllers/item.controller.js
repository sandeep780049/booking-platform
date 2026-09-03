import ApiResponse from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Item } from "../models/item.model.js";
import {
  deleteFromCloudinary,
  uploadOnCloudinary,
} from "../utils/cloudinary.js";
import {
  translateObjectFields,
  translateObjectsFields,
} from "../utils/translation.js";
import { getLanguage } from "../middlewares/language.middleware.js";

export const getItemById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const language = getLanguage(req); // Get language from middleware

  if (!id) {
    throw new ApiError(400, "Item ID is required");
  }

  const item = await Item.findById(id);

  if (!item) {
    throw new ApiError(404, "Item not found");
  }

  // Translate item fields if language is not English
  const translatedItem = await translateObjectFields(
    item.toObject(),
    ["name", "description"],
    language
  );

  res
    .status(200)
    .json(new ApiResponse(200, "Item fetched successfully", translatedItem));
});

export const discoverItems = asyncHandler(async (req, res) => {
  const {
    category,
    search,
    limit = 10,
    page = 1,
    adventureId,
    priceMin,
    priceMax,
    availability,
    minRating,
    brand,
    sortBy,
  } = req.query;
  const language = getLanguage(req); // Get language from middleware

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const queryObj = {};
  if (search) {
    queryObj.name = { $regex: search, $options: "i" };
  }

  if (category) {
    queryObj.category = category;
  }

  if (adventureId) {
    queryObj.adventures = adventureId; // Filter by adventure ID
  }

  // Price range
  if (priceMin !== undefined || priceMax !== undefined) {
    queryObj.price = {};
    if (priceMin !== undefined && priceMin !== "") queryObj.price.$gte = parseFloat(priceMin);
    if (priceMax !== undefined && priceMax !== "") queryObj.price.$lte = parseFloat(priceMax);
  }

  // Brand (partial, case-insensitive)
  if (brand) {
    queryObj.brand = { $regex: brand, $options: "i" };
  }

  // Rating
  if (minRating !== undefined && minRating !== "") {
    queryObj.avgRating = { $gte: parseFloat(minRating) };
  }

  // Availability filter: purchase / rent / any
  if (availability === 'purchase') {
    queryObj.purchase = true;
    queryObj.purchaseStock = { $gt: 0 };
  } else if (availability === 'rent') {
    queryObj.rent = true;
    queryObj.rentalStock = { $gt: 0 };
  } else {
    // Default: Only fetch items that are available for rent or purchase
    queryObj.$or = [{ rentalStock: { $gt: 0 } }, { purchaseStock: { $gt: 0 } }];
  }

  // Build sort
  let sortObj = {};
  if (sortBy === 'price-asc') sortObj.price = 1;
  else if (sortBy === 'price-desc') sortObj.price = -1;
  else if (sortBy === 'rating-desc') sortObj.avgRating = -1;
  else sortObj.createdAt = -1;

  const items = await Item.find(queryObj)
    .populate("adventures", "name")
    .sort(sortObj)
    .skip(skip)
    .limit(parseInt(limit));

  const total = await Item.countDocuments(queryObj);

  // Translate items if language is not English
  const translatedItems = await translateObjectsFields(
    items.map((item) => item.toObject()),
    ["name", "description", "category"],
    language
  );

  // Return items in the message field for compatibility with some frontend usages,
  // and include total in data.
  res.status(200).json(new ApiResponse(200, { total }, translatedItems));
});

export const createItem = asyncHandler(async (req, res) => {
  const {
    name,
    description,
    rentalPrice,
    price,
    purchaseStock,
    rentalStock,
    category,
    adventures,
    purchase,
    rent,
  } = req.body;

  if (!name || !description || !category || !adventures || !purchase || !rent) {
    throw new ApiError(400, "All fields are required");
  }

  if (!req.files || !req.files.images || req.files.images.length === 0) {
    throw new ApiError(400, "Image is required");
  }

  const mediasUrl = await Promise.all(
    req.files.images.map(async (image) => {
      const link = await uploadOnCloudinary(image.path);
      return link.url;
    })
  );

  await Item.create({
    name,
    description,
    price,
    rentalPrice,
    rentalStock,
    purchaseStock,
    category,
    adventures,
    purchase,
    rent,
    images: mediasUrl,
    owner: req.user._id,
  });

  res.status(201).json(new ApiResponse(201, "Item created successfully", {}));
});

export const updateItem = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const {
    name,
    description,
    price,
    purchaseStock,
    category,
    adventures,
    purchase,
    rent,
    rentalPrice,
    rentalStock,
  } = req.body;

  if (!id) {
    throw new ApiError(400, "Item ID is required");
  }

  const item = await Item.findById(id);
  if (!item) {
    throw new ApiError(404, "Item not found");
  }

  // Update fields if provided
  if (name !== undefined) item.name = name;
  if (description !== undefined) item.description = description;
  if (price !== undefined) item.price = price;
  if (purchaseStock !== undefined) item.purchaseStock = purchaseStock;
  if (category !== undefined) item.category = category;
  if (adventures !== undefined) item.adventures = adventures;
  if (purchase !== undefined) item.purchase = purchase;
  if (rent !== undefined) item.rent = rent;
  if (rentalPrice !== undefined) item.rentalPrice = rentalPrice;
  if (rentalStock !== undefined) item.rentalStock = rentalStock;

  // Handle images update
  if (req.files && req.files.images && req.files.images.length > 0) {
    // Delete old images from Cloudinary
    await Promise.all(
      item.images.map(async (image) => {
        await deleteFromCloudinary(image);
      })
    );
    // Upload new images
    const mediasUrl = await Promise.all(
      req.files.images.map(async (image) => {
        const link = await uploadOnCloudinary(image.path);
        return link.url;
      })
    );
    item.images = mediasUrl;
  }

  await item.save();

  res.status(200).json(new ApiResponse(200, "Item updated successfully", item));
});

export const deleteItem = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!id) {
    throw new ApiError(400, "Item ID is required");
  }

  const item = await Item.findByIdAndDelete(id);
  if (!item) {
    throw new ApiError(404, "Item not found");
  }

  await Promise.all(
    item.images.map(async (image) => {
      const link = await deleteFromCloudinary(image);
    })
  );

  res.status(200).json(new ApiResponse(200, "Item deleted successfully", item));
});

export const getAllItems = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 10,
    search,
    category,
    priceMin,
    priceMax,
    availability,
    minRating,
    brand,
    sortBy,
  } = req.query;
  const language = getLanguage(req); // Get language from middleware

  const skip = (parseInt(page) - 1) * parseInt(limit);

  // Build query object
  const queryObj = {};
  if (search) {
    queryObj.name = { $regex: search, $options: "i" };
  }
  if (category) {
    queryObj.category = category;
  }

  if (priceMin !== undefined || priceMax !== undefined) {
    queryObj.price = {};
    if (priceMin !== undefined && priceMin !== "") queryObj.price.$gte = parseFloat(priceMin);
    if (priceMax !== undefined && priceMax !== "") queryObj.price.$lte = parseFloat(priceMax);
  }

  if (brand) {
    queryObj.brand = { $regex: brand, $options: "i" };
  }

  if (minRating !== undefined && minRating !== "") {
    queryObj.avgRating = { $gte: parseFloat(minRating) };
  }

  if (availability === 'purchase') {
    queryObj.purchase = true;
    queryObj.purchaseStock = { $gt: 0 };
  } else if (availability === 'rent') {
    queryObj.rent = true;
    queryObj.rentalStock = { $gt: 0 };
  } else {
    // default: items with stock
    queryObj.$or = [{ rentalStock: { $gt: 0 } }, { purchaseStock: { $gt: 0 } }];
  }

  let sortObj = {};
  if (sortBy === 'price-asc') sortObj.price = 1;
  else if (sortBy === 'price-desc') sortObj.price = -1;
  else if (sortBy === 'rating-desc') sortObj.avgRating = -1;
  else sortObj.createdAt = -1;

  const items = await Item.find(queryObj)
    .populate("adventures", "name")
    .sort(sortObj)
    .skip(skip)
    .limit(parseInt(limit));

  const total = await Item.countDocuments(queryObj);

  // Translate items if language is not English
  const translatedItems = await translateObjectsFields(
    items.map((item) => item.toObject()),
    ["name", "description", "category"],
    language
  );

  // Keep compatibility: return items in message and total in data
  res.json(new ApiResponse(200, { total }, translatedItems));
});
