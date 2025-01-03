#!/bin/bash

# Path to your .env file
ENV_FILE=".env"

# Check if .env file exists
if [[ ! -f $ENV_FILE ]]; then
  echo "Error: .env file not found at $ENV_FILE"
  exit 1
fi

# Function to create or update EAS environment variables
create_or_update_eas_env_var() {
  local name=$1
  local value=$2

  # Create or overwrite the environment variable in EAS
  echo "Setting EAS environment variable: $name"
  eas env:create preview --name "$name" --value "$value" --type string --visibility plaintext --force

  if [[ $? -ne 0 ]]; then
    echo "Failed to set environment variable: $name"
    exit 1
  fi
}

# Read .env file and set environment variables
while IFS= read -r line || [[ -n "$line" ]]; do
  # Skip empty lines and comments
  if [[ -z "$line" || $line == \#* ]]; then
    continue
  fi

  # Split the line into key and value
  IFS='=' read -r name value <<< "$line"

  # Remove potential quotes from the value
  value=$(echo "$value" | sed -e 's/^"//' -e 's/"$//')

  # Create or update the EAS environment variable
  create_or_update_eas_env_var "$name" "$value"
done < "$ENV_FILE"

echo "All environment variables have been set successfully!"
