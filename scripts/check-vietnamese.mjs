import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const TARGET_DIR = path.join(ROOT, "src");
const FILE_EXTENSIONS = new Set([".ts", ".tsx"]);

const MOJIBAKE_RE = /(Ã.|á»|áº|Â·|Æ°|Ä)/;
const ASCII_VIETNAMESE_RE = /\b(khong|vui long|mo ta|tieu de|ngan sach|tuyen dung|de xuat|chap nhan|tu choi|quay lai|dang tai|thanh cong|khong the)\b/i;
const STRING_LITERAL_RE = /(["'`])(?:\\.|(?!\1)[\s\S])*?\1/g;

function walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === "node_modules" || entry.name === ".next") continue;
      files.push(...walk(fullPath));
      continue;
    }
    if (FILE_EXTENSIONS.has(path.extname(entry.name))) {
      files.push(fullPath);
    }
  }
  return files;
}

function getLineNumber(content, index) {
  return content.slice(0, index).split(/\r?\n/).length;
}

function shouldSkipLiteral(text) {
  const trimmed = text.trim();
  if (!trimmed) return true;
  if (/^https?:\/\//i.test(trimmed)) return true;
  if (/^[\w\-./:]+$/.test(trimmed)) return true;
  return false;
}

const files = walk(TARGET_DIR);
const errors = [];

for (const file of files) {
  const content = fs.readFileSync(file, "utf8");

  let mojibakeMatch;
  while ((mojibakeMatch = MOJIBAKE_RE.exec(content)) !== null) {
    errors.push({
      file,
      line: getLineNumber(content, mojibakeMatch.index),
      reason: "Có dấu hiệu lỗi mã hóa tiếng Việt (mojibake).",
      sample: mojibakeMatch[0],
    });
    break;
  }

  let stringMatch;
  while ((stringMatch = STRING_LITERAL_RE.exec(content)) !== null) {
    const raw = stringMatch[0];
    const text = raw.slice(1, -1);
    if (shouldSkipLiteral(text)) continue;

    if (ASCII_VIETNAMESE_RE.test(text)) {
      errors.push({
        file,
        line: getLineNumber(content, stringMatch.index),
        reason: "Phát hiện chuỗi tiếng Việt không dấu. Hãy dùng tiếng Việt có dấu.",
        sample: text.slice(0, 80),
      });
    }
  }
}

if (errors.length) {
  console.error("❌ Kiểm tra tiếng Việt thất bại:\n");
  for (const err of errors) {
    console.error(`- ${path.relative(ROOT, err.file)}:${err.line}`);
    console.error(`  ${err.reason}`);
    console.error(`  → ${err.sample}`);
  }
  process.exit(1);
}

console.log("✅ Kiểm tra tiếng Việt có dấu: OK");
