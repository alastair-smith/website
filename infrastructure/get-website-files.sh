#!/bin/sh

set -e

cd ../src
comma_seperated_filenames=$(find . -name \* -type f -exec echo "{}," \;)
echo ${comma_seperated_filenames%','}
