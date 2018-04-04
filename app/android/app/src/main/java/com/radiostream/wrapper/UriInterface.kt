package com.radiostream.wrapper

import android.net.Uri

/**
 * Created by vitaly on 06/10/2017.
 */
interface UriInterface {
    fun parse(url: String): Uri
}