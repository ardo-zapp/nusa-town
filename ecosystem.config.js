/**
 * Nusa Town - PM2 Ecosystem Configuration
 */

module.exports = {
  apps : [
    {
      name   : "Nusa Town - Login",
      script : "./pony-town.js",
      args   : "--login",
      node_args: "--max_old_space_size=8192",
      exec_mode: "fork"
    },
    {
      name   : "Nusa Town - Admin",
      script : "./pony-town.js",
      args   : "--admin --standaloneadmin",
      node_args: "--max_old_space_size=8192",
      exec_mode: "fork"
    },
    {
      name   : "Nusa Town - Main Game",
      script : "./pony-town.js",
      args   : "--game main",
      node_args: "--max_old_space_size=8192",
      exec_mode: "fork"
    },
    {
      name   : "Nusa Town - Safe Game",
      script : "./pony-town.js",
      args   : "--game safe",
      node_args: "--max_old_space_size=8192",
      exec_mode: "fork"
    }
  ]
};
