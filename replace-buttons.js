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
    let original = content;

    // Change 'rounded-2xl py-4' to 'rounded-full py-4'
    content = content.replace(/rounded-2xl py-4/g, 'rounded-full py-4');
    // Change 'rounded-2xl py-3' to 'rounded-full py-3'
    content = content.replace(/rounded-2xl py-3/g, 'rounded-full py-3');
    // Change 'rounded-2xl border' which typically appears on buttons
    content = content.replace(/rounded-2xl border/g, 'rounded-full border');
    // Change 'rounded-2xl text-' typically on buttons or inputs
    content = content.replace(/rounded-2xl text-/g, 'rounded-full text-');

    if (content !== original) {
        fs.writeFileSync(file, content, 'utf8');
        console.log('Processed', file);
    }
});
