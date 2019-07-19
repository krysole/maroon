#!/bin/sh
set -e


# ./meta/meta -s maroon -o Parser.js Parser.g
# ./maroon > main.s


as dwarf_test.s -o dwarf_test.o
ld -macosx_version_min 10.14 -lc dwarf_test.o -o dwarf_test
dsymutil dwarf_test -o dwarf_test.dSYM
lldb dwarf_test

## TODO Move the extra commands into a proper debug.sh command.
