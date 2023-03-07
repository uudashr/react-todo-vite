// Copyright 2004-present Facebook. All Rights Reserved.

import { it, vi } from 'vitest';
import defaultExport, {apple, strawberry} from './fruit';

/**
 * This file illustrates a full mock of a module.
 */
vi.mock('./fruit');

it('does a full mock', () => {
  expect(defaultExport()).toBe(undefined);
  expect(apple).toBe('apple');
  expect(strawberry()).toBe(undefined);
});
