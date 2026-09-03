import { User } from "../models/user.model.js";
import { UserAchievement } from "../models/userAchievement.model.js";
import { UserAdventureExperience } from "../models/userAdventureExperience.model.js";
import { AchievementRule } from "../models/achievementRule.model.js";
import { Booking } from "../models/booking.model.js";

export const updateUserAchievement = async (userId) => {
  try {
    // Get basic user info
    const user = await User.findById(userId).select("name email");
    if (!user) return;

    // Fetch experiences per adventure
    const experiences = await UserAdventureExperience.find({ user: userId })
      .populate({ path: "adventure", select: "name exp" })
      .lean();

    // Aggregate totals
    let totalXP = 0;
    let adventureCount = experiences.length;
    const adventuresByCategory = new Map(); // category placeholder if added later
    const experienceByCategory = new Map(); // category placeholder if added later

    for (const exp of experiences) {
      totalXP += exp.experience || 0;
    }

    // Compute derived level
    const level = Math.floor(totalXP / 1000);

    // Compute unique categories statistics if category exists in Adventure later
    const uniqueCategories = 0;

    // Upsert core achievement aggregate
    let saved = await UserAchievement.createOrUpdate({
      userId: user._id,
      email: user.email || "",
      name: user.name || "",
      level,
      totalCompletedAdventures: adventureCount,
      adventuresByCategory,
      totalExperiencePoints: totalXP,
      experienceByCategory,
      adventureStats: { uniqueCategories },
    });

    // Evaluate active rules and award badges if thresholds met
    const rules = await AchievementRule.find({ active: true });

    // Build quick lookup of sessions completed per adventure and global
    const completedByAdventure = new Map();
    let globalCompleted = 0;
    for (const e of experiences) {
      completedByAdventure.set(String(e.adventure?._id || e.adventure), e.completedSessions || 0);
      globalCompleted += e.completedSessions || 0;
    }

    // Also compute confirmed bookings counts
    const confirmedBookings = await Booking.find({ user: userId, status: "confirmed" })
      .populate({ path: "session", select: "adventureId" })
      .lean();
    const confirmedByAdventure = new Map();
    let confirmedGlobal = 0;
    for (const b of confirmedBookings) {
      const advId = String(b.session?.adventureId || "");
      if (!advId) continue;
      confirmedByAdventure.set(advId, (confirmedByAdventure.get(advId) || 0) + 1);
      confirmedGlobal += 1;
    }

    const already = new Set(
      (saved.achievements || []).map((a) => `${a.name}|${a.level || 1}`)
    );
    let toPush = [];
    for (const rule of rules) {
      let currentValue = 0;
      if (rule.metric === "completedSessions") {
        currentValue = rule.adventure
          ? completedByAdventure.get(String(rule.adventure)) || 0
          : globalCompleted;
      } else if (rule.metric === "confirmedBookings") {
        currentValue = rule.adventure
          ? confirmedByAdventure.get(String(rule.adventure)) || 0
          : confirmedGlobal;
      } else {
        continue;
      }
      if (currentValue >= rule.threshold) {
        const achName = rule.name || rule.title;
        const key = `${achName}|1`;
        if (!already.has(key)) {
          toPush.push({
            name: achName,
            description: rule.description,
            category: rule.label || "global",
            earnedAt: new Date(),
            level: 1,
          });
          already.add(key);
        }
      }
    }

    if (toPush.length > 0) {
      saved.achievements.push(...toPush);
      await saved.save();
    }

    return saved;
  } catch (error) {
    console.error(`Error updating achievements for user ${userId}:`, error);
  }
};