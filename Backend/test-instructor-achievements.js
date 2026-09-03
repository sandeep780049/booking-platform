import mongoose from "mongoose";
import { AchievementRule } from "./models/achievementRule.model.js";
import { InstructorAchievement } from "./models/instructorAchievement.model.js";
import { User } from "./models/user.model.js";
import { Instructor } from "./models/instructor.model.js";
import { instructorAchievementService } from "./services/instructorAchievement.service.js";

// Test data for instructor achievement rules
const testRules = [
  {
    name: "Top Rated Instructor",
    title: "Top Rated Instructor",
    description: "Achieve an average rating of 4.5 or higher",
    targetType: "instructor",
    metric: "rating",
    threshold: 4.5,
    instructorCriteria: {
      minRating: 4.5
    },
    active: true,
    icon: "⭐"
  },
  {
    name: "Experienced Guide",
    title: "Experienced Guide",
    description: "Complete 6 months as an instructor",
    targetType: "instructor",
    metric: "joiningDate",
    threshold: 6,
    instructorCriteria: {
      minMonthsSinceJoining: 6
    },
    active: true,
    icon: "🎯"
  },
  {
    name: "Popular Instructor",
    title: "Popular Instructor",
    description: "Receive 50 confirmed bookings",
    targetType: "instructor",
    metric: "bookingCount",
    threshold: 50,
    instructorCriteria: {
      minBookings: 50
    },
    active: true,
    icon: "🔥"
  },
  {
    name: "Master Instructor",
    title: "Master Instructor",
    description: "Achieve 4.8+ rating with 100+ bookings and 12+ months experience",
    targetType: "instructor",
    metric: "rating",
    threshold: 4.8,
    instructorCriteria: {
      minRating: 4.8,
      minBookings: 100,
      minMonthsSinceJoining: 12
    },
    active: true,
    icon: "👑"
  }
];

async function testInstructorAchievements() {
  console.log("🚀 Testing Instructor Achievement System...\n");

  try {
    // 1. Test creating instructor achievement rules
    console.log("1️⃣ Testing Achievement Rule Creation:");
    const createdRules = [];
    
    for (const ruleData of testRules) {
      try {
        const rule = await AchievementRule.create(ruleData);
        createdRules.push(rule);
        console.log(`✅ Created rule: ${rule.name}`);
      } catch (error) {
        console.log(`❌ Failed to create rule ${ruleData.name}:`, error.message);
      }
    }
    console.log(`\n📊 Created ${createdRules.length} achievement rules\n`);

    // 2. Test listing instructor rules
    console.log("2️⃣ Testing Achievement Rule Listing:");
    const instructorRules = await AchievementRule.find({ targetType: "instructor" });
    console.log(`✅ Found ${instructorRules.length} instructor achievement rules`);
    instructorRules.forEach(rule => {
      console.log(`   - ${rule.name}: ${rule.description}`);
    });
    console.log();

    // 3. Test achievement preview with different metrics
    console.log("3️⃣ Testing Achievement Preview:");
    const testMetrics = [
      { rating: 4.0, monthsSinceJoining: 3, bookingCount: 25 },
      { rating: 4.6, monthsSinceJoining: 8, bookingCount: 75 },
      { rating: 4.9, monthsSinceJoining: 15, bookingCount: 150 }
    ];

    for (const metrics of testMetrics) {
      const eligibleAchievements = await instructorAchievementService.previewAchievements(metrics);
      console.log(`📋 Metrics: Rating=${metrics.rating}, Months=${metrics.monthsSinceJoining}, Bookings=${metrics.bookingCount}`);
      console.log(`   Eligible for ${eligibleAchievements.length} achievements:`);
      eligibleAchievements.forEach(ach => {
        console.log(`   - ${ach.name} ${ach.icon}`);
      });
      console.log();
    }

    // 4. Test CRUD operations
    console.log("4️⃣ Testing CRUD Operations:");
    
    // Update a rule
    if (createdRules.length > 0) {
      const ruleToUpdate = createdRules[0];
      const updatedRule = await AchievementRule.findByIdAndUpdate(
        ruleToUpdate._id,
        { description: "Updated description for testing" },
        { new: true }
      );
      console.log(`✅ Updated rule: ${updatedRule.name}`);
    }

    // Test filtering
    const activeRules = await AchievementRule.find({ 
      targetType: "instructor", 
      active: true 
    });
    console.log(`✅ Found ${activeRules.length} active instructor rules`);

    console.log("\n🎉 All tests completed successfully!");

    // Cleanup test data
    console.log("\n🧹 Cleaning up test data...");
    await AchievementRule.deleteMany({ name: { $in: testRules.map(r => r.name) } });
    console.log("✅ Test data cleaned up");

  } catch (error) {
    console.error("❌ Test failed:", error);
  }
}

// Example usage patterns
function showUsageExamples() {
  console.log("\n📚 Usage Examples:");
  console.log(`
// Admin creates a new instructor achievement rule
POST /api/achievement-rules/instructor
{
  "name": "Elite Instructor",
  "description": "Achieve 4.9+ rating with 200+ bookings",
  "targetType": "instructor",
  "metric": "rating",
  "threshold": 4.9,
  "instructorCriteria": {
    "minRating": 4.9,
    "minBookings": 200,
    "minMonthsSinceJoining": 12
  },
  "icon": "👑"
}

// Admin lists all instructor achievement rules
GET /api/achievement-rules/instructor

// Instructor evaluates their achievements
POST /api/achievement-rules/instructor/evaluate

// Admin evaluates specific instructor
POST /api/achievement-rules/instructor/evaluate/:instructorId

// Get instructor achievements
GET /api/achievement-rules/instructor/achievements/:instructorId

// Integration with booking completion:
import { instructorAchievementService } from './services/instructorAchievement.service.js';

// After a booking is completed
await instructorAchievementService.evaluateAfterBooking(instructorUserId);

// After instructor rating is updated
await instructorAchievementService.evaluateAfterRatingUpdate(instructorUserId);

// Scheduled daily evaluation (add to cron job)
await instructorAchievementService.scheduledEvaluation();
  `);
}

// If running this file directly
if (import.meta.url === `file://${process.argv[1]}`) {
  // Connect to MongoDB (you may need to adjust this)
  // mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/booking-web')
  //   .then(() => {
  //     console.log("Connected to MongoDB");
  //     return testInstructorAchievements();
  //   })
  //   .then(() => {
  //     showUsageExamples();
  //     process.exit(0);
  //   })
  //   .catch(error => {
  //     console.error("Error:", error);
  //     process.exit(1);
  //   });
  
  showUsageExamples();
}

export { testInstructorAchievements, showUsageExamples };