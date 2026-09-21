module.exports = {
  apps: [
    {
      name: 'app-backend',
      script: 'dist/main.js',
      cwd: './backend',
      interpreter: 'bun',
      env: {
        NODE_ENV: 'production',
        PATH: `${process.env.HOME}/.bun/bin:${process.env.PATH}`,
      },
      env_development: {
        NODE_ENV: 'development',
      },
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      watch: false,
      max_memory_restart: '512M',
      error_file: './backend/logs/pm2-error.log',
      out_file: './backend/logs/pm2-out.log',
    },
    {
      name: 'app-frontend',
      script: 'serve',
      cwd: './',
      env: {
        PM2_SERVE_PATH: './frontend/dist',
        PM2_SERVE_PORT: 8080,
        PM2_SERVE_SPA: 'true',
        PM2_SERVE_HOMEPAGE: '/index.html',
      },
      autorestart: false,
      watch: false,
    },
  ],
};
