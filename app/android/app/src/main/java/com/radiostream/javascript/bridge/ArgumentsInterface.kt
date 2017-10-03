package com.radiostream.javascript.bridge

import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.WritableArray
import com.facebook.react.bridge.WritableMap
import javax.inject.Inject

interface ArgumentsInterface {
    fun createMap(): WritableMap
    fun createArray(): WritableArray
}