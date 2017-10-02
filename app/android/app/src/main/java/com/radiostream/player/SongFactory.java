package com.radiostream.player;

import android.content.Context;

import com.radiostream.Settings;
import com.radiostream.networking.metadata.MetadataBackendGetter;
import com.radiostream.networking.models.SongResult;

import javax.inject.Inject;

public class SongFactory {

    private MediaPlayerFactory mMediaPlayerFactory;
    private Context mContext;
    private Settings mSettings;
    private MetadataBackendGetter mMetadataBackendGetter;

    @Inject
    public SongFactory(MediaPlayerFactory mediaPlayerFactory, Context context, Settings settings,
                       MetadataBackendGetter metadataBackend) {

        mMediaPlayerFactory = mediaPlayerFactory;
        mContext = context;
        mSettings = settings;
        mMetadataBackendGetter = metadataBackend;
    }

    public Song build(SongResult songResult) {
        return new Song(songResult, mMediaPlayerFactory.build(), mContext, mSettings,
            mMetadataBackendGetter);
    }

    public Song build(Song otherSong) {
        return new Song(otherSong, mMediaPlayerFactory.build(), mContext, mSettings,
            mMetadataBackendGetter);
    }
}
