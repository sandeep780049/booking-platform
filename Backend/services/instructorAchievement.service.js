import { User } from "../models/user.model.js";
import { Instructor } from "../models/instructor.model.js";
import { InstructorAchievement } from "../models/instructorAchievement.model.js";
import { AchievementRule } from "../models/achievementRule.model.js";
import { Booking } from "../models/booking.model.js";
import { evaluateAndAwardForInstructor } from "../controllers/achievementRule.controller.js";

class InstructorAchievementService {
  /**
   * Automatically evaluate achievements for an instructor after booking completion
   * @param {string} instructorUserId - The user ID of the instructor
   */
  async evaluateAfterBooking(instructorUserId) {
    try {
      const newlyAwarded = await evaluateAndAwardForInstructor(instructorUserId);
      
      if (newlyAwarded.length > 0) {
        // Here you could add notification logic, email sending, etc.
        await this.notifyInstructorOfNewAchievements(instructorUserId, newlyAwarded);
      }
      
      return newlyAwarded;
    } catch (error) {
      console.error(`Error evaluating achievements for instructor ${instructorUserId}:`, error);
      throw error;
    }
  }

  /**
   * Automatically evaluate achievements for an instructor after rating update
   * @param {string} instructorUserId - The user ID of the instructor
   */
  async evaluateAfterRatingUpdate(instructorUserId) {
    try {
      const newlyAwarded = await evaluateAndAwardForInstructor(instructorUserId);
      
      if (newlyAwarded.length > 0) {
        await this.notifyInstructorOfNewAchievements(instructorUserId, newlyAwarded);
      }
      
      return newlyAwarded;
    } catch (error) {
      console.error(`Error evaluating achievements after rating update for instructor ${instructorUserId}:`, error);
      throw error;
    }
  }

  /**
   * Daily/scheduled evaluation of all instructors for time-based achievements
   */
  async scheduledEvaluation() {
    try {
      console.log("Starting scheduled evaluation of all instructors...");
      
      const instructors = await User.find({ 
        role: "instructor",
        instructor: { $exists: true }
      }).select("_id name email");

      const results = {
        total: instructors.length,
        evaluated: 0,
        errors: 0,
        newAchievements: 0
      };

      for (const instructor of instructors) {
        try {
          const newlyAwarded = await evaluateAndAwardForInstructor(instructor._id);
          results.evaluated++;
          results.newAchievements += newlyAwarded.length;
          
          if (newlyAwarded.length > 0) {
            console.log(`Instructor ${instructor.name} (${instructor._id}) earned ${newlyAwarded.length} new achievements`);
          }
        } catch (error) {
          console.error(`Error evaluating instructor ${instructor._id}:`, error);
          results.errors++;
        }
      }

      console.log("Scheduled evaluation completed:", results);
      return results;
    } catch (error) {
      console.error("Error in scheduled evaluation:", error);
      throw error;
    }
  }

  /**
   * Get instructor achievement statistics
   * @param {string} instructorUserId - The user ID of the instructor
   */
  async getInstructorStats(instructorUserId) {
    try {
      const instructorAchievement = await InstructorAchievement.findOne({ 
        instructorId: instructorUserId 
      });

      if (!instructorAchievement) {
        return {
          totalAchievements: 0,
          level: 0,
          experiencePoints: 0,
          currentRating: 0,
          totalBookings: 0,
          monthsSinceJoining: 0
        };
      }

      return {
        totalAchievements: instructorAchievement.achievements.length,
        level: instructorAchievement.level,
        experiencePoints: instructorAchievement.totalExperiencePoints,
        currentRating: instructorAchievement.currentRating,
        totalBookings: instructorAchievement.totalBookingsReceived,
        monthsSinceJoining: instructorAchievement.monthsSinceJoining,
        recentAchievements: instructorAchievement.achievements
          .sort((a, b) => new Date(b.earnedAt) - new Date(a.earnedAt))
          .slice(0, 5)
      };
    } catch (error) {
      console.error(`Error getting instructor stats for ${instructorUserId}:`, error);
      throw error;
    }
  }

  /**
   * Get leaderboard of instructors by achievements
   * @param {number} limit - Number of top instructors to return
   */
  async getLeaderboard(limit = 10) {
    try {
      const leaderboard = await InstructorAchievement.aggregate([
        {
          $lookup: {
            from: "users",
            localField: "instructorId",
            foreignField: "_id",
            as: "user"
          }
        },
        {
          $unwind: "$user"
        },
        {
          $project: {
            name: "$user.name",
            email: "$user.email",
            level: 1,
            totalExperiencePoints: 1,
            currentRating: 1,
            totalBookingsReceived: 1,
            achievementCount: { $size: "$achievements" },
            monthsSinceJoining: 1
          }
        },
        {
          $sort: { 
            level: -1, 
            totalExperiencePoints: -1, 
            achievementCount: -1 
          }
        },
        {
          $limit: limit
        }
      ]);

      return leaderboard;
    } catch (error) {
      console.error("Error getting instructor leaderboard:", error);
      throw error;
    }
  }

  /**
   * Preview achievements that an instructor would earn with given metrics
   * @param {Object} metrics - { rating, monthsSinceJoining, bookingCount }
   */
  async previewAchievements(metrics) {
    try {
      const { rating, monthsSinceJoining, bookingCount } = metrics;
      
      const rules = await AchievementRule.find({ 
        active: true, 
        targetType: "instructor" 
      });

      const eligibleAchievements = [];

      for (const rule of rules) {
        let qualifies = false;
        const criteria = rule.instructorCriteria || {};

        // Check based on metric type
        if (rule.metric === "rating") {
          qualifies = rating >= (criteria.minRating || rule.threshold);
        } else if (rule.metric === "joiningDate") {
          qualifies = monthsSinceJoining >= (criteria.minMonthsSinceJoining || rule.threshold);
        } else if (rule.metric === "bookingCount") {
          qualifies = bookingCount >= (criteria.minBookings || rule.threshold);
        }

        // Additional criteria checks
        if (qualifies && rule.targetType === "instructor") {
          if (criteria.minRating && rating < criteria.minRating) qualifies = false;
          if (criteria.minMonthsSinceJoining && monthsSinceJoining < criteria.minMonthsSinceJoining) qualifies = false;
          if (criteria.minBookings && bookingCount < criteria.minBookings) qualifies = false;
        }

        if (qualifies) {
          eligibleAchievements.push({
            name: rule.name || rule.title,
            description: rule.description,
            category: rule.label || "instructor",
            icon: rule.icon,
            criteria: {
              rating,
              monthsSinceJoining,
              bookingCount,
            },
          });
        }
      }

      return eligibleAchievements;
    } catch (error) {
      console.error("Error previewing achievements:", error);
      throw error;
    }
  }

  /**
   * Notify instructor of new achievements (placeholder for notification system)
   * @param {string} instructorUserId - The user ID of the instructor
   * @param {Array} newAchievements - Array of newly earned achievement names
   */
  async notifyInstructorOfNewAchievements(instructorUserId, newAchievements) {
    try {
      // This is a placeholder for your notification system
      // You could implement email notifications, push notifications, etc.
      console.log(`Notifying instructor ${instructorUserId} of new achievements:`, newAchievements);
      
      // Example: Log to database, send email, create in-app notification, etc.
      // await this.createInAppNotification(instructorUserId, newAchievements);
      // await this.sendAchievementEmail(instructorUserId, newAchievements);
      
      return true;
    } catch (error) {
      console.error(`Error notifying instructor ${instructorUserId}:`, error);
      return false;
    }
  }
}

export const instructorAchievementService = new InstructorAchievementService();