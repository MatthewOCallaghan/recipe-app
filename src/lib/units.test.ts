import { describe, expect, it } from 'vitest';
import { formatAmount, formatQty, normaliseAmount } from './units';

describe('formatQty', () => {
  it('drops a trailing .0 from whole numbers', () => {
    expect(formatQty(600)).toBe('600');
    expect(formatQty(2.0)).toBe('2');
  });

  it('keeps a single decimal place', () => {
    expect(formatQty(1.5)).toBe('1.5');
    expect(formatQty(1.44)).toBe('1.4');
    expect(formatQty(1.46)).toBe('1.5');
  });
});

describe('formatAmount', () => {
  it('runs metric units flush against the number', () => {
    expect(formatAmount(600, 'g')).toBe('600g');
    expect(formatAmount(600, 'ml')).toBe('600ml');
    expect(formatAmount(1.5, 'kg')).toBe('1.5kg');
  });

  it('spaces every other unit', () => {
    expect(formatAmount(2, 'tbsp')).toBe('2 tbsp');
    expect(formatAmount(1, 'pinch')).toBe('1 pinch');
  });

  it('renders a bare number for counted ingredients', () => {
    expect(formatAmount(3, '')).toBe('3');
  });
});

describe('normaliseAmount', () => {
  it('collapses kg and l into their base units', () => {
    expect(normaliseAmount(1, 'kg')).toEqual({ qty: 1000, unit: 'g' });
    expect(normaliseAmount(2, 'l')).toEqual({ qty: 2000, unit: 'ml' });
  });

  it('leaves units with no conversion alone', () => {
    expect(normaliseAmount(2, 'tbsp')).toEqual({ qty: 2, unit: 'tbsp' });
    expect(normaliseAmount(3, '')).toEqual({ qty: 3, unit: '' });
  });
});
