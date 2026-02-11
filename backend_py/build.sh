#!/usr/bin/env bash
set -o errexit

# Get the directory where the script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"

echo "Current working directory: $(pwd)"
echo "Script directory: $SCRIPT_DIR"
echo "List files in script directory:"
ls -la "$SCRIPT_DIR"

pip install -r "$SCRIPT_DIR/requirements.txt"
python -m spacy download en_core_web_sm
