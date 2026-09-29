# dropbox-audiogata

An [AudioGata](https://github.com/InfoGata/audiogata) plugin that syncs your
playlists and favorites between devices through Dropbox.

[Installation Link](https://www.audiogata.com/plugininstall?manifestUrl=https://cdn.jsdelivr.net/gh/InfoGata/dropbox-audiogata@latest/manifest.json)

After installing, open AudioGata Settings → Cloud Sync, choose Dropbox and log
in. AudioGata then syncs by itself: shortly after you change something,
periodically, and whenever the app is opened or put in the background.

The library is stored as a single automerge file, `audiogata-library.automerge`,
in the app's Dropbox folder. Changes made on different devices are merged,
deletions included.
