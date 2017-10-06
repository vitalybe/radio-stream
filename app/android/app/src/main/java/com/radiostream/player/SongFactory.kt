package com.radiostream.player

import android.content.Context

import com.radiostream.Settings
import com.radiostream.networking.metadata.MetadataBackendGetter
import com.radiostream.networking.models.SongResult
import com.radiostream.wrapper.UriInterface
import com.radiostream.wrapper.UriWrapper

import javax.inject.Inject

class SongFactory @Inject
constructor(private val mMediaPlayerFactory: MediaPlayerFactory, private val mContext: Context, private val mSettings: Settings,
            private val mMetadataBackendGetter: MetadataBackendGetter, private val mUriWrapper: UriWrapper) {

    fun build(songResult: SongResult): Song {
        return Song(songResult, MediaPlayerWrapper(mMediaPlayerFactory.build()), mContext, mSettings,
                mMetadataBackendGetter, mUriWrapper)
    }

    fun build(otherSong: Song): Song {
        return Song(otherSong, MediaPlayerWrapper(mMediaPlayerFactory.build()), mContext, mSettings,
                mMetadataBackendGetter, mUriWrapper)
    }
}
