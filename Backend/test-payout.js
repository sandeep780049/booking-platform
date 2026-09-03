#!/usr/bin/env node

// Test script for the payout system
import { processPayouts } from './controllers/transaction.controller.js';
import connectDB from './config/db.config.js';
import dotenv from 'dotenv';

dotenv.config({ path: './.env' });

async function testPayoutSystem() {
  console.log('🔧 Testing Payout System...');
  
  try {
    // Connect to database
    await connectDB();
    console.log('✅ Database connected');
    
    // Test the payout processing function
    console.log('🚀 Running payout processing test...');
    await processPayouts();
    console.log('✅ Payout processing test completed');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    process.exit(0);
  }
}

testPayoutSystem();
