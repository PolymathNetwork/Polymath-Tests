#!/bin/bash

if [[ -z $FILE || -z $PAT || -z $WORK_ITEM ]]; then
  echo "Usage: FILE=<feature file> PAT=<pat> WORK_ITEM=<work item> ./azureUpdate.sh"
  exit 1
fi

name=${FILE%.*}
name=${name##*/}
read -r -d '' body <<EOM
[
  {
    "op": "add", 
    "path": "/fields/Microsoft.VSTS.TCM.AutomatedTestName",
    "value": "${name}" 
  },
  {
    "op": "add", 
    "path": "/fields/Microsoft.VSTS.TCM.AutomatedTestStorage",
    "value": "${FILE}" 
  },
  {
    "op": "add", 
    "path": "/fields/Microsoft.VSTS.TCM.AutomatedTestId",
    "value": "$(uuidgen)" 
  },
  {
    "op": "add", 
    "path": "/fields/Microsoft.VSTS.TCM.AutomatedTestType",
    "value": "Unit Test" 
  },
  {
    "op": "add", 
    "path": "/fields/Microsoft.VSTS.TCM.AutomationStatus",
    "value": "Automated" 
  }
]
EOM

curl -s -v -X PATCH \
    -H "Content-Type: application/json-patch+json" \
    -u "xxx:$PAT" \
    -d "$body" \
    "https://dev.azure.com/polymathnetwork/_apis/wit/workitems/$WORK_ITEM?api-version=2.0"
