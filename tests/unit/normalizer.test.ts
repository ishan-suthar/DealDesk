import { describe, it, expect } from 'vitest';
import {
  canonicalizeUrl,
  deduplicateSources,
  normalizeCompanyName,
  generateDedupeKey,
  areDealsDuplicate,
} from '@/server/services/normalizer';

describe('normalizer service', () => {
  describe('canonicalizeUrl', () => {
    it('strips tracking parameters and utm tags', () => {
      const url = 'https://example.com/demo/article?utm_source=twitter&utm_medium=social&ref=partner&article_id=123';
      const canonical = canonicalizeUrl(url);
      expect(canonical).toBe('https://example.com/demo/article?article_id=123');
    });

    it('strips URL hash fragments', () => {
      const url = 'https://example.com/demo/filing#exhibit99-1';
      expect(canonicalizeUrl(url)).toBe('https://example.com/demo/filing');
    });

    it('strips trailing slashes from path', () => {
      const url = 'https://example.com/demo/page/';
      expect(canonicalizeUrl(url)).toBe('https://example.com/demo/page');
    });

    it('preserves clean URL', () => {
      const url = 'https://example.com/demo/clean-url';
      expect(canonicalizeUrl(url)).toBe('https://example.com/demo/clean-url');
    });
  });

  describe('deduplicateSources', () => {
    it('deduplicates sources by canonical URL preserving the first', () => {
      const raw = [
        { id: '1', url: 'https://example.com/demo/doc?utm_source=google' },
        { id: '2', url: 'https://example.com/demo/other' },
        { id: '3', url: 'https://example.com/demo/doc#section' },
      ];
      const deduped = deduplicateSources(raw);
      expect(deduped).toHaveLength(2);
      expect(deduped[0].id).toBe('1');
      expect(deduped[1].id).toBe('2');
    });
  });

  describe('normalizeCompanyName', () => {
    it('strips punctuation, common legal suffixes, and collapses whitespace', () => {
      expect(normalizeCompanyName('Harborline Foods, Inc.')).toBe('harborline foods');
      expect(normalizeCompanyName('Maple Crest Snacks Co.')).toBe('maple crest snacks');
      expect(normalizeCompanyName('Ostrander Holdings LLC')).toBe('ostrander');
      expect(normalizeCompanyName('Verity Beauty Group plc')).toBe('verity beauty');
    });
  });

  describe('generateDedupeKey', () => {
    it('generates consistent dedupeKey regardless of buyer/target ordering', () => {
      const key1 = generateDedupeKey(['Harborline Foods Inc'], ['Maple Crest Snacks Co'], '2026-03-15');
      const key2 = generateDedupeKey(['Harborline Foods'], ['Maple Crest Snacks'], '2026-03-28');
      expect(key1).toBe('harborline foods|maple crest snacks|2026-03');
      expect(key2).toBe('harborline foods|maple crest snacks|2026-03');
    });
  });

  describe('areDealsDuplicate', () => {
    it('identifies deals with identical normalized names within 10 days as duplicate', () => {
      const dealA = {
        buyers: ['Harborline Foods Inc.'],
        targets: ['Maple Crest Snacks'],
        announcementDate: '2026-04-01',
      };
      const dealB = {
        buyers: ['Harborline Foods'],
        targets: ['Maple Crest Snacks Co.'],
        announcementDate: '2026-04-08',
      };
      expect(areDealsDuplicate(dealA, dealB)).toBe(true);
    });

    it('rejects deals exceeding 10 days gap', () => {
      const dealA = {
        buyers: ['Harborline Foods'],
        targets: ['Maple Crest Snacks'],
        announcementDate: '2026-04-01',
      };
      const dealB = {
        buyers: ['Harborline Foods'],
        targets: ['Maple Crest Snacks'],
        announcementDate: '2026-04-20',
      };
      expect(areDealsDuplicate(dealA, dealB)).toBe(false);
    });
  });
});
