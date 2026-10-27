import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import Coupon from "../models/coupon.model.js";
import { computeCouponDiscount, recordCouponUsage } from "../utils/coupon.js";

/** Public (any signed-in user): check a coupon against an amount before checkout */
export const validateCoupon = asyncHandler(async (req, res) => {
  const { code, amount } = req.body;

  const { coupon, discount, finalAmount, orderAmount } =
    await computeCouponDiscount(code, amount);

  res.status(200).json(
    new ApiResponse(
      200,
      {
        code: coupon.code,
        discountType: coupon.discountType,
        value: coupon.value,
        originalAmount: orderAmount,
        discount,
        finalAmount,
      },
      "Coupon is valid"
    )
  );
});

/** Admin: list all coupons */
export const listCoupons = asyncHandler(async (req, res) => {
  const coupons = await Coupon.find({}).sort({ createdAt: -1 });
  res.status(200).json(new ApiResponse(200, coupons, "Coupons fetched"));
});

/** Admin: create a coupon */
export const createCoupon = asyncHandler(async (req, res) => {
  const {
    code,
    discountType,
    value,
    minAmount = 0,
    maxUses = 0,
    expiresAt = null,
  } = req.body;

  if (!code || !discountType || value === undefined) {
    throw new ApiError(400, "code, discountType and value are required");
  }
  if (discountType === "percent" && (Number(value) <= 0 || Number(value) > 100)) {
    throw new ApiError(400, "Percent discount must be between 1 and 100");
  }
  if (discountType === "fixed" && Number(value) <= 0) {
    throw new ApiError(400, "Fixed discount must be greater than 0");
  }

  const existing = await Coupon.findOne({
    code: code.trim().toUpperCase(),
  });
  if (existing) {
    throw new ApiError(409, "A coupon with this code already exists");
  }

  const coupon = await Coupon.create({
    code,
    discountType,
    value: Number(value),
    minAmount: Number(minAmount) || 0,
    maxUses: Number(maxUses) || 0,
    expiresAt,
    createdBy: req.user._id,
  });

  res.status(201).json(new ApiResponse(201, coupon, "Coupon created"));
});

/** Admin: toggle a coupon active/inactive */
export const toggleCoupon = asyncHandler(async (req, res) => {
  const coupon = await Coupon.findById(req.params.id);
  if (!coupon) {
    throw new ApiError(404, "Coupon not found");
  }

  coupon.isActive = !coupon.isActive;
  await coupon.save();

  res.status(200).json(new ApiResponse(200, coupon, `Coupon ${coupon.isActive ? "activated" : "deactivated"}`));
});

/** Admin: delete a coupon */
export const deleteCoupon = asyncHandler(async (req, res) => {
  const coupon = await Coupon.findById(req.params.id);
  if (!coupon) {
    throw new ApiError(404, "Coupon not found");
  }

  await coupon.deleteOne();
  res.status(200).json(new ApiResponse(200, null, "Coupon deleted"));
});

export { recordCouponUsage };
