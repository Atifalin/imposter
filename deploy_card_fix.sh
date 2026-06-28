#!/bin/bash
echo "Waiting for GitHub action to complete..."
while true; do
  JSON=$(curl -s -H "Accept: application/vnd.github.v3+json" https://api.github.com/repos/Atifalin/imposter/actions/runs?per_page=1)
  STATUS=$(echo "$JSON" | grep -m 1 '"status":' | awk -F'"' '{print $4}')
  CONCLUSION=$(echo "$JSON" | grep -m 1 '"conclusion":' | awk -F'"' '{print $4}')
  
  if [ "$STATUS" == "completed" ]; then
    if [ "$CONCLUSION" == "success" ]; then
      echo "Action completed successfully!"
      break
    elif [ "$CONCLUSION" == "failure" ] || [ "$CONCLUSION" == "cancelled" ]; then
      echo "❌ Action failed or was cancelled (conclusion: $CONCLUSION)!"
      exit 1
    fi
  fi
  echo "Status: $STATUS... waiting 10s"
  sleep 10
done
echo "Deploying to server..."
ssh root@72.61.236.206 "docker restart ezyimposter-watchtower"
echo "Done!"
