// Simple script to check database connection and table structure
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
});

async function checkDatabase() {
  try {
    console.log('🔍 Checking database connection...');
    await prisma.$connect();
    console.log('✅ Database connection successful!');

    // Check if essays table exists and has data
    try {
      const essayCount = await prisma.essay.count();
      console.log(`📊 Found ${essayCount} essays in the database`);
    } catch (e) {
      console.error('❌ Error accessing essays table:', e.message);
    }

    // Check if users table exists and has data
    try {
      const userCount = await prisma.user.count();
      console.log(`👥 Found ${userCount} users in the database`);
    } catch (e) {
      console.error('❌ Error accessing users table:', e.message);
    }

    // Get current user from session (if possible)
    try {
      const user = await prisma.user.findFirst();
      if (user) {
        console.log('\n👤 Sample user data:');
        console.log(`- ID: ${user.id}`);
        console.log(`- Email: ${user.email}`);
        console.log(`- Created: ${user.createdAt}`);
      } else {
        console.log('\nℹ️ No users found in the database');
      }
    } catch (e) {
      console.error('❌ Error fetching user data:', e.message);
    }

    // Check environment variables
    console.log('\n🔧 Environment variables:');
    console.log(`- NODE_ENV: ${process.env.NODE_ENV || 'Not set'}`);
    console.log(`- DATABASE_URL: ${process.env.DATABASE_URL ? '✅ Set' : '❌ Not set'}`);
    
  } catch (error) {
    console.error('❌ Database check failed:', error);
    if (error.code === 'P1001') {
      console.error('\n🔌 Cannot connect to the database. Please check:');
      console.error('1. Is your database server running?');
      console.error('2. Is the DATABASE_URL in your .env file correct?');
      console.error('3. Do you have the correct database credentials?');
    }
  } finally {
    await prisma.$disconnect();
    process.exit(0);
  }
}

checkDatabase();
