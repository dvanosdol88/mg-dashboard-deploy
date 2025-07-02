#!/bin/bash

# Path to the master learn_mode.md file
SOURCE="$HOME/ClaudeTemplates/learn_mode.md"

# Destination project directory (provided as argument)
DEST="$1"

# Check for argument
if [ -z "$DEST" ]; then
  echo "Usage: ./copy_learn_mode.sh /path/to/project"
  exit 1
fi

# Copy the file
cp "$SOURCE" "$DEST/learn_mode.md"

echo "✅ learn_mode.md copied to $DEST"