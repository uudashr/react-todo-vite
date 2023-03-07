// Copyright 2004-present Facebook. All Rights Reserved.

import { describe, it, expect, vi } from 'vitest';


/**
 * This file illustrates how to define a custom mock per test.
 *
 * The file contains two test cases:
 * - One where the fruit module is mocked.
 * - One where the fruit module is not mocked.
 */
describe('define mock per test', () => {
  it('uses mocked module', async () => {
    vi.doMock('./fruit', () => ({
      apple: 'mocked apple',
      default: vi.fn(() => 'mocked fruit'),
      strawberry: vi.fn(() => 'mocked strawberry'),
    }));
    const {apple, strawberry, default: defaultExport} = await import('./fruit');

    const defaultExportResult = defaultExport();
    expect(defaultExportResult).toBe('mocked fruit');
    expect(defaultExport).toHaveBeenCalled();

    expect(apple).toBe('mocked apple');
    expect(strawberry()).toBe('mocked strawberry');
  });

  it('uses actual module', async () => {
    vi.doUnmock('./fruit');
    const {apple, strawberry, default: defaultExport} = await import('./fruit');

    const defaultExportResult = defaultExport();
    expect(defaultExportResult).toBe('banana');

    expect(apple).toBe('apple');
    expect(strawberry()).toBe('strawberry');
  });
});
