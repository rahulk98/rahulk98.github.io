#!/bin/sh
# Rebuild static/js/teaser.bundle.js from the design sources in this folder.
cd "$(dirname "$0")" || exit 1
bun build entry.jsx --outfile ../js/teaser.bundle.js --minify --jsx-runtime classic --jsx-factory React.createElement --jsx-fragment React.Fragment --target browser
