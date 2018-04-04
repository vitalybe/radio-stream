package com.radiostream.wrapper

import com.facebook.react.bridge.ReactContext

import dagger.Module
import dagger.Provides
import timber.log.Timber
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class ReactContextContainer @Inject constructor() {
    var reactContext: ReactContext? = null
        set(value) {
            Timber.i("setting ReactContext: %h", value)
            field = value
        }
}
