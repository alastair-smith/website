#!/bin/sh

cd ../src
comma_seperated_filenames=$(find . -name \* -type f -exec echo "{}," \;)
echo {\"filenames\":\"${comma_seperated_filenames%','}\"}
