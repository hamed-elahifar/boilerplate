#!/bin/bash

echo "Checking and updating all dependencies in package.json..."

# Use npx to run npm-check-updates without requiring global installation
# -u will upgrade your package.json dependencies to the latest versions
bunx npm-check-updates -u --workspaces --root

echo "Installing updated dependencies..."
bun install

echo "Dependencies updated successfully!"
