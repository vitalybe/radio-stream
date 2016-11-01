#!/usr/bin/env python
import sys
import hiyapyco
from os import path

if len(sys.argv) != 4:
    print "Usage: merge_yaml source_yaml override_yaml destination_yaml"
    sys.exit(1)

source_yaml, override_yaml, merged_yaml = sys.argv[1:]

overrides = []
if path.exists(override_yaml):
    overrides.append(override_yaml)

merged = hiyapyco.load(source_yaml, *overrides, method=hiyapyco.METHOD_MERGE)
with open(merged_yaml, 'w') as file:
    file.write(hiyapyco.dump(merged))