module.exports = {
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
  testEnvironment: 'node',
  verbose: true,
  clearMocks: true,
  restoreMocks: true,
  resetMocks: true,
  testTimeout: 60000,
  forceExit: true,
  detectOpenHandles: true,
  testEnvironmentOptions: {
    url: 'http://localhost'
  }
}; 