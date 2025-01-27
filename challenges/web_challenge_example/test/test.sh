#!/bin/bash
#
# Simple script used for testing the github action
# Not part of the PoC
PROGRAM="python3"
ARGS="solution.py"
FLAG_SUBSTR="hackpackCTF{"

# We expect the string: `hackpackCTF{...}` as the output
OUTPUT=$($PROGRAM $ARGS)
echo $OUTPUT

OUTPUT=${OUTPUT:0:12} # extract first 12 chars

# This is a basic check. We know you can trivially bypass this. Do not.
# If you come to us without a working PoC, we will consider your challenge incomplete.

if [ "$OUTPUT" = "$FLAG_SUBSTR" ]; then
    echo "PoC successful!"
    exit 0
else
    echo "PoC failed, check CI/CD logs."
    exit 1
fi
