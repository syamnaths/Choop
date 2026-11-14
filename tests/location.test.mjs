import test from 'node:test';
import assert from 'node:assert/strict';
import { nearestCity } from '../src/location.js';
test('finds a supported nearby city and rejects distant, invalid or imprecise readings',()=>{
 assert.equal(nearestCity(19.076,72.8777,100),'Mumbai');
 assert.equal(nearestCity(12.9716,77.5946,100),'Bengaluru');
 assert.equal(nearestCity(0,0,100),null);
 assert.equal(nearestCity(19.076,72.8777,50000),null);
 assert.equal(nearestCity(NaN,72.8,100),null);
});
