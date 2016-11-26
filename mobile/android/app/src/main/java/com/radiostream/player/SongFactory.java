package com.radiostream.player;

import android.content.Context;
import android.media.MediaPlayer;

import com.radiostream.Settings;
import com.radiostream.networking.models.SongResult;

import javax.inject.Inject;

public class SongFactory {

    private MediaPlayer mMediaPlayer;
    private Context mContext;
    private Settings mSettings;

    @Inject
    public SongFactory(MediaPlayer mediaPlayer, Context context, Settings settings) {

        mMediaPlayer = mediaPlayer;
        mContext = context;
        mSettings = settings;
    }

    public Song build(SongResult songResult) {
        return new Song(songResult, mMediaPlayer, mContext, mSettings);
    }
}
