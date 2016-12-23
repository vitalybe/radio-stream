#!/usr/bin/env bash
adb logcat -c

react-native run-android

./logcat.sh