#!/bin/sh
set -e

./meta/meta -s maroon -o Parser.js Parser.g && ./maroon
