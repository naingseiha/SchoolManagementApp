#!/usr/bin/env node

/**
 * Fix Koulen Font Issue - Replace with Battambang Bold
 *
 * Koulen font doesn't render Khmer complex scripts correctly.
 * This script replaces font-koulen with font-battambang font-bold
 * for proper Khmer text rendering.
 */

const fs = require('fs');
const path = require('path');

const config = {
  targetDirs: [
    'src/components',
    'src/app'
  ],
  skipDirs: [
    'node_modules',
    '.next',
    'dist',
    'build'
  ],
};

let stats = {
  filesProcessed: 0,
  filesModified: 0,
  replacements: 0,
  errors: 0,
};

function shouldSkipFile(filePath) {
  return config.skipDirs.some(dir => filePath.includes(dir));
}

function processFile(filePath) {
  if (shouldSkipFile(filePath)) return;

  try {
    let content = fs.readFileSync(filePath, 'utf8');
    const originalContent = content;
    let fileChanges = 0;

    // Replace font-koulen with font-battambang font-bold
    // Pattern 1: "font-koulen" → "font-battambang font-bold"
    const pattern1 = /(\s+)font-koulen(\s)/g;
    content = content.replace(pattern1, (match, spaceBefore, spaceAfter) => {
      fileChanges++;
      stats.replacements++;
      return `${spaceBefore}font-battambang font-bold${spaceAfter}`;
    });

    // Pattern 2: At end of className (font-koulen")
    const pattern2 = /(\s+)font-koulen(["'`])/g;
    content = content.replace(pattern2, (match, spaceBefore, quote) => {
      fileChanges++;
      stats.replacements++;
      return `${spaceBefore}font-battambang font-bold${quote}`;
    });

    // Write changes if any
    if (fileChanges > 0) {
      fs.writeFileSync(filePath, content, 'utf8');
      stats.filesModified++;
      console.log(`✅ ${filePath.replace(process.cwd() + '/', '')} (${fileChanges} replacements)`);
    }

    stats.filesProcessed++;

  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
    stats.errors++;
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
  console.log('\n🔧 Fixing Koulen Font Issue\n');
  console.log('Replacing font-koulen → font-battambang font-bold');
  console.log('Reason: Koulen cannot render Khmer complex scripts correctly\n');
  console.log('='.repeat(60) + '\n');

  // Find all files
  const allFiles = [];
  for (const dir of config.targetDirs) {
    const files = findFiles(dir);
    allFiles.push(...files);
  }

  console.log(`Found ${allFiles.length} files to process\n`);

  // Process each file
  for (const file of allFiles) {
    processFile(file);
  }

  // Print summary
  console.log('\n' + '='.repeat(60));
  console.log('\n📊 Summary:\n');
  console.log(`   Files processed:       ${stats.filesProcessed}`);
  console.log(`   Files modified:        ${stats.filesModified}`);
  console.log(`   Total replacements:    ${stats.replacements}`);
  console.log(`   Errors:                ${stats.errors}`);
  console.log('\n' + '='.repeat(60) + '\n');

  console.log('✅ Koulen font issue fixed!');
  console.log('   All text should now render Khmer correctly.\n');
}

main().catch(error => {
  console.error('\n❌ Script failed:', error);
  process.exit(1);
});
