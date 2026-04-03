#!/bin/bash
if [ -z "$1" ] || [ -z "$2" ]; then
  echo "Kullanım: yarn testflight <version> <build>"
  echo "Örnek:    yarn testflight 1.1.2 42"
  exit 1
fi

cd ios && bundle exec fastlane beta version:$1 build:$2