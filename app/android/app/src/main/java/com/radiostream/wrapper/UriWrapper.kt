package com.radiostream.wrapper

import android.net.Uri
import javax.inject.Inject

/**
 * Created by vitaly on 06/10/2017.
 */
class UriWrapper @Inject constructor() : UriInterface {

    override fun parse(url: String): Uri {
        return Uri.parse(url)
    }
}