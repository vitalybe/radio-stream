package com.radiostream.di.components;

import com.radiostream.Settings;
import com.radiostream.javascript.bridge.PlayerEventsEmitter;
import com.radiostream.javascript.proxy.PlayerJsProxy;

import javax.inject.Singleton;

import dagger.Component;


@Component(modules = {})
@Singleton
public interface ApplicationComponent {
  void inject(PlayerJsProxy service);
  Settings provideSettings();
  PlayerEventsEmitter providePlayerEventsEmitter();
}
