import test from 'node:test';
import assert from 'node:assert/strict';
import { demoBuyers, demoProperties } from '../app/demo.js';
import { matchBuyerToProperty, rankBuyersForProperty } from '../app/matching.js';

test('Lindqvist is a strong match for Villa Aurelia',()=>{const m=matchBuyerToProperty(demoBuyers[0],demoProperties[0]);assert.ok(m.score>=85);assert.equal(m.hardMismatch,false);});
test('Reinhardt ranks first for Villa Monteverde',()=>{const ranked=rankBuyersForProperty(demoProperties[2],demoBuyers);assert.equal(ranked[0].buyer.id,'b3');assert.ok(ranked[0].score>=85);});
test('cheap penthouse buyer is a hard mismatch for 14.5m estate',()=>{const m=matchBuyerToProperty(demoBuyers[4],demoProperties[2]);assert.equal(m.hardMismatch,true);});
test('Ashworth family ranks strongly for La Reserva Residence',()=>{const ranked=rankBuyersForProperty(demoProperties[5],demoBuyers);const ashworth=ranked.find((m)=>m.buyer.id==='b2');assert.ok(ashworth.score>=70);});
