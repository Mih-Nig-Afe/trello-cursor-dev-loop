#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { loadConfig } from "./lib/env.js";
import { TrelloClient } from "./lib/trelloClient.js";

function textResult(data) {
  const payload = typeof data === "string" ? data : JSON.stringify(data, null, 2);
  return { content: [{ type: "text", text: payload }] };
}

async function main() {
  const config = loadConfig();
  const trello = new TrelloClient(config);

  const server = new McpServer({
    name: "trello",
    version: "1.0.0",
    description: "MCP Dev Loop — Trello ticket integration for Cursor",
  });

  server.tool(
    "get_my_cards",
    "List Trello cards assigned to the authenticated member.",
    {},
    async () => {
      const cards = await trello.getMyCards();
      const summary = cards.map((card) => ({
        id: card.id,
        name: card.name,
        listId: card.idList,
        boardId: card.idBoard,
        url: card.shortUrl,
        labels: (card.labels || []).map((l) => l.name || l.color),
        due: card.due,
        lastActivity: card.dateLastActivity,
      }));
      return textResult(summary);
    }
  );

  server.tool(
    "get_card",
    "Get full Trello card details including description, checklists, and recent comments.",
    { cardId: z.string().describe("Trello card ID or short link ID") },
    async ({ cardId }) => {
      const card = await trello.getCard(cardId);
      return textResult(trello.formatCardSummary(card));
    }
  );

  server.tool(
    "get_card_comments",
    "Get all comments on a Trello card.",
    { cardId: z.string().describe("Trello card ID") },
    async ({ cardId }) => {
      const comments = await trello.getCardComments(cardId);
      return textResult(comments);
    }
  );

  server.tool(
    "add_comment",
    "Add a comment to a Trello card. Requires explicit user approval in the dev workflow.",
    {
      cardId: z.string().describe("Trello card ID"),
      text: z.string().describe("Comment body"),
    },
    async ({ cardId, text }) => {
      const result = await trello.addComment(cardId, text);
      return textResult({ ok: true, actionId: result.id, date: result.date });
    }
  );

  server.tool(
    "update_card",
    "Update Trello card fields (name, desc, due). Does not move lists.",
    {
      cardId: z.string().describe("Trello card ID"),
      name: z.string().optional().describe("New card title"),
      desc: z.string().optional().describe("New card description"),
      due: z.string().optional().describe("ISO due date or null to clear"),
    },
    async ({ cardId, name, desc, due }) => {
      const data = {};
      if (name !== undefined) data.name = name;
      if (desc !== undefined) data.desc = desc;
      if (due !== undefined) data.due = due;
      const card = await trello.updateCard(cardId, data);
      return textResult({ ok: true, id: card.id, name: card.name });
    }
  );

  server.tool(
    "move_card",
    "Move a card to another list. Requires explicit user approval (e.g. 'mark in progress', 'mark done').",
    {
      cardId: z.string().describe("Trello card ID"),
      listId: z.string().describe("Target list ID"),
    },
    async ({ cardId, listId }) => {
      const card = await trello.moveCard(cardId, listId);
      return textResult({ ok: true, id: card.id, listId: card.idList });
    }
  );

  server.tool(
    "attach_commit",
    "Attach a commit or PR URL to a Trello card.",
    {
      cardId: z.string().describe("Trello card ID"),
      url: z.string().url().describe("Commit or PR URL"),
      name: z.string().optional().describe("Attachment label"),
    },
    async ({ cardId, url, name }) => {
      const attachment = await trello.attachUrl(cardId, url, name || "Commit");
      return textResult({ ok: true, attachmentId: attachment.id, url: attachment.url });
    }
  );

  server.tool(
    "get_boards",
    "List open Trello boards for the authenticated member.",
    {},
    async () => {
      const boards = await trello.getBoards();
      return textResult(
        boards.map((b) => ({ id: b.id, name: b.name, url: b.shortUrl }))
      );
    }
  );

  server.tool(
    "get_board_lists",
    "List columns (lists) on a board. Use to resolve list IDs for move_card.",
    { boardId: z.string().describe("Trello board ID") },
    async ({ boardId }) => {
      const lists = await trello.getBoardLists(boardId);
      return textResult(
        lists.map((l) => ({ id: l.id, name: l.name, closed: l.closed }))
      );
    }
  );

  server.tool(
    "get_board_cards",
    "List all cards on a board grouped by list. Uses TRELLO_BOARD_ID from .env if boardId omitted.",
    {
      boardId: z
        .string()
        .optional()
        .describe("Board ID (defaults to TRELLO_BOARD_ID in .env)"),
    },
    async ({ boardId }) => {
      const id = boardId || config.boardId;
      if (!id) {
        return textResult({
          error: "Provide boardId or set TRELLO_BOARD_ID in .env",
        });
      }
      const cards = await trello.getBoardCards(id);
      return textResult(cards);
    }
  );

  server.tool(
    "mark_in_progress",
    "Move card to the configured In Progress list (TRELLO_LIST_IN_PROGRESS).",
    { cardId: z.string().describe("Trello card ID") },
    async ({ cardId }) => {
      if (!config.listInProgress) {
        return textResult({
          error: "TRELLO_LIST_IN_PROGRESS is not set in .env. Use get_board_lists first.",
        });
      }
      const card = await trello.moveCard(cardId, config.listInProgress);
      return textResult({ ok: true, id: card.id, listId: card.idList, status: "in_progress" });
    }
  );

  server.tool(
    "mark_done",
    "Move card to the configured Done list (TRELLO_LIST_DONE).",
    { cardId: z.string().describe("Trello card ID") },
    async ({ cardId }) => {
      if (!config.listDone) {
        return textResult({
          error: "TRELLO_LIST_DONE is not set in .env. Use get_board_lists first.",
        });
      }
      const card = await trello.moveCard(cardId, config.listDone);
      return textResult({ ok: true, id: card.id, listId: card.idList, status: "done" });
    }
  );

  server.prompt(
    "analyze_ticket",
    "Structured ticket analysis — read-only planning mode, no code changes.",
    { cardId: z.string().describe("Trello card ID to analyze") },
    async ({ cardId }) => {
      const card = await trello.getCard(cardId);
      const summary = trello.formatCardSummary(card);
      return {
        messages: [
          {
            role: "user",
            content: {
              type: "text",
              text: `Analyze Trello ticket ${cardId} fully.

TICKET DATA:
${JSON.stringify(summary, null, 2)}

Produce a structured plan ONLY — do NOT edit code yet.

Output format:
## Summary
## Requirements
## Open questions / missing info
## Implementation plan (numbered steps)
## Suggested files to touch
## Risks

Wait for explicit user approval before implementing.`,
            },
          },
        ],
      };
    }
  );

  server.prompt(
    "implement_ticket",
    "Implementation mode — execute an approved plan for a ticket.",
    {
      cardId: z.string().describe("Trello card ID"),
      plan: z.string().optional().describe("Approved implementation plan"),
    },
    async ({ cardId, plan }) => {
      const card = await trello.getCard(cardId);
      const summary = trello.formatCardSummary(card);
      return {
        messages: [
          {
            role: "user",
            content: {
              type: "text",
              text: `Implement Trello ticket ${cardId} based on the approved plan.

TICKET:
${JSON.stringify(summary, null, 2)}

APPROVED PLAN:
${plan || "(use the plan from the prior analyze step)"}

Rules:
- Edit the codebase to fulfill the plan
- Run relevant tests if appropriate
- Do NOT git commit unless the user explicitly says to commit
- Do NOT update Trello unless the user explicitly asks`,
            },
          },
        ],
      };
    }
  );

  server.prompt(
    "sync_ticket_after_commit",
    "After a user-approved commit, sync Trello with commit info.",
    {
      cardId: z.string().describe("Trello card ID"),
      commitHash: z.string().describe("Short or full commit hash"),
      commitUrl: z.string().optional().describe("GitHub commit URL"),
      moveToDone: z
        .boolean()
        .optional()
        .describe("Whether to move card to Done list"),
    },
    async ({ cardId, commitHash, commitUrl, moveToDone }) => {
      return {
        messages: [
          {
            role: "user",
            content: {
              type: "text",
              text: `User approved Trello sync for ticket ${cardId}.

1. Add comment: "Implemented in commit ${commitHash}"
${commitUrl ? `2. Attach commit URL: ${commitUrl}` : ""}
${moveToDone ? "3. Move card to Done (mark_done)" : "3. Do NOT move the card unless user asked"}

Use the trello MCP tools to perform these updates.`,
            },
          },
        ],
      };
    }
  );

  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
