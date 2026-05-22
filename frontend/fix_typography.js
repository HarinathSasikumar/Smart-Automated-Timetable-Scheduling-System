import fs from 'fs';
import path from 'path';

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
  });
}

walkDir('./src/pages', (filePath) => {
  if (filePath.endsWith('.jsx')) {
    // Skip already manually processed files
    if (filePath.includes('Dashboard.jsx') || filePath.includes('Login.jsx')) return;

    let content = fs.readFileSync(filePath, 'utf8');
    
    // Fix typography weights for headings
    content = content.replace(/text-2xl font-bold/g, 'text-3xl font-black tracking-tight');
    content = content.replace(/text-xl font-semibold/g, 'text-2xl font-bold tracking-tight');
    
    // Fix low contrast grays/slates
    content = content.replace(/text-slate-400/g, 'text-slate-600');
    content = content.replace(/text-slate-500/g, 'text-slate-700');
    content = content.replace(/text-gray-400/g, 'text-slate-600 font-medium');
    content = content.replace(/text-gray-500/g, 'text-slate-700 font-semibold');
    content = content.replace(/text-gray-300/g, 'text-slate-500 font-medium');
    
    // Boost smaller typography readability
    content = content.replace(/text-xs /g, 'text-sm font-semibold tracking-wide ');
    content = content.replace(/text-\[10px\]/g, 'text-xs font-bold tracking-wider');
    
    // Ensure table headers and general text is bolder
    content = content.replace(/font-medium/g, 'font-semibold');
    
    // Additional UI specific fixes for Timetable cells & specific elements
    content = content.replace(/text-gray-400 bg-gray-50/g, 'text-slate-600 bg-slate-100 font-semibold');
    content = content.replace(/text-gray-900/g, 'text-slate-900');
    
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated typography in ${filePath}`);
  }
});
