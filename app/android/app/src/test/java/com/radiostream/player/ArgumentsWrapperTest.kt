package com.radiostream.player

import com.facebook.react.bridge.JavaOnlyArray
import com.facebook.react.bridge.JavaOnlyMap
import com.facebook.react.bridge.WritableArray
import com.facebook.react.bridge.WritableMap
import com.radiostream.javascript.bridge.ArgumentsInterface

class ArgumentsWrapperTest : ArgumentsInterface {
    override fun createMap(): WritableMap {
        return JavaOnlyMap()
    }

    override fun createArray(): WritableArray {
        return JavaOnlyArray()
    }
}