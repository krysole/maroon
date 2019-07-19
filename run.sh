#!/bin/sh
set -e

./meta/meta -s maroon -o Parser.js Parser.g && ./maroon > main.s && clang -o main main.s && ./main
