import { vi, expect } from 'vitest';
import matchers from '@testing-library/jest-dom/matchers';

expect.extend(matchers);


// ref: https://github.com/vitest-dev/vitest/issues/821

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});
