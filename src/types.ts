import type {
  Dropbox as DropBoxType,
  DropboxAuth as DropboxAuthType,
} from "dropbox";

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
