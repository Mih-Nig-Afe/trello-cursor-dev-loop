#!/usr/bin/env node
import { loadConfig } from "../lib/env.js";
import { TrelloClient } from "../lib/trelloClient.js";

async function main() {
  const config = loadConfig();
  const trello = new TrelloClient(config);

  const me = await trello.getMe();
  console.log("Authenticated as:", me.fullName, `(@${me.username})`);

  const cards = await trello.getMyCards();
  console.log(`\nAssigned cards: ${cards.length}`);
  for (const card of cards.slice(0, 10)) {
    console.log(`  - [${card.id}] ${card.name}`);
  }

  const boards = await trello.getBoards();
  console.log(`\nOpen boards: ${boards.length}`);
  for (const board of boards.slice(0, 5)) {
    console.log(`  - [${board.id}] ${board.name}`);
  }
}

main().catch((err) => {
  console.error("Trello API test failed:", err.message);
  process.exit(1);
});
