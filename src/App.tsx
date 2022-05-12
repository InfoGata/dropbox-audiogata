import { FunctionalComponent } from "preact";
import { useState, useEffect } from "preact/hooks";
import { CLIENT_ID } from "./shared";
import { AccessCodeResponse } from "./types";

const redirectPath = "/login_popup.html";
const App: FunctionalComponent = () => {
  const [accessToken, setAccessToken] = useState("");
  const [message, setMessage] = useState("");
  const [redirectUri, setRedirectUri] = useState("");

  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      switch (event.data.type) {
        case "message":
          setMessage(message);
          break;
        case "origin":
          setRedirectUri(event.data.value + redirectPath);
          break;
        case "login":
          setAccessToken(event.data.accessToken);
          break;
      }
    };
    window.addEventListener("message", onMessage);
    parent.postMessage({ type: "check-login" }, "*");
    return () => window.removeEventListener("message", onMessage);
  }, []);

  const onLogin = async () => {
    const newWindow = window.open();
    const dropboxAuth = new Dropbox.DropboxAuth({ clientId: CLIENT_ID });
    const authUrl = await dropboxAuth.getAuthenticationUrl(
      redirectUri,
      undefined,
      "code",
      "offline",
      undefined,
      undefined,
      true
    );
    const url = authUrl.valueOf();
    window.onmessage = async (event: MessageEvent) => {
      if (event.source === newWindow && event.data.url) {
        const returnUrl = new URL(event.data.url);
        newWindow.close();
        const code = returnUrl.searchParams.get("code") || "";
        const accessCodeResponse = await dropboxAuth.getAccessTokenFromCode(
          redirectUri,
          code
        );
        const accessCodeResult =
          accessCodeResponse.result as AccessCodeResponse;
        const accessToken = accessCodeResult.access_token;
        const refreshToken = accessCodeResult.refresh_token;
        setAccessToken(accessToken);
        parent.postMessage(
          {
            type: "login",
            accessToken,
            refreshToken,
          },
          "*"
        );
      }
    };
    newWindow.location.href = url;
  };

  const onSave = () => {
    parent.postMessage({ type: "save" }, "*");
  };

  const onSavePlugins = () => {
    parent.postMessage({ type: "save-plugins" }, "*");
  };

  const onLoad = () => {
    parent.postMessage({ type: "load" }, "*");
  };

  const onLoadPlugins = () => {
    parent.postMessage({ type: "load-plugins" }, "*");
  };

  const onLogout = () => {
    parent.postMessage({ type: "logout" }, "*");
    setAccessToken("");
  };

  return (
    <>
      {accessToken ? (
        <div>
          {message}
          <div>
            <div>
              <button onClick={onSave}>Save Now Playing</button>
              <button onClick={onLoad}>Load Now Playing</button>
            </div>
            <div>
              <button onClick={onSavePlugins}>Save Plugins</button>
              <button onClick={onLoadPlugins}>Install Plugins</button>
            </div>
            <div>
              <button onClick={onLogout}>Logout</button>
            </div>
          </div>
        </div>
      ) : (
        <button onClick={onLogin}>Login</button>
      )}
    </>
  );
};

export default App;