import { describe, it, expect } from 'vitest';
import { managementMetrics } from './metrics';
import { demoSprints, DEMO_NOW } from './demo';

describe('Management metrics',()=>{
  it('counts accepted improvements once and distributes the forecast consistently',()=>{
    const m=managementMetrics(demoSprints,DEMO_NOW);
    expect(m.teams).toBe(12);
    expect(m.delivered).toHaveLength(18);
    expect(m.forecast).toHaveLength(10);
    expect(m.weeks.reduce((n,w)=>n+w.safe+w.risk,0)).toBe(10);
    expect(m.systems.reduce((n,s)=>n+s.count,0)).toBe(18);
    expect(m.decisions).toHaveLength(2);
  });
  it('does not use update date, invoicing or macro records as evidence of acceptance',()=>{
    const base=demoSprints[0];
    const m=managementMetrics([
      {...base,code:'unknown',lane:'completed',lastUpdated:'2026-07-10',invoicedAt:'2026-07-10'},
      {...base,code:'MACRO-X',acceptedAt:'2026-07-10'},
      {...base,code:'accepted',acceptedAt:'2026-07-31'},
      {...base,code:'august',acceptedAt:'2026-08-01'},
    ],DEMO_NOW);
    expect(m.delivered.map(s=>s.code)).toEqual(['accepted']);
    expect(m.missingAcceptance).toBe(1);
  });
});
