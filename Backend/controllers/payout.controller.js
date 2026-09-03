// controllers/payout.controller.js
import { User } from "../models/user.model.js";
import { Payout } from "../models/payout.model.js";
import axios from "axios";
import { getAccessToken } from "../utils/paypal.js";
import { ApiError } from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import { v4 as uuidv4 } from "uuid";
import { asyncHandler } from "../utils/asyncHandler.js";

/* ----------------------- PAYPAL ACCOUNT LINKING ----------------------- */

export const linkPayPalAccount = asyncHandler(async (req, res) => {
  const userId = req.user?.id || req.body.userId; // Get user ID from authenticated request
  
  const accessToken = await getAccessToken();
  const trackingId = `track-${Date.now()}-${userId}`;

  try {
    const response = await axios.post(
      `${process.env.PAYPAL_API_BASE}/v2/customer/partner-referrals`,
      {
        tracking_id: trackingId,
        partner_config_override: {
          return_url: `${process.env.FRONTEND_URL}/paypal/success`,
          return_url_description: "Return after PayPal onboarding",
          show_add_credit_card: false,
        },
        operations: [
          {
            operation: "API_INTEGRATION",
            api_integration_preference: {
              rest_api_integration: {
                integration_method: "PAYPAL",
                integration_type: "THIRD_PARTY",
                third_party_details: {
                  features: [
                    "PAYMENT",
                    "REFUND"
                  ]
                },
              },
            },
          },
        ],
        products: [
          "EXPRESS_CHECKOUT"
        ],
        legal_consents: [
          {
            type: "SHARE_DATA_CONSENT",
            granted: true,
          },
        ],
        partner_customer_id: userId,
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
          "PayPal-Partner-Attribution-Id": process.env.PAYPAL_PARTNER_ATTRIBUTION_ID,
        },
      }
    );

    // Get the redirect URL from response
    const redirectUrl = response.data.links?.find(
      (link) => link.rel === "action_url"
    )?.href;

    if (!redirectUrl) {
      console.error("PayPal response:", response.data);
      throw new ApiError(500, "No redirect URL returned from PayPal");
    }

    // Store tracking info for verification
    await User.findByIdAndUpdate(userId, {
      paypalTrackingId: trackingId,
      paypalOnboardingStarted: new Date(),
    });

    return res
      .status(200)
      .json(new ApiResponse(200, { redirectUrl, trackingId }, "PayPal link initiated"));

  } catch (error) {
    console.error("PayPal API Error:", error.response?.data || error.message);
    throw new ApiError(500, `PayPal API error: ${error.response?.data?.message || error.message}`);
  }
});

// PayPal onboarding completion callback
export const paypalOnboardingComplete = asyncHandler(async (req, res) => {
  const { userId } = req.query;
  const {
    merchantId,
    merchantIdInPayPal,
    permissionsGranted,
    accountStatus,
    consentStatus,
    isEmailConfirmed,
    productIntentId,
    riskStatus
  } = req.query;


  if (!userId) {
    return res.status(400).send("Missing userId parameter");
  }

  try {
    // Update user with PayPal details
    const user = await User.findByIdAndUpdate(
      userId,
      {
        paypalPayerId: merchantIdInPayPal,
        paypalMerchantId: merchantId,
        paypalLinkedAt: new Date(),
        paypalEmailConfirmed: isEmailConfirmed === "true",
        paypalAccountStatus: accountStatus,
        paypalPermissionsGranted: permissionsGranted === "true",
        paypalConsentStatus: consentStatus === "true",
        paypalProductIntentId: productIntentId,
        paypalRiskStatus: riskStatus,
        paypalOnboardingCompleted: true,
      },
      { new: true }
    );

    if (!user) {
      return res.status(404).send("User not found");
    }

    // Redirect to frontend success page
    return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/paypal/success?status=linked&userId=${userId}`);
    
  } catch (error) {
    console.error("Error handling PayPal onboarding callback:", error);
    return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/paypal/error?message=linking_failed`);
  }
});


// 2. Step: Callback after user approves
export const paypalCallback = asyncHandler(async (req, res) => {
  const { code, state } = req.query;
  const userId = state;

  const tokenRes = await axios.post(
    `${process.env.PAYPAL_API_BASE}/v1/oauth2/token`,
    new URLSearchParams({
      grant_type: "authorization_code",
      code,
      redirect_uri: `${process.env.BASE_URL}/api/payouts/callback`,
    }),
    {
      auth: {
        username: process.env.PAYPAL_CLIENT_ID,
        password: process.env.PAYPAL_SECRET,
      },
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    }
  );

  const { access_token } = tokenRes.data;

  const userRes = await axios.get(
    `${process.env.PAYPAL_API_BASE}/v1/identity/oauth2/userinfo?schema=paypalv1.1`,
    {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    }
  );

  const { emails } = userRes.data;

  const {
    merchantIdInPayPal,
    isEmailConfirmed,
    accountStatus,
    permissionsGranted,
    consentStatus,
    riskStatus,
  } = req.query;

  const user = await User.findById(userId);
  if (!user) {
    return res.status(404).send("User not found");
  }

  user.paypalPayerId = merchantIdInPayPal;
  user.paypalEmail = emails?.[0]?.value || null;
  user.paypalLinkedAt = new Date();
  user.paypalEmailConfirmed = isEmailConfirmed === "true";
  user.paypalAccountStatus = accountStatus;
  user.paypalPermissionsGranted = permissionsGranted === "true";
  user.paypalConsentStatus = consentStatus === "true";
  user.paypalRiskStatus = riskStatus;

  await user.save();

  return res.redirect("/dashboard?paypalLinked=1");
});

export const getSuccessPage = asyncHandler(async (req, res) => {
  const {
    merchantId,
    merchantIdInPayPal,
    permissionsGranted,
    productIntentId,
    consentStatus,
    isEmailConfirmed
  } = req.body;

  // Validate required fields
  if (
    !merchantId ||
    !merchantIdInPayPal ||
    !permissionsGranted ||
    !productIntentId ||
    !consentStatus ||
    !isEmailConfirmed
  ) {
    throw new ApiError(400, "Missing required fields in PayPal onboarding data");
  }

  const user = req.user; // assuming verifyJWT middleware sets req.user

  if (!user) {
    throw new ApiError(401, "Unauthorized: User not found");
  }

  // Check if PayPal is already linked
  if (user.paypalOnboardingCompleted) {
    throw new ApiError(400, "PayPal account already linked for this user");
  }

  // Update user with PayPal details
  const updatedUser = await User.findByIdAndUpdate(
    user._id,
    {
      paypalMerchantId: merchantId,
      paypalPayerId: merchantIdInPayPal,
      paypalPermissionsGranted: permissionsGranted === "true",
      paypalProductIntentId: productIntentId,
      paypalConsentStatus: consentStatus === "true",
      paypalEmailConfirmed: isEmailConfirmed === "true",
      paypalOnboardingCompleted: true,
      paypalLinkedAt: new Date(),
    },
    { new: true }
  );

  return res.status(200).json(
    new ApiResponse(200, {
      merchantId: updatedUser.paypalMerchantId,
      merchantIdInPayPal: updatedUser.paypalPayerId,
      permissionsGranted: updatedUser.paypalPermissionsGranted,
      onboardingCompleted: updatedUser.paypalOnboardingCompleted
    }, "PayPal account linked successfully")
  );
});

// Check PayPal linking status
export const getPayPalLinkStatus = asyncHandler(async (req, res) => {
  const userId = req.user?.id || req.params.userId;

  if (!userId) {
    throw new ApiError(401, "User authentication required");
  }

  const user = await User.findById(userId).select(
    'paypalOnboardingCompleted paypalPayerId paypalMerchantId paypalLinkedAt paypalEmailConfirmed paypalAccountStatus'
  );

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  return res.status(200).json(
    new ApiResponse(200, {
      isLinked: user.paypalOnboardingCompleted || false,
      payerId: user.paypalPayerId || null,
      merchantId: user.paypalMerchantId || null,
      linkedAt: user.paypalLinkedAt || null,
      emailConfirmed: user.paypalEmailConfirmed || false,
      accountStatus: user.paypalAccountStatus || "UNKNOWN"
    }, "PayPal link status retrieved")
  );
});

/* -------------------------- PAYOUT CREATION --------------------------- */

export const createBatchPayout = asyncHandler(async (req, res) => {
  const { payouts, currency, note } = req.body;

  const accessToken = await pp.getAppAccessToken({
    apiBase: process.env.PAYPAL_API_BASE,
    clientId: process.env.PAYPAL_CLIENT_ID,
    secret: process.env.PAYPAL_SECRET,
  });

  const senderBatchId = uuidv4();

  const items = await Promise.all(
    payouts.map(async (p) => {
      const user = await User.findById(p.userId);
      if (!user || !user.paypalEmail) {
        throw new Error(`User ${p.userId} has no PayPal linked`);
      }
      return {
        recipient_type: "EMAIL",
        amount: { value: p.amount.toFixed(2), currency },
        receiver: user.paypalEmail,
        note: note || "Batch payout from platform",
        sender_item_id: uuidv4(),
      };
    })
  );

  const payoutRes = await pp.createPayout({
    apiBase: process.env.PAYPAL_API_BASE,
    accessToken,
    senderBatchId,
    items,
  });

  const savedPayouts = await Promise.all(
    items.map((item, idx) =>
      Payout.create({
        user: payouts[idx].userId,
        amount: payouts[idx].amount,
        currency,
        note,
        batchId: senderBatchId,
        itemId: item.sender_item_id,
        status: "SENT",
        rawResponse: payoutRes,
      })
    )
  );

  return res.json({
    success: true,
    batchId: senderBatchId,
    payouts: savedPayouts,
  });
});

/* -------------------------- PAYOUT QUERIES ---------------------------- */

export const getBatchPayouts = asyncHandler(async (req, res) => {
  const { batchId } = req.params;
  const payouts = await Payout.find({ batchId }).populate(
    "user",
    "email name paypalEmail"
  );
  return res.json({ success: true, payouts });
});

export const getUserPayouts = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const payouts = await Payout.find({ user: userId }).sort({
    createdAt: -1,
  });
  return res.json({ success: true, payouts });
});
