package com.radiostream;

import android.app.Application;
import android.util.Log;

import com.facebook.react.ReactApplication;
import com.facebook.react.ReactInstanceManager;
import com.facebook.react.ReactNativeHost;
import com.facebook.react.ReactPackage;
import com.facebook.react.shell.MainReactPackage;
import com.radiostream.javascript.proxy.ProxyPackage;

import java.util.Arrays;
import java.util.List;

import timber.log.Timber;

public class MainApplication extends Application implements ReactApplication {

  private final ReactNativeHost mReactNativeHost = new ReactNativeHost(this) {
    @Override
    protected boolean getUseDeveloperSupport() {
      return BuildConfig.DEBUG;
    }

    @Override
    protected List<ReactPackage> getPackages() {
      return Arrays.<ReactPackage>asList(
        new MainReactPackage(),
        new ProxyPackage()
      );
    }
  };

  public void onCreate() {
    super.onCreate();

    Timber.plant(new Timber.DebugTree());
  }

  @Override
  public ReactNativeHost getReactNativeHost() {
    return mReactNativeHost;
  }
}
