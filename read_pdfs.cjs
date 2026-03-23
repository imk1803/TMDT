// Lightweight PDF text extraction — only scan first 200KB of each file for embedded text
const fs = require('fs');
const path = require('path');

const dir = 'd:\\Fast-Job-main';

// Get all PDF files
const files = fs.readdirSync(dir).filter(f => f.endsWith('.pdf'));

for (const file of files) {
  const filePath = path.join(dir, file);
  const stat = fs.statSync(filePath);
  
  process.stdout.write('\n' + '='.repeat(60) + '\n');
  process.stdout.write('FILE: ' + file + '\n');
  process.stdout.write('SIZE: ' + Math.round(stat.size/1024) + 'KB\n');
  process.stdout.write('='.repeat(60) + '\n');
  
  try {
    // Read limited bytes
    const fd = fs.openSync(filePath, 'r');
    const CHUNK = 400 * 1024; // 400KB
    const buf = Buffer.alloc(Math.min(CHUNK, stat.size));
    fs.readSync(fd, buf, 0, buf.length, 0);
    fs.closeSync(fd);
    
    // Extract printable text sequences (PDF text objects appear between BT and ET)
    const raw = buf.toString('latin1');
    
    // Method 1: Find text between parentheses (PDF Tj/TJ operators)
    const matches = raw.match(/\(([^\)]{2,200})\)/g) || [];
    const texts = matches
      .map(m => m.slice(1, -1))
      .filter(t => /[a-zA-ZÀ-ÿ\u0100-\u017F]{3,}/.test(t))
      .map(t => t.replace(/\\n/g, '\n').replace(/\\r/g, '').trim());
    
    if (texts.length > 0) {
      process.stdout.write('EXTRACTED CONTENT:\n');
      const unique = [...new Set(texts)];
      unique.forEach(t => process.stdout.write('  • ' + t + '\n'));
    } else {
      process.stdout.write('NO TEXT LAYER FOUND (likely image-based PDF)\n');
    }
    
  } catch(e) {
    process.stdout.write('ERROR: ' + e.message + '\n');
  }
}
