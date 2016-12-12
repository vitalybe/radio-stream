#!/usr/bin/env bash

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
-i SELinux \
-i System.out \
-i MediaHTTPConnection
