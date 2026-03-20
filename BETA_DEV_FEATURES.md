# BETA and DEVELOPMENT Exclusive Features

<details open>
<summary><b> Bahasa Indonesia</b></summary>

Dokumen ini berisi daftar fitur-fitur, perintah, dan *hotkeys* tersembunyi yang hanya aktif apabila server atau *client* dijalankan dengan opsi `--beta` (mode BETA) atau konstanta `DEVELOPMENT` (di-*compile* untuk lingkungan pengembangan).

Fitur-fitur ini sangat berguna bagi para developer, modder, dan map builder untuk men-debug permainan, mengubah letak objek secara instan, dan melihat kinerja sistem. Tidak satu pun dari fitur ini akan aktif pada *production build*.

---

### 1. Alat Pembangunan Peta Tingkat Lanjut (Advanced Map Editor Tools)

Ketika fitur `BETA` aktif dan akun Anda adalah seorang Mod (`isMod(account)`), mode editor map menjadi jauh lebih canggih. Anda dapat meletakkan, menghapus, dan memindahkan entitas/objek secara langsung menggunakan mouse di *in-game screen*.

* **File terkait:** `src/ts/client/game.ts` dan `src/ts/server/api/account.ts`
* **Cuplikan kode (*Code Snippet*):**
  ```typescript
  // src/ts/server/api/account.ts (Baris ~159)
  if (BETA && isMod(account)) {
      data.editor = entitiesInfo; // Memberikan akses data seluruh objek kepada Mod
  }
  ```

#### Hotkeys dan Klik:
- **Mouse Kanan (Klik Kanan)**:
  - Memindahkan *entities* yang sedang diseleksi ke titik kursor (`editorMoveEntities`).
  - Menghapus tembok secara instan (Toggle Wall).
- **Mouse Tengah (Klik Tengah / Roda Mouse)**:
  - Meletakkan entitas/objek spesifik ke koordinat kursor `(hover.x, hover.y)`.
- **Tombol Backspace**: Meng-undo (membatalkan) aksi editor terakhir (menghapus objek yang baru ditaruh, dll).
- **Pemilihan Massal (Drag Select)**: Menahan klik dan menarik kotak (drag) akan memilih banyak objek sekaligus.
- **Kuas Ukuran Besar**: Apabila ukuran brush `editor.brushSize > 1`, Anda dapat mengecat ubin tanah (tiles) di area yang luas secara bersamaan (`server.editorAction`).

---

### 2. Fitur Debug Kinerja & Visual Rendering (Debug Modes)

Mode BETA/DEVELOPMENT memberikan kebebasan bagi developer untuk melihat isi "*jeroan*" proses *rendering* (seperti hitboxes, grid, memori, dll) secara *real-time*.

* **File terkait:** `src/ts/client/game.ts` dan `src/ts/client/draw.ts`

#### Info Tambahan di Layar (Overlay):
- Menampilkan jumlah objek yang sedang dirender (`tris`, `flush`), dan daftar lagu yang sedang terputar di pojok kiri bawah, menggantikan teks versi.
  ```typescript
  // src/ts/client/game.ts (Baris ~1815)
  const extra = DEVELOPMENT ? `(${drawn}/${total}) ${tris} tris, ${flush} flush, ${this.audio.trackName}` : version;
  ```
- Jika `debug.showInfo` aktif, klien akan menampilkan data FPS dan tinggi koordinat map (heightmap).

#### Engine Render Alternatif:
- **Engine LayeredTiles**: Fitur eksperimental untuk merender tanah lapis demi lapis.
- **Engine Whiteness**: Menghapus seluruh tekstur map dan merender kanvas menjadi putih bersih.
- **Tampilan garis-garis kotak (Hitbox/Bounds)**:
  - Memperlihatkan garis tepi tabrakan fisik `(ColliderMap)` (Warna Ungu).
  - Memperlihatkan batas di mana pemain bisa duduk (Warna Hijau/Biru).
  - Memperlihatkan radius interaktif (`Interact Bounds`) (Warna Merah).
  ```typescript
  // src/ts/client/draw.ts (Baris ~155)
  if (BETA && options.debug.showHelpers) {
      drawOutlineRect(batch, PURPLE, getInteractBounds(player));
      drawOutlineRect(batch, 0xff000066, getSitOnBounds(player));
  }
  ```

---

### 3. Perintah Chat & Action Khusus Developer

Daftar perintah (`/`) yang hanya tersedia untuk debugging di lingkungan DEV atau di balik flag *Superadmin Beta*. Perintah-perintah ini tidak akan berjalan di server *production* normal (akan memunculkan error *invalid command*).

* **File terkait:** `src/ts/server/commands.ts` dan `src/ts/components/shared/actions-modal/actions-modal.ts`

- **`/season <musim>`**: (*Superadmin/BETA*) Memaksa map berganti musim (contoh: `/season winter`).
- **`/weather rain`**: (*Superadmin/BETA*) Memaksa hujan turun secara instan.
- **`/noclouds`**: (*Superadmin/BETA*) Membersihkan dan menghentikan laju awan yang bergerak di atas map.
- **`/hold <nama_objek>`**: (*Superadmin/BETA*) Memaksa *pony* untuk memegang/membawa suatu objek map tertentu.
- **`/toy <id_mainan>`**: (*Superadmin/BETA*) Memaksa *pony* untuk memegang mainan secara spesifik tanpa harus mendapatkannya dari map.
- **`/time <jam>`**: Memutar jam permainan. Pada mode Production, ini hanya untuk admin, namun pada mode DEVELOPMENT, ini terbuka untuk *semua* pemain (untuk menguji bayangan global).
  ```typescript
  // src/ts/server/commands.ts (Baris ~399)
  command(['time'], '/time <hour> - change server time', DEVELOPMENT ? '' : 'admin', ...);
  ```
- **`/map`**: (*DEVELOPMENT*) Menampilkan ukuran RAM peta yang sedang dimainkan beserta jumlah *entities* dan Map ID.
- **`/testparty`**: (*DEVELOPMENT*) Memaksa bot dan pemain di area sekitar secara otomatis masuk ke dalam grup Party (batas uji coba stres/limit party).
- **Aksi Objek Kustom (Actions Modal)**: Di mode BETA, pemain bisa langsung meletakkan objek (*entity*) spesifik dari Action Bar.
  ```typescript
  // src/ts/components/shared/actions-modal/actions-modal.ts (Baris ~85)
  if (BETA) {
      this.entityActions = getEntityNames().map(name => entityButtonAction(name));
  }
  ```
- **Tombol Pintasan `F1`**: Mengaktifkan layar bantuan overlay dengan daftar tombol kontrol rahasia.

---

### 4. Aksesori Eksperimental Tak Terbatas

Dalam versi *Production*, pemain hanya bisa memiliki maksimal 2 lapis *Extra Accessories* secara visual. Dalam *build* `DEVELOPMENT`, pembatasan ini dinaikkan hingga 100 lapis untuk membantu seniman (artist) menguji penggabungan elemen sprite.

* **File terkait:** `src/ts/client/ponyUtils.ts`
* **Cuplikan kode:**
  ```typescript
  // src/ts/client/ponyUtils.ts (Baris ~157)
  export const mergedExtraAccessories = mergeSpriteSets(sprites.extraAccessoriesBehind, sprites.extraAccessories)!
      .slice(0, DEVELOPMENT ? 100 : 2);
  ```

</details>

<br>

<details>
<summary><b> English</b></summary>

This document lists the hidden features, commands, and hotkeys that are only active when the server or client is run with the `--beta` option (BETA mode) or the `DEVELOPMENT` constant.

These features are highly useful for developers, modders, and map builders to debug the game, instantiate objects instantly, and monitor system performance. None of these features will be active in production builds.

---

### 1. Advanced Map Editor Tools

When `BETA` mode is active and your account is a Mod (`isMod(account)`), the map editor mode becomes significantly more advanced. You can place, delete, and move entities/objects directly using your mouse.

* **Related files:** `src/ts/client/game.ts` and `src/ts/server/api/account.ts`
* **Code snippet:**
  ```typescript
  // src/ts/server/api/account.ts (Line ~159)
  if (BETA && isMod(account)) {
      data.editor = entitiesInfo; // Gives Mods full access to entity data
  }
  ```

#### Hotkeys and Clicks:
- **Right Mouse Button**:
  - Moves selected entities to the cursor coordinate (`editorMoveEntities`).
  - Instantly deletes walls when holding the "Remove" tool (Toggle Wall).
- **Middle Mouse Button (Scroll Wheel)**:
  - Places a specific entity/object at the cursor's coordinate `(hover.x, hover.y)`.
- **Backspace Key**: Undoes the last editor action (e.g., deleting a newly placed object).
- **Drag Select**: Clicking and dragging the mouse will select multiple objects simultaneously.
- **Large Brushes**: When `editor.brushSize > 1`, you can paint tiles over a wide area simultaneously (`server.editorAction`).

---

### 2. Performance Debug & Visual Rendering Modes

BETA/DEVELOPMENT modes provide developers the freedom to inspect the "internals" of the rendering process (such as hitboxes, grids, memory usage, etc.) in real-time.

* **Related files:** `src/ts/client/game.ts` and `src/ts/client/draw.ts`

#### On-Screen Information (Overlays):
- Displays the number of rendering objects (`tris`, `flush`) and the currently playing audio track name in the bottom left corner, replacing the standard release version string.
  ```typescript
  // src/ts/client/game.ts (Line ~1815)
  const extra = DEVELOPMENT ? `(${drawn}/${total}) ${tris} tris, ${flush} flush, ${this.audio.trackName}` : version;
  ```
- If `debug.showInfo` is active, the client will stream FPS data and map heightmap coordinates on screen.

#### Alternative Render Engines:
- **LayeredTiles Engine**: Experimental feature to render tiles layer by layer.
- **Whiteness Engine**: Removes all map textures and renders the canvas completely white.
- **Hitbox/Bounds Grid Displays**:
  - Shows physical collision bounds `(ColliderMap)` (Purple color).
  - Shows bounds indicating where players can sit (Green/Blue color).
  - Shows interactive radius (`Interact Bounds`) (Red color).
  ```typescript
  // src/ts/client/draw.ts (Line ~155)
  if (BETA && options.debug.showHelpers) {
      drawOutlineRect(batch, PURPLE, getInteractBounds(player));
      drawOutlineRect(batch, 0xff000066, getSitOnBounds(player));
  }
  ```

---

### 3. Developer Chat Commands & Actions

List of commands (`/`) that are strictly available for debugging in the DEV environment or locked behind the `BETA` flag. These commands will result in an *invalid command* error on standard production servers.

* **Related files:** `src/ts/server/commands.ts` and `src/ts/components/shared/actions-modal/actions-modal.ts`

- **`/season <season>`**: (*Superadmin/BETA*) Instantly forces a season change on the map (e.g. `/season winter`).
- **`/weather rain`**: (*Superadmin/BETA*) Forces rain.
- **`/noclouds`**: (*Superadmin/BETA*) Clears and stops moving clouds on the map.
- **`/hold <item_name>`**: (*Superadmin/BETA*) Forces the pony to hold a specific map item instantly.
- **`/toy <toy_id>`**: (*Superadmin/BETA*) Forces the pony to hold a specific toy item instantly.
- **`/time <hour>`**: Fast-forwards the in-game clock. In Production, this is reserved for admins, but in DEVELOPMENT, it's open for *all* players (to test global lighting and shadows).
  ```typescript
  // src/ts/server/commands.ts (Line ~399)
  command(['time'], '/time <hour> - change server time', DEVELOPMENT ? '' : 'admin', ...);
  ```
- **`/map`**: (*DEVELOPMENT*) Prints classified information on the chat screen regarding the current map instance, including `Map ID`, RAM map memory (in kb), and total entities.
- **`/testparty`**: (*DEVELOPMENT*) Forces nearby bots and players to automatically join a party group for stress-testing the party limits.
- **Custom Object Actions (Actions Modal)**: In BETA mode, players can directly spawn and place specific entities via the Action Bar.
  ```typescript
  // src/ts/components/shared/actions-modal/actions-modal.ts (Line ~85)
  if (BETA) {
      this.entityActions = getEntityNames().map(name => entityButtonAction(name));
  }
  ```
- **`F1` Hotkey**: Activates a helpful overlay displaying a list of secret control commands.

---

### 4. Unlimited Experimental Accessories

In *Production* builds, players are strictly limited to rendering a maximum of 2 layers of *Extra Accessories*. In the `DEVELOPMENT` build, this limit is skyrocketed to 100 layers to assist artists in testing sprite overlapping and rendering edge cases.

* **Related file:** `src/ts/client/ponyUtils.ts`
* **Code snippet:**
  ```typescript
  // src/ts/client/ponyUtils.ts (Line ~157)
  export const mergedExtraAccessories = mergeSpriteSets(sprites.extraAccessoriesBehind, sprites.extraAccessories)!
      .slice(0, DEVELOPMENT ? 100 : 2);
  ```

</details>
