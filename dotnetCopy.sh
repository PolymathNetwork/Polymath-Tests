#!/bin/bash
if [ -z ${NO_DOTNET_BUILD+x} ]; then
    dotnet restore --configfile nuget.config --force
    dotnet build
fi

export PATH=$(echo ${PATH} | awk -v RS=: -v ORS=: '/\/usr\/local\/sbin/ {next} {print}' | sed 's/:*$//')
export DEPS="$(pwd)/bin/Debug/netcoreapp2.1"
export NAME=tests
export ADAPTER="$(pwd)/$(ls packages/coreprotractor.testadapter/*/lib/*/*.dll)"
# Otherwise we will have a problem with getting the dll loaded
export JSON="$(pwd)/$(ls packages/system.json/*/lib/netstandard2.0/*.dll)"

find tests -name "*.feature" \
 -execdir sh -c 'cp "$DEPS/$NAME.deps.json" $(basename "{}" .feature).deps.json' \; \
 -execdir sh -c 'cp "$DEPS/$NAME.runtimeconfig.json" $(basename "{}" .feature).runtimeconfig.json' \; \
 -execdir sh -c 'cp "$DEPS/$NAME.runtimeconfig.dev.json" $(basename "{}" .feature).runtimeconfig.dev.json' \; \
 -execdir sh -c 'cp "$DEPS/$NAME.dll" $(dirname "{}")' \; \
 -execdir sh -c 'cp "$ADAPTER" $(dirname "{}")' \; \
 -execdir sh -c 'cp "$JSON" $(dirname "{}")' \;
