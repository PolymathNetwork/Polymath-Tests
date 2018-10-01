#!/bin/bash

if [[ -z $PAT || -z $BUILD || -z $PROJECT ]]; then
  echo "Usage: PAT=<pat> BUILD=<build> PROJECT=<project> ./azureTriggerBuild.sh"
  exit 1
fi

read -r -d '' body <<EOM
{
  definition:{
    id: ${BUILD}
  }
}
EOM

curl -s -v -X POST \
    -H "Content-Type: application/json" \
    -u "xxx:$PAT" \
    -d "$body" \
    "https://dev.azure.com/polymathnetwork/$PROJECT/_apis/build/builds?api-version=4.1"
