require('dotenv').config();
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongoServer;

// Connect to test database before all tests
beforeAll(async () => {
  // Create an in-memory MongoDB instance
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  
  // Disconnect from any existing connections
  await mongoose.disconnect();
  
  // Connect to the in-memory database
  await mongoose.connect(mongoUri);
});

// Clean up and close connection after all tests
afterAll(async () => {
  try {
    // Drop all collections in the test database
    const collections = await mongoose.connection.db.collections();
    for (let collection of collections) {
      await collection.deleteMany({});
    }
    
    // Close mongoose connection
    await mongoose.connection.close();
    
    // Stop the in-memory server
    await mongoServer.stop();
    
    // Clear any remaining timers
    jest.useRealTimers();
  } catch (error) {
    console.error('Error during test cleanup:', error);
  }
});

// Reset timers before each test
beforeEach(() => {
  jest.useFakeTimers();
});

// Clear timers after each test
afterEach(() => {
  jest.useRealTimers();
}); 