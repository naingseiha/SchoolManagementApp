#!/usr/bin/env node

/**
 * UI Font Fix Script - Fixes only web UI components, NOT print/report styling
 *
 * This script:
 * 1. Adds font-moul to text-3xl/4xl/5xl (replaces font-black/font-bold)
 * 2. Adds font-koulen to text-2xl/xl (replaces font-black/font-bold/font-semibold)
 * 3. Skips report/print components to preserve their working fonts
 */

const fs = require('fs');
const path = require('path');

const config = {
  // Only target UI components, NOT reports/printing
  targetDirs: [
    'src/components/dashboard',
    'src/components/students',
    'src/components/classes',
    'src/components/teachers',
    'src/components/subjects',
    'src/components/schedule',
    'src/components/grades',
    'src/components/attendance',
    'src/components/modals',
    'src/components/layout',
    'src/components/mobile',
    'src/app'
  ],
  // Skip these directories (printing/reports work fine)
  skipDirs: [
    'src/components/reports',  // Skip all report components
    'src/app/reports',
    'node_modules',
    '.next',
    'dist',
    'build'
  ],
  dryRun: false,
};

let stats = {
  filesProcessed: 0,
  filesModified: 0,
  text3xlFixed: 0,
  text2xlFixed: 0,
  errors: 0,
};

function shouldSkipFile(filePath) {
  return config.skipDirs.some(dir => filePath.includes(dir));
}

function processFile(filePath) {
  if (shouldSkipFile(filePath)) {
    return;
  }

  try {
    let content = fs.readFileSync(filePath, 'utf8');
    const originalContent = content;
    let fileChanges = 0;

    // Fix text-3xl, text-4xl, text-5xl → font-moul
    const text3xlRegex = /(className\s*=\s*["'`][^"'`]*?)(text-(?:3xl|4xl|5xl))(\s+font-(?:black|bold))([^"'`]*?["'`])/g;
    content = content.replace(text3xlRegex, (match, prefix, textSize, fontWeight, suffix) => {
      if (!match.includes('font-moul')) {
        stats.text3xlFixed++;
        fileChanges++;
        return `${prefix}${textSize} font-moul${suffix}`;
      }
      return match;
    });

    // Also catch text-3xl/4xl/5xl without explicit font (add font-moul)
    const text3xlNoFontRegex = /(className\s*=\s*["'`][^"'`]*?)(text-(?:3xl|4xl|5xl))(?!\s+font-)([^"'`]*?["'`])/g;
    content = content.replace(text3xlNoFontRegex, (match, prefix, textSize, suffix) => {
      // Skip if already has a font class
      if (match.includes('font-')) return match;
      // Skip if it's an emoji or icon
      if (suffix.includes('🏆') || suffix.includes('⭐') || suffix.includes('🥇')) return match;

      stats.text3xlFixed++;
      fileChanges++;
      return `${prefix}${textSize} font-moul${suffix}`;
    });

    // Fix text-2xl, text-xl → font-koulen
    const text2xlRegex = /(className\s*=\s*["'`][^"'`]*?)(text-(?:2xl|xl))(\s+font-(?:black|bold|semibold))([^"'`]*?["'`])/g;
    content = content.replace(text2xlRegex, (match, prefix, textSize, fontWeight, suffix) => {
      if (!match.includes('font-koulen') && !match.includes('font-moul')) {
        stats.text2xlFixed++;
        fileChanges++;
        return `${prefix}${textSize} font-koulen${suffix}`;
      }
      return match;
    });

    // Also catch text-2xl/xl without explicit font (add font-koulen)
    const text2xlNoFontRegex = /(className\s*=\s*["'`][^"'`]*?)(text-(?:2xl|xl))(?!\s+font-)([^"'`]*?["'`])/g;
    content = content.replace(text2xlNoFontRegex, (match, prefix, textSize, suffix) => {
      // Skip if already has a font class
      if (match.includes('font-')) return match;
      // Skip emoji/icon elements
      if (suffix.includes('👨') || suffix.includes('👩') || suffix.includes('🏆')) return match;
      // Skip if it seems to be for icons/emoji based on context
      const fullMatch = match.toLowerCase();
      if (fullMatch.includes('icon') || fullMatch.includes('emoji')) return match;

      stats.text2xlFixed++;
      fileChanges++;
      return `${prefix}${textSize} font-koulen${suffix}`;
    });

    // Write changes if any
    if (fileChanges > 0) {
      if (!config.dryRun) {
        fs.writeFileSync(filePath, content, 'utf8');
      }
      stats.filesModified++;
      console.log(`✅ ${filePath.replace(process.cwd() + '/', '')} (${fileChanges} changes)`);
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

    if (shouldSkipFile(filePath)) {
      continue;
    }

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
  console.log('\n🎨 Khmer UI Font Fix Script\n');
  console.log('Target directories:', config.targetDirs.length, 'directories');
  console.log('Skipping:', config.skipDirs.join(', '));
  console.log('Dry run:', config.dryRun ? 'YES (no files will be modified)' : 'NO');
  console.log('\n' + '='.repeat(60) + '\n');

  // Find all files
  const allFiles = [];
  for (const dir of config.targetDirs) {
    const files = findFiles(dir);
    allFiles.push(...files);
  }

  console.log(`Found ${allFiles.length} UI files to process\n`);

  // Process each file
  for (const file of allFiles) {
    processFile(file);
  }

  // Print summary
  console.log('\n' + '='.repeat(60));
  console.log('\n📊 Summary:\n');
  console.log(`   Files processed:      ${stats.filesProcessed}`);
  console.log(`   Files modified:       ${stats.filesModified}`);
  console.log(`   text-3xl/4xl fixed:   ${stats.text3xlFixed}`);
  console.log(`   text-2xl/xl fixed:    ${stats.text2xlFixed}`);
  console.log(`   Total fixes:          ${stats.text3xlFixed + stats.text2xlFixed}`);
  console.log(`   Errors:               ${stats.errors}`);
  console.log('\n' + '='.repeat(60) + '\n');

  if (config.dryRun) {
    console.log('⚠️  DRY RUN - No files were actually modified');
    console.log('   Set config.dryRun = false to apply changes\n');
  } else {
    console.log('✨ UI font fixes applied successfully!');
    console.log('   Report/print components were not modified.\n');
  }
}

main().catch(error => {
  console.error('\n❌ Script failed:', error);
  process.exit(1);
});
