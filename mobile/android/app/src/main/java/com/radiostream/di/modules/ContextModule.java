package com.radiostream.di.modules;

import android.content.Context;
import android.media.MediaPlayer;

import dagger.Module;
import dagger.Provides;

@Module
public class ContextModule {

  private Context mContext;

  public ContextModule(Context reactContext) {
    mContext = reactContext;
  }

  @Provides
  Context provideContext() {
    return mContext;
  }

  @Provides
  MediaPlayer provideMediaPlayer() {
    return new MediaPlayer();
  }
}
