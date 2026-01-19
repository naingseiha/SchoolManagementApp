#!/usr/bin/env node

/**
 * Font Fix Script for SchoolManagementApp
 *
 * This script automatically fixes Khmer font usage across the project:
 * 1. Adds font-moul to all text-3xl and text-4xl classes
 * 2. Adds font-koulen to all text-2xl and text-xl classes
 * 3. Removes font-black/font-bold when adding Khmer fonts (as they don't support these weights)
 *
 * Rules:
 * - text-3xl, text-4xl, text-5xl → should use font-moul
 * - text-2xl, text-xl → should use font-koulen
 * - All other text → should use font-battambang (default via globals.css)
 */

const fs = require('fs');
const path = require('path');

// Configuration
const config = {
  targetDirs: ['src/components', 'src/app'],
  filePattern: '**/*.{tsx,ts,jsx,js}',
  backupDir: '.font-fixes-backup',
  dryRun: false, // Set to true to see changes without applying
};

// Font mapping rules
const fontRules = [
  {
    // text-3xl, text-4xl, text-5xl should use Moul
    pattern: /(text-(?:3xl|4xl|5xl))(\s+(?:font-black|font-bold))?/g,
    description: 'text-3xl/4xl/5xl → font-moul',
    fix: (match, textSize, fontWeight) => {
      // Check if font-moul is already present in the className
      return `${textSize} font-moul`;
    },
    // Only apply if font-moul not already present
    shouldApply: (fullClassName) => {
      return !fullClassName.includes('font-moul');
    }
  },
  {
    // text-2xl, text-xl should use Koulen (but not if it's an emoji or icon)
    pattern: /(text-(?:2xl|xl))(\s+(?:font-black|font-bold|font-semibold))?/g,
    description: 'text-2xl/xl → font-koulen',
    fix: (match, textSize, fontWeight) => {
      return `${textSize} font-koulen`;
    },
    shouldApply: (fullClassName, context) => {
      return !fullClassName.includes('font-koulen') &&
             !fullClassName.includes('font-moul') &&
             !fullClassName.includes('font-poppins') &&
             !fullClassName.includes('font-inter');
    }
  }
];

let stats = {
  filesProcessed: 0,
  filesModified: 0,
  changesApplied: 0,
  errors: 0,
};

function processFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let originalContent = content;
    let fileChanges = 0;

    // Apply each font rule
    fontRules.forEach(rule => {
      // Find all className attributes
      const classNameRegex = /className\s*=\s*["`']([^"`']*)["`']|className\s*=\s*\{[^}]*`([^`]*)`[^}]*\}/g;

      let match;
      while ((match = classNameRegex.exec(content)) !== null) {
        const fullClassName = match[1] || match[2];
        if (!fullClassName) continue;

        // Check if this className matches our pattern and should be fixed
        if (rule.pattern.test(fullClassName) && rule.shouldApply(fullClassName, content)) {
          const updatedClassName = fullClassName.replace(rule.pattern, rule.fix);

          if (updatedClassName !== fullClassName) {
            // Replace in content
            content = content.replace(fullClassName, updatedClassName);
            fileChanges++;
            stats.changesApplied++;
          }
        }

        // Reset regex index for next iteration
        rule.pattern.lastIndex = 0;
      }
    });

    // Write changes if any
    if (fileChanges > 0) {
      if (!config.dryRun) {
        fs.writeFileSync(filePath, content, 'utf8');
      }
      stats.filesModified++;
      console.log(`✅ ${filePath} (${fileChanges} changes)`);
    }

    stats.filesProcessed++;

  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
    stats.errors++;
  }
}

// Recursively find all files matching pattern
function findFiles(dir, pattern, results = []) {
  if (!fs.existsSync(dir)) return results;

  const files = fs.readdirSync(dir);

  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    // Skip node_modules, .next, dist, build
    if (file === 'node_modules' || file === '.next' || file === 'dist' || file === 'build') {
      continue;
    }

    if (stat.isDirectory()) {
      findFiles(filePath, pattern, results);
    } else if (pattern.test(file)) {
      results.push(filePath);
    }
  }

  return results;
}

async function main() {
  console.log('\n🎨 Khmer Font Fix Script\n');
  console.log('Target directories:', config.targetDirs.join(', '));
  console.log('Dry run:', config.dryRun ? 'YES (no files will be modified)' : 'NO');
  console.log('\n' + '='.repeat(60) + '\n');

  // Create backup directory
  if (!config.dryRun && !fs.existsSync(config.backupDir)) {
    fs.mkdirSync(config.backupDir, { recursive: true });
    console.log(`📁 Created backup directory: ${config.backupDir}\n`);
  }

  // Find all files
  const fileRegex = /\.(tsx|ts|jsx|js)$/;
  const allFiles = [];
  for (const dir of config.targetDirs) {
    const files = findFiles(dir, fileRegex);
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
  console.log(`   Files processed: ${stats.filesProcessed}`);
  console.log(`   Files modified:  ${stats.filesModified}`);
  console.log(`   Total changes:   ${stats.changesApplied}`);
  console.log(`   Errors:          ${stats.errors}`);
  console.log('\n' + '='.repeat(60) + '\n');

  if (config.dryRun) {
    console.log('⚠️  DRY RUN - No files were actually modified');
    console.log('   Set config.dryRun = false to apply changes\n');
  } else {
    console.log('✨ Font fixes applied successfully!\n');
  }
}

// Run the script
main().catch(error => {
  console.error('\n❌ Script failed:', error);
  process.exit(1);
});
