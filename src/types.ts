import type {
  Dropbox as DropBoxType,
  DropboxAuth as DropboxAuthType,
} from "dropbox";

export interface ISong {
  id?: string;
  name: string;
  source: string;
  from?: string;
  apiId?: string;
  duration?: number;
  albumId?: string;
  artistId?: string;
  artistName?: string;
  images: IImage[];
}

export interface IAlbum {
  name: string;
  apiId: string;
  from: string;
  artistName?: string;
  artistId?: string;
  images: IImage[];
}

export interface IArtist {
  name: string;
  apiId: string;
  from: string;
  images: IImage[];
}

export interface IPlaylist {
  id?: string;
  name: string;
  songs: ISong[];
  apiId?: string;
  images?: IImage[];
  from?: string;
}

export interface IImage {
  url: string;
  height: number;
  width: number;
}

export interface PluginInfo {
  id?: string;
  name: string;
  script: string;
  version?: string;
  description?: string;
  optionsHtml?: string;
  optionsSameOrigin?: boolean;
}

export interface NotificationMessage {
  message: string;
  type?: "default" | "success" | "error" | "warning" | "info";
}

export interface Application {
  searchAll?: (query: string) => Promise<{
    tracks?: ISong[];
    albums?: IAlbum[];
    artists?: IArtist[];
    playlists?: IPlaylist[];
  }>;
  getTrackUrl?: (song: ISong) => Promise<void>;
  getPlaylistTracks?: (playlist: IPlaylist) => Promise<void>;
  postUiMessage: (msg: any) => Promise<void>;
  onDeepLinkMessage: (message: any) => Promise<void>;
  onUiMessage?: (message: any) => void;
  endTrack: () => Promise<void>;
  setTrackTime: (currentTime: number) => Promise<void>;
  play?: (song: ISong) => Promise<void>;
  setVolume?: (volume: number) => Promise<void>;
  pause?: () => Promise<void>;
  resume?: () => Promise<void>;
  seek?: (time: number) => Promise<void>;
  getAlbumTracks?: (album: IAlbum) => Promise<ISong[]>;
  getArtistAlbums?: (artist: IArtist) => Promise<IAlbum[]>;
  setPlaybackRate?: (rate: number) => Promise<void>;
  getNowPlayingTracks: () => Promise<ISong[]>;
  setNowPlayingTracks: (tracks: ISong[]) => Promise<void>;
  onNowPlayingTracksAdded: (track: ISong[]) => Promise<void>;
  onNowPlayingTracksRemoved: (track: ISong[]) => Promise<void>;
  onNowPlayingTracksChanged: (track: ISong[]) => Promise<void>;
  onNowPlayingTracksSet: (track: ISong[]) => Promise<void>;
  createNotification: (notification: NotificationMessage) => Promise<void>;
  getCorsProxy: () => Promise<string>;
  installPlugins: (plugins: PluginInfo[]) => void;
  getPlugins: () => Promise<PluginInfo[]>;
  getPluginId: () => Promise<string>;
  getPlaylists: () => Promise<IPlaylist[]>;
  addPlaylists: (playlists: IPlaylist[]) => Promise<void>;
}

export interface AccessCodeResponse {
  access_token: string;
  account_id: string;
  expires_in: number;
  refresh_token: string;
  token_type: string;
  uid: string;
}

declare global {
  var Dropbox: {
    DropboxAuth: typeof DropboxAuthType;
    Dropbox: typeof DropBoxType;
  };
}
