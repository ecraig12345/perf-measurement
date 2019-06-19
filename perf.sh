#!/bin/bash

prefix() {
  if (($1 < 10)); then echo "0"; else echo ""; fi
}

fabric=/Users/elizabeth/git/fabric-react5
dir=profile
timefile="$dir/time.txt"
profile() {
  echo "$dir/profile$(prefix $1)$1.log"
}
processed() {
  echo "$dir/processed$(prefix $1)$1.txt"
}

mkdir $dir
for i in $(seq 1 10); do
  { time node --prof --single-threaded --turbo-inlining=false "$fabric/scripts/node_modules/tslint/lib/tslintCli.js" --project "$fabric/packages/office-ui-fabric-react/tsconfig.json" -t stylish -r "$fabric/scripts/node_modules/tslint-microsoft-contrib" ; } 2>>$timefile
  mv isolate*.log $(profile $i)
  node --prof-process $(profile $i) > $(processed $i)
done

