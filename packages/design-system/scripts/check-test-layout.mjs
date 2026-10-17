import { existsSync } from "node:fs";
import { readdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const testsDir = path.join(root, "tests");
const srcDir = path.join(root, "src");

const TEST_FILE = /\.test\.tsx?$/;
const SOURCE_EXTENSIONS = [".ts", ".tsx"];

const entries = await readdir(testsDir, { recursive: true, withFileTypes: true });
const tests = entries
  .filter((entry) => entry.isFile())
  .map((entry) => path.relative(testsDir, path.join(entry.parentPath, entry.name)))
  .sort();

const problems = tests.flatMap((test) => {
  if (!TEST_FILE.test(test)) {
    return [`${test} is not named *.test.ts or *.test.tsx`];
  }
  const base = path.join(srcDir, test.replace(TEST_FILE, ""));
  const found = SOURCE_EXTENSIONS.some((ext) => existsSync(base + ext));
  if (found) return [];
  const expected = path.relative(root, base);
  return [`tests/${test} has no source at ${expected}.ts or ${expected}.tsx`];
});

if (problems.length > 0) {
  console.error("Tests must mirror src exactly:");
  for (const problem of problems) console.error(`  ${problem}`);
  process.exit(1);
}

console.log(`${tests.length} test files mirror src`);
