#!/usr/bin/env bash

adb logcat -c

react-native run-android

pidcat com.radiostream \
-l D \
-i ViewRootImpl \
-i DisplayListCanvas \
-i Timeline \
-i mali_winsys \
-i art \
-i libGLESv1 \
-i unknown:ViewManagerPropertyUpdater \
-i ApkSoSource \
-i TimaKeyStoreProvider \
-i ActivityThread \
-i ResourcesManager \
-i InjectionManager \
-i SensorManager \
-i Activity \
-i OpenGLRenderer \
-i SecWifiDisplayUtil \
-i libEGL \
-i Zygote \
-i SELinux