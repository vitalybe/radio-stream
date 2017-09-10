package com.radiostream.di.modules;

import com.facebook.react.bridge.ReactContext;

import dagger.Module;
import dagger.Provides;

@Module
public class ReactContextModule {

  private ReactContext mReactContext;

  public ReactContextModule(ReactContext reactContext) {
    mReactContext = reactContext;
  }

  @Provides
  ReactContext provideReactContext() {
    return mReactContext;
  }
}
