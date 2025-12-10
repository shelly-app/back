#!/bin/bash

# Helper script to get a Cognito ID token for testing authentication
# Usage: ./scripts/get-cognito-token.sh [username] [password]

set -e

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}=========================================${NC}"
echo -e "${BLUE}Cognito Token Generator${NC}"
echo -e "${BLUE}=========================================${NC}"
echo ""

# Load environment variables
if [ -f .env ]; then
    export $(cat .env | grep -v '^#' | xargs)
fi

# Check if Cognito is configured
if [ -z "$AWS_COGNITO_USER_POOL_ID" ] || [ -z "$AWS_COGNITO_CLIENT_ID" ]; then
    echo -e "${RED}Error: Cognito credentials not found in .env${NC}"
    echo ""
    echo "Please set the following in your .env file:"
    echo "  AWS_COGNITO_USER_POOL_ID=your-pool-id"
    echo "  AWS_COGNITO_CLIENT_ID=your-client-id"
    echo ""
    echo "See AUTHENTICATION_TESTING.md for setup instructions."
    exit 1
fi

# Check if DISABLE_AUTH is enabled
if [ "$DISABLE_AUTH" = "true" ]; then
    echo -e "${RED}Warning: DISABLE_AUTH is set to 'true'${NC}"
    echo "Authentication is currently bypassed in your application."
    echo "Set DISABLE_AUTH=false in .env to enable real authentication."
    echo ""
fi

# Get username and password from arguments or prompt
USERNAME=${1:-}
PASSWORD=${2:-}

if [ -z "$USERNAME" ]; then
    echo -n "Enter username (email): "
    read USERNAME
fi

if [ -z "$PASSWORD" ]; then
    echo -n "Enter password: "
    read -s PASSWORD
    echo ""
fi

echo ""
echo "Authenticating with AWS Cognito..."
echo "User Pool ID: $AWS_COGNITO_USER_POOL_ID"
echo "Client ID: $AWS_COGNITO_CLIENT_ID"
echo "Username: $USERNAME"
echo ""

# Authenticate and get tokens
RESPONSE=$(aws cognito-idp initiate-auth \
    --region "$AWS_REGION" \
    --auth-flow USER_PASSWORD_AUTH \
    --client-id "$AWS_COGNITO_CLIENT_ID" \
    --auth-parameters "USERNAME=$USERNAME,PASSWORD=$PASSWORD" \
    2>&1) || {
    echo -e "${RED}Authentication failed!${NC}"
    echo "$RESPONSE"
    exit 1
}

# Extract tokens
ID_TOKEN=$(echo "$RESPONSE" | grep -o '"IdToken": *"[^"]*"' | grep -o '"[^"]*"$' | tr -d '"')
ACCESS_TOKEN=$(echo "$RESPONSE" | grep -o '"AccessToken": *"[^"]*"' | grep -o '"[^"]*"$' | tr -d '"')
REFRESH_TOKEN=$(echo "$RESPONSE" | grep -o '"RefreshToken": *"[^"]*"' | grep -o '"[^"]*"$' | tr -d '"')

echo -e "${GREEN}✓ Authentication successful!${NC}"
echo ""
echo -e "${BLUE}=========================================${NC}"
echo -e "${BLUE}Your Tokens:${NC}"
echo -e "${BLUE}=========================================${NC}"
echo ""
echo "ID Token (use this for API requests):"
echo "$ID_TOKEN"
echo ""
echo "Access Token:"
echo "$ACCESS_TOKEN"
echo ""
echo "Refresh Token:"
echo "$REFRESH_TOKEN"
echo ""
echo -e "${BLUE}=========================================${NC}"
echo -e "${BLUE}Usage Examples:${NC}"
echo -e "${BLUE}=========================================${NC}"
echo ""
echo "Test with cURL:"
echo "  curl -H \"Authorization: Bearer $ID_TOKEN\" http://localhost:8080/api/v1/pets"
echo ""
echo "Export as environment variable:"
echo "  export AUTH_TOKEN=\"$ID_TOKEN\""
echo ""
echo "Save to file:"
echo "  echo \"$ID_TOKEN\" > .test-token"
echo ""
echo -e "${GREEN}Note: Tokens expire after 1 hour (default). Generate a new token if expired.${NC}"
echo ""
