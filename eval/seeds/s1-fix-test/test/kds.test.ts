import { test } from 'node:test';
import assert from 'node:assert';
import { canTransition } from '../src/kds.ts';
test('pending -> cooking ได้', () => assert.equal(canTransition('pending','cooking'), true));
test('cooking -> ready ได้', () => assert.equal(canTransition('cooking','ready'), true));
test('pending ห้ามข้ามไป ready', () => assert.equal(canTransition('pending','ready'), false));
test('ready เป็น terminal', () => assert.equal(canTransition('ready','cooking'), false));
