import type { DropboxAuth } from "dropbox";
import { CLIENT_ID } from "./shared";
import { Application, ISong, PluginInfo } from "./types";

const PATH_PREFIX = "/audiogata";
const NOW_PLAYING_PATH = "/nowplaying.json";
const PLUGIN_PATH = "/plugins.json";

declare var application: Application;
let dropboxAuth: DropboxAuth;

const setTokens = (accessToken: string, refreshToken: string) => {
  dropboxAuth.setAccessToken(accessToken);
  dropboxAuth.setRefreshToken(refreshToken);
  application.onNowPlayingTracksAdded = saveNowPlaying;
  application.onNowPlayingTracksChanged = saveNowPlaying;
  application.onNowPlayingTracksRemoved = saveNowPlaying;
  application.onNowPlayingTracksSet = saveNowPlaying;
};

const save = async (path: string, items: any[]) => {
  // Requires files.content.write scope
  const dropbox = new Dropbox.Dropbox({ auth: dropboxAuth });
  await dropbox.filesUpload({
    path: PATH_PREFIX + path,
    mute: true,
    mode: { ".tag": "overwrite" },
    contents: JSON.stringify(items),
  });
};

const load = async (path: string): Promise<any[]> => {
  const dropbox = new Dropbox.Dropbox({ auth: dropboxAuth });
  const files = await dropbox.filesDownload({
    path: PATH_PREFIX + path,
  });
  const blob: Blob = (files.result as any).fileBlob;
  const json = await blob.text();
  const items = JSON.parse(json);
  return items;
};

const saveNowPlaying = async () => {
  const tracks = await application.getNowPlayingTracks();
  await save(NOW_PLAYING_PATH, tracks);
};

const loadNowPlaying = async () => {
  const tracks: ISong[] = await load(NOW_PLAYING_PATH);
  await application.setNowPlayingTracks(tracks);
};

const savePlugins = async () => {
  const plugins = await application.getPlugins();
  await save(PLUGIN_PATH, plugins);
};

const loadPlugins = async () => {
  const plugins: PluginInfo[] = await load(PLUGIN_PATH);
  application.installPlugins(plugins);
};

const sendOrigin = () => {
  const host = document.location.host;
  const hostArray = host.split(".");
  hostArray.shift();
  const domain = hostArray.join(".");
  const origin = `${document.location.protocol}//${domain}`;
  application.postUiMessage({
    type: "origin",
    value: origin,
  });
};

application.onUiMessage = async (message: any) => {
  switch (message.type) {
    case "login":
      let accessToken = message.accessToken;
      let refreshToken = message.refreshToken;
      localStorage.setItem("access_token", accessToken);
      localStorage.setItem("refresh_token", refreshToken);
      setTokens(accessToken, refreshToken);
      break;
    case "check-login":
      const token = localStorage.getItem("access_token");
      if (token) {
        await application.postUiMessage({ type: "login", accessToken: token });
      }
      sendOrigin();
      break;
    case "save":
      await saveNowPlaying();
      break;
    case "load":
      await loadNowPlaying();
      break;
    case "save-plugins":
      await savePlugins();
      break;
    case "load-plugins":
      await loadPlugins();
      break;
    case "logout":
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      break;
  }
};
application.onDeepLinkMessage = async (message: string) => {
  console.log(message);
  application.postUiMessage({ type: "deeplink", url: message });
};

const loadScript = () => {
  return new Promise<void>((resolve, reject) => {
    const src = "https://unpkg.com/dropbox/dist/Dropbox-sdk.min.js";
    const script = document.createElement("script");
    script.src = src;
    script.type = "text/javascript";
    document.getElementsByTagName("head")[0].appendChild(script);
    script.onload = () => {
      resolve();
    };
    script.onerror = () => {
      reject();
    };
  });
};

const init = async () => {
  await loadScript();
  dropboxAuth = new Dropbox.DropboxAuth({ clientId: CLIENT_ID });

  let accessToken = localStorage.getItem("access_token");
  let refreshToken = localStorage.getItem("refresh_token");
  if (accessToken && refreshToken) {
    setTokens(accessToken, refreshToken);
  }
};

init();
