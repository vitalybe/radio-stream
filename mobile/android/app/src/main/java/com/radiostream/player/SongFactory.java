package com.radiostream.player;

import android.content.Context;

import com.radiostream.Settings;
import com.radiostream.networking.metadata.MetadataBackend;
import com.radiostream.networking.models.SongResult;
import com.radiostream.util.SetTimeout;

import javax.inject.Inject;

public class SongFactory {

    private MediaPlayerFactory mMediaPlayerFactory;
    private Context mContext;
    private Settings mSettings;
    private SetTimeout mSetTimeout;
    private MetadataBackend mMetadataBackend;

    @Inject
    public SongFactory(MediaPlayerFactory mediaPlayerFactory, Context context, Settings settings,
                       SetTimeout setTimeout, MetadataBackend metadataBackend) {

        mMediaPlayerFactory = mediaPlayerFactory;
        mContext = context;
        mSettings = settings;
        mSetTimeout = setTimeout;
        mMetadataBackend = metadataBackend;
    }

    public Song build(SongResult songResult) {
        return new Song(songResult, mMediaPlayerFactory.build(), mContext, mSettings,
            mSetTimeout, mMetadataBackend);
    }
}
