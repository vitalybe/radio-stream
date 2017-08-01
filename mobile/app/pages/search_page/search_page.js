import loggerCreator from "../../utils/logger";
//noinspection JSUnresolvedVariable
var moduleLogger = loggerCreator("SearchPage");

import React, { Component } from "react";
import { observer } from "mobx-react";
import { backendMetadataApi } from "app/utils/backend_metadata_api/backend_metadata_api";
import { playlistsStore } from "app/stores/playlists_store";
import { navigator } from "app/stores/navigator";
import { player } from "app/stores/player/player";
import LoadingSpinner from "app/shared_components/loading_spinner";
import SearchPart from "app/pages/search_page/search_part";
import PlaylistNamePart from "app/pages/search_page/playlist_name_part";
import { masterStore } from "app/stores/master_store";

@observer
export default class SearchPage extends Component {
  prepareComponentState(props) {
    this.setState({
      askForName: false,
      saving: false,

      query: props.initialQuery,
    });
  }

  componentWillMount() {
    const logger = loggerCreator("componentWillMount", moduleLogger);
    logger.info(`props: ${JSON.stringify(this.props)}`);

    this.prepareComponentState(this.props);
  }

  componentWillReceiveProps(nextProps) {
    const logger = loggerCreator("componentWillReceiveProps", moduleLogger);
    logger.info(`props: ${JSON.stringify(this.props)}`);

    this.prepareComponentState(nextProps);
  }

  saveAndPlay = async (playlistName, query) => {
    const logger = loggerCreator("saveAndPlay", moduleLogger);

    this.setState({ saving: true });
    try {
      await backendMetadataApi.savePlaylist(playlistName, query);
      await playlistsStore.updatePlaylists();

      await player.changePlaylist(playlistName);
      player.play();
      navigator.navigateToPlayer();
    } catch (err) {
      logger.error(`save failed: ${err}`);
    }
  };

  saveIfHasName = async (playlistName, query) => {
    const logger = loggerCreator("saveIfHasName", moduleLogger);

    if (!playlistName) {
      logger.info(`no playlist name. showing ui to get name`);
      this.setState({ askForName: true, query: query });
    } else {
      await this.saveAndPlay(playlistName, query);
    }
  };

  deletePlaylist = async playlistName => {
    const logger = loggerCreator("deletePlaylist", moduleLogger);
    logger.info(`deleting: ${playlistName}`);

    this.setState({ saving: true });
    await backendMetadataApi.deletePlaylist(playlistName);
    await playlistsStore.updatePlaylists();

    masterStore.isNavigationSidebarOpen = true;
    navigator.navigateToPlayer();
  };

  render() {
    if (this.state.saving) {
      return <LoadingSpinner message="Saving playlist..." />;
    } else if (this.state.askForName === false) {
      return (
        <SearchPart
          initialQuery={this.props.initialQuery}
          playlistName={this.props.playlistName}
          onSaveAndPlay={this.saveIfHasName}
          onDeletePlaylist={this.deletePlaylist}
        />
      );
    } else {
      return <PlaylistNamePart query={this.state.query} onSaveAndPlay={this.saveIfHasName} />;
    }
  }
}

SearchPage.propTypes = {
  initialQuery: React.PropTypes.string,
  playlistName: React.PropTypes.string,
};
