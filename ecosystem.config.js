module.exports = {
  apps: [
    {
      name: 'expense-backend',
      script: 'server.js',
      cwd: './backend',
      env: {
        NODE_ENV: 'production',
        PORT: 5001
      },
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      error_file: './logs/err.log',
      out_file: './logs/out.log',
      log_file: './logs/combined.log',
      time: true,
      env_production: {
        NODE_ENV: 'production',
        PORT: 5001
      }
    },
    {
      name: 'expense-frontend',
      script: 'npx',
      args: 'serve -s build -l 3002',
      cwd: './frontend',
      env: {
        NODE_ENV: 'production',
        PORT: 3002
      },
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G'
    }
  ]
}; 