// Copyright 2004-present Facebook. All Rights Reserved.

import { it, expect, vi } from 'vitest';

/**
 * This file illustrates how to do a partial mock where a subset
 * of a module's exports have been mocked and the rest
 * keep their actual implementation.
 */
import defaultExport, { apple, strawberry } from './fruit';

vi.mock('./fruit', async () => {
  const originalModule = await vi.importActual('./fruit');
  const mockedModule = vi.importMock('./fruit');

  //Mock the default export and named export 'apple'.
  return {
    ...mockedModule,
    ...originalModule,
    apple: 'mocked apple',
    default: vi.fn(() => 'mocked fruit'),
  };
});

it('does a partial mock', () => {
  const defaultExportResult = defaultExport();
  expect(defaultExportResult).toBe('mocked fruit');
  expect(defaultExport).toHaveBeenCalled();

  expect(apple).toBe('mocked apple');
  expect(strawberry()).toBe('strawberry');
});
