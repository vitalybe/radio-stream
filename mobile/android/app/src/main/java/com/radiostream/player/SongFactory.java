package com.radiostream.player;

import android.content.Context;

import com.radiostream.Settings;
import com.radiostream.networking.models.SongResult;

import javax.inject.Inject;

public class SongFactory {

    private MediaPlayerFactory mMediaPlayerFactory;
    private Context mContext;
    private Settings mSettings;

    @Inject
    public SongFactory(MediaPlayerFactory mediaPlayerFactory, Context context, Settings settings) {

        mMediaPlayerFactory = mediaPlayerFactory;
        mContext = context;
        mSettings = settings;
    }

    public Song build(SongResult songResult) {
        return new Song(songResult, mMediaPlayerFactory.build(), mContext, mSettings);
    }
}
