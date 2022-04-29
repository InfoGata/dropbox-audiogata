import type { DropboxAuth } from "dropbox";
import { CLIENT_ID } from "./shared";
import { Application, ISong } from "./types";

const PATH_PREFIX = "/audiogata";
const NOW_PLAYING_PATH = "/nowplaying.json";

declare var application: Application;
let dropboxAuth: DropboxAuth;
let accessToken: string = "";
let refreshToken: string = "";

const setTokens = (accessToken: string, refreshToken: string) => {
  dropboxAuth.setAccessToken(accessToken);
  dropboxAuth.setRefreshToken(refreshToken);
};

application.onUiMessage = async (message: any) => {
  switch (message.type) {
    case "login":
      accessToken = message.accessToken;
      refreshToken = message.refreshToken;
      localStorage.setItem("access_token", accessToken);
      localStorage.setItem("refresh_token", refreshToken);
      setTokens(accessToken, refreshToken);
      break;
    case "check-login":
      const token = localStorage.getItem("access_token");
      if (token) {
        await application.postUiMessage({ type: "login", accessToken: token });
      }
      break;
    case "save":
      await save();
      break;
    case "logout":
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      break;
    case "load":
      await load();
      break;
  }
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

const save = async () => {
  // Requires files.content.write scope
  const dropbox = new Dropbox.Dropbox({ auth: dropboxAuth });
  const tracks = await application.getNowPlayingTracks();
  await dropbox.filesUpload({
    path: PATH_PREFIX + NOW_PLAYING_PATH,
    mute: true,
    mode: { ".tag": "overwrite" },
    contents: JSON.stringify(tracks),
  });
};

const load = async () => {
  const dropbox = new Dropbox.Dropbox({ auth: dropboxAuth });
  const files = await dropbox.filesDownload({
    path: PATH_PREFIX + NOW_PLAYING_PATH,
  });
  const blob: Blob = (files.result as any).fileBlob;
  const json = await blob.text();
  const tracks: ISong[] = JSON.parse(json);
  await application.setNowPlayingTracks(tracks);
};

application.onNowPlayingTracksAdded = save;
application.onNowPlayingTracksChanged = save;
application.onNowPlayingTracksRemoved = save;
application.onNowPlayingTracksSet = save;

const init = async () => {
  await loadScript();
  dropboxAuth = new Dropbox.DropboxAuth({ clientId: CLIENT_ID });

  accessToken = localStorage.getItem("access_token");
  refreshToken = localStorage.getItem("refresh_token");
  if (accessToken && refreshToken) {
    setTokens(accessToken, refreshToken);
  }
};

init();
