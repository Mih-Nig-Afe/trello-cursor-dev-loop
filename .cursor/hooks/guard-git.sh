#!/bin/bash
# Gate git commit and push — human approval required.
input=$(cat)
command=$(echo "$input" | jq -r '.command // empty')

if echo "$command" | grep -qE 'git\s+commit'; then
  echo '{
    "permission": "ask",
    "user_message": "Git commit requires your explicit approval. Review the diff, then approve or deny.",
    "agent_message": "A project hook requires user approval before git commit. Only commit when the user explicitly said to commit."
  }'
  exit 0
fi

if echo "$command" | grep -qE 'git\s+push'; then
  if echo "$command" | grep -qE 'push\s+.*\s+(main|master)\b|push\s+(origin\s+)?(main|master)\b'; then
    echo '{
      "permission": "ask",
      "user_message": "Push to main/master requires explicit approval.",
      "agent_message": "Blocked push to main/master pending user approval."
    }'
    exit 0
  fi
  echo '{
    "permission": "ask",
    "user_message": "Git push requires your approval.",
    "agent_message": "A project hook requires user approval before git push."
  }'
  exit 0
fi

echo '{ "permission": "allow" }'
exit 0
