package com.radiostream.di.modules;

import android.content.Context;
import android.media.MediaPlayer;

import dagger.Module;
import dagger.Provides;
import timber.log.Timber;

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
}
