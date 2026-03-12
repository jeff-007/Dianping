module.exports = {
  apps: [
    {
      name: "dianping-server",
      cwd: "./server",
      script: "index.js",
      instances: "max",
      exec_mode: "cluster",
      autorestart: true,
      watch: false,
      max_memory_restart: "1G",
      env_file: "./server/.env",
      env: {
        NODE_ENV: "production"
      }
    }
  ]
};
