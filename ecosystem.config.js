module.exports = {
  apps: [
    {
      name: "hr-portal",
      script: "node_modules/.bin/next",
      args: "start",
      cwd: "/var/www/hr-portal",
      instances: 2,
      exec_mode: "cluster",
      watch: false,
      max_memory_restart: "512M",
      env: {
        NODE_ENV: "production",
        PORT: 3000,
      },
      error_file: "/var/log/pm2/hr-portal-error.log",
      out_file: "/var/log/pm2/hr-portal-out.log",
      log_date_format: "YYYY-MM-DD HH:mm:ss",
      restart_delay: 3000,
      max_restarts: 10,
      min_uptime: "10s",
    },
  ],
}
