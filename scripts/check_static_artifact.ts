import assert from 'node:assert/strict';
import { readdir, readFile, stat } from 'node:fs/promises';
import { join, relative } from 'node:path';

const root = 'dist';
const html = await readFile(join(root, 'index.html'), 'utf8');
assert.match(html, /\/ERP_DAIRY\/assets\//, 'Built scripts and styles must use the GitHub Pages project base');
assert.match(html, /\/ERP_DAIRY\/manifest\.json/, 'Manifest must use the GitHub Pages project base');
assert.match(await readFile(join(root, 'manifest.json'), 'utf8'), /"start_url": "\.\/"/, 'Manifest start URL should be relative to its project path');

const files: string[] = [];
const visit = async (dir: string) => {
  for (const entry of await readdir(dir)) {
    const absolute = join(dir, entry);
    if ((await stat(absolute)).isDirectory()) await visit(absolute);
    else files.push(absolute);
  }
};
await visit(root);
const forbiddenFile = /(?:^|\/)(?:\.env(?:\..*)?|dev\.db|data_dump\.json|schema\.prisma|seed\.ts)$/i;
for (const file of files) assert.equal(forbiddenFile.test(relative(root, file)), false, `Private/backend file must not be published: ${relative(root, file)}`);

const forbiddenContent = [
  /DATABASE_URL/i,
  /JWT_SECRET/i,
  /Vikram Joshi|Rakesh Parmar|Priya Sharma|Suresh Parmar|Amul Cattle Feed Plant|Shreeji Dairy Distributors|Uflex Packaging Industries Ltd|D-Mart Supermarket Anand|Shri Ram Logistics Fleet Services|Mold-Tek Packaging Ltd/i,
  /04820200001844|384910293849|SBIN0004101|BARB0ANANDX/i,
  /10018021003456|24AAACC1209B1ZK/,
  /\+91\s?2692\s?245000/,
  /FSSAI Grade A/,
  /\+91 9825\d{6}|SBI-XXXX\d+/,
  /TXN-(?:IMPS|NEFT|REC|PEND)-884\d{2}/,
];
const sourceFixtures = await readFile('src/data/mockDairyData.ts', 'utf8');
const farmerNameList = sourceFixtures.match(/const farmerNames = \[([\s\S]*?)\];/)?.[1];
assert.ok(farmerNameList, 'Could not inspect the existing frontend farmer fixtures');
const existingFarmerNames = Array.from(farmerNameList.matchAll(/'([^']+)'/g), (match) => match[1]);
for (const file of files) {
  const content = await readFile(file, 'utf8').catch(() => '');
  for (const pattern of forbiddenContent) assert.equal(pattern.test(content), false, `Public artifact ${relative(root, file)} contains a blocked private/demo fixture pattern: ${pattern}`);
  for (const name of existingFarmerNames) assert.equal(content.includes(name), false, `Public artifact ${relative(root, file)} contains a non-synthetic farmer fixture: ${name}`);
}

console.log(`PASS: ${files.length} static files use the project base and no configured private fixture patterns were found.`);
