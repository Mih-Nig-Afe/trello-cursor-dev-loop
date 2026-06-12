import { readFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));

function parseEnvFile(content) {
  const env = {};
  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    env[key] = value;
  }
  return env;
}

function loadEnvFile(path) {
  if (!existsSync(path)) return;
  const parsed = parseEnvFile(readFileSync(path, "utf8"));
  for (const [key, value] of Object.entries(parsed)) {
    if (process.env[key] === undefined) {
      process.env[key] = value;
    }
  }
}

export function loadConfig() {
  const repoRoot = join(__dirname, "..", "..");
  loadEnvFile(join(repoRoot, ".env"));

  const apiKey = process.env.TRELLO_API_KEY;
  const token = process.env.TRELLO_TOKEN;

  if (!apiKey || !token) {
    throw new Error(
      "Missing TRELLO_API_KEY or TRELLO_TOKEN. Copy .env.example to .env and fill in your credentials."
    );
  }

  return {
    apiKey,
    token,
    boardId: process.env.TRELLO_BOARD_ID || null,
    listInProgress: process.env.TRELLO_LIST_IN_PROGRESS || null,
    listReview: process.env.TRELLO_LIST_REVIEW || null,
    listDone: process.env.TRELLO_LIST_DONE || null,
  };
}
