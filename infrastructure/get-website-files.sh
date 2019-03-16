#!/bin/sh

cd ../src
comma_seperated_filenames=$(find . -name \* -type f -printf "%p,")
echo {\"filenames\":\"${comma_seperated_filenames%','}\"}
