package com.radiostream.di.components;

import com.radiostream.Settings;
import com.radiostream.di.modules.ReactContextModule;
import com.radiostream.javascript.proxy.PlayerJsProxy;

import javax.inject.Singleton;

import dagger.Component;

/**
 * Created by vitaly on 08/11/2016.
 */

@Component(modules = {ReactContextModule.class})
@Singleton
public interface JsProxyComponent {
  void inject(PlayerJsProxy service);
  Settings provideSettings();
}
