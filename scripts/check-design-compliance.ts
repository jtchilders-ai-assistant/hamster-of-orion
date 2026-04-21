#!/usr/bin/env npx tsx
/**
 * Design Compliance Checker
 * 
 * Extracts formulas and constants from design docs and compares them
 * against the implementation in src/game/constants.ts and other files.
 * 
 * Usage:
 *   npx tsx scripts/check-design-compliance.ts
 *   npx tsx scripts/check-design-compliance.ts --verbose
 *   npx tsx scripts/check-design-compliance.ts design/economy/factory-formulas.md
 */

import { readFileSync, readdirSync, statSync } from 'fs';
import { join, relative } from 'path';

const DESIGN_DIR = 'design';
const SRC_DIR = 'src/game';
const CONSTANTS_FILE = 'src/game/constants.ts';

interface Formula {
  doc: string;
  section: string;
  line: number;
  text: string;
  variables: string[];
}

interface Constant {
  name: string;
  value: string | number;
  file: string;
  line: number;
}

interface ComplianceIssue {
  type: 'missing_constant' | 'value_mismatch' | 'unimplemented_formula';
  doc: string;
  section?: string;
  expected?: string;
  found?: string;
  details: string;
}

// Extract formulas from design docs (lines with = and variables)
function extractFormulas(docPath: string): Formula[] {
  const content = readFileSync(docPath, 'utf-8');
  const lines = content.split('\n');
  const formulas: Formula[] = [];
  
  let currentSection = '';
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Track section headers
    if (line.startsWith('#')) {
      currentSection = line.replace(/^#+\s*/, '').trim();
      continue;
    }
    
    // Look for formula patterns: Variable = expression
    // Matches: Total_Production = Factories × Output
    // Matches: Hit% = 50 + (Attack - Defense) × 5
    const formulaMatch = line.match(/([A-Z][A-Za-z_]+)\s*=\s*(.+)/);
    if (formulaMatch) {
      const [, varName, expression] = formulaMatch;
      
      // Extract variable names from expression
      const variables = expression.match(/[A-Z][A-Za-z_]+/g) || [];
      
      formulas.push({
        doc: relative(process.cwd(), docPath),
        section: currentSection,
        line: i + 1,
        text: line.trim(),
        variables: [varName, ...variables],
      });
    }
  }
  
  return formulas;
}

// Extract constants from TypeScript files
function extractConstants(filePath: string): Constant[] {
  const content = readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');
  const constants: Constant[] = [];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Match: export const NAME = value;
    // Match: const NAME = value;
    const constMatch = line.match(/(?:export\s+)?const\s+([A-Z_][A-Z0-9_]*)\s*=\s*([^;]+)/);
    if (constMatch) {
      const [, name, rawValue] = constMatch;
      let value: string | number = rawValue.trim();
      
      // Try to parse numeric values
      const numValue = parseFloat(value);
      if (!isNaN(numValue) && value.match(/^[\d.]+$/)) {
        value = numValue;
      }
      
      constants.push({
        name,
        value,
        file: relative(process.cwd(), filePath),
        line: i + 1,
      });
    }
  }
  
  return constants;
}

// Find all markdown files in design/
function findDesignDocs(dir: string): string[] {
  const results: string[] = [];
  
  function walk(currentDir: string) {
    const entries = readdirSync(currentDir);
    for (const entry of entries) {
      const fullPath = join(currentDir, entry);
      const stat = statSync(fullPath);
      if (stat.isDirectory()) {
        walk(fullPath);
      } else if (entry.endsWith('.md')) {
        results.push(fullPath);
      }
    }
  }
  
  walk(dir);
  return results;
}

// Find all TypeScript files in src/game/
function findSourceFiles(dir: string): string[] {
  const results: string[] = [];
  
  function walk(currentDir: string) {
    const entries = readdirSync(currentDir);
    for (const entry of entries) {
      const fullPath = join(currentDir, entry);
      const stat = statSync(fullPath);
      if (stat.isDirectory()) {
        walk(fullPath);
      } else if (entry.endsWith('.ts') && !entry.endsWith('.test.ts')) {
        results.push(fullPath);
      }
    }
  }
  
  walk(dir);
  return results;
}

// Known constant mappings from design docs to code
const KNOWN_MAPPINGS: Record<string, string> = {
  // Economy
  'Factory_Output': 'FACTORY_OUTPUT_BASE',
  'Factory_Cost': 'FACTORY_COST_BASE',
  'Pop_Output': 'POP_WORKER_OUTPUT',
  'Base_Growth': 'BASE_GROWTH_RATE',
  
  // Combat
  'Base_Hit': 'BASE_HIT_CHANCE',
  'Hit_Modifier': 'HIT_SKILL_MODIFIER',
  
  // Trade
  'Trade_Ramp': 'TRADE_RAMP_TURNS',
};

function main() {
  const verbose = process.argv.includes('--verbose');
  const specificDoc = process.argv.find(arg => arg.endsWith('.md'));
  
  console.log('🔍 Design Compliance Checker\n');
  
  // Get design docs
  const docPaths = specificDoc 
    ? [specificDoc]
    : findDesignDocs(DESIGN_DIR);
  
  console.log(`📚 Found ${docPaths.length} design documents`);
  
  // Extract all formulas
  const allFormulas: Formula[] = [];
  for (const docPath of docPaths) {
    const formulas = extractFormulas(docPath);
    allFormulas.push(...formulas);
  }
  
  console.log(`📐 Found ${allFormulas.length} formulas in design docs`);
  
  // Extract constants from source
  const sourceFiles = findSourceFiles(SRC_DIR);
  const allConstants: Constant[] = [];
  for (const srcPath of sourceFiles) {
    const constants = extractConstants(srcPath);
    allConstants.push(...constants);
  }
  
  console.log(`📦 Found ${allConstants.length} constants in source files`);
  console.log('');
  
  // Check for issues
  const issues: ComplianceIssue[] = [];
  
  // Check that key formula variables have corresponding constants
  const constantNames = new Set(allConstants.map(c => c.name));
  
  for (const formula of allFormulas) {
    for (const varName of formula.variables) {
      const mappedName = KNOWN_MAPPINGS[varName];
      if (mappedName && !constantNames.has(mappedName)) {
        issues.push({
          type: 'missing_constant',
          doc: formula.doc,
          section: formula.section,
          expected: mappedName,
          details: `Formula uses ${varName} but ${mappedName} not found in constants`,
        });
      }
    }
  }
  
  // Print results
  if (verbose) {
    console.log('📐 Formulas found:');
    for (const formula of allFormulas) {
      console.log(`  ${formula.doc}:${formula.line} (${formula.section})`);
      console.log(`    ${formula.text}`);
    }
    console.log('');
    
    console.log('📦 Constants found:');
    for (const constant of allConstants) {
      console.log(`  ${constant.file}:${constant.line}`);
      console.log(`    ${constant.name} = ${constant.value}`);
    }
    console.log('');
  }
  
  if (issues.length > 0) {
    console.log('⚠️  Compliance Issues:');
    for (const issue of issues) {
      console.log(`  [${issue.type}] ${issue.doc}`);
      if (issue.section) console.log(`    Section: ${issue.section}`);
      console.log(`    ${issue.details}`);
    }
    process.exit(1);
  } else {
    console.log('✅ No obvious compliance issues found');
    console.log('');
    console.log('Note: This is a basic check. Manual review of formulas is still recommended.');
  }
}

main();
