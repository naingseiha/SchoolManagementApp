#!/usr/bin/env node

/**
 * Koulen Font - Correct Fix
 *
 * Replace "font-battambang font-bold" with just "font-koulen"
 * Key insight: Koulen works perfectly WITHOUT bold modifier
 * The bold weight was breaking Khmer rendering!
 */

const fs = require('fs');
const path = require('path');

const config = {
  targetDirs: ['src/components', 'src/app'],
  skipDirs: ['node_modules', '.next', 'dist', 'build'],
};

let stats = {
  filesProcessed: 0,
  filesModified: 0,
  replacements: 0,
};

function shouldSkipFile(filePath) {
  return config.skipDirs.some(dir => filePath.includes(dir));
}

function processFile(filePath) {
  if (shouldSkipFile(filePath)) return;

  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let fileChanges = 0;

    // Replace "font-battambang font-bold" with "font-koulen"
    // This preserves Khmer rendering by using Koulen's default weight (400)

    // Pattern 1: "font-battambang font-bold " (with space after)
    const pattern1 = /font-battambang font-bold(\s)/g;
    const newContent1 = content.replace(pattern1, (match, space) => {
      fileChanges++;
      return `font-koulen${space}`;
    });

    // Pattern 2: "font-battambang font-bold" at end of className
    const pattern2 = /font-battambang font-bold(["'`])/g;
    const newContent2 = newContent1.replace(pattern2, (match, quote) => {
      fileChanges++;
      return `font-koulen${quote}`;
    });

    if (fileChanges > 0) {
      fs.writeFileSync(filePath, newContent2, 'utf8');
      stats.filesModified++;
      stats.replacements += fileChanges;
      console.log(`✅ ${filePath.replace(process.cwd() + '/', '')} (${fileChanges} changes)`);
    }

    stats.filesProcessed++;

  } catch (error) {
    console.error(`❌ ${filePath}:`, error.message);
  }
}

function findFiles(dir, results = []) {
  if (!fs.existsSync(dir)) return results;

  const files = fs.readdirSync(dir);

  for (const file of files) {
    const filePath = path.join(dir, file);
    if (shouldSkipFile(filePath)) continue;

    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      findFiles(filePath, results);
    } else if (/\.(tsx|ts|jsx|js)$/.test(file)) {
      results.push(filePath);
    }
  }

  return results;
}

async function main() {
  console.log('\n🎨 Koulen Font - Correct Fix\n');
  console.log('Replacing: font-battambang font-bold → font-koulen');
  console.log('Reason: Koulen works perfectly without bold modifier!\n');
  console.log('='.repeat(60) + '\n');

  const allFiles = [];
  for (const dir of config.targetDirs) {
    const files = findFiles(dir);
    allFiles.push(...files);
  }

  console.log(`Processing ${allFiles.length} files...\n`);

  for (const file of allFiles) {
    processFile(file);
  }

  console.log('\n' + '='.repeat(60));
  console.log('\n📊 Summary:\n');
  console.log(`   Files processed:    ${stats.filesProcessed}`);
  console.log(`   Files modified:     ${stats.filesModified}`);
  console.log(`   Replacements:       ${stats.replacements}`);
  console.log('\n' + '='.repeat(60) + '\n');
  console.log('✅ Koulen restored - now renders Khmer perfectly!\n');
}

main().catch(error => {
  console.error('\n❌ Failed:', error);
  process.exit(1);
});
