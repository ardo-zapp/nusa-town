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


**Patreon**
- Go to https://www.patreon.com/portal/registration/register-clients and create a new app.
- Set redirect URI to `http://<your domain>/auth/patreon/callback` or `http://localhost:8090/auth/patreon/callback` for localhost server.
- Add this to `oauth` field in your `config.json`:
  ```json
  "patreon": {
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
You MUST change the main server port ("id": "main") in config.json before running this, because the login server is separated from the main (game) server otherwise the port will clash. From port 8090 to 8093 and wsPort from 10090 to 10093.
```bash
node pony-town.js --login --beta             # Login server (--beta is optional. Only works if you have run "npm run build-beta", and the server has "test" & "editor" flag)
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
1. **Server Configuration:** To actually see developer-only map objects and use the map editor, ensure your `config.json` has the following JSON object in the `flags` property of the target server:
"flags": {
  "test": true,
  "editor": true
}
2. Build Dependency: The `--beta` argument only works if you have run `npm run build-beta`. If you run `npm run build` or `npm run build-fast`, the beta features will be automatically removed. You have to run `npm run build-beta` again to enable it.

#### Development Environment

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
2. Dev Server, this part is optional, you can leave it for map editing, if left as is don't forget to run "npm run build-beta".

If you want to delete it, delete the dev server block with "id": "dev" from config.json and also delete this block from apache:

```apacheconf
# Dev Server - WebSocket
ProxyPass "/s02/ws" "ws://localhost:10094/s02/ws" flushpackets=on keepalive=On retry=0 timeout=3600 max=200 acquire=3000
ProxyPassReverse "/s02/ws" "ws://localhost:10094/s02/ws"
```

And run the standard build (not beta) "npm run build" or "npm run build-fast".

Make sure you have run "npm run build-beta" if you keep the dev server or "npm run build-fast" if you have deleted the dev server from config.json.

3. You MUST change the main server port ("id": "main") in config.json before running PM2 because the server is run as a "Fully Isolated Process".

From port 8090 to 8093 and wsPort from 10090 to 10093.

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

---
### Useful PM2 Commands

Here are some basic commands for managing your servers using PM2:

- **Viewing Server Logs:**
  `pm2 logs` (View all logs in real-time)
  `pm2 logs nusatown-main-game` (View logs for a specific instance)

- **Restarting Servers:**
  `pm2 restart all` (Restart all instances)
  `pm2 restart nusatown-main-game` (Restart a specific instance)

- **Stopping Servers:**
  `pm2 stop all`
  `pm2 stop nusatown-main-game`

- **Deleting Instances from PM2:**
  `pm2 delete all`
  `pm2 delete nusatown-main-game`

- **Killing the PM2 Daemon:**
  `pm2 kill`

- **Updating Configuration (If ecosystem.config.js changes):**
  If you make changes to `ecosystem.config.js`, apply those changes without deleting the instance using:
  `pm2 restart ecosystem.config.js --update-env`
---

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

    # Main Server - WebSocket
    ProxyPass "/s00/ws" "ws://localhost:10093/s00/ws" flushpackets=on keepalive=On retry=0 timeout=3600 max=200 acquire=3000
    ProxyPassReverse "/s00/ws" "ws://localhost:10093/s00/ws"

    # Safe Server - WebSocket
    ProxyPass "/s01/ws" "ws://localhost:10094/s01/ws" flushpackets=on keepalive=On retry=0 timeout=3600 max=200 acquire=3000
    ProxyPassReverse "/s01/ws" "ws://localhost:10094/s01/ws"

    # Dev Server - WebSocket
    ProxyPass "/s02/ws" "ws://localhost:10095/s02/ws" flushpackets=on keepalive=On retry=0 timeout=3600 max=200 acquire=3000
    ProxyPassReverse "/s02/ws" "ws://localhost:10095/s02/ws"

    # Standalone Admin - WebSocket
    ProxyPass "/admin/ws-admin" "ws://localhost:10091/admin/ws-admin" flushpackets=on keepalive=On retry=0 timeout=3600 max=50 acquire=3000
    ProxyPassReverse "/admin/ws-admin" "ws://localhost:10091/admin/ws-admin"

    # Standalone Admin - HTTP
    ProxyPass "/admin/" "http://localhost:8091/admin/" keepalive=On retry=0
    ProxyPassReverse "/admin/" "http://localhost:8091/admin/"

    # Standalone Tools - HTTP
    ProxyPass "/tools/" "http://localhost:8092/tools/" keepalive=On retry=0
    ProxyPassReverse "/tools/" "http://localhost:8092/tools/"

    # HTTP Fallback
    ProxyPass "/" "http://localhost:8090/" keepalive=On retry=0
    ProxyPassReverse "/" "http://localhost:8090/"

    ErrorLog ${APACHE_LOG_DIR}/nusatown_error.log
    CustomLog ${APACHE_LOG_DIR}/nusatown_access.log combined
</VirtualHost>
```

**Alternative: Create an Nginx Server Block configuration file**
Apache is highly recommended, but an Nginx configuration is provided below as an alternative.
```nginx
server {
    listen 80;
    server_name example.com;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl;
    server_name example.com;

    ssl_certificate /etc/letsencrypt/live/example.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/example.com/privkey.pem;

    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_prefer_server_ciphers on;

    proxy_set_header X-Forwarded-Proto https;
    proxy_set_header X-Forwarded-Port 443;
    proxy_set_header Host $host;

    # Main Server - WebSocket
    location /s00/ws {
        proxy_pass http://127.0.0.1:10093/s00/ws;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_read_timeout 3600s;
        proxy_send_timeout 3600s;
    }

    # Safe Server - WebSocket
    location /s01/ws {
        proxy_pass http://127.0.0.1:10094/s01/ws;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_read_timeout 3600s;
        proxy_send_timeout 3600s;
    }

    # Dev Server - WebSocket
    location /s02/ws {
        proxy_pass http://127.0.0.1:10095/s02/ws;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_read_timeout 3600s;
        proxy_send_timeout 3600s;
    }

    # Standalone Admin - WebSocket
    location /admin/ws-admin {
        proxy_pass http://127.0.0.1:10091/admin/ws-admin;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_read_timeout 3600s;
        proxy_send_timeout 3600s;
    }

    # Standalone Admin - HTTP
    location /admin/ {
        proxy_pass http://127.0.0.1:8091/admin/;
    }

    # Standalone Tools - HTTP
    location /tools/ {
        proxy_pass http://127.0.0.1:8092/tools/;
    }

    # HTTP Fallback
    location / {
        proxy_pass http://127.0.0.1:8090/;
    }

    access_log /var/log/nginx/nusatown_access.log;
    error_log /var/log/nginx/nusatown_error.log;
}
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

**C. Workflow for Adding New Objects (Example: Bakso Cart)**
1. **File Placement**: Save your design file (e.g., `bakso_cart.psd`) into the `assets-source/objects/` directory. Ensure it has a layer named `color` and (optionally) `shadow`.
2. **Compilation (Sprite Generator)**: Run the terminal command `npx gulp dev --sprites` to register the asset and generate the `.bin`/.`raw` *sprite sheet*. This file also automatically updates the *cache* file in `src/ts/generated/sprites.ts`.
3. **Code Registration**: Open the `src/ts/common/entities.ts` file and register the object entity so it is recognized by the client and server. Example code call using the generated layers:
   ```typescript
   export const baksoCart = doodad(
       n('bakso-cart'),
       sprites.bakso_cart.color, // Passing the specific color layer
       30, 15, 0,
       mixColliderRect(-20, -10, 40, 20)
   );
   ```
   *`sprites.bakso_cart.color` directly calls the layer you named `color` in your `bakso_cart.psd` file.*

**D. Handling PNG vs PSD Files**
- `.psd` extensions are used specifically for interactive/complex objects that require layering functionality (shadows, trunks, color palettes, overlapping clothing transparency).
- `.png` extensions are strictly used for **Static Assets** (such as *UI Buttons*, *Icons*, *Lights*/glowing effects, and terrain *Tilesets*). These files are rendered purely flat and do not require palette manipulation logic. Do not delete static `.png` files in `assets-source/` unless you are modifying the *source code* dependencies.

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

By default, Docker uses "npm run build-fast". Please adjust the Dockerfile in the /docker/ directory to "npm run build-beta" if you want to run beta features (--beta) and tools (/tools/).

4. Build and run:

```bash
cd docker && docker-compose up --build
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
cd docker && docker-compose up --build     # build and start all services
cd docker && docker-compose up -d          # start in background (detached)
cd docker && docker-compose down           # stop all services
cd docker && docker-compose logs -f        # view logs (follow mode)
cd docker && docker-compose logs game-main # view logs for specific service
cd docker && docker-compose restart login  # restart specific service
```

### Adding Roles via Docker

```bash
cd docker && docker-compose exec game-main node cli.js --addrole <account_id> superadmin
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
  "toolsPort": 8092, // Port HTTP khusus untuk fitur developer (in-game tools)
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
      "wsPort": 10090, // Port khusus uWebSockets untuk lalu-lintas WebSocket secara direct
      "path": "/s00/ws", // Rute WebSocket path yang dicocokkan dengan reverse proxy Apache/Nginx
      "local": "localhost:8090", // Alamat host lokal yang dituju sistem ketika membroadcast info ke map ini
      "name": "18+ Server", // Nama sub-server yang muncul di daftar pilihan lobi
      "desc": "18+ speaking server", // Deskripsi singkat di lobi
      "season": "summer", // Melakukan override / menimpa musim global
      "holiday": "none", // Melakukan override / menimpa liburan global
      "flag": "", // Label identifikasi sub-server tambahan di UI (contoh: 'test', 'star', 'ru')
      "flags": { // Toggle fitur in-game pada sub-server
        "test": true, // Menandai server dengan border "test"
        "editor": true // Mengaktifkan alat modifikasi map (map editor) bagi user
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


**Patreon**
- Buka https://www.patreon.com/portal/registration/register-clients dan buat aplikasi baru.
- Atur redirect URI ke `http://<domain Anda>/auth/patreon/callback` atau `http://localhost:8090/auth/patreon/callback` untuk server localhost.
- Tambahkan ini ke field `oauth` di `config.json` Anda:
  ```json
  "patreon": {
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
WAJIB mengubah port server main ("id": "main") pada config.json sebelum menjalankan ini, karena server login terpisah dari server main (game) jika tidak port akan bentrok. Dari port 8090 jadi 8093 dan wsPort dari 10090 jadi 10093.
```bash
node pony-town.js --login --beta             # Menjalankan server Login (--beta bersifat opsional. Hanya berfungsi jika Anda sudah menjalankan "npm run build-beta", dan server memiliki flag "test" & "editor")
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
1. **Konfigurasi Server:** Agar objek tes (seperti item yang bisa dipungut) dan alat map editor in-game benar-benar diizinkan, pastikan file `config.json` Anda memiliki objek JSON berikut di dalam properti `flags` server yang dituju:
"flags": {
  "test": true,
  "editor": true
}
2. Ketergantungan Build: Argumen `--beta` hanya berfungsi jika Anda sudah menjalankan `npm run build-beta`. Jika Anda menjalankan `npm run build` atau `npm run build-fast`, fitur beta akan terhapus otomatis. Anda harus menjalankan `npm run build-beta` kembali untuk mengaktifkannya.

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
2. Dev Server, bagian ini bersifat opsional, boleh dibiarkan untuk edit map, jika tetap dibiarkan jangan lupa jalankan "npm run build-beta".

Jika ingin dihapus, hapus bagian Server dev dengan "id": "dev" dari config.json dan hapus juga blok ini dari apache:

```apacheconf
# Dev Server - WebSocket
ProxyPass "/s02/ws" "ws://localhost:10094/s02/ws" flushpackets=on keepalive=On retry=0 timeout=3600 max=200 acquire=3000
ProxyPassReverse "/s02/ws" "ws://localhost:10094/s02/ws"
```

Dan jalankan build standar (bukan beta) "npm run build" atau "npm run build-fast".

Pastikan sudah menjalankan "npm run build-beta" jika mempertahankan server dev atau "npm run build-fast" jika sudah menghapus server dev dari config.json.

3. WAJIB mengubah port server main ("id": "main") pada config.json sebelum Menjalankan PM2 karena server dijalankan sebagai "Fully Isolated Process / Mandiri".

Dari port 8090 jadi 8093 dan wsPort dari 10090 jadi 10093.

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

---
### Perintah Operasional PM2 yang Berguna

Berikut adalah beberapa perintah dasar untuk mengelola server menggunakan PM2:

- **Melihat Log Server:**
  `pm2 logs` (Melihat semua log secara real-time)
  `pm2 logs nusatown-main-game` (Melihat log untuk spesifik instance)

- **Restart Server:**
  `pm2 restart all` (Restart semua instance)
  `pm2 restart nusatown-main-game` (Restart spesifik instance)

- **Menghentikan Server Sementara (Stop):**
  `pm2 stop all`
  `pm2 stop nusatown-main-game`

- **Menghapus Instance dari PM2 (Delete):**
  `pm2 delete all`
  `pm2 delete nusatown-main-game`

- **Mematikan Total PM2 Daemon (Kill):**
  `pm2 kill`

- **Update Konfigurasi (Jika ecosystem.config.js berubah):**
  Jika Anda melakukan perubahan pada file `ecosystem.config.js`, terapkan perubahan tersebut tanpa harus menghapus instance dengan perintah:
  `pm2 restart ecosystem.config.js --update-env`
---

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

    # Main Server - WebSocket
    ProxyPass "/s00/ws" "ws://localhost:10093/s00/ws" flushpackets=on keepalive=On retry=0 timeout=3600 max=200 acquire=3000
    ProxyPassReverse "/s00/ws" "ws://localhost:10093/s00/ws"

    # Safe Server - WebSocket
    ProxyPass "/s01/ws" "ws://localhost:10094/s01/ws" flushpackets=on keepalive=On retry=0 timeout=3600 max=200 acquire=3000
    ProxyPassReverse "/s01/ws" "ws://localhost:10094/s01/ws"

    # Dev Server - WebSocket
    ProxyPass "/s02/ws" "ws://localhost:10095/s02/ws" flushpackets=on keepalive=On retry=0 timeout=3600 max=200 acquire=3000
    ProxyPassReverse "/s02/ws" "ws://localhost:10095/s02/ws"

    # Standalone Admin - WebSocket
    ProxyPass "/admin/ws-admin" "ws://localhost:10091/admin/ws-admin" flushpackets=on keepalive=On retry=0 timeout=3600 max=50 acquire=3000
    ProxyPassReverse "/admin/ws-admin" "ws://localhost:10091/admin/ws-admin"

    # Standalone Admin - HTTP
    ProxyPass "/admin/" "http://localhost:8091/admin/" keepalive=On retry=0
    ProxyPassReverse "/admin/" "http://localhost:8091/admin/"

    # Standalone Tools - HTTP
    ProxyPass "/tools/" "http://localhost:8092/tools/" keepalive=On retry=0
    ProxyPassReverse "/tools/" "http://localhost:8092/tools/"

    # HTTP Fallback
    ProxyPass "/" "http://localhost:8090/" keepalive=On retry=0
    ProxyPassReverse "/" "http://localhost:8090/"

    ErrorLog ${APACHE_LOG_DIR}/nusatown_error.log
    CustomLog ${APACHE_LOG_DIR}/nusatown_access.log combined
</VirtualHost>
```

**Alternatif: Buat file Server Block Nginx**
Apache adalah rekomendasi utama, namun Nginx disediakan di bawah ini sebagai alternatif.
```nginx
server {
    listen 80;
    server_name example.com;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl;
    server_name example.com;

    ssl_certificate /etc/letsencrypt/live/example.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/example.com/privkey.pem;

    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_prefer_server_ciphers on;

    proxy_set_header X-Forwarded-Proto https;
    proxy_set_header X-Forwarded-Port 443;
    proxy_set_header Host $host;

    # Main Server - WebSocket
    location /s00/ws {
        proxy_pass http://127.0.0.1:10093/s00/ws;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_read_timeout 3600s;
        proxy_send_timeout 3600s;
    }

    # Safe Server - WebSocket
    location /s01/ws {
        proxy_pass http://127.0.0.1:10094/s01/ws;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_read_timeout 3600s;
        proxy_send_timeout 3600s;
    }

    # Dev Server - WebSocket
    location /s02/ws {
        proxy_pass http://127.0.0.1:10095/s02/ws;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_read_timeout 3600s;
        proxy_send_timeout 3600s;
    }

    # Standalone Admin - WebSocket
    location /admin/ws-admin {
        proxy_pass http://127.0.0.1:10091/admin/ws-admin;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_read_timeout 3600s;
        proxy_send_timeout 3600s;
    }

    # Standalone Admin - HTTP
    location /admin/ {
        proxy_pass http://127.0.0.1:8091/admin/;
    }

    # Standalone Tools - HTTP
    location /tools/ {
        proxy_pass http://127.0.0.1:8092/tools/;
    }

    # HTTP Fallback
    location / {
        proxy_pass http://127.0.0.1:8090/;
    }

    access_log /var/log/nginx/nusatown_access.log;
    error_log /var/log/nginx/nusatown_error.log;
}
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

#### Panduan Pengembangan Aset (Asset Development Guide)
Sistem dalam game ini bekerja berdasarkan *sprite sheets* yang di-*generate* dari file `.psd` maupun `.png`. Untuk memastikan visual, *shadow*, dan efek warna musim (season) berfungsi baik di dalam game, berikut adalah alur kerja standar pengembangan aset:

**A. Struktur Layer PSD (Functional Layering)**
Sistem menggunakan penamaan layer secara spesifik untuk memisahkan fungsionalitas dan pewarnaan objek in-game. Struktur dasar layer dalam file `.psd`:
- `color`: Layer ini (atau nama bagian objek lainnya) mendefinisikan bentuk dasar dan warna objek. Jika memiliki referensi *palette*, warna di layer ini dapat ditukar secara dinamis.
- `shadow`: Layer bayangan objek dengan opasitas rendah (umumnya 30%) agar pencahayaan *render* terlihat natural di atas dataran (terrain) yang bervariasi.
- *Catatan:* Untuk pohon (trees), penamaannya lebih kompleks, seperti `crown` (dedaunan atas), `trunk` (batang utama), dan `stump` (akar pohon) yang diwarnai terpisah. Layer bernomor seperti `4:crown` hanya penamaan grup/folder dalam *Photoshop* agar rapi.

**B. Konvensi Penamaan (Naming Convention) pada Kode**
Ketika `npx gulp dev --sprites` memproses folder `assets-source/`, skrip generator akan menyatukan nama folder dan file menjadi variabel referensi di *typescript*:
- Jika Anda menyimpan file `bakso_cart.psd` di dalam folder root `assets-source/objects/`, skrip akan menghasilkan referensi kode: `sprites.bakso_cart`. Untuk memanggil layernya di dalam kode, Anda harus menambahkan nama layernya (contoh: `sprites.bakso_cart.color` dan `sprites.bakso_cart.shadow`).
- Jika Anda menyimpan di sub-folder, misal `assets-source/objects/bench/1.psd`, skrip menggabungkan nama foldernya, sehingga referensinya menjadi: `sprites.bench_1`. Pemanggilan layernya menjadi `sprites.bench_1.color` dan `sprites.bench_1.shadow`.
- Jika file memiliki *palette* untuk variasi warna, ia akan masuk ke dalam array `.palettes` (contoh: `sprites.bench_1.palettes`).

**C. Alur Penambahan Objek Baru (Contoh: Bakso Cart)**
1. **Penempatan File**: Simpan file desain (misal: `bakso_cart.psd`) ke dalam direktori `assets-source/objects/`. Pastikan Anda menamai layer gambar utamanya sebagai `color` dan layer bayangannya sebagai `shadow`.
2. **Kompilasi (Sprite Generator)**: Jalankan perintah terminal `npx gulp dev --sprites` untuk mendaftarkan aset dan menghasilkan *sprite sheet* `.bin`/.`raw`. File ini juga secara otomatis memperbarui file *cache* di `src/ts/generated/sprites.ts`.
3. **Registrasi Kode**: Buka file `src/ts/common/entities.ts` dan daftarkan entitas objek tersebut agar dikenali oleh klien dan server. Contoh nyata pemanggilan kodenya dengan memanggil layer spesifik:
   ```typescript
   export const baksoCart = doodad(
       n('bakso-cart'),
       sprites.bakso_cart.color, // Mengacu pada layer "color" di dalam psd
       30, 15, 0,
       mixColliderRect(-20, -10, 40, 20)
   );
   ```
   *`sprites.bakso_cart.color` langsung memanggil gambar yang ada di layer `color` pada file `bakso_cart.psd` Anda.*

**D. Penanganan File PNG vs PSD**
- File ekstensi `.psd` digunakan secara khusus untuk objek interaktif/kompleks yang membutuhkan fungsionalitas layering (bayangan, batang, palet warna, transparansi tumpukan pakaian).
- File ekstensi `.png` digunakan khusus sebagai **Static Assets** (seperti *UI Buttons*, *Icons*, efek bercahaya/Lights, dan *Tileset* dataran). File ini murni di-*render* datar dan tidak memerlukan logika manipulasi sistem palette. Jangan menghapus file statik `.png` di dalam `assets-source/` kecuali Anda mengubah dependensi *source code*.

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

Secara standar, Docker menggunakan "npm run build-fast". Silakan sesuaikan Dockerfile pada direktori /docker/ menjadi "npm run build-beta" jika Anda ingin menjalankan fitur beta (--beta) dan tools (/tools/).

4. Build dan jalankan:

```bash
cd docker && docker-compose up --build
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
cd docker && docker-compose up --build     # build dan jalankan semua layanan
cd docker && docker-compose up -d          # jalankan di background (detached)
cd docker && docker-compose down           # hentikan semua layanan
cd docker && docker-compose logs -f        # lihat log (mode follow)
cd docker && docker-compose logs game-main # lihat log untuk layanan tertentu
cd docker && docker-compose restart login  # restart layanan tertentu
```

### Menambahkan Peran via Docker

```bash
cd docker && docker-compose exec game-main node cli.js --addrole <account_id> superadmin
```

</details>
