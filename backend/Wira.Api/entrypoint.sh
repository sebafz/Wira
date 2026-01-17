#!/bin/sh
set -e

if [ "$RUN_RESET_DB" = "true" ]; then
  echo "RUN_RESET_DB is true: running --reset-db"
  dotnet Wira.Api.dll --reset-db
  echo "--reset-db finished"
fi

exec dotnet Wira.Api.dll "$@"
