#!/bin/bash

# Contest Check-In Migration Script
# This script runs the migration to retroactively update contest participants

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}🔄 Contest Check-In Migration${NC}"
echo "=================================="
echo ""

# Check if MIGRATION_SECRET is set
if [ -z "$MIGRATION_SECRET" ]; then
    echo -e "${YELLOW}⚠️  MIGRATION_SECRET environment variable is not set${NC}"
    echo ""
    echo "Please set it first:"
    echo "  export MIGRATION_SECRET=\"your-secret-key-here\""
    echo ""
    echo "Or run this script with the secret inline:"
    echo "  MIGRATION_SECRET=\"your-secret-key\" ./run_migration.sh"
    echo ""
    exit 1
fi

# Function URL
FUNCTION_URL="https://us-central1-gymforceapp-778e1.cloudfunctions.net/migrateContestCheckIns"

echo -e "${GREEN}📡 Calling migration function...${NC}"
echo "URL: $FUNCTION_URL"
echo ""

# Call the function
response=$(curl -s -w "\n%{http_code}" -X POST "$FUNCTION_URL" \
  -H "Content-Type: application/json" \
  -d "{\"secret\": \"$MIGRATION_SECRET\"}")

# Extract HTTP status code and body
http_code=$(echo "$response" | tail -n1)
body=$(echo "$response" | sed '$d')

echo ""
echo "HTTP Status: $http_code"
echo ""

if [ "$http_code" -eq 200 ]; then
    echo -e "${GREEN}✅ Migration completed successfully!${NC}"
    echo ""
    echo "Response:"
    echo "$body" | jq '.' 2>/dev/null || echo "$body"
else
    echo -e "${RED}❌ Migration failed${NC}"
    echo ""
    echo "Response:"
    echo "$body" | jq '.' 2>/dev/null || echo "$body"
    exit 1
fi

echo ""
echo "=================================="
echo -e "${GREEN}✅ Done!${NC}"
