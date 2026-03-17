# Nusa Town

[English](#english) | [Bahasa Indonesia](#bahasa-indonesia)

---

<a name="english"></a>
# English

A game of ponies building a town

This is a Pony Town Custom Server project with modified Indonesian nuances.
This project requires some adjustments, please adjust it yourself according to your needs.

NOTE: This is an old version of the project, Pony Town no longer provides source code and has become closed source, you should use this repository as learning material.

## Prerequisites

* [Node.js](https://nodejs.org/en/download/) (version 24 LTS)
* MongoDB 7+: [download link](https://www.mongodb.com/download-center/community) and [installation instructions](https://docs.mongodb.com/manual/administration/install-community/)
* System dependencies for Canvas (Required for Ubuntu/Debian): `sudo apt-get install build-essential libcairo2-dev libpango1.0-dev libjpeg-dev libgif-dev librsvg2-dev pkg-config`
* [ImageMagick](https://imagemagick.org/script/download.php#windows) (optional, required for generating preview gifs in animation tool)

## Installation

```bash
npm install
```

## Setup

Create `config.json` file in the root folder with the following content:

```json
{
  "title": "My custom server",
  "discordLink": "<LINK_TO_DISCORD_INVITE>",
  "contactDiscord": "your_contact_discord#0000", // optional
  "twitterLink": "<LINK_TO_TWITTER>",
  "contactEmail": "your_contact_email",
  "port": 8090,
  "adminPort": 8091,
  "host": "http://localhost:8090/",
  "local": "localhost:8090",
  "adminLocal": "localhost:8091",
  "proxy": false,
  "secret": "<some_random_string_here>",
  "token": "<some_random_string_here>",
  "db": "mongodb://<username>:<password>@localhost:27017/<database_name>", // use values you used when setting up database
  "analytics": { // optional google analytics
    "trackingID": "<tracking_id>"
  },
  "facebookAppId": "<facebook_id>", // optional facebook app link
  "assetsPath": "<path_to_graphics_assets>", // optional, for asset generation
  "season": "spring", // optional, defaults to spring; season for all servers, seasons are "spring", "summer", "autumn" and "winter"
  "holiday": "none", // optional, defaults to none; holiday for all servers, holidays are "none", "halloween", "christmas", "stpatricks" and "easter"
  "oauth": {
    "google": {
      "clientID": "<CLIENT_ID_HERE>",
      "clientSecret": "<CLIENT_SECRET_HERE>"
    }
    // other oauth entries here
  },
  "servers": [
    {
      "id": "dev",
      "port": 8090,
      "path": "/s00/ws",
      "local": "localhost:8090",
      "name": "Dev server",
      "desc": "Development server",
      "season": "summer", // optional, defaults to summer, seasons are "spring", "summer", "autumn" and "winter"
      "holiday": "none", // optional, defaults to none, holidays are "none", "halloween", "christmas", "stpatricks" and "easter"
      "flag": "test", // optional system flag ("test", "star" or space separated list of country flags)
      "flags": { // optional feature flags
        "test": true, // test server
        "editor": true // in-game editor
      },
      "alert": "18+" // optional 18+ alert (also blocks underage players)
    }
  ]
}
```


### Generating Secret and Token

You **MUST** provide **unique**, **random** values for the `secret` and `token` fields of your config. It is **extremely dangerous** to leave these as default, as these values serve as authentication tokens for internal APIs and session cookies.

To generate new values for these parameters, you can use the following command:

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('base64'))"
```

### Setting up Database

- Install MongoDB
- Start `mongosh` or `mongo` from command line (you may need to go to your MongoDB installation path on windows to run the command)
- Type `use your_database_name` to create database
- Type `db.new_collection.insert({ some_key: "some_value" })` to initialize database
- Type
  ```javascript
  db.createUser(
    {
      user: "your_username",
      pwd: "your_password",
      roles: [ { role: "readWrite", db: "your_database_name" } ]
    }
  )
  ```
  to create database user.
- Type `quit()` to exit mongo

### Setting up OAuth keys

Get OAuth keys for the authentication platform of your choice (github, google, twitter, facebook, vkontakte, discord).

#### Github

- Go to https://github.com/settings/developers create new OAuth app.
- Set authorization callback URL to `http://<your domain>/auth/github/callback` or `http://localhost:8090/auth/github/callback` for localhost server.
- Add this to `oauth` field in your `config.json`

```json
"github": {
  "clientID": "<your_client_id>",
  "clientSecret": "<your_client_secret>"
}
```

#### Twitter

- Go to https://developer.twitter.com/en/apps create new app.
- Set callback URL to `http://<your domain>/auth/twitter/callback` or `http://localhost:8090/auth/twitter/callback` for localhost server.
- Add this to `oauth` field in your `config.json`

```json
"twitter": {
  "consumerKey": "<your_consumer_key>",
  "consumerSecret": "<your_consumer_secret>"
}
```

#### Google

- Go to https://console.developers.google.com/apis/dashboard create new project from dropdown at the top, go to credentials and create new entry.
- Add to Authorized JavaScript origins `http://<your domain>` or `http://localhost:8090/` for localhost server.
- Add to Authorized redirect URIs `http://<your domain>/auth/google/callback` or `http://localhost:8090/auth/google/callback` for localhost server.
- Add this to `oauth` field in your `config.json`

```json
"google": {
  "clientID": "<your_client_id>",
  "clientSecret": "<your_client_secret>"
}
```

#### Facebook

- Go to https://developers.facebook.com/apps/ add a new app.
- Add "Facebook Login" product to your app
- Enable "Web OAuth Login"
- Add `https://<your domain>/auth/facebook/callback` to Valid OAuth Redirect URIs
- Add this to `oauth` field in your `config.json` (You can find App ID and App Secret in Settings > Basic section)

```json
"facebook": {
  "clientID": "<your_app_id>",
  "clientSecret": "<your_app_secret>",
  "graphApiVersion": "v3.1"
}
```

#### VKontakte

- Go to https://vk.com/apps?act=manage and create new app
- Set Authorized redirect URI to `http://<your domain>/auth/vkontakte/callback` or `http://localhost:8090/auth/vkontakte/callback` for localhost server.
- Add this to `oauth` field in your `config.json`

```json
"vkontakte": {
  "clientID": "<your_app_id>",
  "clientSecret": "<secure_key>"
}
```

#### Discord

- Go to https://discord.com/developers/applications/ and create a new app
- Navigate to the OAuth2 tab
- Add `http://<your domain>/auth/discord/callback` (or `http://localhost:8090/auth/discord/callback` for your localhost server) as a redirect URI
- Navigate back to the General Information tab
- Add this to the `oauth` field in your `config.json`

```json
"discord": {
  "clientID": "<your_client_id>",
  "clientSecret": "<your_client_secret>"
}
```


## Running

Production environment

```bash
npm run build
npm start
```

Adding/removing roles

```bash
node cli.js --addrole <account_id> <role>   # roles: superadmin, admin, mod, dev
node cli.js --removerole <account_id> <role>
```

To setup superadmin role use following command

```bash
node cli.js --addrole <your_account_id> superadmin
```

Admin panel is accessible at `<base_url>/admin/` (requires admin or superadmin role to access)
Tools are accessible at `<base_url>/tools/` (only available in dev mode or when started with --tools flag)

Starting as multiple processes

```bash
node pony-town.js --login                    # login server
node pony-town.js --game main                # game server 1 ('main' has to match id from config.json)
node pony-town.js --game safe                # game server 2 ('safe' has to match id from config.json)
node pony-town.js --admin --standaloneadmin  # admin server
```

For these to work on the same URL, paths to game servers and admin server need to be bound to correct ports, using http proxy.

It is recommended to run processes with larger memory pool for large user bases (especially admin and game processes), example:

```bash
node --max_old_space_size=8192 pony-town.js --game main
```

Beta environment (with dev tools and in-development features)

```bash
npm run build-beta
node pony-town.js --login --admin --game --tools --beta
```

Running in development

```bash
npm run ts-watch    # terminal 1
npm run wds         # terminal 2
npx gulp dev            # terminal 3
npx gulp test           # terminal 4 (optional)
```

```bash
npx gulp dev --sprites  # run with generation of sprite sheets (use src/ts/tools/trigger.txt to trigger sprite generation without restarting gulp)
npx gulp dev --test     # run with tests
npx gulp dev --coverage # run with tests and code coverage
```

## Apache Reverse Proxy

Enabling Necessary Apache Modules

```bash
sudo a2enmod proxy proxy_http proxy_balancer lbmethod_byrequests
```

```bash
sudo systemctl restart apache2
```

Create Apache VirtualHost

```apacheconf
<VirtualHost *:80>
    ServerName example.com

    ProxyPreserveHost on
    RewriteEngine on

    ProxyPass / http://localhost:8090/
    ProxyPassReverse / http://localhost:8090/

    # Main Server
    <Location /s00/ws>
        RewriteCond %{HTTP:UPGRADE} ^websocket$ [NC]
        RewriteCond %{HTTP:CONNECTION} ^upgrade$ [NC]
        RewriteRule .* ws://localhost:8090%{REQUEST_URI} [P]
    </Location>

    # Safe Server
    <Location /s01/ws>
        RewriteCond %{HTTP:UPGRADE} ^websocket$ [NC]
        RewriteCond %{HTTP:CONNECTION} ^upgrade$ [NC]
        RewriteRule .* ws://localhost:8091%{REQUEST_URI} [P]
    </Location>
</VirtualHost>
```

Create an Apache VirtualHost with SSL

```apacheconf
<VirtualHost *:443>
    ServerName example.com

    ProxyPreserveHost on
    RewriteEngine on
    SSLEngine on

    ProxyPass / http://localhost:8090/
    ProxyPassReverse / http://localhost:8090/

    # Main Server
    <Location /s00/ws>
        RewriteCond %{HTTP:UPGRADE} ^websocket$ [NC]
        RewriteCond %{HTTP:CONNECTION} ^upgrade$ [NC]
        RewriteRule .* ws://localhost:8090%{REQUEST_URI} [P]
    </Location>

    # Safe Server
    <Location /s01/ws>
        RewriteCond %{HTTP:UPGRADE} ^websocket$ [NC]
        RewriteCond %{HTTP:CONNECTION} ^upgrade$ [NC]
        RewriteRule .* ws://localhost:8091%{REQUEST_URI} [P]
    </Location>

    SSLCertificateFile /etc/ssl/server.crt
    SSLCertificateKeyFile /etc/ssl/server.key
    SSLProtocol +TLSv1.3
</VirtualHost>
```

To put these changes into effect, restart Apache

```bash
sudo systemctl restart apache2
```

Set proxy to true in config.json

```json
"proxy": true
```

It is recommended to use Cloudflare.

## Customization

- `package.json` - settings for title and description of the website
- `assets/images` - logos and team avatars
- `public/images` - additional logos
- `public` - privacy policy and terms of service
- `favicons` - icons
- `src/ts/common/constants.ts` - global settings
- `src/ts/server/maps/*` - maps configuration and setup
- `src/ts/server/start.ts` - world setup
- `src/ts/components/services/audio.ts` - adding/removing sound tracks
- `src/ts/client/credits` - credits and contributors
- `src/style/partials/_variables.scss` - page style configuration

### Custom map introduction

- `src/ts/server/start.ts:35` - adding custom map to the world
- `src/ts/server/maps/customMap.ts` - commented introduction to customizing maps


## Repo quirks and notes

### `sprites.ts`

Due to an issue with the build system, an old copy of `src/ts/generated/sprites.ts` is shipped with this repository. In order to prevent Git from seeing changes to this file from local builds and warning you about them when changing branches or pulling new changes, you can use the following command:

```bash
git update-index --assume-unchanged src/ts/generated/sprites.ts
```

Read more about it [here](https://stackoverflow.com/questions/1139762/ignore-files-that-have-already-been-committed-to-a-git-repository).

### Adding assets

1. Edit sprites (`assets-source` folder)
2. Compile sprites (`npx gulp dev --sprites` or `npm run build-sprites`)
3. Add relevant code
4. (In some cases) compile sprites again

## Project Modification (Advanced)

This section is for developers who want to customize or add features to the project.

### 1. Main Directory Structure

* `src/` - Contains TypeScript (`.ts`) and SCSS (`.scss`) source code for client and server.
  * `src/ts/client/` - Code for the web client (frontend), managing character rendering (canvas), user input (keyboard/mouse), websocket handlers, etc.
  * `src/ts/server/` - Backend server code (NodeJS + Express + WebSockets). Manages authentication, APIs, *game loop*, maps, and socket communication to all clients.
  * `src/ts/common/` - Code shared/used by both client and server (e.g., model definitions, constants, utils).
  * `src/ts/components/` - Angular components for the web interface (UI modals, action bars, character editor, chat logs).
  * `src/ts/graphics/` - WebGL and *canvas drawing* system to render the world, maps, and characters.
* `assets/` - Place to store static files like CSS, Fonts, Images.
* `assets-source/` - Source directory for graphics files (generally PSD or sprite-sheet files).
* `public/` - Contains files exposed directly to the root (like general static images).

### 2. Modifying Assets (Adding Items / Clothing)

This game uses a *sprite sheet* system to render animations, objects, hair, and items.

1. **Sprite Images**: Place new image files in the `assets-source` folder or modify existing `.png` files. Usually, for hair/clothing, you must draw all animation frames (standing, walking, trotting, sitting, etc.).
2. **Sprite Generator**: Use the `gulp dev --sprites` script (or run `npm run build-sprites`) to convert images/individual images from the `assets-source` directory into the final *sprite sheet* file.
   > **Tip**: You can use a trigger file by touching/changing the contents of `src/ts/tools/trigger.txt` to re-trigger automatic sprite generation if you are in dev mode.
3. **Registering Assets to Code**:
   After the sprite sheet is generated, ensure the object is added to the initialization script in `src/ts/common/pony.ts` or `src/ts/common/entities.ts` according to its designation (e.g.: `manespire`, `tails`, or `accessories`).

### 3. Modifying Gameplay (Client & Server)

The flow of adding an action (e.g.: "Dancing") generally involves 3 stages:

#### A. Adding Action Declaration in Common
* Open `src/ts/common/interfaces.ts` and add your action constant inside `enum Action`.
* Define an `EntityState` (e.g., `PonyDancing`) that represents the character's status.

#### B. Handle Action on Client
* Add UI click detection or keyboard hotkeys in `src/ts/client/playerActions.ts`. Example:
  ```typescript
  export function danceAction(player: Pony, game: PonyTownGame) {
      if (canPonyDance(player, game.map)) {
          game.send(server => server.action(Action.Dance));
          // change local state for instant feedback before getting server response
          player.state = setPonyState(player.state, EntityState.PonyDancing);
      }
  }
  ```
* Provide visual response, like changing the frame to be rendered in `src/ts/client/ponyDraw.ts` if currently in `PonyDancing` state.

#### C. Handle Action on Server
* The server listens to client actions via WebSocket event handlers. Find the action handling logic, usually in `src/ts/server/serverActions.ts` or `src/ts/server/playerUtils.ts`.
* Add logic checks (whether they can dance) on the server, and broadcast the status `Update` to all clients (other players on screen so they see your character dancing).

### 4. Custom Map

To add a new map:
1. Open `src/ts/server/maps/`.
2. Create a map creation script file (or duplicate `customMap.ts`). Here you define the tile structure, tree placement, houses, etc.
3. Open `src/ts/server/start.ts` and find the line where the map is initialized (around line 35). Register and initiate your new map class to the `world` instance.

---

<a name="bahasa-indonesia"></a>
# Bahasa Indonesia

Sebuah game tentang pony-pony yang membangun kota.

Ini adalah proyek Pony Town Custom Server dengan modifikasi nuansa Indonesia.
Proyek ini memerlukan beberapa penyesuaian, silakan sesuaikan sendiri sesuai dengan kebutuhan Anda.

CATATAN: Ini adalah versi lama dari proyek ini, Pony Town tidak lagi menyediakan kode sumber dan telah menjadi sumber tertutup (closed source), Anda harus menggunakan repositori ini sebagai bahan pembelajaran.

## Persyaratan (Prerequisites)

* [Node.js](https://nodejs.org/en/download/) (versi 24 LTS)
* MongoDB 7+: [tautan unduhan](https://www.mongodb.com/download-center/community) dan [petunjuk instalasi](https://docs.mongodb.com/manual/administration/install-community/)
* Dependensi sistem untuk Canvas (Dibutuhkan untuk Ubuntu/Debian): `sudo apt-get install build-essential libcairo2-dev libpango1.0-dev libjpeg-dev libgif-dev librsvg2-dev pkg-config`
* [ImageMagick](https://imagemagick.org/script/download.php#windows) (opsional, diperlukan untuk menghasilkan gif pratinjau dalam alat animasi)

## Instalasi

```bash
npm install
```

## Pengaturan (Setup)

Buat file `config.json` di folder root dengan konten berikut:

```json
{
  "title": "My custom server",
  "discordLink": "<LINK_TO_DISCORD_INVITE>",
  "contactDiscord": "your_contact_discord#0000", // opsional
  "twitterLink": "<LINK_TO_TWITTER>",
  "contactEmail": "your_contact_email",
  "port": 8090,
  "adminPort": 8091,
  "host": "http://localhost:8090/",
  "local": "localhost:8090",
  "adminLocal": "localhost:8091",
  "proxy": false,
  "secret": "<some_random_string_here>",
  "token": "<some_random_string_here>",
  "db": "mongodb://<username>:<password>@localhost:27017/<database_name>", // gunakan nilai yang Anda gunakan saat menyiapkan database
  "analytics": { // opsional google analytics
    "trackingID": "<tracking_id>"
  },
  "facebookAppId": "<facebook_id>", // opsional facebook app link
  "assetsPath": "<path_to_graphics_assets>", // opsional, for asset generation
  "season": "spring", // opsional, defaults to spring; season for all servers, seasons are "spring", "summer", "autumn" and "winter"
  "holiday": "none", // opsional, defaults to none; holiday for all servers, holidays are "none", "halloween", "christmas", "stpatricks" and "easter"
  "oauth": {
    "google": {
      "clientID": "<CLIENT_ID_HERE>",
      "clientSecret": "<CLIENT_SECRET_HERE>"
    }
    // entri oauth lainnya di sini
  },
  "servers": [
    {
      "id": "dev",
      "port": 8090,
      "path": "/s00/ws",
      "local": "localhost:8090",
      "name": "Dev server",
      "desc": "Development server",
      "season": "summer", // opsional, defaults to summer, seasons are "spring", "summer", "autumn" and "winter"
      "holiday": "none", // opsional, defaults to none, holidays are "none", "halloween", "christmas", "stpatricks" and "easter"
      "flag": "test", // opsional system flag ("test", "star" or space separated list of country flags)
      "flags": { // opsional feature flags
        "test": true, // server uji coba
        "editor": true // editor dalam game
      },
      "alert": "18+" // opsional 18+ alert (also blocks underage players)
    }
  ]
}
```


### Menghasilkan Secret dan Token

Anda **HARUS** memberikan nilai yang **unik** dan **acak** untuk field `secret` dan `token` di konfigurasi Anda. Sangat berbahaya membiarkannya default, karena nilai ini berfungsi sebagai token otentikasi untuk API internal dan session cookie.

Untuk menghasilkan nilai baru, Anda dapat menggunakan perintah berikut di terminal:

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('base64'))"
```

### Menyiapkan Database

- Instal MongoDB
- Mulai `mongosh` atau `mongo` dari baris perintah (Anda mungkin perlu pergi ke path instalasi MongoDB Anda di windows untuk menjalankan perintah)
- Ketik `use your_database_name` untuk membuat database
- Ketik `db.new_collection.insert({ some_key: "some_value" })` untuk menginisialisasi database
- Ketik
  ```javascript
  db.createUser(
    {
      user: "your_username",
      pwd: "your_password",
      roles: [ { role: "readWrite", db: "your_database_name" } ]
    }
  )
  ```
  untuk membuat pengguna database.
- Ketik `quit()` untuk keluar dari mongo

### Menyiapkan kunci OAuth

Dapatkan kunci OAuth untuk platform otentikasi pilihan Anda (github, google, twitter, facebook, vkontakte, discord).

#### Github

- Buka https://github.com/settings/developers buat aplikasi OAuth baru.
- Atur authorization callback URL ke `http://<domain Anda>/auth/github/callback` atau `http://localhost:8090/auth/github/callback` untuk server localhost.
- Tambahkan ini ke field `oauth` di `config.json` Anda

```json
"github": {
  "clientID": "<client_id_Anda>",
  "clientSecret": "<client_secret_Anda>"
}
```

#### Twitter

- Buka https://developer.twitter.com/en/apps buat aplikasi baru.
- Atur callback URL ke `http://<domain Anda>/auth/twitter/callback` atau `http://localhost:8090/auth/twitter/callback` untuk server localhost.
- Tambahkan ini ke field `oauth` di `config.json` Anda

```json
"twitter": {
  "consumerKey": "<consumer_key_Anda>",
  "consumerSecret": "<consumer_secret_Anda>"
}
```

#### Google

- Buka https://console.developers.google.com/apis/dashboard buat proyek baru dari dropdown di bagian atas, buka credentials (kredensial) dan buat entri baru.
- Tambahkan ke Authorized JavaScript origins `http://<domain Anda>` atau `http://localhost:8090/` untuk server localhost.
- Tambahkan ke Authorized redirect URIs `http://<domain Anda>/auth/google/callback` atau `http://localhost:8090/auth/google/callback` untuk server localhost.
- Tambahkan ini ke field `oauth` di `config.json` Anda

```json
"google": {
  "clientID": "<client_id_Anda>",
  "clientSecret": "<client_secret_Anda>"
}
```

#### Facebook

- Buka https://developers.facebook.com/apps/ tambahkan aplikasi baru.
- Tambahkan produk "Facebook Login" ke aplikasi Anda
- Aktifkan "Web OAuth Login"
- Tambahkan `https://<domain Anda>/auth/facebook/callback` ke Valid OAuth Redirect URIs
- Tambahkan ini ke field `oauth` di `config.json` Anda (Anda dapat menemukan App ID dan App Secret di bagian Settings > Basic)

```json
"facebook": {
  "clientID": "<app_id_Anda>",
  "clientSecret": "<app_secret_Anda>",
  "graphApiVersion": "v3.1"
}
```

#### VKontakte

- Buka https://vk.com/apps?act=manage dan buat aplikasi baru
- Atur Authorized redirect URI ke `http://<domain Anda>/auth/vkontakte/callback` atau `http://localhost:8090/auth/vkontakte/callback` untuk server localhost.
- Tambahkan ini ke field `oauth` di `config.json` Anda

```json
"vkontakte": {
  "clientID": "<app_id_Anda>",
  "clientSecret": "<secure_key_Anda>"
}
```

#### Discord

- Buka https://discord.com/developers/applications/ dan buat aplikasi baru
- Navigasi ke tab OAuth2
- Tambahkan `http://<domain Anda>/auth/discord/callback` (atau `http://localhost:8090/auth/discord/callback` untuk server localhost Anda) sebagai redirect URI
- Navigasi kembali ke tab General Information
- Tambahkan ini ke field `oauth` di `config.json` Anda

```json
"discord": {
  "clientID": "<client_id_Anda>",
  "clientSecret": "<client_secret_Anda>"
}
```


## Menjalankan (Running)

Lingkungan produksi (Production environment)

```bash
npm run build
npm start
```

Menambahkan/menghapus peran (roles)

```bash
node cli.js --addrole <account_id> <role>   # peran: superadmin, admin, mod, dev
node cli.js --removerole <account_id> <role>
```

Untuk mengatur peran superadmin gunakan perintah berikut

```bash
node cli.js --addrole <your_account_id> superadmin
```

Panel admin dapat diakses di `<base_url>/admin/` (memerlukan peran admin atau superadmin untuk mengakses)
Alat-alat (Tools) dapat diakses di `<base_url>/tools/` (hanya tersedia dalam mode dev atau saat dimulai dengan flag --tools)

Memulai sebagai beberapa proses

```bash
node pony-town.js --login                    # login server
node pony-town.js --game main                # game server 1 ('main' harus cocok dengan id dari config.json)
node pony-town.js --game safe                # game server 2 ('safe' harus cocok dengan id dari config.json)
node pony-town.js --admin --standaloneadmin  # admin server
```

Agar ini berfungsi pada URL yang sama, jalur ke server game dan server admin perlu diikat ke port yang benar, menggunakan http proxy.

Disarankan untuk menjalankan proses dengan pool memori yang lebih besar untuk basis pengguna yang besar (terutama proses admin dan game), contoh:

```bash
node --max_old_space_size=8192 pony-town.js --game main
```

Lingkungan Beta (dengan alat dev dan fitur dalam pengembangan)

```bash
npm run build-beta
node pony-town.js --login --admin --game --tools --beta
```

Berjalan dalam pengembangan (development)

```bash
npm run ts-watch    # terminal 1
npm run wds         # terminal 2
npx gulp dev            # terminal 3
npx gulp test           # terminal 4 (opsional)
```

```bash
npx gulp dev --sprites  # jalankan dengan generasi lembar sprite (gunakan src/ts/tools/trigger.txt untuk memicu generasi sprite tanpa me-restart gulp)
npx gulp dev --test     # jalankan dengan tes
npx gulp dev --coverage # jalankan dengan tes dan cakupan kode (code coverage)
```

## Apache Reverse Proxy

Mengaktifkan Modul Apache yang Diperlukan

```bash
sudo a2enmod proxy proxy_http proxy_balancer lbmethod_byrequests
```

```bash
sudo systemctl restart apache2
```

Buat Apache VirtualHost

```apacheconf
<VirtualHost *:80>
    ServerName example.com

    ProxyPreserveHost on
    RewriteEngine on

    ProxyPass / http://localhost:8090/
    ProxyPassReverse / http://localhost:8090/

    # Main Server
    <Location /s00/ws>
        RewriteCond %{HTTP:UPGRADE} ^websocket$ [NC]
        RewriteCond %{HTTP:CONNECTION} ^upgrade$ [NC]
        RewriteRule .* ws://localhost:8090%{REQUEST_URI} [P]
    </Location>

    # Safe Server
    <Location /s01/ws>
        RewriteCond %{HTTP:UPGRADE} ^websocket$ [NC]
        RewriteCond %{HTTP:CONNECTION} ^upgrade$ [NC]
        RewriteRule .* ws://localhost:8091%{REQUEST_URI} [P]
    </Location>
</VirtualHost>
```

Buat Apache VirtualHost dengan SSL

```apacheconf
<VirtualHost *:443>
    ServerName example.com

    ProxyPreserveHost on
    RewriteEngine on
    SSLEngine on

    ProxyPass / http://localhost:8090/
    ProxyPassReverse / http://localhost:8090/

    # Main Server
    <Location /s00/ws>
        RewriteCond %{HTTP:UPGRADE} ^websocket$ [NC]
        RewriteCond %{HTTP:CONNECTION} ^upgrade$ [NC]
        RewriteRule .* ws://localhost:8090%{REQUEST_URI} [P]
    </Location>

    # Safe Server
    <Location /s01/ws>
        RewriteCond %{HTTP:UPGRADE} ^websocket$ [NC]
        RewriteCond %{HTTP:CONNECTION} ^upgrade$ [NC]
        RewriteRule .* ws://localhost:8091%{REQUEST_URI} [P]
    </Location>

    SSLCertificateFile /etc/ssl/server.crt
    SSLCertificateKeyFile /etc/ssl/server.key
    SSLProtocol +TLSv1.3
</VirtualHost>
```

Untuk menerapkan perubahan ini, mulai ulang (restart) Apache

```bash
sudo systemctl restart apache2
```

Atur proxy ke true di config.json

```json
"proxy": true
```

Disarankan untuk menggunakan Cloudflare.

## Kustomisasi

- `package.json` - pengaturan untuk judul dan deskripsi situs web
- `assets/images` - logo dan avatar tim
- `public/images` - logo tambahan
- `public` - kebijakan privasi dan persyaratan layanan
- `favicons` - ikon
- `src/ts/common/constants.ts` - pengaturan global
- `src/ts/server/maps/*` - konfigurasi dan pengaturan peta
- `src/ts/server/start.ts` - pengaturan dunia
- `src/ts/components/services/audio.ts` - menambah/menghapus trek suara
- `src/ts/client/credits` - kredit dan kontributor
- `src/style/partials/_variables.scss` - konfigurasi gaya halaman

### Pengenalan peta kustom

- `src/ts/server/start.ts:35` - menambahkan peta kustom ke dunia
- `src/ts/server/maps/customMap.ts` - pengenalan dengan komentar untuk menyesuaikan peta



## Catatan dan keanehan Repositori (Repo quirks and notes)

### `sprites.ts`

Karena adanya masalah dengan sistem build, salinan lama `src/ts/generated/sprites.ts` disertakan dengan repositori ini. Untuk mencegah Git melihat perubahan pada file ini dari build lokal dan memperingatkan Anda tentang perubahan tersebut saat mengubah cabang atau menarik perubahan baru, Anda dapat menggunakan perintah berikut:

```bash
git update-index --assume-unchanged src/ts/generated/sprites.ts
```

Baca selengkapnya tentang hal ini [di sini](https://stackoverflow.com/questions/1139762/ignore-files-that-have-already-been-committed-to-a-git-repository).

### Menambahkan Aset (Adding assets)

1. Edit sprite (folder `assets-source`)
2. Kompilasi sprite (`npx gulp dev --sprites` atau `npm run build-sprites`)
3. Tambahkan kode yang relevan
4. (Dalam beberapa kasus) kompilasi sprite lagi

## Modifikasi Project (Tingkat Lanjut)

Bagian ini diperuntukkan bagi pengembang yang ingin melakukan penyesuaian (kustomisasi) atau menambahkan fitur pada project.

### 1. Struktur Direktori Utama

* `src/` - Berisi source code TypeScript (`.ts`) dan SCSS (`.scss`) untuk client dan server.
  * `src/ts/client/` - Kode untuk web client (frontend), mengatur rendering karakter (canvas), input user (keyboard/mouse), handlers websocket, dll.
  * `src/ts/server/` - Kode backend server (NodeJS + Express + WebSockets). Mengatur autentikasi, API, *game loop*, map, dan komunikasi socket ke semua client.
  * `src/ts/common/` - Kode yang di-share/digunakan baik oleh client maupun server (misalnya definisi model, constant, utils).
  * `src/ts/components/` - Komponen Angular untuk bagian antarmuka web (UI modal, action bar, karakter editor, chat log).
  * `src/ts/graphics/` - Sistem WebGL dan *canvas drawing* untuk me-render dunia, map, dan karakter-karakter.
* `assets/` - Tempat menyimpan file statis seperti CSS, Fonts, Images.
* `assets-source/` - Direktori sumber untuk file grafis (umumnya file PSD atau sprite-sheet).
* `public/` - Berisi file yang langsung diekspos ke root (seperti gambar statis umum).

### 2. Memodifikasi Assets (Menambahkan Item / Pakaian)

Game ini menggunakan sistem *sprite sheet* untuk me-render animasi, objek, rambut, hingga item.

1. **Sprite Images**: Letakkan file gambar baru di folder `assets-source` atau ubah file gambar `.png` yang ada. Biasanya, untuk rambut/pakaian, Anda harus menggambar semua frame animasinya (berdiri, berjalan, trotting, sitting, dll).
2. **Generator Sprite**: Gunakan script `gulp dev --sprites` (atau jalankan `npm run build-sprites`) untuk mengubah gambar/gambar individual dari direktori `assets-source` menjadi file *sprite sheet* final.
   > **Tip**: Kamu dapat menggunakan file trigger dengan menyentuh/mengubah isi `src/ts/tools/trigger.txt` untuk men-trigger ulang sprite generation otomatis jika sedang dalam mode dev.
3. **Mendaftarkan Asset ke Kode**:
   Setelah sprite sheet di-generate, pastikan objek tersebut ditambahkan ke script inisialisasi di `src/ts/common/pony.ts` atau `src/ts/common/entities.ts` sesuai dengan peruntukkannya (misal: `manespire`, `tails`, atau `accessories`).

### 3. Memodifikasi Gameplay (Client & Server)

Alur penambahan sebuah aksi (misal: "Berdansa") umumnya melibatkan 3 tahapan:

#### A. Menambah Deklarasi Action di Common
* Buka `src/ts/common/interfaces.ts` dan tambahkan konstanta aksi Anda di dalam `enum Action`.
* Tentukan `EntityState` (misal: `PonyDancing`) yang merepresentasikan status karakter.

#### B. Handle Aksi di Client
* Tambahkan deteksi klik UI atau hotkey keyboard di `src/ts/client/playerActions.ts`. Contoh:
  ```typescript
  export function danceAction(player: Pony, game: PonyTownGame) {
      if (canPonyDance(player, game.map)) {
          game.send(server => server.action(Action.Dance));
          // ubah state lokal agar instan sebelum dapat feedback dari server
          player.state = setPonyState(player.state, EntityState.PonyDancing);
      }
  }
  ```
* Berikan respon visual, seperti mengubah frame yang akan di render di `src/ts/client/ponyDraw.ts` jika sedang di state `PonyDancing`.

#### C. Handle Aksi di Server
* Server mendengarkan aksi klien lewat event handler WebSocket. Cari logika penanganan action, biasanya di file `src/ts/server/serverActions.ts` atau `src/ts/server/playerUtils.ts`.
* Tambahkan pengecekan logika (apakah bisa berdansa) di server, dan sebarkan `Update` status ke semua klien (pemain lain yang ada di layar agar melihat karakter Anda berdansa).

### 4. Custom Map

Untuk menambahkan peta baru:
1. Buka `src/ts/server/maps/`.
2. Buat file script pembuatan peta (atau duplikasi `customMap.ts`). Di sini Anda menentukan struktur tile, penempatan pohon, rumah, dll.
3. Buka `src/ts/server/start.ts` lalu cari baris di mana map diinisialisasi (disekitar baris 35). Registrasikan dan inisiasi class map baru Anda ke instance `world`.
