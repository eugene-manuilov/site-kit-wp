#!/bin/bash

# Exit if any command fails.
set -e

# Include useful functions
. "$(dirname "$0")/includes.sh"

# Export database
wp db export --add-drop-table wp-content/plugins/google-site-kit/bin/local-env/dump.sql
