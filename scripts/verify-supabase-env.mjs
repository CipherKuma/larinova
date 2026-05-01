import fs from "node:fs";

const EXPECTED_REF = "afitpprgfsidrnrrhvzs";

const envFiles = [
  "app/.env",
  "app/.env.local",
  "landing/.env.local",
  "patient-portal/.env.local",
];

const vercelProjects = new Map([
  ["app/.vercel/project.json", "larinova-app"],
  ["landing/.vercel/project.json", "larinova-landing"],
  ["patient-portal/.vercel/project.json", "larinova-patient"],
]);

function readEnvRef(file) {
  if (!fs.existsSync(file)) return { ok: false, detail: "missing file" };
  const text = fs.readFileSync(file, "utf8");
  const match = text.match(/^NEXT_PUBLIC_SUPABASE_URL=(.*)$/m);
  if (!match) return { ok: false, detail: "missing NEXT_PUBLIC_SUPABASE_URL" };

  const value = match[1].trim().replace(/^["']|["']$/g, "");
  try {
    const ref = new URL(value).hostname.split(".")[0];
    return {
      ok: ref === EXPECTED_REF,
      detail: ref,
    };
  } catch {
    return { ok: false, detail: "invalid URL" };
  }
}

function readVercelProject(file, expectedName) {
  if (!fs.existsSync(file)) return { ok: false, detail: "missing file" };
  const project = JSON.parse(fs.readFileSync(file, "utf8"));
  return {
    ok: project.projectName === expectedName,
    detail: project.projectName ?? "missing projectName",
  };
}

let failed = false;

console.log(`Expected Supabase project ref: ${EXPECTED_REF}`);

for (const file of envFiles) {
  const result = readEnvRef(file);
  const mark = result.ok ? "OK" : "FAIL";
  console.log(`${mark} ${file}: ${result.detail}`);
  failed ||= !result.ok;
}

for (const [file, expectedName] of vercelProjects) {
  const result = readVercelProject(file, expectedName);
  const mark = result.ok ? "OK" : "FAIL";
  console.log(`${mark} ${file}: ${result.detail}`);
  failed ||= !result.ok;
}

if (failed) {
  process.exitCode = 1;
}
