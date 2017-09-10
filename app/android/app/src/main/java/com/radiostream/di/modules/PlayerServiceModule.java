package com.radiostream.di.modules;


import com.radiostream.player.PlayerService;

import dagger.Module;
import dagger.Provides;

@Module
public class PlayerServiceModule {

  private PlayerService mPlayerService;

  public PlayerServiceModule(PlayerService service) {
    mPlayerService = service;
  }

  @Provides
  PlayerService provideService() {
    return mPlayerService;
  }
}
