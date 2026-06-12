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

  const testCardId = process.env.TRELLO_TEST_CARD_ID;
  const boardId = config.boardId || boards[0]?.id;

  let cardId = testCardId;
  if (!cardId && boardId) {
    const boardCards = await trello.getBoardCards(boardId);
    cardId = boardCards[0]?.id;
  }

  if (cardId) {
    console.log(`\nFull extraction test for card: ${cardId}`);
    const full = await trello.getCardFull(cardId);
    console.log("  Fields extracted:");
    console.log(`    desc: ${full.desc ? `${full.desc.slice(0, 60)}...` : "(empty)"}`);
    console.log(`    comments: ${full.comments.length}`);
    console.log(`    attachments: ${full.attachments.length}`);
    console.log(`    checklists: ${full.checklists.length}`);
    console.log(`    customFields: ${full.customFields.length}`);
    console.log(`    stickers: ${full.stickers.length}`);
    console.log(`    activity: ${full.activity.length}`);
    console.log(`    list: ${full.list?.name || full.list?.id}`);
    console.log(`    board: ${full.board?.name || full.board?.id}`);
  } else {
    console.log("\nNo card available for full extraction test.");
  }
}

main().catch((err) => {
  console.error("Trello API test failed:", err.message);
  process.exit(1);
});
