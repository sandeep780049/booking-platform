import Coupon from "../models/coupon.model.js";
import { ApiError } from "./ApiError.js";

/**
 * Compute the discount a coupon gives for a booking amount.
 * Returns raw coupon + pricing breakdown; does not mutate usage counters.
 */
export const computeCouponDiscount = async (code, amount) => {
  if (!code || typeof code !== "string") {
    throw new ApiError(400, "Coupon code is required");
  }

  const orderAmount = Number(amount);
  if (isNaN(orderAmount) || orderAmount <= 0) {
    throw new ApiError(400, "A positive booking amount is required to apply a coupon");
  }

  const coupon = await Coupon.findOne({ code: code.trim().toUpperCase() });

  if (!coupon) {
    throw new ApiError(404, "Invalid coupon code");
  }
  if (!coupon.isActive) {
    throw new ApiError(400, "This coupon is no longer active");
  }
  if (coupon.expiresAt && coupon.expiresAt < new Date()) {
    throw new ApiError(400, "This coupon has expired");
  }
  if (coupon.maxUses > 0 && coupon.usedCount >= coupon.maxUses) {
    throw new ApiError(400, "This coupon has reached its usage limit");
  }
  if (orderAmount < coupon.minAmount) {
    throw new ApiError(
      400,
      `This coupon requires a minimum booking amount of ${coupon.minAmount}`
    );
  }

  let discount =
    coupon.discountType === "percent"
      ? (orderAmount * coupon.value) / 100
      : coupon.value;

  discount = Math.min(Math.round(discount * 100) / 100, orderAmount);
  const finalAmount = Math.round((orderAmount - discount) * 100) / 100;

  return { coupon, discount, finalAmount, orderAmount };
};

/**
 * Record one usage of a coupon. Guarded by booking.couponUsedAt so the same
 * booking can never increment the counter twice (webhooks can repeat).
 */
export const recordCouponUsage = async (booking) => {
  if (!booking?.couponCode || booking.couponUsedAt) {
    return;
  }

  await Coupon.updateOne(
    { code: booking.couponCode },
    { $inc: { usedCount: 1 } }
  );

  booking.couponUsedAt = new Date();

  // Persist the guard flag without clobbering fields saved by the caller
  await booking.constructor.updateOne(
    { _id: booking._id, couponUsedAt: { $exists: false } },
    { $set: { couponUsedAt: booking.couponUsedAt } }
  );
};
