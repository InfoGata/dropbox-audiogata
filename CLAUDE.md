# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Dropbox plugin for AudioGata that enables users to store and sync their AudioGata data (playlists, now playing tracks, and plugins) to Dropbox. The plugin is built using SolidJS with TypeScript and Vite.

## Build Commands

```bash
# Build both plugin and options UI
npm run build

# Build options UI only (creates dist/options.html)
npm run build:options

# Build plugin JS only (creates dist/index.js)
npm run build:plugin
```

## Architecture

### Dual Build System
The project uses two separate Vite configurations:
- `vite.config.ts` - Builds the options UI (SolidJS app) into `dist/options.html`
- `plugin.vite.config.ts` - Builds the main plugin logic into `dist/index.js`

### Core Components

**Main Plugin (`src/index.ts`)**:
- Handles communication with AudioGata application via `application` global
- Manages Dropbox authentication and API calls
- Implements save/load functionality for playlists, plugins, and now playing tracks
- Uses message-based architecture with UI components

**Options UI (`src/App.tsx`)**:
- SolidJS component providing the plugin configuration interface
- Handles OAuth authentication flow with Dropbox
- Allows users to configure custom Dropbox app credentials
- Communicates with main plugin via `postMessage`

**Message Types (`src/types.ts`)**:
- Defines TypeScript interfaces for communication between UI and plugin
- Two-way message system: `UiMessageType` (UI → Plugin) and `MessageType` (Plugin → UI)

### Key Files Structure
```
src/
├── index.ts          # Main plugin logic (runs in AudioGata context)
├── App.tsx           # Options UI SolidJS component
├── options.tsx       # Options UI entry point
├── options.html      # Options page template
├── types.ts          # TypeScript message/data interfaces
├── shared.ts         # Shared constants (CLIENT_ID)
└── components/ui/    # SolidJS UI components (Button, Input, Accordion)
```

## Technology Stack

- **Framework**: SolidJS (not React, despite some alias configuration)
- **Build Tool**: Vite with custom configurations
- **Styling**: TailwindCSS with custom design system
- **UI Components**: @kobalte/core (SolidJS component library)
- **External API**: Dropbox SDK (loaded dynamically via CDN)
- **Plugin System**: AudioGata plugin typings from `@infogata/audiogata-plugin-typings`

## Authentication Flow

1. Plugin loads Dropbox SDK from CDN
2. User clicks login in options UI
3. Opens Dropbox OAuth in popup window
4. Handles redirect to extract access/refresh tokens  
5. Stores tokens in localStorage
6. Plugin maintains authentication state across sessions

## Data Storage Paths

The plugin stores data in these Dropbox paths:
- `/nowplaying.json` - Current playing queue
- `/plugins.json` - Installed plugins list
- `/playlists.json` - User playlists

## Development Notes

- Uses `viteSingleFile` plugin to bundle everything into single files
- Custom path aliases: `~` points to `./src`
- Theme system integrated with AudioGata's theme via `localStorage.setItem("kb-color-mode", theme)`
- Plugin manifest in `manifest.json` defines entry points and metadata