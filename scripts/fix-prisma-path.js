#!/usr/bin/env node
// Fix Prisma client path issue by creating .prisma/client/default directory
const fs = require('fs');
const path = require('path');

const sourceDir = path.join(__dirname, '../node_modules/.prisma/client');
const targetDir = path.join(__dirname, '../.prisma/client');
const defaultTargetDir = path.join(targetDir, 'default');

// Prisma 7 generates client files directly in node_modules/.prisma/client
// We need to create .prisma/client/default that exports from the parent
if (fs.existsSync(sourceDir)) {
  // Create parent directory
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }
  
  // Remove old default directory if it exists
  if (fs.existsSync(defaultTargetDir)) {
    fs.rmSync(defaultTargetDir, { recursive: true, force: true });
  }
  
  // Create default directory
  fs.mkdirSync(defaultTargetDir, { recursive: true });
  
  // Create index.js that exports from parent
  // Try client.js first, then client.ts (for TypeScript)
  const indexPath = path.join(defaultTargetDir, 'index.js');
  const clientJsPath = path.join(targetDir, 'client.js');
  const clientTsPath = path.join(targetDir, 'client.ts');
  
  let indexContent;
  if (fs.existsSync(clientJsPath)) {
    indexContent = `// Export PrismaClient from parent client.js
module.exports = require('../client.js');
`;
  } else if (fs.existsSync(clientTsPath)) {
    // For TypeScript, we need to use a different approach
    // Import the TypeScript file directly (Next.js/Turbopack handles this)
    indexContent = `// Export PrismaClient from parent client.ts
module.exports = require('../client.ts');
`;
  } else {
    // Fallback: try to require the directory itself
    indexContent = `// Export PrismaClient from parent
const path = require('path');
const parentPath = path.resolve(__dirname, '..');
module.exports = require(parentPath);
`;
  }
  fs.writeFileSync(indexPath, indexContent);
  
  // Also copy all files from source to target for compatibility
  function copyDir(src, dest) {
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true });
    }
    
    const entries = fs.readdirSync(src, { withFileTypes: true });
    
    for (const entry of entries) {
      const srcPath = path.join(src, entry.name);
      const destPath = path.join(dest, entry.name);
      
      // Skip default directory if it exists in source
      if (entry.name === 'default') continue;
      
      if (entry.isDirectory()) {
        copyDir(srcPath, destPath);
      } else {
        fs.copyFileSync(srcPath, destPath);
      }
    }
  }
  
  copyDir(sourceDir, targetDir);
  console.log('✅ Fixed Prisma client path');
} else {
  console.log('⚠️  Prisma client not found, run "npm run db:generate" first');
}
