module.exports = {
  testEnvironment: 'node',
  coveragePathIgnorePatterns: ['/node_modules/'],
  setupFilesAfterEnv: ['./setup.js'],
  testTimeout: 15000
};