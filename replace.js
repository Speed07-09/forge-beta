const fs = require('fs');
const path = require('path');

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(function(file) {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) { 
            results = results.concat(walk(file));
        } else { 
            if (file.endsWith('.tsx') || file.endsWith('.ts')) {
                results.push(file);
            }
        }
    });
    return results;
}

const files = walk('C:\\Users\\user\\Desktop\\Forge-app\\app');

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    
    // Replace rounded-none with rounded-3xl globally for everything (cards, generic containers)
    content = content.replace(/rounded-none/g, 'rounded-2xl');
    
    // Replace primary CTA style border-2 border-white to solid dark grey rounded pill
    content = content.replace(/border-2 border-white text-white hover:bg-white hover:text-black/g, 'bg-zinc-900 border border-zinc-800 text-white hover:bg-zinc-800 hover:border-zinc-700 rounded-full');
    
    // Note: the previous replace might add rounded-full alongside rounded-3xl if I just did it naively.
    // The current buttons had "rounded-none" first. So they became "rounded-3xl ... bg-zinc-900... rounded-full"
    // Let's clean up any double rounded rules.
    content = content.replace(/rounded-2xl(.+?)rounded-full/g, 'rounded-full$1');
    content = content.replace(/rounded-full(.+?)rounded-2xl/g, 'rounded-full$1');

    fs.writeFileSync(file, content, 'utf8');
    console.log('Processed', file);
});
