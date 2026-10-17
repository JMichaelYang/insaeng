import { existsSync } from "node:fs";
import { readdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const PACKAGES = [
  { dir: "packages/design-system", tests: "tests", source: "src" },
  { dir: "apps/web", tests: "tests", source: "app", required: /^page\.tsx$/ },
];

const TEST_FILE = /\.(test|spec)\.tsx?$/;
const SOURCE_EXTENSIONS = [".ts", ".tsx"];
const ARTIFACT_DIRS = new Set(["__screenshots__"]);

async function files(dir) {
  if (!existsSync(dir)) return [];
  const entries = await readdir(dir, { recursive: true, withFileTypes: true });
  return entries
    .filter((entry) => entry.isFile())
    .map((entry) => path.relative(dir, path.join(entry.parentPath, entry.name)))
    .filter((file) => !file.split(path.sep).some((part) => ARTIFACT_DIRS.has(part)))
    .sort();
}

const problems = [];
let checked = 0;

for (const pkg of PACKAGES) {
  const testsDir = path.join(root, pkg.dir, pkg.tests);
  const sourceDir = path.join(root, pkg.dir, pkg.source);
  const tests = await files(testsDir);
  checked += tests.length;

  for (const test of tests) {
    const testPath = path.join(pkg.dir, pkg.tests, test);
    if (!TEST_FILE.test(test)) {
      problems.push(`${testPath} is not named *.test.ts(x) or *.spec.ts(x)`);
      continue;
    }
    const base = path.join(sourceDir, test.replace(TEST_FILE, ""));
    if (SOURCE_EXTENSIONS.some((ext) => existsSync(base + ext))) continue;
    const expected = path.relative(root, base);
    problems.push(`${testPath} has no source at ${expected}.ts or ${expected}.tsx`);
  }

  if (!pkg.required) continue;
  for (const source of await files(sourceDir)) {
    if (!pkg.required.test(path.basename(source))) continue;
    const stem = source.replace(/\.tsx?$/, "");
    const tested = tests.some((test) => test.replace(TEST_FILE, "") === stem);
    if (tested) continue;
    const sourcePath = path.join(pkg.dir, pkg.source, source);
    problems.push(`${sourcePath} has no test at ${path.join(pkg.dir, pkg.tests, stem)}.spec.ts`);
  }
}

if (problems.length > 0) {
  console.error("Tests must mirror their source folders exactly:");
  for (const problem of problems) console.error(`  ${problem}`);
  process.exit(1);
}

console.log(`${checked} test files mirror their source folders`);
