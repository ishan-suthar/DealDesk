import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

function getAllFiles(dir: string, extFilter = ['.ts', '.tsx', '.js']): string[] {
  let results: string[] = [];
  if (!fs.existsSync(dir)) return results;
  const list = fs.readdirSync(dir);
  for (const file of list) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat && stat.isDirectory()) {
      if (file !== 'node_modules' && file !== '.next' && file !== '.git') {
        results = results.concat(getAllFiles(fullPath, extFilter));
      }
    } else {
      if (extFilter.some((ext) => file.endsWith(ext))) {
        results.push(fullPath);
      }
    }
  }
  return results;
}

describe('Security Verification Pass (AGENTS.md & M6)', () => {
  it('server-only LLM SDKs (@anthropic-ai/sdk, @google/genai) are never imported in client components', () => {
    const clientFiles = getAllFiles(path.resolve('src/components')).concat(
      getAllFiles(path.resolve('src/app'))
    );

    for (const file of clientFiles) {
      const content = fs.readFileSync(file, 'utf-8');
      if (content.includes("'use client'") || content.includes('"use client"')) {
        expect(content).not.toContain("from '@anthropic-ai/sdk'");
        expect(content).not.toContain('from "@anthropic-ai/sdk"');
        expect(content).not.toContain("from '@google/genai'");
        expect(content).not.toContain('from "@google/genai"');
      }
    }
  });

  it('no usage of dangerouslySetInnerHTML anywhere in src/', () => {
    const srcFiles = getAllFiles(path.resolve('src'));
    for (const file of srcFiles) {
      const content = fs.readFileSync(file, 'utf-8');
      expect(content).not.toContain('dangerouslySetInnerHTML');
    }
  });

  it('.env.example contains only template placeholders and no live secrets', () => {
    const envExamplePath = path.resolve('.env.example');
    expect(fs.existsSync(envExamplePath)).toBe(true);

    const content = fs.readFileSync(envExamplePath, 'utf-8');
    expect(content).toContain('RESEARCH_PROVIDER=demo');
    expect(content).toContain('ANTHROPIC_API_KEY=');
    expect(content).toContain('GEMINI_API_KEY=');

    // Confirm no real API keys are in example
    expect(content).not.toMatch(/sk-ant-[a-zA-Z0-9_-]{20,}/);
    expect(content).not.toMatch(/AIza[a-zA-Z0-9_-]{30,}/);
  });

  it('no secret API keys are committed in source code files', () => {
    const srcFiles = getAllFiles(path.resolve('src'));
    for (const file of srcFiles) {
      const content = fs.readFileSync(file, 'utf-8');
      expect(content).not.toMatch(/sk-ant-api03-[a-zA-Z0-9_-]{20,}/);
      expect(content).not.toMatch(/AIzaSy[a-zA-Z0-9_-]{30,}/);
    }
  });
});
