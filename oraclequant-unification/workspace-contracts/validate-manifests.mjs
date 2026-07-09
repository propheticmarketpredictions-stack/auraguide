import fs from 'fs';
import path from 'path';

const root = process.cwd();
const schemaPath = path.join(root, 'workspace-contracts', 'app-manifest.schema.json');
const schema = JSON.parse(fs.readFileSync(schemaPath, 'utf8'));
const required = new Set(schema.required || []);

const repoDirs = fs
  .readdirSync(root, { withFileTypes: true })
  .filter((d) => d.isDirectory() && fs.existsSync(path.join(root, d.name, '.git')))
  .map((d) => d.name)
  .sort((a, b) => a.localeCompare(b));

const errors = [];
const seenRepoNames = new Set();

for (const repo of repoDirs) {
  const manifestPath = path.join(root, repo, 'repo-manifest.json');
  if (!fs.existsSync(manifestPath)) {
    errors.push(`${repo}: missing repo-manifest.json`);
    continue;
  }

  let manifest;
  try {
    manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  } catch (error) {
    errors.push(`${repo}: invalid JSON (${error.message})`);
    continue;
  }

  for (const key of required) {
    if (!(key in manifest)) {
      errors.push(`${repo}: missing required field ${key}`);
    }
  }

  if (manifest.repo_name !== repo) {
    errors.push(`${repo}: repo_name mismatch (${manifest.repo_name})`);
  }

  if (seenRepoNames.has(manifest.repo_name)) {
    errors.push(`${repo}: duplicate repo_name ${manifest.repo_name}`);
  }
  seenRepoNames.add(manifest.repo_name);
}

if (errors.length) {
  console.error('Manifest validation failed:');
  for (const error of errors) {
    console.error(`- ${error}`);
  }
  process.exit(1);
}

console.log(`Validated ${repoDirs.length} manifests successfully.`);
