Prerequirements
===============

1. `yarn install`
1. Install [pidcat](https://github.com/JakeWharton/pidcat), on OSX: `brew install lnav`

OSX desktop
===========
Execute: `yarn run desktop`

Android
=======

Launching
---------

Execute: `yarn run android`

This will do the following:
* Compile the native (Android) part of the application
* Launches the bundler, transpiles javascript files and serves them.
* Installs the debug application to the connected Android phone
* Launches **lnav** and shows you application's logs filtered to show only releveant output

If you want to see the log, without everything else, run: `./logcat.sh`

If you're using **iTerm 3**, install **mert**. Then you can use `yarn run android-iterm3`, that would:
* Start the emulator in the current tab
* Open a new tab with 2 panes:
    * One pane will be the android-packager
    * In the other, it would compile the application and and run the log viewer

Modifying code
--------------

Javascript code can be modified without rerunning the app - Simply shake the device and choose "Reload" from the menu.

After modifying Java code, however, a full `yarn run android` is required.


Mock mode
---------

To develop without an active backend (or while offline) you can enable a mock mode by changing the `MOCK_MODE` in **app/utils/constants.js** to `true`.

Release
--------

* Create android key store with a key named `radio-stream` (as explained [here](https://developer.android.com/studio/publish/app-signing.html)).
* Modify the file `~/.gradle/gradle.properties` and add the lines below. Make sure to provide the correct password and path instead of the placeholders.

```
RADIO_STREAM_RELEASE_KEY_ALIAS=radio-stream

ANDROID_RELEASE_STORE_FILE=/Path/To/Store
ANDROID_RELEASE_STORE_PASSWORD=FillRealPassword
RADIO_STREAM_RELEASE_KEY_PASSWORD=FillRealPassword
```
* Run: `cd android && ./gradlew assembleRelease && cd ..`
* Make sure an **app-release.apk** file was created by: `ls android/app/build/outputs/apk`
* Install the APK file: `adb install android/app/build/outputs/apk/app-release.apk`

