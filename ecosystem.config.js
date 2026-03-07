
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
      env: {
        NODE_ENV: "production",
        PORT: 5000,
        MONGO_URI: "mongodb://127.0.0.1:27017/dianping",
        JWT_SECRET: "your_jwt_secret_change_this_in_production"
      },
    },
  ],
};
