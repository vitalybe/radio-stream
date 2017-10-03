package com.radiostream.javascript.bridge

import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.WritableArray
import com.facebook.react.bridge.WritableMap
import javax.inject.Inject

/**
 * Created by vitaly on 03/10/2017.
 */
class ArgumentsWrapper @Inject constructor() : ArgumentsInterface {
    override fun createMap(): WritableMap {
        return Arguments.createMap()
    }

    override fun createArray(): WritableArray {
        return Arguments.createArray()
    }

}