import test from 'node:test';
import assert from 'node:assert/strict';
import { demoBuyers, demoProperties } from '../app/demo.js';
import { getContactQueue, getOpportunitySummary, matchBuyerToProperty, rankBuyersForProperty } from '../app/matching.js';

test('Lindqvist is a strong match for Villa Aurelia',()=>{const m=matchBuyerToProperty(demoBuyers[0],demoProperties[0]);assert.ok(m.score>=85);assert.equal(m.hardMismatch,false);});
test('Reinhardt ranks first for Villa Monteverde',()=>{const ranked=rankBuyersForProperty(demoProperties[2],demoBuyers);assert.equal(ranked[0].buyer.id,'b3');assert.ok(ranked[0].score>=85);});
test('cheap penthouse buyer is a hard mismatch for 14.5m estate',()=>{const m=matchBuyerToProperty(demoBuyers[4],demoProperties[2]);assert.equal(m.hardMismatch,true);});
test('Ashworth family ranks strongly for La Reserva Residence',()=>{const ranked=rankBuyersForProperty(demoProperties[5],demoBuyers);const ashworth=ranked.find((m)=>m.buyer.id==='b2');assert.ok(ashworth.score>=70);});

test('contact queue excludes paused and hard-mismatch buyers',()=>{const queue=getContactQueue(demoProperties[5],demoBuyers);assert.equal(queue.some((m)=>m.buyer.status==='paused'),false);assert.equal(queue.some((m)=>m.hardMismatch),false);assert.equal(queue.every((m)=>m.score>=70),true);});
test('contact queue removes buyers already processed for this property',()=>{const property=demoProperties[0];const initial=getContactQueue(property,demoBuyers);assert.ok(initial.length>0);const buyerId=initial[0].buyer.id;const queue=getContactQueue(property,demoBuyers,[{propertyId:property.id,buyerId,status:'contacted'}]);assert.equal(queue.some((m)=>m.buyer.id===buyerId),false);});
test('contact queue is capped even with a large buyer database',()=>{const template=demoBuyers[0];const buyers=Array.from({length:2000},(_,index)=>({...template,id:`bulk-${index}`,name:`Buyer ${index}`}));const queue=getContactQueue(demoProperties[0],buyers);assert.equal(queue.length,15);});
test('opportunity summary counts processed buyers separately',()=>{const property=demoProperties[0];const queue=getContactQueue(property,demoBuyers);const action={propertyId:property.id,buyerId:queue[0].buyer.id,status:'interested'};const summary=getOpportunitySummary(property,demoBuyers,[action]);assert.equal(summary.processed,1);assert.ok(summary.analyzed>=summary.queueCount);});

test('opportunity summary categories never exceed analyzed buyers',()=>{const property=demoProperties[5];const summary=getOpportunitySummary(property,demoBuyers);assert.ok(summary.queueCount+summary.overflow+summary.processed+summary.automaticallyDiscarded<=summary.analyzed);});
