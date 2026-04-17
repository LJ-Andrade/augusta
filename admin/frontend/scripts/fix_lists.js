const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

let filesRaw;
try {
  filesRaw = execSync('dir /s /b *List.jsx', { cwd: 'e:/Vimana/proyecto_admin/adminpanel/src/views', encoding: 'utf-8' });
} catch (e) {
  console.error("Error finding files", e);
  process.exit(1);
}

const files = filesRaw.trim().split('\r\n').filter(f => !!f && !f.includes('Articles'));

for (const file of files) {
  let content = fs.readFileSync(file, 'utf-8');
  let original = content;

  // 1. Narrow the ID column header
  // <TableHead className="cursor-pointer select-none w-[80px]" or similar
  content = content.replace(/<TableHead\s+className="cursor-pointer select-none w-\[80px\]"/g, '<TableHead className="cursor-pointer select-none w-[60px]"');
  content = content.replace(/<TableCell className="py-2 w-\[80px\]">/g, '<TableCell className="py-2 w-[60px]">');
  content = content.replace(/<TableCell className="w-\[80px\]">/g, '<TableCell className="w-[60px]">');

  // 2. Narrow Date column header & cell, right aligned
  content = content.replace(/<TableHead\s+className="cursor-pointer select-none text-right w-\[140px\]"/g, '<TableHead className="cursor-pointer select-none text-right w-[110px]"');
  content = content.replace(/<TableCell className="py-2 text-right w-\[140px\]">/g, '<TableCell className="py-2 text-right w-[110px]">');
  content = content.replace(/<TableCell className="text-right w-\[140px\]">/g, '<TableCell className="text-right w-[110px]">');

  // Narrow actions header
  content = content.replace(/<TableHead className="text-right w-\[100px\]">/g, '<TableHead className="text-right w-[120px]">');

  // 3. Fix action cells
  // We need to replace different variations of action cells:
  content = content.replace(/<TableCell className="text-right space-x-2 py-2 w-\[100px\]">/g, '<TableCell className="text-right w-[120px]">');
  content = content.replace(/<TableCell className="text-right space-x-2 w-\[100px\]">/g, '<TableCell className="text-right w-[120px]">');
  content = content.replace(/<TableCell className="text-right py-2 w-\[100px\]">/g, '<TableCell className="text-right w-[120px]">');
  content = content.replace(/<TableCell className="text-right w-\[100px\]">/g, '<TableCell className="text-right w-[120px]">');

  // Now wrap the buttons inside the action cell
  const regex = /(<TableCell className="text-right w-\[120px\]">)([\s\S]*?)(<\/TableCell>)/g;
  
  content = content.replace(regex, (match, p1, p2, p3) => {
    if (p2.includes('<div className="flex items-center justify-end')) {
       return match;
    }
    // Remove leading/trailing whitespace to wrap correctly
    return p1 + '\n\t\t\t\t\t\t\t\t\t\t<div className="flex items-center justify-end gap-1 sm:gap-2">\n' + p2 + '\t\t\t\t\t\t\t\t\t\t</div>\n\t\t\t\t\t\t\t\t\t' + p3;
  });

  if (content !== original) {
    fs.writeFileSync(file, content, 'utf-8');
    console.log('Fixed ' + file);
  }
}
