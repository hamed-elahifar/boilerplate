module.exports = {
  apps: [
    {
      // One process: the API under /api and the built frontend (frontend/dist) on the same port
      name: 'boilerplate',
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
  ],
};
