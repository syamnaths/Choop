import test from 'node:test';
import assert from 'node:assert/strict';
import { cities, isSupportedCity } from '../src/cities.js';
test('city list offers major Indian cities without duplicates', () => {
  for (const city of ['Mumbai', 'Delhi', 'Bengaluru', 'Chennai', 'Kolkata', 'Hyderabad', 'Pune', 'Ahmedabad']) assert.ok(cities.includes(city), city);
  assert.equal(new Set(cities).size, cities.length);
  assert.equal(isSupportedCity('Mumbai'), true);
  assert.equal(isSupportedCity(''), false);
  assert.equal(isSupportedCity('Unknown'), false);
});
