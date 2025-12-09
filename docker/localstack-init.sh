#!/bin/bash

# LocalStack S3 bucket initialization script
# This script runs when LocalStack is ready

echo "Initializing LocalStack S3 bucket..."

# Create S3 bucket
awslocal s3 mb s3://pet-photos

# Set bucket CORS configuration for local development
awslocal s3api put-bucket-cors \
  --bucket pet-photos \
  --cors-configuration '{
    "CORSRules": [
      {
        "AllowedOrigins": ["*"],
        "AllowedMethods": ["GET", "PUT", "POST", "DELETE", "HEAD"],
        "AllowedHeaders": ["*"],
        "ExposeHeaders": ["ETag"],
        "MaxAgeSeconds": 3000
      }
    ]
  }'

# Set bucket ACL to private (signed URLs will provide access)
awslocal s3api put-bucket-acl --bucket pet-photos --acl private

echo "S3 bucket 'pet-photos' created and configured successfully!"
