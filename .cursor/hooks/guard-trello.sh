#!/bin/bash
# Gate Trello status changes and comments unless user explicitly requested.
input=$(cat)
tool_name=$(echo "$input" | jq -r '.tool_name // .toolName // empty')
prompt=$(echo "$input" | jq -r '.prompt // .user_message // empty' | tr '[:upper:]' '[:lower:]')

SENSITIVE_TOOLS="move_card|mark_in_progress|mark_done|add_comment|attach_commit"

if echo "$tool_name" | grep -qE "$SENSITIVE_TOOLS"; then
  if echo "$prompt" | grep -qE 'update trello|mark in progress|mark done|sync trello|attach commit'; then
    echo '{ "permission": "allow" }'
    exit 0
  fi
  echo '{
    "permission": "ask",
    "user_message": "Trello update (move card / comment / attach) requires explicit approval. Say \"update trello\" or \"mark done\" to proceed.",
    "agent_message": "Trello write blocked by hook. Only update Trello when the user explicitly requests it."
  }'
  exit 0
fi

echo '{ "permission": "allow" }'
exit 0
