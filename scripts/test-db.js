// scripts/test-db.js
import dotenv from 'dotenv';
import { MongoClient } from 'mongodb';

// Load environment variables
dotenv.config({ path: '.env.local' });

async function testConnection() {
  const uri = process.env.MONGODB_URI;
  
  if (!uri) {
    console.error('❌ MONGODB_URI is not defined in .env.local');
    process.exit(1);
  }

  // Extract and display username (for debugging)
  let username = 'unknown';
  try {
    const match = uri.match(/\/\/([^:]+):([^@]+)@/);
    if (match) {
      username = match[1];
      console.log('📝 Username from URI:', username);
    }
  } catch (e) {
    // Ignore parsing errors
  }

  console.log('Testing connection to MongoDB...');
  console.log('URI (hidden):', uri.replace(/\/\/([^:]+):([^@]+)@/, '//***:***@'));
  
  // Parse URI to show cluster info
  try {
    const match = uri.match(/mongodb\+srv:\/\/[^@]+@([^/?]+)/);
    if (match) {
      console.log('Cluster:', match[1]);
    }
  } catch (e) {
    // Ignore parsing errors
  }

  const client = new MongoClient(uri, {
    serverSelectionTimeoutMS: 5000,
    connectTimeoutMS: 10000,
    authSource: 'admin', // Important: forces authentication against admin database
  });

  try {
    await client.connect();
    console.log('✅ Successfully connected to MongoDB!');
    
    // List databases to verify access
    const databases = await client.db().admin().listDatabases();
    console.log('📚 Available databases:', databases.databases.map(db => db.name).join(', '));
    
  } catch (error) {
    console.error('❌ Connection failed!');
    console.error('Error message:', error.message);
    
    if (error.message.includes('authentication failed')) {
      console.error('\n🔐 AUTHENTICATION FAILED - Troubleshooting:');
      console.error('1. Verify username and password in your .env.local file');
      console.error(`2. Current username: ${username}`);
      console.error('3. Make sure this user exists in MongoDB Atlas → Database Access');
      console.error('4. Try resetting the password in MongoDB Atlas');
      console.error('5. Create a new user with a simple password to test');
      console.error('\n📝 Quick fix steps:');
      console.error('   - Go to https://cloud.mongodb.com');
      console.error('   - Select your project and cluster');
      console.error('   - Click "Database Access" in left sidebar');
      console.error('   - Create a new user or reset password for existing user');
      console.error('   - Update your .env.local with new credentials');
      console.error('   - Restart the test script');
    } else if (error.message.includes('ENOTFOUND')) {
      console.error('\n🌐 NETWORK ERROR:');
      console.error('1. Check your internet connection');
      console.error('2. Verify the cluster name is correct');
    }
    
    console.error('\nFull error:', error);
  } finally {
    await client.close();
  }
}

testConnection();