import env from '#start/env'
import { defineConfig } from '@adonisjs/lucid'

const dbConfig = defineConfig({
  connection: 'postgres',
  connections: {
    postgres: {
      client: 'pg',
      connection: {
        host: env.get('DB_HOST'),
        port: env.get('DB_PORT'),
        user: env.get('DB_USER'),
        password: env.get('DB_PASSWORD'),
        database: env.get('DB_DATABASE'),
        ssl: env.get('DB_SSL') ? { 
          rejectUnauthorized: false 
        } : undefined,
      },
       pool: {
        min: 0,
        max: 3, // Render free tier limite à 5 connexions
        acquireTimeoutMillis: 120000, // 2 minutes
        createTimeoutMillis: 120000,
        idleTimeoutMillis: 30000
      },
      migrations: {
        naturalSort: true,
        paths: ['database/migrations'],
      },
      debug: env.get('NODE_ENV') === 'development',

    },
  },
})

export default dbConfig