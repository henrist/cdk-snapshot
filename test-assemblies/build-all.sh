#!/bin/bash
set -e

# Run this from project root.

for path in test-assemblies/src/*; do
  name=${path##*/}

  node lib/bin/cdk-snapshot.js \
    "test-assemblies/src/$name" \
    "test-assemblies/snapshots/$name"
done
