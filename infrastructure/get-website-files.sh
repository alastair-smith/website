#!/bin/sh

cd ../build/dev/src
comma_seperated_filenames=$(find . -name \* -type f -exec echo "{}," \;)
echo ${comma_seperated_filenames%','}
