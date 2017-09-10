package com.radiostream.di.components;

import com.radiostream.di.modules.ContextModule;
import com.radiostream.di.modules.PlayerServiceModule;
import com.radiostream.di.scopes.PlayerServiceScope;
import com.radiostream.player.PlayerService;

import dagger.Component;

@Component(dependencies = {JsProxyComponent.class}, modules = {ContextModule.class, PlayerServiceModule.class})
@PlayerServiceScope
public interface PlayerServiceComponent {
  void inject(PlayerService service);
}