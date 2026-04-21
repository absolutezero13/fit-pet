#!/bin/bash
if [ -n "$1" ]; then
  cd ios && bundle exec fastlane beta version:"$1"
else
  cd ios && bundle exec fastlane beta
fi