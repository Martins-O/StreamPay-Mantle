#!/usr/bin/env node
import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs';
import { join } from 'path';

// Rebranding replacements
const replacements = [
  // Brand names
  { from: /Mantle StreamYield/g, to: 'Liquifi' },
  { from: /StreamYield/g, to: 'Liquifi' },
  { from: /StreamPay Mantle/g, to: 'Liquifi' },
  { from: /StreamPay/g, to: 'Liquifi' },

  // Taglines and descriptions
  { from: /Real-time crypto payment streaming/g, to: 'Instant liquidity for future revenue' },
  { from: /AI-powered tokenized cashflow \+ yield streaming protocol for real-world businesses on Mantle/g, to: 'AI-powered revenue streaming protocol' },
  { from: /RealFi \+ AI streaming/g, to: 'Instant liquidity' },
  { from: /Stream crypto payments in real time/g, to: 'Transform future revenue into instant capital' },
  { from: /Stream tokens by the second/g, to: 'Liquidity on demand' },
  { from: /Real-time crypto payment streaming on the Mantle Sepolia Testnet/g, to: 'Instant liquidity for future revenue on Mantle L2' },

  // Product descriptions
  { from: /turns invoices, rent, or subscription ARR into live on-chain cashflow/g, to: 'transforms future revenue into instant capital with AI-powered risk management' },
  { from: /RevenueTokens fund a shared YieldPool while the AI Risk Oracle signs updated exposure in real time/g, to: 'Businesses tokenize cashflows, investors provide liquidity, everyone earns from real revenue streams' },

  // Operations and console names
  { from: /StreamYield Ops Console/g, to: 'Liquifi Operations Console' },
  { from: /StreamYield handles the heavy lifting/g, to: 'Liquifi handles the heavy lifting' },
  { from: /Mantle StreamYield removes the friction/g, to: 'Liquifi removes the friction' },
  { from: /Mantle StreamYield packages underwriting/g, to: 'Liquifi packages underwriting' },
  { from: /Launch Mantle StreamYield/g, to: 'Launch Liquifi' },

  // Embed references
  { from: /Embed StreamYield/g, to: 'Embed Liquifi' },
];

function rebrandFile(filePath) {
  try {
    let content = readFileSync(filePath, 'utf8');
    let modified = false;

    for (const { from, to } of replacements) {
      if (from.test(content)) {
        content = content.replace(from, to);
        modified = true;
      }
    }

    if (modified) {
      writeFileSync(filePath, content, 'utf8');
      console.log(`✅ Updated: ${filePath}`);
      return 1;
    }
    return 0;
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
    return 0;
  }
}

function processDirectory(dirPath, extensions = ['.tsx', '.ts', '.jsx', '.js', '.css']) {
  let filesUpdated = 0;

  const items = readdirSync(dirPath);

  for (const item of items) {
    const fullPath = join(dirPath, item);
    const stat = statSync(fullPath);

    if (stat.isDirectory()) {
      // Skip node_modules and build directories
      if (!['node_modules', 'dist', 'build', '.git'].includes(item)) {
        filesUpdated += processDirectory(fullPath, extensions);
      }
    } else if (stat.isFile()) {
      // Process files with matching extensions
      if (extensions.some(ext => fullPath.endsWith(ext))) {
        filesUpdated += rebrandFile(fullPath);
      }
    }
  }

  return filesUpdated;
}

// Main execution
console.log('🌊 Starting Liquifi Rebranding Script...\n');

const frontendSrc = './frontend/src';
const filesUpdated = processDirectory(frontendSrc);

console.log(`\n✨ Rebranding complete! Updated ${filesUpdated} files.`);
console.log('\nNext steps:');
console.log('1. Review changes: git diff');
console.log('2. Test frontend: cd frontend && npm run dev');
console.log('3. Commit changes: git add -A && git commit -m "rebrand(ui): complete Liquifi rebrand across all pages"');
