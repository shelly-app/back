#!/bin/bash

# Photo Upload Helper Script
# This script demonstrates how to upload photos for pets using curl

set -e

API_URL="${API_URL:-http://localhost:8080}"
PET_ID="${1}"

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}🐾 Pet Photo Upload Helper${NC}\n"

# Check if pet ID is provided
if [ -z "$PET_ID" ]; then
    echo -e "${YELLOW}Usage: ./scripts/upload-photos.sh <pet_id> [image_file]${NC}"
    echo ""
    echo "Examples:"
    echo "  ./scripts/upload-photos.sh 1 /path/to/photo.jpg"
    echo "  ./scripts/upload-photos.sh 1  # Uses example placeholder if available"
    echo ""
    echo -e "${YELLOW}📋 Available Pets:${NC}"

    # List available pets
    response=$(curl -s "$API_URL/pets")

    if command -v jq &> /dev/null; then
        echo "$response" | jq -r '.[] | "\(.id) - \(.name) (\(.breed))"'
    else
        echo "$response"
        echo ""
        echo -e "${YELLOW}💡 Install 'jq' for prettier output: brew install jq${NC}"
    fi

    exit 1
fi

# Get image file path
IMAGE_FILE="${2}"

if [ -z "$IMAGE_FILE" ]; then
    echo -e "${YELLOW}No image file provided.${NC}"
    echo ""
    echo "You can:"
    echo "  1. Provide an image file: ./scripts/upload-photos.sh $PET_ID /path/to/photo.jpg"
    echo "  2. Use a placeholder service:"
    echo ""

    # Create a temporary file with placeholder image
    TEMP_FILE="/tmp/pet-photo-${PET_ID}.jpg"

    echo -e "${YELLOW}Downloading placeholder image...${NC}"
    curl -s "https://placekitten.com/800/600" -o "$TEMP_FILE"

    if [ -f "$TEMP_FILE" ]; then
        IMAGE_FILE="$TEMP_FILE"
        echo -e "${GREEN}✅ Placeholder image downloaded${NC}\n"
    else
        echo -e "${RED}❌ Failed to download placeholder image${NC}"
        exit 1
    fi
fi

# Validate image file exists
if [ ! -f "$IMAGE_FILE" ]; then
    echo -e "${RED}❌ Error: Image file not found: $IMAGE_FILE${NC}"
    exit 1
fi

# Get file size
FILE_SIZE=$(wc -c < "$IMAGE_FILE" | tr -d ' ')
FILE_SIZE_MB=$(echo "scale=2; $FILE_SIZE / 1024 / 1024" | bc)

# Check file size (max 5MB)
MAX_SIZE=$((5 * 1024 * 1024))
if [ "$FILE_SIZE" -gt "$MAX_SIZE" ]; then
    echo -e "${RED}❌ Error: File size ($FILE_SIZE_MB MB) exceeds 5MB limit${NC}"
    exit 1
fi

echo -e "${GREEN}📤 Uploading photo...${NC}"
echo "   Pet ID: $PET_ID"
echo "   File: $IMAGE_FILE"
echo "   Size: $FILE_SIZE_MB MB"
echo ""

# Upload photo
response=$(curl -s -w "\n%{http_code}" -X POST "$API_URL/pet-photos" \
    -F "petId=$PET_ID" \
    -F "file=@$IMAGE_FILE")

# Extract status code
http_code=$(echo "$response" | tail -n1)
body=$(echo "$response" | sed '$d')

# Check response
if [ "$http_code" -eq 201 ] || [ "$http_code" -eq 200 ]; then
    echo -e "${GREEN}✅ Photo uploaded successfully!${NC}\n"

    if command -v jq &> /dev/null; then
        photo_id=$(echo "$body" | jq -r '.id')
        echo "Photo ID: $photo_id"
        echo ""
        echo "Get photo URL:"
        echo "  curl $API_URL/pet-photos/$photo_id/url"
    else
        echo "$body"
    fi
else
    echo -e "${RED}❌ Upload failed (HTTP $http_code)${NC}"
    echo "$body"
    exit 1
fi

# Clean up temp file if created
if [[ "$IMAGE_FILE" == /tmp/pet-photo-* ]]; then
    rm -f "$IMAGE_FILE"
fi

echo ""
echo -e "${GREEN}🎉 Done!${NC}"
