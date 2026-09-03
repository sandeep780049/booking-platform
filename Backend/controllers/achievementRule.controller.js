import { AchievementRule } from "../models/achievementRule.model.js";
import { UserAdventureExperience } from "../models/userAdventureExperience.model.js";
import { Booking } from "../models/booking.model.js";
import { UserAchievement } from "../models/userAchievement.model.js";
import { InstructorAchievement } from "../models/instructorAchievement.model.js";
import { User } from "../models/user.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";

// Admin: create a rule
export const createRule = asyncHandler(async (req, res) => {
  const payload = { ...req.body };
  if (!payload.name && payload.title) payload.name = payload.title;
  if (!payload.title) payload.title = payload.name;
  const rule = await AchievementRule.create(payload);
  res
    .status(201)
    .json(new ApiResponse(201, rule, "Achievement rule created"));
});

// Admin: update a rule
export const updateRule = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const payload = { ...req.body };
  if (!payload.name && payload.title) payload.name = payload.title;
  if (!payload.title && payload.name) payload.title = payload.name;
  const rule = await AchievementRule.findByIdAndUpdate(id, payload, {
    new: true,
    runValidators: true,
  });
  if (!rule) throw new ApiError(404, "Rule not found");
  res.status(200).json(new ApiResponse(200, rule, "Achievement rule updated"));
});

// Admin: delete a rule
export const deleteRule = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const rule = await AchievementRule.findByIdAndDelete(id);
  if (!rule) throw new ApiError(404, "Rule not found");
  res.status(200).json(new ApiResponse(200, rule, "Achievement rule deleted"));
});

// Public/Admin: list rules (optionally filter by adventure)
export const listRules = asyncHandler(async (req, res) => {
  const { adventure, active, targetType } = req.query;
  const filter = {};
  if (adventure) filter.adventure = adventure;
  if (active !== undefined) filter.active = active === "true";
  if (targetType) filter.targetType = targetType;
  const rules = await AchievementRule.find(filter).sort({ createdAt: -1 });
  res.status(200).json(new ApiResponse(200, rules, "Achievement rules list"));
});

// Admin: create instructor achievement rule
export const createInstructorRule = asyncHandler(async (req, res) => {
  const payload = { 
    ...req.body, 
    targetType: "instructor" 
  };
  
  // Validate instructor-specific criteria
  if (payload.metric === "rating" && !payload.instructorCriteria?.minRating) {
    throw new ApiError(400, "Minimum rating is required for rating-based achievement rules");
  }
  if (payload.metric === "joiningDate" && !payload.instructorCriteria?.minMonthsSinceJoining) {
    throw new ApiError(400, "Minimum months since joining is required for joining date-based achievement rules");
  }
  if (payload.metric === "bookingCount" && !payload.instructorCriteria?.minBookings) {
    throw new ApiError(400, "Minimum bookings is required for booking count-based achievement rules");
  }

  if (!payload.name && payload.title) payload.name = payload.title;
  if (!payload.title) payload.title = payload.name;
  
  const rule = await AchievementRule.create(payload);
  res
    .status(201)
    .json(new ApiResponse(201, rule, "Instructor achievement rule created"));
});

// Admin: update instructor achievement rule
export const updateInstructorRule = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const payload = { ...req.body };
  
  // Ensure it's still an instructor rule
  payload.targetType = "instructor";
  
  if (!payload.name && payload.title) payload.name = payload.title;
  if (!payload.title && payload.name) payload.title = payload.name;
  
  const rule = await AchievementRule.findOneAndUpdate(
    { _id: id, targetType: "instructor" },
    payload,
    { new: true, runValidators: true }
  );
  
  if (!rule) throw new ApiError(404, "Instructor achievement rule not found");
  
  res.status(200).json(new ApiResponse(200, rule, "Instructor achievement rule updated"));
});

// Admin: delete instructor achievement rule
export const deleteInstructorRule = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const rule = await AchievementRule.findOneAndDelete({ 
    _id: id, 
    targetType: "instructor" 
  });
  
  if (!rule) throw new ApiError(404, "Instructor achievement rule not found");
  
  res.status(200).json(new ApiResponse(200, rule, "Instructor achievement rule deleted"));
});

// Admin: list instructor achievement rules
export const listInstructorRules = asyncHandler(async (req, res) => {
  const { adventure, active } = req.query;
  const filter = { targetType: "instructor" };
  
  if (adventure) filter.adventure = adventure;
  if (active !== undefined) filter.active = active === "true";
  
  const rules = await AchievementRule.find(filter)
    .populate("adventure", "name")
    .sort({ createdAt: -1 });
    
  res.status(200).json(new ApiResponse(200, rules, "Instructor achievement rules list"));
});

// Admin: get single instructor achievement rule
export const getInstructorRule = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const rule = await AchievementRule.findOne({ 
    _id: id, 
    targetType: "instructor" 
  }).populate("adventure", "name");
  
  if (!rule) throw new ApiError(404, "Instructor achievement rule not found");
  
  res.status(200).json(new ApiResponse(200, rule, "Instructor achievement rule retrieved"));
});

// Internal helper (can be used by services): evaluate and award for a given user
export const evaluateAndAwardForUser = async (userId) => {
  // Load user experience per adventure
  const experiences = await UserAdventureExperience.find({ user: userId });

  // Build maps for quick checks
  const byAdventure = new Map();
  let globalCompleted = 0;
  for (const exp of experiences) {
    byAdventure.set(String(exp.adventure), exp);
    globalCompleted += exp.completedSessions || 0;
  }

  const rules = await AchievementRule.find({ active: true });

  // Preload confirmed bookings per adventure for this user (if schema supports adventure ref)
  const userBookings = await Booking.find({ user: userId, status: "confirmed" })
    .populate({ path: "session", select: "adventureId" })
    .lean();
  const confirmedByAdventure = new Map();
  let confirmedGlobal = 0;
  for (const b of userBookings) {
    const advId = String(b.session?.adventureId || "");
    if (!advId) continue;
    confirmedByAdventure.set(advId, (confirmedByAdventure.get(advId) || 0) + 1);
    confirmedGlobal += 1;
  }

  // Load or init user's achievement record
  let userAch = await UserAchievement.findOne({ userId: userId });
  if (!userAch) {
    // Create minimal doc if missing so we can push achievements
    userAch = await UserAchievement.create({
      userId,
      email: "",
      name: "",
      level: 0,
    });
  }

  const already = new Set(
    (userAch.achievements || []).map((a) => `${a.name}|${a.level || 1}`)
  );
  let newlyAwarded = [];

  for (const rule of rules) {
    let value = 0;
    if (rule.metric === "completedSessions") {
      if (rule.adventure) {
        const exp = byAdventure.get(String(rule.adventure));
        value = exp?.completedSessions || 0;
      } else {
        value = globalCompleted;
      }
    } else if (rule.metric === "confirmedBookings") {
      if (rule.adventure) {
        value = confirmedByAdventure.get(String(rule.adventure)) || 0;
      } else {
        value = confirmedGlobal;
      }
    }

    if (value >= rule.threshold) {
      const achName = rule.name || rule.title;
      const key = `${achName}|1`;
      if (!already.has(key)) {
        userAch.achievements.push({
          name: achName,
          description: rule.description,
          category: rule.label || "global",
          level: 1,
          earnedAt: new Date(),
        });
        already.add(key);
        newlyAwarded.push(rule.title);
      }
    }
  }

  if (newlyAwarded.length > 0) {
    await userAch.save();
  }

  return newlyAwarded;
};

// Internal helper: evaluate and award achievements for instructors
export const evaluateAndAwardForInstructor = async (instructorUserId) => {
  // Get user with instructor details
  const user = await User.findById(instructorUserId).populate("instructor");
  if (!user || user.role !== "instructor" || !user.instructor) {
    throw new ApiError(404, "Instructor not found");
  }

  const instructor = user.instructor;
  
  // Calculate months since joining
  const joinDate = new Date(user.createdAt);
  const now = new Date();
  const monthsSinceJoining = Math.floor((now - joinDate) / (1000 * 60 * 60 * 24 * 30.44)); // Average days per month

  // Get instructor's bookings count
  const bookingCount = await Booking.countDocuments({
    session: { $in: instructor.sessions },
    status: "confirmed"
  });

  // Get current rating
  const currentRating = instructor.avgReview || 0;

  // Get active instructor achievement rules
  const rules = await AchievementRule.find({ 
    active: true, 
    targetType: "instructor" 
  });

  // Load or create instructor's achievement record
  let instructorAch = await InstructorAchievement.findOne({ instructorId: instructorUserId });
  if (!instructorAch) {
    instructorAch = await InstructorAchievement.create({
      instructorId: instructorUserId,
      email: user.email,
      name: user.name,
      currentRating,
      totalBookingsReceived: bookingCount,
      monthsSinceJoining,
    });
  } else {
    // Update current metrics
    instructorAch.currentRating = currentRating;
    instructorAch.totalBookingsReceived = bookingCount;
    instructorAch.monthsSinceJoining = monthsSinceJoining;
  }

  const already = new Set(
    (instructorAch.achievements || []).map((a) => `${a.name}|${a.level || 1}`)
  );
  let newlyAwarded = [];

  for (const rule of rules) {
    let qualifies = false;
    const criteria = rule.instructorCriteria || {};

    // Check based on metric type
    if (rule.metric === "rating") {
      qualifies = currentRating >= (criteria.minRating || rule.threshold);
    } else if (rule.metric === "joiningDate") {
      qualifies = monthsSinceJoining >= (criteria.minMonthsSinceJoining || rule.threshold);
    } else if (rule.metric === "bookingCount") {
      qualifies = bookingCount >= (criteria.minBookings || rule.threshold);
    } else {
      // For legacy metrics, check threshold
      let value = 0;
      if (rule.metric === "completedSessions") {
        value = instructor.sessions?.length || 0;
      } else if (rule.metric === "confirmedBookings") {
        value = bookingCount;
      }
      qualifies = value >= rule.threshold;
    }

    // Additional criteria checks for instructor rules
    if (qualifies && rule.targetType === "instructor") {
      if (criteria.minRating && currentRating < criteria.minRating) qualifies = false;
      if (criteria.minMonthsSinceJoining && monthsSinceJoining < criteria.minMonthsSinceJoining) qualifies = false;
      if (criteria.minBookings && bookingCount < criteria.minBookings) qualifies = false;
    }

    if (qualifies) {
      const achName = rule.name || rule.title;
      const key = `${achName}|1`;
      
      if (!already.has(key)) {
        const achievement = {
          name: achName,
          description: rule.description,
          category: rule.label || "instructor",
          level: 1,
          earnedAt: new Date(),
          criteria: {
            rating: currentRating,
            monthsSinceJoining,
            bookingCount,
          },
        };

        instructorAch.achievements.push(achievement);
        instructorAch.totalExperiencePoints += 50; // Award points for achievement
        already.add(key);
        newlyAwarded.push(achName);
      }
    }
  }

  if (newlyAwarded.length > 0 || instructorAch.isModified()) {
    instructorAch.calculateLevel();
    await instructorAch.save();
  }

  return newlyAwarded;
};

// Instructor endpoint to evaluate achievements
export const evaluateInstructorAchievements = asyncHandler(async (req, res) => {
  if (req.user.role !== "instructor") {
    throw new ApiError(403, "Only instructors can evaluate instructor achievements");
  }

  const newly = await evaluateAndAwardForInstructor(req.user._id);
  res
    .status(200)
    .json(new ApiResponse(200, { awarded: newly }, "Instructor achievements evaluated"));
});

// Admin endpoint to evaluate achievements for a specific instructor
export const evaluateSpecificInstructor = asyncHandler(async (req, res) => {
  const { instructorId } = req.params;
  
  const newly = await evaluateAndAwardForInstructor(instructorId);
  res
    .status(200)
    .json(new ApiResponse(200, { awarded: newly }, "Instructor achievements evaluated"));
});

// Admin endpoint to bulk evaluate all instructors
export const evaluateAllInstructors = asyncHandler(async (req, res) => {
  const instructors = await User.find({ 
    role: "instructor",
    instructor: { $exists: true }
  }).select("_id");

  const results = [];
  
  for (const instructor of instructors) {
    try {
      const newly = await evaluateAndAwardForInstructor(instructor._id);
      results.push({
        instructorId: instructor._id,
        awarded: newly,
        success: true,
      });
    } catch (error) {
      results.push({
        instructorId: instructor._id,
        error: error.message,
        success: false,
      });
    }
  }

  res
    .status(200)
    .json(new ApiResponse(200, { results }, "All instructors evaluated"));
});

// Get instructor achievements
export const getInstructorAchievements = asyncHandler(async (req, res) => {
  const { instructorId } = req.params;
  
  let achievements = await InstructorAchievement.findOne({ 
    instructorId: instructorId || req.user._id
  });

  if (!achievements) {
    // Return empty achievement structure instead of error
    const user = await User.findById(instructorId || req.user._id);
    if (!user) {
      throw new ApiError(404, "Instructor not found");
    }
    
    achievements = {
      instructorId: user._id,
      email: user.email,
      name: user.name,
      level: 0,
      currentRating: 0,
      totalBookingsReceived: 0,
      monthsSinceJoining: 0,
      totalExperiencePoints: 0,
      achievements: [],
      badges: [],
      stats: {
        totalAchievements: 0,
        lastEvaluated: null,
        streak: 0
      }
    };
  }

  res
    .status(200)
    .json(new ApiResponse(200, achievements, "Instructor achievements retrieved"));
});

// Authed user endpoint to evaluate and return newly awarded titles
export const evaluateMyAchievements = asyncHandler(async (req, res) => {
  const newly = await evaluateAndAwardForUser(req.user._id);
  res
    .status(200)
    .json(new ApiResponse(200, { awarded: newly }, "Achievements evaluated"));
});
