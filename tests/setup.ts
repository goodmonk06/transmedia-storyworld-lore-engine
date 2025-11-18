import '@testing-library/jest-dom';
import { beforeAll, afterAll, afterEach } from 'vitest';

// Mock environment variables for tests
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test_db';
process.env.NODE_ENV = 'test';

beforeAll(() => {
  // Global test setup
});

afterEach(() => {
  // Clean up after each test
});

afterAll(() => {
  // Global test teardown
});
