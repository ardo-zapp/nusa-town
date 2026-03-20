# Nusa Town

<details>
<summary>English</summary>

<br>

A game of ponies building a town.

This is a Pony Town Custom Server project with modified Indonesian nuances. This project requires some adjustments, please adjust it yourself according to your needs.

**NOTE:** This is an old version of the project. Pony Town no longer provides source code and has become closed source. **Please do not use this project for commercial purposes.**

---

### 1. Prerequisites

* **Operating System**: Ubuntu 24.04.4 LTS (Highly Recommended) or Debian.
* [Node.js](https://nodejs.org/en/download/) (version 24 LTS)
* MongoDB 7+: [download link](https://www.mongodb.com/download-center/community) and [installation instructions](https://docs.mongodb.com/manual/administration/install-community/)
* System dependencies for Canvas:
  ```bash
  sudo apt-get install build-essential libcairo2-dev libpango1.0-dev libjpeg-dev libgif-dev librsvg2-dev pkg-config
  ```

---

### 2. Installation

```bash
npm install --legacy-peer-deps
```

---

### 3. Setup Configuration

To start configuring your server, simply copy the template provided:

```bash
cp config-template.json config.json
```

Then edit `config.json` to suit your needs. Below is the explanation of what each property does:

```json
{
  "title": "My custom server", // Name of your server displayed on the browser tab
  "discordLink": "<LINK_TO_DISCORD_INVITE>", // URL to your Discord server shown in the footer
  "twitterLink": "<LINK_TO_TWITTER>", // URL to your Twitter account
  "contactEmail": "your_contact_email@example.com", // Support contact email
  "contactDiscord": "your_contact_discord#0000", // Support discord username
  "wdsUrl": "http://localhost:8091", // Webpack Dev Server URL used during local development (npm run wds)
  "sw": true, // Toggle Service Worker registration (used for PWA/offline mode)
  "noindex": false, // Sets X-Robots-Tag header to prevent search engines from indexing your site
  "rollbar": { // Error tracking configuration (leave empty if unused)
    "environment": "",
    "clientToken": "",
    "serverToken": "",
    "gulpToken": ""
  },
  "analytics": { // Google Analytics config (leave empty if unused)
    "trackingID": ""
  },
  "port": 8090, // The public-facing HTTP port the game server listens to
  "adminPort": 8091, // The HTTP port for the admin/standalone server
  "host": "http://localhost:8090/", // The root public URL of your server. Change to "https://example.com/" in production.
  "local": "localhost:8090", // IP:Port pair used for internal cluster communication (login/game API)
  "adminLocal": "localhost:8091", // Internal IP:Port pair for the admin server
  "proxy": false, // Set to true if you are using Nginx/Apache/Cloudflare reverse proxies so Express trusts proxy headers (X-Forwarded-For)
  "secret": "<some_random_string_here>", // Secret for hashing Express session cookies (must be >= 16 chars)
  "token": "<some_random_string_here>", // Secret token for verifying internal cluster API requests (must be >= 16 chars)
  "db": "mongodb://<username>:<password>@localhost:27017/<database_name>", // Connection string for your MongoDB database
  "oauth": { // OAuth keys for social login
    "google": { ... },
    "github": { ... },
    "discord": { ... }
  },
  "season": "spring", // Default season ("spring", "summer", "autumn", "winter") applied to all servers globally
  "holiday": "none", // Default holiday ("none", "halloween", "christmas", etc) applied to all servers globally
  "servers": [ // Defines the individual game sub-servers running on your cluster
    {
      "id": "main", // Server ID (used by CLI and start commands)
      "port": 8090, // Express port for the game REST API
      "wsPort": 10092, // uWebSockets port for the game WebSocket traffic
      "path": "/s00/ws", // The WebSocket route path matching the reverse proxy config
      "local": "localhost:8090", // Internal host for the cluster to send requests to this server
      "name": "18+ Server", // Server name visible to players in the lobby
      "desc": "18+ speaking server", // Server description in the lobby
      "season": "summer", // Overrides global season setting
      "holiday": "none", // Overrides global holiday setting
      "flag": "", // An optional string identifier label for the UI (e.g. 'test', 'ru')
      "flags": { // Server feature toggles
        "test": false, // Highlights the server as a test server
        "editor": false // Enables the in-game map editor tools
      },
      "alert": "18+" // Optional warning pop-up before joining the server
    }
  ]
}
```

#### Generating Secret and Token

You **MUST** provide **unique**, **random** values for the `secret` and `token` fields of your config. It is **extremely dangerous** to leave these as default, as these values serve as authentication tokens for internal APIs and session cookies.

To generate new values for these parameters, you can use the following command:

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('base64'))"
```

#### Setting up Database

1. Install MongoDB
2. Start `mongosh` or `mongo` from command line.
3. Type `use your_database_name` to create a database.
4. Type `db.new_collection.insert({ some_key: "some_value" })` to initialize the database.
5. Create a database user:
   ```javascript
   db.createUser({
     user: "your_username",
     pwd: "your_password",
     roles: [ { role: "readWrite", db: "your_database_name" } ]
   })
   ```
6. Type `quit()` to exit mongo.

#### Setting up OAuth keys

Get OAuth keys for the authentication platform of your choice (github, google, twitter, vkontakte, discord).

**Github**
- Go to https://github.com/settings/developers create new OAuth app.
- Set authorization callback URL to `http://<your domain>/auth/github/callback` or `http://localhost:8090/auth/github/callback` if using localhost server.
- Add this to `oauth` field in your `config.json`:
  ```json
  "github": {
    "clientID": "<your_client_id>",
    "clientSecret": "<your_client_secret>"
  }
  ```

**Twitter**
- Go to https://developer.twitter.com/en/apps create new app.
- Set callback URL to `http://<your domain>/auth/twitter/callback` or `http://localhost:8090/auth/twitter/callback` if using localhost server.
- Add this to `oauth` field in your `config.json`:
  ```json
  "twitter": {
    "consumerKey": "<your_consumer_key>",
    "consumerSecret": "<your_consumer_secret>"
  }
  ```

**Google**
- Go to https://console.developers.google.com/apis/dashboard.
- Add Authorized JavaScript origins: `http://<your domain>` or `http://localhost:8090/`.
- Add Authorized redirect URIs: `http://<your domain>/auth/google/callback` or `http://localhost:8090/auth/google/callback` if using localhost server.
- Add this to `oauth` field in your `config.json`:
  ```json
  "google": {
    "clientID": "<your_client_id>",
    "clientSecret": "<your_client_secret>"
  }
  ```

**VKontakte**
- Go to https://vk.com/apps?act=manage and create a new app.
- Set Authorized redirect URI to `http://<your domain>/auth/vkontakte/callback` or `http://localhost:8090/auth/vkontakte/callback` if using localhost server.
- Add this to `oauth` field in your `config.json`:
  ```json
  "vkontakte": {
    "clientID": "<your_app_id>",
    "clientSecret": "<secure_key>"
  }
  ```

**Discord**
- Go to https://discord.com/developers/applications/.
- Navigate to the OAuth2 tab and add `http://<your domain>/auth/discord/callback` (or `http://localhost:8090/auth/discord/callback` for localhost server) as a redirect URI.
- Add this to the `oauth` field in your `config.json`:
  ```json
  "discord": {
    "clientID": "<your_client_id>",
    "clientSecret": "<your_client_secret>"
  }
  ```

---

### 4. Running the Server

#### Production Environment

```bash
npm run build
npm start
```

#### Roles Management & Admin CLI

You can use the built-in `cli.js` to manage server roles directly from the command line:
```bash
node cli.js --addrole <account_id> <role>   # roles: superadmin, admin, mod, dev
node cli.js --removerole <account_id> <role>
```
*Note: Other advanced commands (like `--ban`, `--mute`, `--clear-origins`) are also available in `cli.js` for moderating your game server.*

The Web Admin panel is accessible at `<base_url>/admin/` (requires `admin` or `superadmin` role).
In-game Tools are accessible at `<base_url>/tools/` (only available in dev mode or when starting the game server with the `--tools` flag).

#### Running Multiple Processes (Cluster Setup)

For larger servers, you'll want to separate sub-servers into different processes instead of running them on a single thread. The `id` string (e.g., `main`, `safe`, `dev`) must match the `id` field defined inside the `servers: []` block of your `config.json`.

**Method 1 (Recommended Standard Multi-Server)**

This keeps your login and admin connected to your main server process, while hosting other sub-servers separately:
```bash
npm start                       # Starts login, admin, and the "main" game server
node pony-town.js --game safe   # Starts the safe server (in a separate terminal/screen)
node pony-town.js --game dev    # Starts the dev server (in a separate terminal/screen)
```

**Method 2 (Fully Isolated Processes)**

If you want to isolate everything including the login and admin standalone server:
```bash
node pony-town.js --login                    # Login server
node pony-town.js --admin --standaloneadmin  # Admin server
node pony-town.js --game main                # Main 18+ server
node pony-town.js --game safe                # Safe server
node pony-town.js --game dev                 # Dev server
```

*Note: For large user bases, it's highly recommended to increase the memory allocation limit for the game processes:*
```bash
node --max_old_space_size=8192 pony-town.js --game main
```

#### Beta Environment (In-Game Editor)
If you want to run a live "Beta" testing server with built-in development tools, in-game debuggers, and the map editor enabled:

```bash
npm run build-beta
node pony-town.js --login --admin --game --tools --beta
```
*Important Notes on Beta Features:*
1. **Server Configuration:** To actually see developer-only map objects and use the map editor, ensure your `config.json` has `"test": true` and `"editor": true` enabled under the `flags` field for that server.
2. **Build Dependency:** You **MUST** run `npm run build-beta` first before starting the node server with the `--beta` flag (e.g. `node pony-town.js --game dev --beta`).
3. The `--beta` backend flag opens admin chat commands and cheat features. However, the heavy Map Editor user interface (in the browser) is *physically removed* from the JavaScript bundle during a standard `npm run build` to save bandwidth. Running a standard `npm run build` later on will overwrite and erase your beta UI tools.
 Development Environment

```bash
npm run ts-watch        # terminal 1
npm run wds             # terminal 2
npx gulp dev            # terminal 3
npx gulp test           # terminal 4 (optional)
```

#### Useful NPM & Gulp Scripts
The `package.json` file contains several built-in scripts to aid your development and deployment workflows. Here are the most important ones:

| Command | Description |
|---|---|
| `npm start` | Starts all servers (login, admin, and game main) simultaneously using the default config. |
| `npm run startlocal` | Starts all servers passing the `--local` flag to enable loopback development mode. |
| `npm run build` | Full production build of the frontend, maps, and tools. |
| `npm run build-fast` | Runs a production build faster using parallel workers. |
| `npm run build-beta` | Builds the frontend including debugging tools (for beta environments). |
| `npm run wds` | Starts the Webpack Dev Server to compile and serve frontend changes in real-time (usually on port 8091). |
| `npm run ts-watch` | Watches and live-compiles backend TypeScript (`src/ts`) files into JavaScript (`src/scripts`). |
| `npx gulp dev --sprites` | Compiles image assets into usable sprite sheets. |
| `npm run test-ts` | Executes all mocha `.spec.ts` unit tests directly using ts-node. |
| `npm run lint` | Runs the TSLint checking to ensure code style compliance. |
| `npm run sw` | Generates and minifies the PWA service worker files (`build/sw.js`). |

---

### 5. Service Worker / Progressive Web App (PWA)

If you'd like your application to cache assets heavily or act as a Progressive Web App (Offline Mode), you must enable the Service Worker flag `"sw": true` in your `config.json`.

After doing so, make sure to generate the service worker files via:
```bash
npm run sw
```
*(This command runs `workbox generateSW` behind the scenes and then uglifies the result into your `build/` directory.)*

---

### 6. Deployment & Production

To run the server in a production environment, you must configure **Apache Reverse Proxy** and **PM2** to manage the Node.js *processes* automatically (autostart, logs, restarts) in the *background*. This repository includes an `ecosystem.config.js` configuration file for PM2.

#### A. Configuring `config.json`

Before starting PM2 and the Proxy, you must adjust your `config.json` to separate the local ports for each *instance* and ensure the proxy headers are forwarded correctly:

1. You must set proxy to `true`:
   ```json
   "proxy": true,
   "host": "https://example.com/"
   ```
2. Change the port for the server with the ID `main` to `8092` and its local value:
   ```json
   "id": "main",
   "port": 8092,
   //...
   "local": "localhost:8092",
   ```
3. Change the port for the server with the ID `safe` to `8093` and its local value:
   ```json
   "id": "safe",
   "port": 8093,
   //...
   "local": "localhost:8093",
   ```
4. **Delete the entire `dev` server configuration block** (the one with `"id": "dev"`) from `config.json` because this configuration is only intended for *production*.

#### B. Running PM2

1. **Install PM2 globally**:
   ```bash
   npm install -g pm2
   ```

2. **Run the server cluster**:
   Make sure you have built the server (`npm run build-fast`) first, then run:
   ```bash
   pm2 start ecosystem.config.js
   ```

3. **PM2 Autostart** (Automatically start on server *reboot*):
   ```bash
   pm2 startup
   pm2 save
   ```

#### C. Apache Reverse Proxy Setup

A reverse proxy must be set up to serve your game over standard HTTP/HTTPS ports (80 and 443) and route client WebSocket *requests* to the correct PM2 ports.

1. **Install Apache2 & Enable Modules**:
   ```bash
   sudo apt update
   sudo apt install apache2
   sudo a2enmod proxy proxy_http proxy_balancer proxy_wstunnel lbmethod_byrequests headers rewrite ssl
   sudo systemctl restart apache2
   ```

2. **Create an Apache VirtualHost configuration file** (e.g., `/etc/apache2/sites-available/nusatown.conf`):
```apacheconf
<VirtualHost *:80>
    ServerName example.com

    RewriteEngine On
    RewriteRule ^(.*)$ https://%{HTTP_HOST}$1 [R=301,L]
</VirtualHost>

<VirtualHost *:443>
    ServerName example.com

    ProxyPreserveHost On
    SSLEngine On

    SSLCertificateFile /etc/letsencrypt/live/example.com/fullchain.pem
    SSLCertificateKeyFile /etc/letsencrypt/live/example.com/privkey.pem

    SSLProtocol all -SSLv3 -TLSv1 -TLSv1.1 +TLSv1.2 +TLSv1.3
    SSLHonorCipherOrder on

    RequestHeader set X-Forwarded-Proto "https"
    RequestHeader set X-Forwarded-Port "443"

    # Main Server WebSocket (wsPort: 10092)
    ProxyPass "/s00/ws" "ws://localhost:10092/s00/ws" flushpackets=on keepalive=On retry=0 timeout=3600 max=200 acquire=3000
    ProxyPassReverse "/s00/ws" "ws://localhost:10092/s00/ws"

    # Safe Server WebSocket (wsPort: 10093)
    ProxyPass "/s01/ws" "ws://localhost:10093/s01/ws" flushpackets=on keepalive=On retry=0 timeout=3600 max=200 acquire=3000
    ProxyPassReverse "/s01/ws" "ws://localhost:10093/s01/ws"

    # Admin WS - Standalone (wsPortAdmin: 10091)
    ProxyPass "/admin/ws-admin" "ws://localhost:10091/admin/ws-admin" flushpackets=on keepalive=On retry=0 timeout=3600 max=50 acquire=3000
    ProxyPassReverse "/admin/ws-admin" "ws://localhost:10091/admin/ws-admin"

    # HTTP Fallback / Root Game (port login/main: 8090)
    ProxyPass "/" "http://localhost:8090/" keepalive=On retry=0
    ProxyPassReverse "/" "http://localhost:8090/"

    ErrorLog ${APACHE_LOG_DIR}/nusatown_error.log
    CustomLog ${APACHE_LOG_DIR}/nusatown_access.log combined
</VirtualHost>
```

3. **Enable the site configuration and restart Apache**:
```bash
sudo a2ensite nusatown.conf
sudo systemctl restart apache2
```

---

### 7. Customization & Advanced Modifications

#### Customization Locations
- `package.json` - title and description of the website
- `assets/images` - logos and team avatars
- `public/images` - additional logos
- `favicons` - icons
- `src/ts/server/start.ts` - world setup
- `src/style/partials/_variables.scss` - page style configuration

#### Essential Scripts & Tools (`src/ts/tools/`)
The project contains several utility scripts for development (such as palette manipulations, font builders, and sprites generators). The most commonly used tool during asset modding is the sprite compiler:
```bash
npx gulp dev --sprites
```
This leverages `create-sprites.ts` to pack images from `assets-source` into optimized game sprites.

#### Adding Assets (Items / Clothing)
This game uses a *sprite sheet* system to render animations, objects, hair, and items.

1. **Sprite Images**: Place new image files in the `assets-source` folder or modify existing `.png` files.
2. **Sprite Generator**: Use `npx gulp dev --sprites` to compile images into sprite sheets.
   > **Tip**: You can use a trigger file by touching `src/ts/tools/trigger.txt` to trigger automatic sprite generation if you are in dev mode.
3. **Registration**: Ensure your new objects are added to initialization scripts like `src/ts/common/pony.ts` or `src/ts/common/entities.ts`.

#### Modifying Gameplay & Interactive Entities
Adding custom gameplay logic involves defining new objects (Entities) and how players interact with them (InteractActions, items, events).

**1. Adding Interactive Objects (Items / Events)**
To create an object players can click or pick up (like food, gifts, or tools):
- Open `src/ts/common/interfaces.ts` and add a new constant to `enum InteractAction` (e.g. `GiveMyCustomItem`).
- Open `src/ts/common/entities.ts`. Register your new object (Doodad) with the interactive flag and your custom action:
  ```typescript
  export const myCustomTable = doodad(n('my-custom-table'), sprites.my_table_sprite, xOffset, yOffset, 0,
      mixFlags(EntityFlags.Interactive),
      base => base.interactRange = 5,
      mixInteractAction(InteractAction.GiveMyCustomItem),
      mixColliderRect(-13, -12, 26, 14)
  );
  ```

**2. Handling the Interaction (Server-Side)**
- Open `src/ts/server/playerUtils.ts` and locate the `interactWith()` function.
- Add a new `case` for your `InteractAction` inside the switch block:
  ```typescript
  case InteractAction.GiveMyCustomItem: {
      // Logic for handling the interaction.
      // Example: Give a player a specific item.
      const itemToGive = entities.myCustomItem.type;
      holdItem(client.pony, itemToGive);
      break;
  }
  ```

**3. Handling Custom Player Actions (Animations/Emotes)**
To add a new core action (e.g. "Dancing"):
- **Declaration**: Open `src/ts/common/interfaces.ts` and add your action inside `enum Action`. Also, define a new `EntityState`.
- **Client Side**: Add UI triggers or hotkeys in `src/ts/client/playerActions.ts` to fire `game.send(server => server.action(Action.YourNewAction))`. Provide visual feedback in `src/ts/client/ponyDraw.ts`.
- **Server Side**: Handle the request in `src/ts/server/serverActions.ts`.

#### Custom Map Creation
To add a new map:
1. Go to `src/ts/server/maps/`.
2. Create a map creation script (or duplicate `customMap.ts`) and define tile structure, trees, objects.
3. Open `src/ts/server/start.ts`, register, and initiate your new map class to the `world` instance.

---

### 8. Repo Quirks

Due to an issue with the build system, an old copy of `src/ts/generated/sprites.ts` is shipped with this repository. To prevent Git from tracking local modifications on this file, use:

```bash
git update-index --assume-unchanged src/ts/generated/sprites.ts
```

---

### 9. In-Game Chat Commands
Players and moderators can type special slash commands directly into the in-game chat to trigger specific behaviors.

<details>
<summary><b>Click to show/hide the full command list</b></summary>

#### Player Commands
* `/help` or `/h` or `/?` - Show help and shortcuts menu.
* `/roll [[min-]max]` or `/rand` - Randomize a number in chat.
* `/w <name>` - Whisper to a player.
* `/r` - Reply to the last whisper.
* `/e <id>` - Set permanent facial expression.
* `/turn` - Turn head backwards.
* `/boop` or `/)` - Perform a boop action.
* `/drop` - Drop the held item (food/tool).
* `/droptoy` - Drop the held toy.
* `/gifts`, `/candies`, `/eggs`, `/clovers`, `/toys` - Show your collection scores for seasonal items.
* `/unstuck` - Respawn at the map spawn point.
* `/leave` - Instantly leave the game.
* `/sit`, `/lie`, `/fly`, `/stand` - Perform basic stances.
* `/blush`, `/love`, `/sleep`, `/cry` - Special animated actions.
* `/swap <name>` - Quickly swap your character without going back to the lobby.

#### House / Island Commands
* `/savehouse` - Saves the current house furniture setup.
* `/loadhouse` - Loads the saved house setup.
* `/resethouse` - Resets the house back to its default state.
* `/lockhouse` - Prevents guests from editing your house map.
* `/unlockhouse` - Enables house editing by guests.
* `/removetoolbox` / `/restoretoolbox` - Removes or restores the map-editing toolbox item from the island.

#### Moderator & Admin Commands (Some require *beta* or *dev* mode)
* `/goto <account_id>` - (Mod) Instantly go to a specific player's position.
* `/tp <location_name> | <x> <y>` - (Mod) Teleport to a named map region or specific X/Y coordinate.
* `/emotetest` - (Mod) Print all emotes.
* `/announce <message>` - (Admin) Broadcast a global system announcement across the entire server.
* `/time <hour>` - (Admin) Change the server day/night time (0-24).
* `/togglerestore` - (Admin) Toggle automatic map terrain restoration.
* `/resettiles` - (Admin) Revert all map tiles to the original loaded state.

#### Superadmin Commands (Some require *beta* or *dev* mode)
* `/update` / `/shutdown` - Signal game servers to prepare for a maintenance shutdown.
* `/loadmap` / `/savemap` - Load or save the map instance state to local files.
* Cheat and debug tools like `/season`, `/weather`, `/hold`, `/noclouds` and `/testparty` are undocumented here as they can only be executed in *non-production* environments (`--beta` or `DEVELOPMENT`). Please read `BETA_DEV_FEATURES.md`.
</details>


---


### 10. Running with Docker

### Prerequisites

* [Docker](https://docs.docker.com/get-docker/)
* [Docker Compose](https://docs.docker.com/compose/install/) (included with Docker Desktop)

### Setup

1. Create environment file from template:

```bash
cp .env.example .env
```

2. Create config file from template:

```bash
cp config-template.json config.json
```

3. Update `config.json`:
   - Set `"proxy": true`
   - Set `"db"` to: `"mongodb://<MONGO_USERNAME>:<MONGO_PASSWORD>@mongodb:27017/<MONGO_DATABASE>?authSource=admin"` (use the values from your `.env` file)
   - Generate **two different** random values for `"secret"` and `"token"`:

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('base64'))"
```

4. Build and run:

```bash
docker compose up --build
```

### Services Architecture

The Docker setup runs the following services behind an Nginx reverse proxy:

| Service | Description | Internal Port |
|---|---|---|
| `nginx` | Reverse proxy, routes all traffic | 80 → exposed as 8090 |
| `login` | Authentication & web page | 8090 |
| `game-main` | Main game server (18+) | 10092 (WS) |
| `game-safe` | Safe game server (PG) | 10093 (WS) |
| `admin` | Admin dashboard | 8091 |
| `mongodb` | Database | 27017 |

Access the application:
- **Game**: `http://localhost:8090`
- **Admin**: `http://localhost:8090/admin/`

### Useful Commands

```bash
docker compose up --build     # build and start all services
docker compose up -d          # start in background (detached)
docker compose down           # stop all services
docker compose logs -f        # view logs (follow mode)
docker compose logs game-main # view logs for specific service
docker compose restart login  # restart specific service
```

### Adding Roles via Docker

```bash
docker compose exec game-main node cli.js --addrole <account_id> superadmin
```

</details>

<details open>
<summary>Bahasa Indonesia</summary>

<br>

Sebuah game tentang pony-pony yang membangun kota.

Ini adalah proyek Pony Town Custom Server dengan modifikasi nuansa Indonesia. Proyek ini memerlukan beberapa penyesuaian, silakan sesuaikan sendiri sesuai dengan kebutuhan Anda.

**CATATAN:** Ini adalah versi lama dari proyek ini. Pony Town tidak lagi menyediakan kode sumber dan telah menjadi sumber tertutup (closed source). **Jangan jadikan project ini sebagai media komersial.**

---

### 1. Persyaratan Sistem

* **Sistem Operasi**: Ubuntu 24.04.4 LTS (Sangat Direkomendasikan) atau Debian.
* [Node.js](https://nodejs.org/en/download/) (versi 24 LTS)
* MongoDB 7+: [tautan unduhan](https://www.mongodb.com/download-center/community) dan [petunjuk instalasi](https://docs.mongodb.com/manual/administration/install-community/)
* Dependensi sistem untuk Canvas:
  ```bash
  sudo apt-get install build-essential libcairo2-dev libpango1.0-dev libjpeg-dev libgif-dev librsvg2-dev pkg-config
  ```

---

### 2. Instalasi

```bash
npm install --legacy-peer-deps
```

---

### 3. Pengaturan Konfigurasi

Untuk mulai mengkonfigurasi server Anda, cukup salin file template yang sudah disediakan:

```bash
cp config-template.json config.json
```

Kemudian edit file `config.json` sesuai dengan kebutuhan Anda. Di bawah ini adalah penjelasan dari fungsi setiap properti:

```json
{
  "title": "Nusa Town", // Nama server Anda yang ditampilkan di tab browser
  "discordLink": "<LINK_TO_DISCORD_INVITE>", // Tautan ke server Discord Anda yang ditautkan pada footer
  "twitterLink": "<LINK_TO_TWITTER>", // Tautan ke akun Twitter Anda
  "contactEmail": "your_contact_email@example.com", // Email kontak dukungan (support email)
  "contactDiscord": "your_contact_discord#0000", // Kontak Discord dukungan pengguna
  "wdsUrl": "http://localhost:8091", // URL Webpack Dev Server untuk keperluan development lokal (npm run wds)
  "sw": true, // Mengaktifkan fitur Service Worker (Progressive Web App / mode offline)
  "noindex": false, // Jika true, menambahkan header X-Robots-Tag agar website tidak diindeks oleh Google / mesin pencari
  "rollbar": { // Konfigurasi tracking error Rollbar (kosongkan jika tidak dipakai)
    "environment": "",
    "clientToken": "",
    "serverToken": "",
    "gulpToken": ""
  },
  "analytics": { // Konfigurasi tracking Google Analytics (kosongkan jika tidak dipakai)
    "trackingID": ""
  },
  "port": 8090, // Port HTTP publik yang mendengarkan koneksi game server
  "adminPort": 8091, // Port HTTP untuk server mandiri administrator (standalone admin server)
  "wsPortAdmin": 10091, // Port WebSocket khusus untuk traffic administrator (standalone admin server).
  "host": "http://localhost:8090/", // URL domain utama server. Ganti menjadi "https://example.com/" pada tahap production.
  "local": "localhost:8090", // Pasangan IP:Port internal yang digunakan kluster untuk berkomunikasi (contoh: login mengirim auth ke game server)
  "adminLocal": "localhost:8091", // IP:Port internal server admin
  "proxy": false, // Ubah ke true jika Anda menggunakan Nginx/Apache/Cloudflare reverse proxy, agar header IP Client (X-Forwarded-For) diteruskan dengan aman
  "secret": "<some_random_string_here>", // Kunci hash untuk sesi dan cookie Express (harus unik dan >= 16 karakter)
  "token": "<some_random_string_here>", // Token rahasia internal untuk memvalidasi request API antar-kluster (harus unik dan >= 16 karakter)
  "db": "mongodb://<username>:<password>@localhost:27017/<database_name>", // String koneksi database MongoDB
  "oauth": { // Kunci-kunci pengaturan API sosial media login
    "google": { ... },
    "github": { ... },
    "discord": { ... }
  },
  "season": "spring", // Musim default global ("spring", "summer", "autumn", "winter") untuk semua sub-server
  "holiday": "none", // Liburan default global ("none", "halloween", "christmas", dll)
  "servers": [ // Definisi setiap sub-server (game server) yang berjalan di kluster Anda
    {
      "id": "main", // ID Server internal (dipakai oleh CLI/startup script `--game main`)
      "port": 8090, // Port Express HTTP (REST API game map)
      "wsPort": 10092, // Port khusus uWebSockets untuk lalu-lintas WebSocket secara direct
      "path": "/s00/ws", // Rute WebSocket path yang dicocokkan dengan reverse proxy Apache/Nginx
      "local": "localhost:8090", // Alamat host lokal yang dituju sistem ketika membroadcast info ke map ini
      "name": "18+ Server", // Nama sub-server yang muncul di daftar pilihan lobi
      "desc": "18+ speaking server", // Deskripsi singkat di lobi
      "season": "summer", // Melakukan override / menimpa musim global
      "holiday": "none", // Melakukan override / menimpa liburan global
      "flag": "", // Label identifikasi sub-server tambahan di UI (contoh: 'test', 'ru')
      "flags": { // Toggle fitur in-game pada sub-server
        "test": false, // Menandai server dengan border "test"
        "editor": false // Mengaktifkan alat modifikasi map (map editor) bagi user
      },
      "alert": "18+" // Pop-up persetujuan opsional sebelum user memasuki server ini
    }
  ]
}
```

#### Menghasilkan Secret dan Token

Anda **HARUS** memberikan nilai yang **unik** dan **acak** untuk field `secret` dan `token` di konfigurasi Anda. Sangat berbahaya membiarkannya default, karena nilai ini berfungsi sebagai token otentikasi untuk API internal dan session cookie.

Untuk menghasilkan nilai baru, Anda dapat menggunakan perintah berikut di terminal:

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('base64'))"
```

#### Menyiapkan Database

1. Instal MongoDB
2. Mulai `mongosh` atau `mongo` dari baris perintah.
3. Ketik `use your_database_name` untuk membuat database.
4. Ketik `db.new_collection.insert({ some_key: "some_value" })` untuk menginisialisasi database.
5. Buat pengguna database:
   ```javascript
   db.createUser({
     user: "your_username",
     pwd: "your_password",
     roles: [ { role: "readWrite", db: "your_database_name" } ]
   })
   ```
6. Ketik `quit()` untuk keluar.

#### Menyiapkan kunci OAuth

Dapatkan kunci OAuth untuk platform pilihan Anda (github, google, twitter, vkontakte, discord).

**Github**
- Buka https://github.com/settings/developers buat aplikasi OAuth baru.
- Atur authorization callback URL ke `http://<domain Anda>/auth/github/callback` atau `http://localhost:8090/auth/github/callback` untuk server localhost.
- Tambahkan ini ke field `oauth` di `config.json` Anda:
  ```json
  "github": {
    "clientID": "<client_id_Anda>",
    "clientSecret": "<client_secret_Anda>"
  }
  ```

**Twitter**
- Buka https://developer.twitter.com/en/apps buat aplikasi baru.
- Atur callback URL ke `http://<domain Anda>/auth/twitter/callback` atau `http://localhost:8090/auth/twitter/callback` untuk server localhost.
- Tambahkan ini ke field `oauth` di `config.json` Anda:
  ```json
  "twitter": {
    "consumerKey": "<consumer_key_Anda>",
    "consumerSecret": "<consumer_secret_Anda>"
  }
  ```

**Google**
- Buka https://console.developers.google.com/apis/dashboard buka credentials (kredensial) dan buat entri baru.
- Tambahkan ke Authorized JavaScript origins `http://<domain Anda>` atau `http://localhost:8090/` untuk server localhost.
- Tambahkan ke Authorized redirect URIs `http://<domain Anda>/auth/google/callback` atau `http://localhost:8090/auth/google/callback` untuk server localhost.
- Tambahkan ini ke field `oauth` di `config.json` Anda:
  ```json
  "google": {
    "clientID": "<client_id_Anda>",
    "clientSecret": "<client_secret_Anda>"
  }
  ```

**VKontakte**
- Buka https://vk.com/apps?act=manage dan buat aplikasi baru.
- Atur Authorized redirect URI ke `http://<domain Anda>/auth/vkontakte/callback` atau `http://localhost:8090/auth/vkontakte/callback` untuk server localhost.
- Tambahkan ini ke field `oauth` di `config.json` Anda:
  ```json
  "vkontakte": {
    "clientID": "<app_id_Anda>",
    "clientSecret": "<secure_key_Anda>"
  }
  ```

**Discord**
- Buka https://discord.com/developers/applications/ dan buat aplikasi baru.
- Navigasi ke tab OAuth2 dan tambahkan `http://<domain Anda>/auth/discord/callback` (atau `http://localhost:8090/auth/discord/callback` untuk server localhost Anda) sebagai redirect URI.
- Tambahkan ini ke field `oauth` di `config.json` Anda:
  ```json
  "discord": {
    "clientID": "<client_id_Anda>",
    "clientSecret": "<client_secret_Anda>"
  }
  ```

---

### 4. Menjalankan Server

#### Lingkungan Produksi (Production)

```bash
npm run build
npm start
```

#### Pengaturan Peran (Roles) & Admin CLI

Anda dapat menggunakan command internal `cli.js` untuk mengatur administrasi user langsung dari terminal:
```bash
node cli.js --addrole <account_id> <role>   # peran: superadmin, admin, mod, dev
node cli.js --removerole <account_id> <role>
```
*Catatan: Perintah manajemen lainnya (seperti `--ban`, `--mute`, `--clear-origins`) juga ada pada script `cli.js` untuk memoderasi server game Anda.*

Panel admin web dapat diakses pada URL `<base_url>/admin/` (membutuhkan peran admin / superadmin pada akun Anda).
Berbagai In-game Tools dapat diakses di `<base_url>/tools/` (tersedia saat mode dev atau men-deploy server dengan menggunakan flag `--tools`).

#### Memulai Kluster / Multi-Process (Multi-Server)

Untuk basis server yang luas, Anda diwajibkan menjalankan masing-masing sub-server pada *process* (terminal) yang terpisah. Nama identifikasi server seperti `main`, `safe`, dan `dev` diambil dari properti `id` di dalam pengaturan `servers: []` pada file `config.json` Anda.

**Metode 1 (Standard Multi-Server)**

Metode ini adalah cara tercepat. Anda menjalankan server login, admin, dan game `main` sekaligus di satu tempat, kemudian menjalankan *sub-server* lainnya di background (atau menggunakan terminal/screen berbeda):
```bash
npm start                       # Memulai server login, admin, dan "main" game secara bersamaan
node pony-town.js --game safe   # Memulai server "safe" (di terminal terpisah)
node pony-town.js --game dev    # Memulai server "dev" (di terminal terpisah)
```

**Metode 2 (Fully Isolated Process / Mandiri)**

Metode ini benar-benar memisahkan semuanya, termasuk memisah server login dengan server admin standalone.
```bash
node pony-town.js --login                    # Menjalankan server Login
node pony-town.js --admin --standaloneadmin  # Menjalankan server Admin
node pony-town.js --game main                # Menjalankan server Main 18+
node pony-town.js --game safe                # Menjalankan server Safe
node pony-town.js --game dev                 # Menjalankan server Dev
```

*Catatan: Jika server Anda dimainkan oleh banyak pengguna, Anda disarankan mengalokasikan RAM yang lebih besar saat men-deploy Node:*
```bash
node --max_old_space_size=8192 pony-town.js --game main
```

#### Lingkungan Beta (In-Game Editor / Alat Dev)
Jika Anda ingin menjalankan server "Beta" secara live dengan alat *developer*, *debugger* dalam game, serta Map Editor yang menyala:

```bash
npm run build-beta
node pony-town.js --login --admin --game --tools --beta
```

*Catatan Penting mengenai Fitur Beta:*
1. **Konfigurasi Server:** Agar objek tes (seperti item yang bisa dipungut) dan alat map editor in-game benar-benar diizinkan, pastikan file `config.json` Anda memiliki `"test": true` dan `"editor": true` di dalam properti `flags` server yang dituju.
2. **Ketergantungan Build:** Anda **WAJIB** melakukan kompilasi klien dengan `npm run build-beta` sebelum menaikkan server node dengan akhiran `--beta` (misal: `node pony-town.js --game dev --beta`).
3. Menjalankan `--beta` di backend akan membuka cheat command admin. Namun, UI Map Editor di browser akan terhapus jika Anda mengompilasi sistem menggunakan `npm run build` (build standar tanpa beta) karena sistem otomatis membersihkan kode berat untuk production. **Mengeksekusi `npm run build` standar setelahnya akan membuat UI Beta Anda hilang kembali.**

#### Lingkungan Pengembangan (Development)

```bash
npm run ts-watch        # terminal 1
npm run wds             # terminal 2
npx gulp dev            # terminal 3
npx gulp test           # terminal 4 (opsional)
```
#### Skrip NPM & Gulp Penting
File `package.json` menyertakan berbagai skrip bawaan untuk mempermudah alur kerja (workflow). Berikut adalah perintah utama yang sering digunakan:

| Perintah | Fungsi |
|---|---|
| `npm start` | Memulai semua server sekaligus (login, admin, dan game main) menggunakan konfigurasi default. |
| `npm run startlocal` | Memulai semua server dengan flag `--local` (mode development lokal/loopback). |
| `npm run build` | Melakukan proses build penuh untuk frontend, peta, dan alat secara production. |
| `npm run build-fast` | Menjalankan build secara paralel agar jauh lebih cepat. |
| `npm run build-beta` | Melakukan build aplikasi dengan environment beta dan menyertakan tools inspector. |
| `npm run wds` | Memulai Webpack Dev Server untuk kompilasi dan reload frontend secara langsung (biasanya pada port 8091). |
| `npm run ts-watch` | Menjalankan compiler Typescript (mengawasi `src/ts`) ke JavaScript (`src/scripts`) secara real-time. |
| `npx gulp dev --sprites` | Mengompilasi dan mengompres aset gambar menjadi sprite sheets yang dipakai game. |
| `npm run test-ts` | Menjalankan seluruh berkas unit test Mocha (`.spec.ts`) secara langsung memakai ts-node. |
| `npm run lint` | Memeriksa ketaatan standar gaya penulisan kode menggunakan TSLint. |
| `npm run sw` | Men-generate dan mengecilkan file service worker PWA ke `build/sw.js`. |

---

### 5. Service Worker / Progressive Web App (PWA)

Jika Anda ingin situs game menyimpan *cache asset* secara agresif dan bertindak seperti aplikasi lokal (Progressive Web App / Offline mode), pastikan fitur ini aktif dengan mengatur nilai `"sw": true` di `config.json`.

Kemudian, Anda harus menjalankan skrip NPM berikut untuk men-generate logic file service worker tersebut:
```bash
npm run sw
```
*(Perintah ini akan memanggil `workbox generateSW` dan mengkompres filenya menuju folder `build/`.)*

---

### 6. Deployment & Production

Untuk menjalankan server di lingkungan produksi, Anda wajib mengkonfigurasi **Apache Reverse Proxy** dan **PM2** guna mengelola *process* Node.js secara otomatis (autostart, logs, restart) di *background*. Repositori ini telah dilengkapi dengan file `ecosystem.config.js` untuk PM2.

#### A. Konfigurasi `config.json`

Sebelum memulai PM2 dan Proxy, Anda wajib melakukan penyesuaian di `config.json` untuk memisahkan port lokal tiap *instance* serta memastikan header proxy diteruskan:

1. Wajib atur proxy ke `true`:
   ```json
   "proxy": true,
   "host": "https://example.com/"
   ```
2. Ganti port pada server yang ber-ID `main` menjadi `8092` beserta nilai lokalnya:
   ```json
   "id": "main",
   "port": 8092,
   //...
   "local": "localhost:8092",
   ```
3. Ganti port pada server yang ber-ID `safe` menjadi `8093` beserta nilai lokalnya:
   ```json
   "id": "safe",
   "port": 8093,
   //...
   "local": "localhost:8093",
   ```
4. **Hapus blok konfigurasi server `dev`** (yang memiliki `"id": "dev"`) seluruhnya dari `config.json` karena konfigurasi ini hanya ditujukan untuk *production*.

#### B. Menjalankan PM2

1. **Instal PM2 secara global**:
   ```bash
   npm install -g pm2
   ```

2. **Jalankan kluster server**:
   Pastikan Anda telah melakukan *build* server (`npm run build-fast`), kemudian jalankan:
   ```bash
   pm2 start ecosystem.config.js
   ```

3. **Autostart PM2** (agar berjalan otomatis saat server *reboot*):
   ```bash
   pm2 startup
   pm2 save
   ```

#### C. Konfigurasi Apache Reverse Proxy

Reverse proxy wajib dipasang untuk melayani game Anda di port HTTP/HTTPS standar (80 dan 443) serta merutekan *request* WebSockets klien ke port PM2 yang benar.

1. **Instal Apache2 & Aktifkan Modul**:
   ```bash
   sudo apt update
   sudo apt install apache2
   sudo a2enmod proxy proxy_http proxy_balancer proxy_wstunnel lbmethod_byrequests headers rewrite ssl
   sudo systemctl restart apache2
   ```

2. **Buat file VirtualHost Apache** (contoh: `/etc/apache2/sites-available/nusatown.conf`):
```apacheconf
<VirtualHost *:80>
    ServerName example.com

    RewriteEngine On
    RewriteRule ^(.*)$ https://%{HTTP_HOST}$1 [R=301,L]
</VirtualHost>

<VirtualHost *:443>
    ServerName example.com

    ProxyPreserveHost On
    SSLEngine On

    SSLCertificateFile /etc/letsencrypt/live/example.com/fullchain.pem
    SSLCertificateKeyFile /etc/letsencrypt/live/example.com/privkey.pem

    SSLProtocol all -SSLv3 -TLSv1 -TLSv1.1 +TLSv1.2 +TLSv1.3
    SSLHonorCipherOrder on

    RequestHeader set X-Forwarded-Proto "https"
    RequestHeader set X-Forwarded-Port "443"

    # Main Server WebSocket (wsPort: 10092)
    ProxyPass "/s00/ws" "ws://localhost:10092/s00/ws" flushpackets=on keepalive=On retry=0 timeout=3600 max=200 acquire=3000
    ProxyPassReverse "/s00/ws" "ws://localhost:10092/s00/ws"

    # Safe Server WebSocket (wsPort: 10093)
    ProxyPass "/s01/ws" "ws://localhost:10093/s01/ws" flushpackets=on keepalive=On retry=0 timeout=3600 max=200 acquire=3000
    ProxyPassReverse "/s01/ws" "ws://localhost:10093/s01/ws"

    # Admin WS - Standalone (wsPortAdmin: 10091)
    ProxyPass "/admin/ws-admin" "ws://localhost:10091/admin/ws-admin" flushpackets=on keepalive=On retry=0 timeout=3600 max=50 acquire=3000
    ProxyPassReverse "/admin/ws-admin" "ws://localhost:10091/admin/ws-admin"

    # HTTP Fallback / Root Game (port login/main: 8090)
    ProxyPass "/" "http://localhost:8090/" keepalive=On retry=0
    ProxyPassReverse "/" "http://localhost:8090/"

    ErrorLog ${APACHE_LOG_DIR}/nusatown_error.log
    CustomLog ${APACHE_LOG_DIR}/nusatown_access.log combined
</VirtualHost>
```

3. **Aktifkan konfigurasi dan restart Apache**:
```bash
sudo a2ensite nusatown.conf
sudo systemctl restart apache2
```

---

### 7. Modifikasi Lanjutan (Advanced Customization)

#### Struktur Direktori Utama
* `src/ts/client/` - Kode frontend/web (merender canvas, input pengguna, dsb).
* `src/ts/server/` - Kode backend server NodeJS.
* `src/ts/common/` - Kode sistem global yang dibagikan ke server maupun client.
* `assets-source/` - Folder penyimpanan file grafis yang belum di-compile (PSD/Sprite sheets).

#### Peralatan Pengembangan Tambahan (`src/ts/tools/`)
Terdapat beberapa skrip utilitas seperti file generator font dan modifikasi palet. Salah satu utilitas paling krusial untuk para modder adalah compiler sprite, yang dapat dijalankan lewat perintah:
```bash
npx gulp dev --sprites
```
Alat ini memanggil skrip internal seperti `create-sprites.ts` untuk memproses seluruh gambar (PNG, PSD) yang ada pada direktori `assets-source` menjadi sprite game yang dioptimasi untuk WebGL canvas.

#### Menambahkan Asset (Pakaian / Objek Baru)
Sistem dalam game ini bekerja berdasarkan *sprite sheets*.
1. Tempatkan dan edit gambar animasi di folder `assets-source`.
2. Gunakan `npx gulp dev --sprites` untuk men-generate gambar tersebut ke dalam cache sprite sheets. Anda bisa menambahkan file `src/ts/tools/trigger.txt` untuk re-trigger generasi otomatis.
3. Daftarkan kode objek di script sistem seperti `src/ts/common/pony.ts`.

#### Modifikasi Gameplay & Entitas Interaktif
Untuk memodifikasi logika game, menambah event, atau membuat objek map yang dapat berinteraksi dengan player (contoh: meja tempat mengambil makanan), ikuti panduan berikut:

**1. Membuat Objek Interaktif (Item / Event Map)**
- Buka `src/ts/common/interfaces.ts` dan tambahkan konstanta baru ke dalam `enum InteractAction` (misal: `GiveMyCustomItem`).
- Buka `src/ts/common/entities.ts`. Daftarkan objek baru Anda sebagai *Doodad* dan beri flag interaktif berserta aksinya:
  ```typescript
  export const myCustomTable = doodad(n('my-custom-table'), sprites.my_table_sprite, xOffset, yOffset, 0,
      mixFlags(EntityFlags.Interactive),       // Mengizinkan objek untuk diklik
      base => base.interactRange = 5,          // Radius interaksi player
      mixInteractAction(InteractAction.GiveMyCustomItem), // Menyematkan aksi ke objek ini
      mixColliderRect(-13, -12, 26, 14)        // Hitbox tabrakan objek
  );
  ```

**2. Menjalankan Efek Interaksi (Sisi Server)**
- Buka `src/ts/server/playerUtils.ts` dan cari fungsi `interactWith()`.
- Tambahkan blok `case` baru untuk tipe `InteractAction` Anda di dalam `switch`:
  ```typescript
  case InteractAction.GiveMyCustomItem: {
      // Logika game setelah objek diklik, contohnya memberikan player item:
      const itemToGive = entities.myCustomItem.type;
      holdItem(client.pony, itemToGive);
      break;
  }
  ```

**3. Modifikasi Animasi (Penambahan Aksi Player)**
Untuk menambah aksi inti baru seperti "Berdansa":
- **Deklarasi**: Buka `src/ts/common/interfaces.ts` dan tambahkan enum konstanta aksi Anda pada `enum Action` dan definisikan status karakter (`EntityState`).
- **Sisi Klien**: Tambahkan kontrol klik UI / hotkey di `src/ts/client/playerActions.ts` yang akan mengeksekusi `game.send(server => server.action(Action.YourNewAction))`. Siapkan render frame baru di `ponyDraw.ts`.
- **Sisi Server**: Validasi permintaan aksi di `src/ts/server/serverActions.ts` dan sebarkan update via websocket ke pemain lain yang ada di sekitar layar.

#### Membuat Peta (Custom Map)
1. Buka `src/ts/server/maps/`.
2. Buat script peta baru atau salin `customMap.ts`. Di sini Anda bisa mendesain peletakan objek, rumah, tanah, air, dll.
3. Daftarkan instance class map yang baru ke file core `src/ts/server/start.ts`.

---

### 8. Repo Quirks

Karena kendala sistem build, ada duplikasi file cache kuno di repositori ini. Untuk mencegah git mendeteksi perubahan pada `sprites.ts` yang di-generate oleh sistem lokal Anda, gunakan perintah ini:

```bash
git update-index --assume-unchanged src/ts/generated/sprites.ts
```

---

### 9. Perintah Obrolan (In-Game Chat Commands)
Pemain maupun pengawas (moderator) dapat mengetik perintah tertentu secara langsung ke dalam kolom *chat* di dalam permainan untuk memicu fungsi khusus.

<details>
<summary><b>Klik untuk menampilkan/menyembunyikan daftar perintah</b></summary>

#### Perintah Umum Pemain
* `/help` atau `/h` atau `/?` - Membuka menu bantuan (help).
* `/roll [[min-]max]` atau `/rand` - Mengundi angka secara acak di chat.
* `/w <name>` - Berbisik (whisper) kepada pemain tertentu.
* `/r` - Membalas bisikan terakhir.
* `/e <id>` - Membekukan ekspresi wajah tertentu.
* `/turn` - Menengok ke belakang.
* `/boop` atau `/)` - Melakukan tindakan boop.
* `/drop` - Menjatuhkan benda/peralatan yang sedang digigit.
* `/droptoy` - Menjatuhkan mainan.
* `/gifts`, `/candies`, `/eggs`, `/clovers`, `/toys` - Memeriksa skor / jumlah koleksi barang musiman.
* `/unstuck` - Respawn ulang ke titik awal (spawn point).
* `/leave` - Keluar dari game ke lobi secara instan.
* `/sit`, `/lie`, `/fly`, `/stand` - Melakukan pose dasar (duduk, rebahan, terbang, berdiri).
* `/blush`, `/love`, `/sleep`, `/cry` - Menyalakan animasi aksi spesial (tersipu, cinta, tidur, menangis).
* `/swap <nama_karakter>` - Mengganti karakter secara cepat tanpa harus kembali ke lobi.

#### Perintah Rumah / Pulau Pribadi
* `/savehouse` - Menyimpan pengaturan letak barang (furniture) di rumah saat ini.
* `/loadhouse` - Memuat (load) pengaturan letak rumah yang sudah disimpan sebelumnya.
* `/resethouse` - Mengembalikan map pulau/rumah ke kondisi asli kosong.
* `/lockhouse` - Mengunci pulau agar tamu (guest) tidak dapat merubah barang.
* `/unlockhouse` - Mengizinkan tamu untuk merubah barang.
* `/removetoolbox` / `/restoretoolbox` - Menghilangkan atau memunculkan kembali alat pertukangan map dari pulau.

#### Perintah Moderator & Administrator (Beberapa membutuhkan mode *beta* atau *dev*)
* `/goto <account_id>` - (Mod) Pindah / teleportasi instan ke titik lokasi pemain tersebut berada.
* `/tp <nama_lokasi> | <x> <y>` - (Mod) Teleportasi ke zona peta tertentu atau menggunakan koordinat pasti X dan Y.
* `/emotetest` - (Mod) Mencetak (print) seluruh koleksi emote karakter.
* `/announce <pesan>` - (Admin) Mengirimkan pengumuman server global ke seluruh pemain yang sedang online.
* `/time <jam>` - (Admin) Memutar jam (0-24) untuk mengatur siang/malam di server saat ini.
* `/togglerestore` - (Admin) Menyalakan/mematikan restorasi otomatis dataran (terrain) rumput map.
* `/resettiles` - (Admin) Menghapus perubahan pemain pada map dan mengembalikan kondisi tanah (tiles) seperti asli.

#### Perintah Superadmin (Beberapa membutuhkan mode *beta* atau *dev*)
* `/update` / `/shutdown` - Memberi aba-aba hitung mundur pemeliharaan/update sistem.
* `/loadmap` / `/savemap` - Memuat atau menyimpan state instance map ke file lokal.
* Fitur cheat/debug seperti `/season`, `/weather`, `/hold`, `/noclouds` dan `/testparty` tidak didokumentasikan di sini karena hanya dapat dijalankan di lingkungan *non-production* (`--beta` atau `DEVELOPMENT`). Silahkan baca `BETA_DEV_FEATURES.md`.
</details>

---


### 10. Menjalankan dengan Docker

### Persyaratan

* [Docker](https://docs.docker.com/get-docker/)
* [Docker Compose](https://docs.docker.com/compose/install/) (sudah termasuk dalam Docker Desktop)

### Pengaturan

1. Buat file environment dari template:

```bash
cp .env.example .env
```

2. Buat file konfigurasi dari template:

```bash
cp config-template.json config.json
```

3. Perbarui `config.json`:
   - Atur `"proxy": true`
   - Atur `"db"` menjadi: `"mongodb://<MONGO_USERNAME>:<MONGO_PASSWORD>@mongodb:27017/<MONGO_DATABASE>?authSource=admin"` (gunakan nilai dari file `.env` Anda)
   - Buat **dua nilai acak yang berbeda** untuk `"secret"` dan `"token"`:

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('base64'))"
```

4. Build dan jalankan:

```bash
docker compose up --build
```

### Arsitektur Layanan (Services)

Docker menjalankan layanan berikut di belakang Nginx reverse proxy:

| Layanan | Deskripsi | Port Internal |
|---|---|---|
| `nginx` | Reverse proxy, mengarahkan semua traffic | 80 → diekspos sebagai 8090 |
| `login` | Otentikasi & halaman web | 8090 |
| `game-main` | Server game utama (18+) | 10092 (WS) |
| `game-safe` | Server game aman (PG) | 10093 (WS) |
| `admin` | Dashboard admin | 8091 |
| `mongodb` | Database | 27017 |

Akses aplikasi:
- **Game**: `http://localhost:8090`
- **Admin**: `http://localhost:8090/admin/`

### Perintah yang Berguna

```bash
docker compose up --build     # build dan jalankan semua layanan
docker compose up -d          # jalankan di background (detached)
docker compose down           # hentikan semua layanan
docker compose logs -f        # lihat log (mode follow)
docker compose logs game-main # lihat log untuk layanan tertentu
docker compose restart login  # restart layanan tertentu
```

### Menambahkan Peran via Docker

```bash
docker compose exec game-main node cli.js --addrole <account_id> superadmin
```

</details>
