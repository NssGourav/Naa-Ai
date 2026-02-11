#!/usr/bin/env bash
set -o errexit

# Ensure we are in the script's directory
cd "$(dirname "$0")"

pip install -r requirements.txt
python -m spacy download en_core_web_sm
