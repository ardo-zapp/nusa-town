
# Nusa Town

[English](#english) | [Indonesia](#indonesia)

## English

A game of ponies building a town.

This is a Pony Town Custom Server project with modified Indonesian nuances. This project requires some adjustments, please adjust it yourself according to your needs.

**NOTE:** This is an old version of the project. Pony Town no longer provides source code and has become closed source. **Please do not use this project for commercial purposes.**

This project is based on the original Pony Town version 0.55.2, which is the final version before Pony Town became closed-source forever.

---

### Table of Contents
- [1. Prerequisites](#1-prerequisites)
- [2. Installation](#2-installation)
- [3. Setup Configuration](#3-setup-configuration)
- [4. Running the Server](#4-running-the-server)
- [5. Service Worker / Progressive Web App (PWA)](#5-service-worker--progressive-web-app-pwa)
- [6. Deployment & Production](#6-deployment--production)
- [7. Customization & Advanced Modifications](#7-customization--advanced-modifications)
- [8. Repo Quirks](#8-repo-quirks)
- [9. In-Game Chat Commands](#9-in-game-chat-commands)
- [10. Running with Docker](#10-running-with-docker)

[⬆ Back to Top](#table-of-contents)

### 1. Prerequisites

* **Operating System**: Ubuntu 24.04.4 LTS (Highly Recommended) or Debian.
* [Node.js](https://nodejs.org/en/download/) (version 24 LTS)
* MongoDB 7+: [download link](https://www.mongodb.com/download-center/community) and [installation instructions](https://docs.mongodb.com/manual/administration/install-community/)
* System dependencies for Canvas:
  ```sh
  sudo apt-get install build-essential libcairo2-dev libpango1.0-dev libjpeg-dev libgif-dev librsvg2-dev pkg-config
  ```

---

[⬆ Back to Top](#table-of-contents)

### 2. Installation

```sh
npm install --legacy-peer-deps
```

---

[⬆ Back to Top](#table-of-contents)

### 3. Setup Configuration

To start configuring your server, simply copy the template provided:

```sh
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
  "wsPortAdmin": 10091, // The WebSocket port for the admin/standalone server
  "toolsPort": 8092, // The HTTP port for the in-game developer tools
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
      "wsPort": 10090, // uWebSockets port for the game WebSocket traffic
      "path": "/s00/ws", // The WebSocket route path matching the reverse proxy config
      "local": "localhost:8090", // Internal host for the cluster to send requests to this server
      "name": "18+ Server", // Server name visible to players in the lobby
      "desc": "18+ speaking server", // Server description in the lobby
      "season": "summer", // Overrides global season setting
      "holiday": "none", // Overrides global holiday setting
      "flag": "", // An optional string identifier label for the UI (e.g. 'test', 'star', 'ru')
      "flags": { // Server feature toggles
        "test": true, // Highlights the server as a test server
        "editor": true // Enables the in-game map editor tools
      },
      "alert": "18+" // Optional warning pop-up before joining the server
    }
  ]
}
```

#### Generating Secret and Token

You **MUST** provide **unique**, **random** values for the `secret` and `token` fields of your config. It is **extremely dangerous** to leave these as default, as these values serve as authentication tokens for internal APIs and session cookies.

To generate new values for these parameters, you can use the following command:

```sh
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
- Go to [GitHub Developer Settings](https://github.com/settings/developers) and click **"New OAuth App"**.
- Fill in the application name and homepage URL.
- Set **Authorization callback URL** to `https://<your domain>/auth/github/callback` (or `http://localhost:8090/auth/github/callback` if using a localhost development server).
- Generate a new client secret and add this to the `oauth` field in your `config.json`:
  ```json
  "github": {
    "clientID": "<your_client_id>",
    "clientSecret": "<your_client_secret>"
  }
  ```

**TikTok**
- Go to the [TikTok Developer Portal](https://developers.tiktok.com/doc/login-kit-web).
- Register a **TikTok for Developers** account and create a new App within your **Organization**.
- Navigate to your App's **Login Kit** settings and configure the platform for "Web".
- Set the **Authorized redirect URI** to `https://<your domain>/auth/tiktok/callback` or `http://localhost:8090/auth/tiktok/callback` for localhost.
- Submit the App for review (if required by TikTok for production) and copy the **Client Key** and **Client Secret** to your `config.json`:
  ```json
  "tiktok": {
    "clientID": "<TIKTOK_CLIENT_ID>",
    "clientSecret": "<TIKTOK_CLIENT_SECRET>"
  }
  ```

**Twitter (X)**
- Go to the [Twitter Developer Portal](https://developer.twitter.com/en/apps) and create a new Project/App.
- Enable **User authentication settings** (OAuth 1.0a or OAuth 2.0 depending on your needs).
- Set the **Callback URL** to `https://<your domain>/auth/twitter/callback` or `http://localhost:8090/auth/twitter/callback` for localhost.
- Generate your API Keys and add them to the `oauth` field in your `config.json`:
  ```json
  "twitter": {
    "consumerKey": "<your_consumer_key>",
    "consumerSecret": "<your_consumer_secret>"
  }
  ```

**Google**
- Go to the [Google Cloud Console](https://console.cloud.google.com/apis/dashboard).
- Create a new project and configure the **OAuth consent screen**.
- Navigate to **Credentials** -> **Create Credentials** -> **OAuth client ID**. Choose "Web application".
- Add **Authorized JavaScript origins**: `https://<your domain>` or `http://localhost:8090/`.
- Add **Authorized redirect URIs**: `https://<your domain>/auth/google/callback` or `http://localhost:8090/auth/google/callback` for localhost.
- Copy your Client ID and Client Secret to your `config.json`:
  ```json
  "google": {
    "clientID": "<your_client_id>",
    "clientSecret": "<your_client_secret>"
  }
  ```

**Patreon**
- Go to the [Patreon Developer Portal](https://www.patreon.com/portal/registration/register-clients) and click **"Create App"**.
- Fill in the basic app details.
- Set **Redirect URIs** to `https://<your domain>/auth/patreon/callback` or `http://localhost:8090/auth/patreon/callback` for localhost.
- Copy the "Client ID" and "Client Secret" provided and add them to your `config.json`:
  ```json
  "patreon": {
    "clientID": "<your_client_id>",
    "clientSecret": "<your_client_secret>"
  }
  ```

**Discord**
- Go to the [Discord Developer Portal](https://discord.com/developers/applications/) and click **"New Application"**.
- Navigate to the **OAuth2** tab.
- Add `https://<your domain>/auth/discord/callback` (or `http://localhost:8090/auth/discord/callback` for localhost) under **Redirects**.
- Copy your Client ID and generate a Client Secret, then add them to your `config.json`:
  ```json
  "discord": {
    "clientID": "<your_client_id>",
    "clientSecret": "<your_client_secret>"
  }
  ```

**VKontakte**
- Go to [VK Apps Management](https://vk.com/apps?act=manage) and create a new app.
- Navigate to your App's settings.
- Set **Authorized redirect URI** to `https://<your domain>/auth/vkontakte/callback` or `http://localhost:8090/auth/vkontakte/callback` for localhost.
- Add your App ID and Secure Key to your `config.json`:
  ```json
  "vkontakte": {
    "clientID": "<your_app_id>",
    "clientSecret": "<secure_key>"
  }
  ```

---

[⬆ Back to Top](#table-of-contents)

### 4. Running the Server

#### Production Environment

```sh
npm run build
npm run start:prod
```

#### Roles Management & Admin CLI

If you want to grant admin privileges to specific users, use the built-in Command Line Interface:

```sh
node cli.js --addrole <account_id> <role_name>
```
For example:
```sh
node cli.js --addrole 5b... superadmin
```
Valid roles are: `superadmin`, `admin`, `mod`, `dev`. After assigning the role, you can access the admin dashboard on `http://localhost:8090/admin/`.

#### Running Multiple Processes (Cluster Setup)

For heavy load, the configuration uses an array for "servers". If you define multiple servers (e.g. `main`, `safe`, `dev`), you must launch them on their respective processes using PM2 or Docker. Alternatively, with terminal:

```text
node pony-town.js --game main
node pony-town.js --game safe
node pony-town.js --login
node pony-town.js --admin
```

#### Beta Environment (In-Game Editor)

Running the game in `beta` mode grants special features (often used in conjunction with `dev` roles or server flags), enabling the map and sprite **In-Game Editors**.

```sh
npm run build-beta
npm run start:beta
```

#### Development Environment

For local modifications, Webpack Dev Server will watch and live-reload changes. You need to run the compilation task simultaneously with the backend servers.

```text
# Terminal 1: Game server backend
npm run dev-mode

# Terminal 2: Webpack watcher (Frontend UI live-reload)
npm run wds
```

You can then access your server locally at `http://localhost:8090`.

#### Useful NPM & Gulp Scripts
The `package.json` file includes various helpful built-in scripts:
- `npm test` - Run basic linting and code validation.
- `npx gulp dev --sprites` - Compile static sprites from Photoshop files.
- `npx gulp --tasks` - View all available gulp tasks (such as regenerating manifest files and SW).

---

[⬆ Back to Top](#table-of-contents)

### 5. Service Worker / Progressive Web App (PWA)

If you want the game site to aggressively cache assets and act like a local app (PWA/Offline mode), ensure `"sw": true` is set in `config.json`.
You can generate the service worker script by running:

```sh
npm run sw
```

---

[⬆ Back to Top](#table-of-contents)

### 6. Deployment & Production

To run the server in a production environment, you must configure **Apache Reverse Proxy** and use **PM2** to manage the Node.js *processes* automatically (autostart, logs, restarts) in the *background*. This repository includes an `ecosystem.config.js` configuration file for PM2.

#### A. Configuring `config.json`

Open `config.json`, and change your host parameter according to your domain, and **make sure you turn on proxy**:

```json
  "host": "https://yourdomain.com/",
  "proxy": true,
```

#### B. Running PM2

1. Install PM2 globally:
   ```sh
   sudo npm install -g pm2
   ```
2. Boot all server clusters based on the given configuration:
   ```sh
   pm2 start ecosystem.config.js
   pm2 save
   ```

### Useful PM2 Commands
- `pm2 list` - See the status of all running servers.
- `pm2 logs` - View real-time logs (very useful for troubleshooting login API errors).
- `pm2 restart all` - Restart all servers (run this after pulling Git updates).

#### C. Apache Reverse Proxy Setup

If you prefer Apache over Nginx, you must enable its proxy modules:
```sh
sudo a2enmod proxy proxy_http proxy_wstunnel rewrite headers
```

Then configure your VirtualHost config file (`/etc/apache2/sites-available/yourdomain.conf`):

```apache
<VirtualHost *:80>
    ServerName yourdomain.com

    # Pass all normal HTTP requests to the Login/Web Server Node.js Process (Port 8090)
    ProxyPass / http://127.0.0.1:8090/
    ProxyPassReverse / http://127.0.0.1:8090/

    # Setup WebSocket tunneling for the Game WebSocket connection
    RewriteEngine on
    RewriteCond %{HTTP:UPGRADE} ^WebSocket$ [NC]
    RewriteCond %{HTTP:CONNECTION} ^Upgrade$ [NC]
    RewriteRule .* ws://127.0.0.1:8090%{REQUEST_URI} [P]

    # Direct WebSockets to specific sub-servers based on their "path" property in config.json
    # Example: "path": "/s00/ws" -> point it to the wsPort: 10090
    ProxyPass /s00/ws ws://127.0.0.1:10090/

    # Example for Safe Server: "path": "/s01/ws" -> wsPort: 10091
    # ProxyPass /s01/ws ws://127.0.0.1:10091/
</VirtualHost>
```

Restart Apache to apply changes:
```sh
sudo systemctl restart apache2
```

---

[⬆ Back to Top](#table-of-contents)

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
```sh
npx gulp dev --sprites
```
This leverages `create-sprites.ts` to pack images from `assets-source` into optimized game sprites.

#### Asset Development Guide
This game uses a *sprite sheet* system generated from `.psd` and `.png` files. To ensure visuals, *shadows*, and seasonal color effects function correctly in-game, here is the standard workflow for asset development:

**A. PSD Structure (Functional Layering)**
The system uses specific layer naming to separate the functionality and coloring of in-game objects. The basic layer structure in a `.psd` file is:
- `color`: This layer (or another object part name) defines the basic shape and color of the object. If it has a *palette* reference, the color in this layer can be dynamically swapped.
- `shadow`: The shadow layer of the object with low opacity (typically 30%) so the lighting *renders* naturally over various *terrains*.
- *Note:* For trees, the naming is more complex, such as `crown` (top leaves), `trunk` (main trunk), and `stump` (tree roots) which are colored separately. Numbered layers like `4:crown` are just group/folder names in *Photoshop* for neatness.

**B. Naming Convention in Code**
When `npx gulp dev --sprites` processes the `assets-source/` folder, the generator script will merge the folder and file name into a reference variable in *typescript*:
- If you save the file `bakso_cart.psd` in the root `assets-source/objects/` folder, the script will generate a code reference: `sprites.bakso_cart`. To access its layers in code, you append the layer name (e.g., `sprites.bakso_cart.color` and `sprites.bakso_cart.shadow`).
- If you save it in a sub-folder, e.g., `assets-source/objects/bench/1.psd`, the script combines the folder name, making the reference: `sprites.bench_1`. You access its layers via `sprites.bench_1.color` and `sprites.bench_1.shadow`.
- If the file has a *palette* for color variations, it will be added into the `.palettes` array (e.g., `sprites.bench_1.palettes`).

**C. Adding New Objects Workflow (Example: Bakso Cart)**
1. **File Placement**: Save your design file (`bakso_cart.psd`) into `assets-source/objects/`.
2. **Compilation**: Run `npx gulp dev --sprites` to register the asset and generate the `.bin`/`.raw` sprite sheet and cache file `src/ts/generated/sprites.ts`.
3. **Code Registration**: Open `src/ts/common/entities.ts` and register the object entity so it can be recognized by the client and server. Example:
   ```typescript
   export const baksoCart = doodad(
       n('bakso-cart'),
       sprites.bakso_cart.color, // Reference to the 'color' layer inside PSD
       30, 15, 0,
       mixColliderRect(-20, -10, 40, 20)
   );
   ```

#### Modifying Default Ponies (Constants.ts)
The game uses Base64 encoded strings in `src/ts/common/constants.ts` to render default characters such as `OFFLINE_PONY` (default player) or `DISCORD_PONY` (Discord login button mascot).
To change them:
1. Log into the game and open the Character Editor on the Home page.
2. Select or design the pony you want.
3. Click the **Export Pony** button on the Body tab. It will download a `.txt` file.
4. Open the downloaded file (e.g., `Ardo Zapp.txt`). The content looks like this:
   ```text
   Ardo Zapp	FAb///8fiaZkUFBPhbstKi0RZbo2QANkIAAAJWAE/AAYADBAHBAZIDOAYIlQE0AhFAKhAGhgIA==
   ```
5. Copy only the Base64 portion (the random string of characters) and replace the existing string variable in `src/ts/common/constants.ts`.

#### Modifying Gameplay & Interactive Entities
To modify game logic, add events, or create interactive map objects (e.g., a table to grab food from), follow this guide:

**1. Creating an Interactive Object (Map Event)**
- Open `src/ts/common/interfaces.ts` and add a new constant to `enum InteractAction` (e.g., `GiveMyCustomItem`).
- Open `src/ts/common/entities.ts`. Register your new object as a Doodad and assign the interactive flag and action:
  ```typescript
  export const myCustomTable = doodad(n('my-custom-table'), sprites.my_table_sprite, xOffset, yOffset, 0,
      mixFlags(EntityFlags.Interactive),       // Allows the object to be clicked
      base => base.interactRange = 5,          // Player interaction radius
      mixInteractAction(InteractAction.GiveMyCustomItem), // Assign the action
      mixColliderRect(-13, -12, 26, 14)        // Object collision hitbox
  );
  ```

**2. Executing Interaction Logic (Server-side)**
- Open `src/ts/server/playerUtils.ts` and find the `interactWith()` function.
- Add a new `case` block for your `InteractAction` inside the `switch`:
  ```typescript
  case InteractAction.GiveMyCustomItem: {
      // Game logic after clicking the object, e.g., giving an item:
      const itemToGive = entities.myCustomItem.type;
      holdItem(client.pony, itemToGive);
      break;
  }
  ```

**3. Modifying Animations (Adding Player Actions)**
To add a core new action like "Dance":
- **Declaration**: Open `src/ts/common/interfaces.ts` and define your action constant in `enum Action` and character state (`EntityState`).
- **Client-side**: Add a UI click handler / hotkey in `src/ts/client/playerActions.ts` that executes `game.send(server => server.action(Action.YourNewAction))`. Prepare the frame renderer in `ponyDraw.ts`.
- **Server-side**: Validate the action request in `src/ts/server/serverActions.ts` and broadcast the state update via websocket to surrounding players.

#### Custom Map Creation
To add a new map:
1. Go to `src/ts/server/maps/`.
2. Create a map creation script (or duplicate `customMap.ts`) and define tile structure, trees, objects.
3. Open `src/ts/server/start.ts`, register, and initiate your new map class to the `world` instance.

---

[⬆ Back to Top](#table-of-contents)

### 8. Repo Quirks

Due to an issue with the build system, an old copy of `src/ts/generated/sprites.ts` is shipped with this repository. To prevent Git from tracking local modifications on this file, use:

```sh
git update-index --assume-unchanged src/ts/generated/sprites.ts
```

---

[⬆ Back to Top](#table-of-contents)

### 9. In-Game Chat Commands
Players and moderators can type special slash commands directly into the in-game chat to trigger specific behaviors.


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
* `/savehouse` - Save your current island house layout.
* `/loadhouse` - Load your previously saved island layout.
* `/resethouse` - Reset the island back to a blank state.
* `/lockhouse` - Lock your island so guests cannot edit it.
* `/unlockhouse` - Allow guests to place objects on your island.
* `/removetoolbox` / `/restoretoolbox` - Toggle the mapping toolbox on your island.

#### Moderator & Admin Commands (Some require *beta* or *dev* mode)
* `/goto <account_id>` - (Mod) Teleport instantly to a player's location.
* `/tp <location> | <x> <y>` - (Mod) Teleport to a specific map zone or coordinate.
* `/emotetest` - (Mod) Print all character expressions.
* `/announce <message>` - (Admin) Send a global server announcement to all players online.
* `/time <hour>` - (Admin) Adjust the current in-game clock (0-24).
* `/togglerestore` - (Admin) Toggle automatic map terrain restoration.
* `/resettiles` - (Admin) Purge all player changes on the map and restore the terrain.

#### Superadmin Commands (Some require *beta* or *dev* mode)
* `/update` / `/shutdown` - Trigger the server restart countdown.
* `/loadmap` / `/savemap` - Save or load map state instance.
* Note: Developer and cheat tools such as `/season`, `/weather`, `/hold`, `/noclouds` and `/testparty` are not documented here since they are only available on *non-production* builds (`--beta` or `DEVELOPMENT`). Refer to `BETA_DEV_FEATURES.md`.

---

[⬆ Back to Top](#table-of-contents)

### 10. Running with Docker

#### Prerequisites

* [Docker](https://docs.docker.com/get-docker/)
* [Docker Compose](https://docs.docker.com/compose/install/) (included in Docker Desktop)

#### Setup

1. Create environment file from template:

```sh
cp .env.example .env
```

2. Create config file from template:

```sh
cp config-template.json config.json
```

3. Update `config.json`:
   - Set `"proxy": true`
   - Set `"db"` to: `"mongodb://<MONGO_USERNAME>:<MONGO_PASSWORD>@mongodb:27017/<MONGO_DATABASE>?authSource=admin"` (use values from your `.env` file)
   - Generate **two different random values** for `"secret"` and `"token"`:

```sh
node -e "console.log(require('crypto').randomBytes(64).toString('base64'))"
```

By default, Docker uses "npm run build-fast". You can change this inside the Dockerfile in the /docker/ directory to "npm run build-beta" if you want to use the --beta flags and access the /tools/.

4. Build and run:

```sh
cd docker && docker-compose up --build
```

#### Services Architecture

Docker runs the following services behind an Nginx reverse proxy:

| Service | Description | Internal Port |
|---|---|---|
| `nginx` | Reverse proxy, routes all traffic | 80 → exposed as 8090 |
| `login` | Authentication & web pages | 8090 |
| `game-main` | Main game server (18+) | 10092 (WS) |
| `game-safe` | Safe game server (PG) | 10093 (WS) |
| `admin` | Admin dashboard | 8091 |
| `mongodb` | Database | 27017 |

Access the application:
- **Game**: `http://localhost:8090`
- **Admin**: `http://localhost:8090/admin/`

#### Useful Commands

```sh
cd docker && docker-compose up --build     # build and run all services
cd docker && docker-compose up -d          # run in detached mode (background)
cd docker && docker-compose down           # stop all services
cd docker && docker-compose logs -f        # view logs (follow mode)
cd docker && docker-compose logs game-main # view logs for specific service
cd docker && docker-compose restart login  # restart specific service
```

#### Adding Roles via Docker

```sh
cd docker && docker-compose exec game-main node cli.js --addrole <account_id> superadmin
```

[⬆ Back to Top](#table-of-contents)

---

## Indonesia

Sebuah game tentang pony-pony yang membangun kota.

Ini adalah proyek Pony Town Custom Server dengan modifikasi nuansa Indonesia. Proyek ini memerlukan beberapa penyesuaian, silakan sesuaikan sendiri sesuai dengan kebutuhan Anda.

**CATATAN:** Ini adalah versi lama dari proyek ini. Pony Town tidak lagi menyediakan kode sumber dan telah menjadi sumber tertutup (closed source). **Jangan jadikan project ini sebagai media komersial.**

Proyek ini berasal dari proyek Pony Town original versi 0.55.2, yaitu versi terakhir sebelum source code Pony Town menjadi close source untuk selamanya.

---

### Daftar Isi
- [1. Persyaratan Sistem](#1-persyaratan-sistem)
- [2. Instalasi](#2-instalasi)
- [3. Pengaturan Konfigurasi](#3-pengaturan-konfigurasi)
- [4. Autentikasi & OAuth](#4-autentikasi--oauth)
- [5. Menjalankan Server](#5-menjalankan-server)
- [6. Manajemen Admin & Roles](#6-manajemen-admin--roles)
- [7. Service Worker / Progressive Web App (PWA)](#7-service-worker--progressive-web-app-pwa-1)
- [8. Deployment & Production](#8-deployment--production-1)
- [9. Modifikasi Lanjutan & Peta Kustom](#9-modifikasi-lanjutan--peta-kustom)
- [10. Perintah Obrolan (In-Game Chat Commands)](#10-perintah-obrolan-in-game-chat-commands)
- [11. Menjalankan dengan Docker](#11-menjalankan-dengan-docker)

[⬆ Kembali ke Atas](#daftar-isi)

### 1. Persyaratan Sistem

* **Sistem Operasi**: Ubuntu 24.04.4 LTS (Sangat Direkomendasikan) atau Debian.
* [Node.js](https://nodejs.org/en/download/) (versi 24 LTS)
* MongoDB 7+: [tautan unduhan](https://www.mongodb.com/download-center/community) dan [petunjuk instalasi](https://docs.mongodb.com/manual/administration/install-community/)
* Dependensi sistem untuk Canvas:
  ```sh
  sudo apt-get install build-essential libcairo2-dev libpango1.0-dev libjpeg-dev libgif-dev librsvg2-dev pkg-config
  ```

---

[⬆ Kembali ke Atas](#daftar-isi)

### 2. Instalasi

```sh
npm install --legacy-peer-deps
```

---

[⬆ Kembali ke Atas](#daftar-isi)

### 3. Pengaturan Konfigurasi

Untuk mulai mengkonfigurasi server Anda, cukup salin template yang disediakan:

```sh
cp config-template.json config.json
```

Kemudian edit `config.json` sesuai kebutuhan Anda. Berikut adalah penjelasan fungsi setiap properti:

```json
{
  "title": "My custom server", // Nama server Anda yang ditampilkan di tab browser
  "discordLink": "<LINK_TO_DISCORD_INVITE>", // URL ke server Discord yang ditampilkan di footer
  "twitterLink": "<LINK_TO_TWITTER>", // URL ke akun Twitter
  "contactEmail": "your_contact_email@example.com", // Email kontak dukungan
  "port": 8090, // Port HTTP publik yang mendengarkan koneksi game server
  "adminPort": 8091, // Port HTTP untuk server administrator
  "host": "http://localhost:8090/", // URL root publik server. Ubah ke "https://domainanda.com/" di production.
  "local": "localhost:8090", // IP:Port internal yang digunakan cluster API
  "proxy": false, // Setel ke true jika Anda menggunakan Nginx/Apache reverse proxies
  "secret": "<some_random_string_here>", // Secret untuk hashing session cookies
  "token": "<some_random_string_here>", // Token untuk memverifikasi request cluster API
  "db": "mongodb://<username>:<password>@localhost:27017/<database_name>", // String koneksi MongoDB
  "oauth": { ... },
  "servers": [
    {
      "id": "main",
      "port": 8090,
      "wsPort": 10090,
      "path": "/s00/ws",
      "local": "localhost:8090",
      "name": "18+ Server",
      "desc": "18+ speaking server",
      "flags": {
        "test": true,
        "editor": true
      }
    }
  ]
}
```

#### Menghasilkan Secret dan Token

Anda **WAJIB** memberikan nilai yang **unik** dan **acak** untuk field `secret` dan `token` di konfigurasi Anda. Sangat berbahaya membiarkan nilainya default, karena nilai ini berfungsi sebagai token autentikasi. Gunakan perintah ini:

```sh
node -e "console.log(require('crypto').randomBytes(64).toString('base64'))"
```

#### Menyiapkan Database

1. Instal MongoDB
2. Mulai `mongosh` atau `mongo` dari baris perintah.
3. Ketik `use your_database_name` untuk membuat database.
4. Ketik `db.new_collection.insert({ some_key: "some_value" })` untuk inisialisasi.
5. Buat pengguna database:
   ```javascript
   db.createUser({
     user: "your_username",
     pwd: "your_password",
     roles: [ { role: "readWrite", db: "your_database_name" } ]
   })
   ```

### 4. Autentikasi & OAuth

Dapatkan kunci OAuth untuk platform pilihan Anda (github, google, twitter, tiktok, discord, dsb).

**Github**
- Buka [GitHub Developer Settings](https://github.com/settings/developers) dan klik **"New OAuth App"**.
- Atur **Authorization callback URL** ke `https://<domain Anda>/auth/github/callback` (atau `http://localhost:8090/auth/github/callback`).
- Tambahkan ke field `oauth` di `config.json`:
  ```json
  "github": {
    "clientID": "<client_id_Anda>",
    "clientSecret": "<client_secret_Anda>"
  }
  ```

**TikTok**
- Buka [TikTok Developer Portal](https://developers.tiktok.com/doc/login-kit-web).
- Daftarkan akun dan buat Aplikasi (App) baru di dalam **Organization** Anda.
- Navigasi ke pengaturan **Login Kit** Aplikasi Anda dan konfigurasikan untuk "Web".
- Atur **Authorized redirect URI** ke `https://<domain Anda>/auth/tiktok/callback` atau `http://localhost:8090/auth/tiktok/callback`.
- Salin **Client Key** serta **Client Secret** ke `config.json`:
  ```json
  "tiktok": {
    "clientID": "<TIKTOK_CLIENT_ID>",
    "clientSecret": "<TIKTOK_CLIENT_SECRET>"
  }
  ```

**Twitter (X)**
- Buka [Twitter Developer Portal](https://developer.twitter.com/en/apps) dan buat Project/App baru.
- Atur **Callback URL** ke `https://<domain Anda>/auth/twitter/callback` atau `http://localhost:8090/auth/twitter/callback`.
- Tambahkan API Keys Anda ke `config.json`:
  ```json
  "twitter": {
    "consumerKey": "<consumer_key_Anda>",
    "consumerSecret": "<consumer_secret_Anda>"
  }
  ```

**Google**
- Buka [Google Cloud Console](https://console.cloud.google.com/apis/dashboard).
- Buat proyek baru dan konfigurasikan **OAuth consent screen**.
- Navigasi ke **Credentials** -> **Create Credentials** -> **OAuth client ID** ("Web application").
- Tambahkan **Authorized JavaScript origins**: `https://<domain Anda>` atau `http://localhost:8090/`.
- Tambahkan **Authorized redirect URIs**: `https://<domain Anda>/auth/google/callback` atau `http://localhost:8090/auth/google/callback`.
- Salin Client ID dan Client Secret ke `config.json`:
  ```json
  "google": {
    "clientID": "<client_id_Anda>",
    "clientSecret": "<client_secret_Anda>"
  }
  ```

**Patreon**
- Buka [Patreon Developer Portal](https://www.patreon.com/portal/registration/register-clients) dan klik **"Create App"**.
- Atur **Redirect URIs** ke `https://<domain Anda>/auth/patreon/callback` atau `http://localhost:8090/auth/patreon/callback`.
- Tambahkan ke `config.json`:
  ```json
  "patreon": {
    "clientID": "<client_id_Anda>",
    "clientSecret": "<client_secret_Anda>"
  }
  ```

**Discord**
- Buka [Discord Developer Portal](https://discord.com/developers/applications/) dan klik **"New Application"**.
- Tambahkan `https://<domain Anda>/auth/discord/callback` (atau `http://localhost:8090/auth/discord/callback`) di bawah **Redirects**.
- Tambahkan ke `config.json`:
  ```json
  "discord": {
    "clientID": "<client_id_Anda>",
    "clientSecret": "<client_secret_Anda>"
  }
  ```

**VKontakte**
- Buka [VK Apps Management](https://vk.com/apps?act=manage) dan buat aplikasi baru.
- Atur **Authorized redirect URI** ke `https://<domain Anda>/auth/vkontakte/callback` atau `http://localhost:8090/auth/vkontakte/callback`.
- Tambahkan App ID dan Secure Key ke `config.json`:
  ```json
  "vkontakte": {
    "clientID": "<app_id_Anda>",
    "clientSecret": "<secure_key_Anda>"
  }
  ```

---

[⬆ Kembali ke Atas](#daftar-isi)

### 5. Menjalankan Server

#### Lingkungan Pengembangan (Development)
Untuk menguji server secara lokal dengan fitur auto-reload (Webpack Dev Server):

```text
# Terminal 1: Mulai game server & compiler
npm run dev-mode
# Terminal 2: Mulai Webpack dev proxy
npm run wds
```
Buka `http://localhost:8090` di browser.

#### Lingkungan Produksi (Production)
Untuk deployment rilis, kompilasi kode:

```sh
npm run build
npm run start:prod
```

---

[⬆ Kembali ke Atas](#daftar-isi)

### 6. Manajemen Admin & Roles

Game ini memiliki Dashboard Admin internal beserta berbagai sistem privilege in-game.

**Mengakses Dashboard Admin:**
Buka `http://localhost:8090/admin/` (atau `https://<domain Anda>/admin/`). Anda harus sudah masuk ke akun yang memiliki peran `admin` atau `superadmin`.

**Memberikan Roles via CLI:**
Jalankan script berikut untuk memberikan hak akses kepada sebuah `_id` akun (string 24 karakter dari MongoDB):
```sh
node cli.js --addrole <account_id> <role_name>
# Pilihan peran: superadmin, admin, mod, dev
# Contoh: node cli.js --addrole 5f6...789 superadmin
```

---

[⬆ Kembali ke Atas](#daftar-isi)

### 7. Service Worker / Progressive Web App (PWA)

Jika Anda ingin situs game menyimpan *cache asset* secara agresif dan bertindak seperti aplikasi lokal (Progressive Web App / Offline mode), pastikan fitur ini aktif dengan mengatur nilai `"sw": true` di `config.json`. Buat berkas precache:

```sh
npm run sw
```

---

[⬆ Kembali ke Atas](#daftar-isi)

### 8. Deployment & Production

Untuk menjalankan server di lingkungan produksi, Anda wajib mengkonfigurasi **Apache Reverse Proxy** dan **PM2** guna mengelola proses Node.js otomatis di *background*.

#### A. Menjalankan PM2
Instal PM2 secara global:
```sh
sudo npm install -g pm2
```
Mulai ekosistem server:
```sh
pm2 start ecosystem.config.js
pm2 save
```

#### B. Konfigurasi Apache Reverse Proxy
Aktifkan proxy modul:
```sh
sudo a2enmod proxy proxy_http proxy_wstunnel rewrite headers
```

```apache
<VirtualHost *:80>
    ServerName domainanda.com

    # Server Web Utama
    ProxyPass / http://127.0.0.1:8090/
    ProxyPassReverse / http://127.0.0.1:8090/

    # Konfigurasi WebSocket
    RewriteEngine on
    RewriteCond %{HTTP:UPGRADE} ^WebSocket$ [NC]
    RewriteCond %{HTTP:CONNECTION} ^Upgrade$ [NC]
    RewriteRule .* ws://127.0.0.1:8090%{REQUEST_URI} [P]

    # Server 1 - Game WebSocket Traffic
    ProxyPass /s00/ws ws://127.0.0.1:10090/
</VirtualHost>
```

---

[⬆ Kembali ke Atas](#daftar-isi)

### 9. Modifikasi Lanjutan & Peta Kustom

#### Memodifikasi Pony Default (Constants.ts)
Game ini menggunakan string kode Base64 di dalam file `src/ts/common/constants.ts` untuk me-*render* karakter *default* seperti `OFFLINE_PONY` (karakter pemain saat offline) atau `DISCORD_PONY` (maskot animasi tombol masuk Discord).
Untuk mengubahnya:
1. Masuk ke dalam game dan buka menu Editor Karakter di laman Beranda.
2. Pilih atau desain pony yang Anda inginkan.
3. Klik tombol **Export Pony** pada Tab Body. Fitur ini akan mendownload sebuah file `.txt`.
4. Buka file yang baru saja diunduh tersebut (Misalnya: `Ardo Zapp.txt`). Isinya akan terlihat seperti ini:
   ```text
   Ardo Zapp	FAb///8fiaZkUFBPhbstKi0RZbo2QANkIAAAJWAE/AAYADBAHBAZIDOAYIlQE0AhFAKhAGhgIA==
   ```
5. Ambil bagian string Base64-nya saja (kode acak di sebelah kanan) lalu gunakan untuk mengganti variabel di dalam `src/ts/common/constants.ts`.

#### Membuat Peta (Custom Map)
1. Buka direktori `src/ts/server/maps/`.
2. Buat script peta baru atau salin `customMap.ts`. Di sini Anda bisa mendesain peletakan objek, rumah, tanah, air, dll.
3. Daftarkan instance class map baru Anda ke file `src/ts/server/start.ts`.

#### Panduan Pengembangan Aset (Sprites)
Game ini menggunakan sistem *sprite sheet* yang di-generate dari file `.psd` dan `.png` pada direktori `assets-source/`.
Setelah membuat objek atau sprite baru, re-compile aset:
```sh
npx gulp dev --sprites
```

---

[⬆ Kembali ke Atas](#daftar-isi)

### 10. Perintah Obrolan (In-Game Chat Commands)
Pemain maupun moderator dapat mengetik perintah tertentu langsung di dalam kolom *chat*.

#### Perintah Umum Pemain
* `/help` atau `/h` atau `/?` - Membuka menu bantuan.
* `/roll [[min-]max]` atau `/rand` - Acak dadu numerik.
* `/e <id>` - Membekukan ekspresi wajah.
* `/sit`, `/lie`, `/fly`, `/stand` - Melakukan pose dasar.
* `/blush`, `/love`, `/sleep`, `/cry` - Animasi aksi khusus.
* `/unstuck` - Respawn ulang ke titik awal map.
* `/swap <nama_karakter>` - Mengganti karakter cepat.

#### Perintah Moderator & Administrator
* `/goto <account_id>` - (Mod) Pindah instan ke lokasi pemain.
* `/tp <location> | <x> <y>` - (Mod) Teleportasi ke zona X/Y.
* `/announce <pesan>` - (Admin) Kirim pengumuman server global.
* `/time <jam>` - (Admin) Memutar jam siang/malam (0-24).
* `/update` / `/shutdown` - (Superadmin) Aba-aba hitung mundur pemeliharaan.

---

[⬆ Kembali ke Atas](#daftar-isi)

### 11. Menjalankan dengan Docker

#### Persyaratan

* [Docker](https://docs.docker.com/get-docker/)
* [Docker Compose](https://docs.docker.com/compose/install/) (sudah termasuk dalam Docker Desktop)

#### Pengaturan

1. Buat file environment dari template:

```sh
cp .env.example .env
```

2. Buat file konfigurasi dari template:

```sh
cp config-template.json config.json
```

3. Perbarui `config.json`:
   - Atur `"proxy": true`
   - Atur `"db"` menjadi: `"mongodb://<MONGO_USERNAME>:<MONGO_PASSWORD>@mongodb:27017/<MONGO_DATABASE>?authSource=admin"` (gunakan nilai dari file `.env` Anda)
   - Buat **dua nilai acak yang berbeda** untuk `"secret"` dan `"token"`:

```sh
node -e "console.log(require('crypto').randomBytes(64).toString('base64'))"
```

Secara standar, Docker menggunakan "npm run build-fast". Silakan sesuaikan Dockerfile pada direktori /docker/ menjadi "npm run build-beta" jika Anda ingin menjalankan fitur beta (--beta) dan tools (/tools/).

4. Build dan jalankan:

```sh
cd docker && docker-compose up --build
```

#### Arsitektur Layanan (Services)

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

#### Perintah yang Berguna

```sh
cd docker && docker-compose up --build     # build dan jalankan semua layanan
cd docker && docker-compose up -d          # jalankan di background (detached)
cd docker && docker-compose down           # hentikan semua layanan
cd docker && docker-compose logs -f        # lihat log (mode follow)
cd docker && docker-compose logs game-main # lihat log untuk layanan tertentu
cd docker && docker-compose restart login  # restart layanan tertentu
```

#### Menambahkan Peran via Docker

```sh
cd docker && docker-compose exec game-main node cli.js --addrole <account_id> superadmin
```

[⬆ Kembali ke Atas](#daftar-isi)
