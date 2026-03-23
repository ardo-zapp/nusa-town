module.exports = {
  apps: [
    {
      name: "nusatown-login",
      script: "./pony-town.js",
      args: "--login --beta",
      node_args: "--max_old_space_size=1024",
      exec_mode: "fork",
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: "1.5G",
      log_date_format: "YYYY-MM-DD HH:mm:ss Z",
      env: {
        NODE_ENV: "production"
      }
    },
    {
      name: "nusatown-admin",
      script: "./pony-town.js",
      args: "--admin --standaloneadmin",
      node_args: "--max_old_space_size=1024",
      exec_mode: "fork",
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: "1.5G",
      log_date_format: "YYYY-MM-DD HH:mm:ss Z",
      env: {
        NODE_ENV: "production"
      }
    },
    {
      name: "nusatown-main-game",
      script: "./pony-town.js",
      args: "--game main",
      node_args: "--max_old_space_size=4096",
      exec_mode: "fork",
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: "5G",
      log_date_format: "YYYY-MM-DD HH:mm:ss Z",
      env: {
        NODE_ENV: "production"
      }
    },
    {
      name: "nusatown-safe-game",
      script: "./pony-town.js",
      args: "--game safe",
      node_args: "--max_old_space_size=4096",
      exec_mode: "fork",
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: "5G",
      log_date_format: "YYYY-MM-DD HH:mm:ss Z",
      env: {
        NODE_ENV: "production"
      }
    },
    {
      name: "nusatown-dev-game",
      script: "./pony-town.js",
      args: "--game dev",
      node_args: "--max_old_space_size=1024",
      exec_mode: "fork",
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: "1.5G",
      log_date_format: "YYYY-MM-DD HH:mm:ss Z",
      env: {
        NODE_ENV: "production"
      }
    }
  ]
};
