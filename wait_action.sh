#!/bin/bash
echo "Waiting for GitHub action to complete..."
while true; do
  STATUS=$(curl -s -H "Accept: application/vnd.github.v3+json" https://api.github.com/repos/Atifalin/imposter/actions/runs?per_page=1 | grep '"status":' | head -n 1 | awk -F'"' '{print $4}')
  if [ "$STATUS" == "completed" ]; then
    echo "Action completed!"
    break
  fi
  echo "Status: $STATUS... waiting 10s"
  sleep 10
done
