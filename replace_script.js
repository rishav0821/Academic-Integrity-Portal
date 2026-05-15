const fs = require('fs');
const path = require('path');
const file = path.join('d:\\\\MProject-main-main\\\\MProject-main-main\\\\academic-integrity-frontend\\\\src\\\\pages\\\\Dashboard.jsx');
const content = fs.readFileSync(file, 'utf8').split('\n');

let out = '';
for (let i = 0; i < content.length; i++) {
    if (content[i].includes('Academic Warnings')) {
        for (let j = Math.max(0, i - 5); j <= Math.min(content.length - 1, i + 5); j++) {
            out += j + ": `" + content[j] + "`\n";
        }
        break;
    }
}
fs.writeFileSync('d:\\\\MProject-main-main\\\\MProject-main-main\\\\logs.txt', out);
