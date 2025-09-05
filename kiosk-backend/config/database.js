module.exports = ({ env }) => {
  // Support multiple database types
  const client = env('DATABASE_CLIENT', 'sqlite');
  
  // Option 1: Use DATABASE_URL (for services like Render, Heroku, etc.)
  const databaseUrl = env('DATABASE_URL');
  if (databaseUrl) {
    const url = new URL(databaseUrl);
    
    return {
      connection: {
        client: url.protocol.includes('postgres') ? 'postgres' : client,
        connection: {
          host: url.hostname,
          port: parseInt(url.port || '5432'),
          database: url.pathname.slice(1),
          user: url.username,
          password: url.password,
          ssl: env.bool('DATABASE_SSL', true) && {
            rejectUnauthorized: env.bool('DATABASE_SSL_REJECT_UNAUTHORIZED', false)
          },
        },
        debug: env.bool('DATABASE_DEBUG', false),
      },
    };
  }
  
  // Option 2: PostgreSQL with individual environment variables
  if (client === 'postgres') {
    return {
      connection: {
        client: 'postgres',
        connection: {
          host: env('DATABASE_HOST', 'localhost'),
          port: env.int('DATABASE_PORT', 5432),
          database: env('DATABASE_NAME', 'strapi'),
          user: env('DATABASE_USERNAME', 'strapi'),
          password: env('DATABASE_PASSWORD', 'strapi'),
          ssl: env.bool('DATABASE_SSL', false) && {
            rejectUnauthorized: env.bool('DATABASE_SSL_REJECT_UNAUTHORIZED', false)
          },
        },
        debug: env.bool('DATABASE_DEBUG', false),
        pool: {
          min: env.int('DATABASE_POOL_MIN', 2),
          max: env.int('DATABASE_POOL_MAX', 10),
        },
      },
    };
  }
  
  // Option 3: SQLite for local development or lightweight deployments
  if (client === 'sqlite') {
    return {
      connection: {
        client: 'better-sqlite3',
        connection: {
          filename: env('DATABASE_FILENAME', '.tmp/data.db'),
        },
        useNullAsDefault: true,
        debug: env.bool('DATABASE_DEBUG', false),
      },
    };
  }
  
  // Option 4: MySQL/MariaDB support
  if (client === 'mysql' || client === 'mysql2') {
    return {
      connection: {
        client: client,
        connection: {
          host: env('DATABASE_HOST', 'localhost'),
          port: env.int('DATABASE_PORT', 3306),
          database: env('DATABASE_NAME', 'strapi'),
          user: env('DATABASE_USERNAME', 'strapi'),
          password: env('DATABASE_PASSWORD', 'strapi'),
          ssl: env.bool('DATABASE_SSL', false) && {
            rejectUnauthorized: env.bool('DATABASE_SSL_REJECT_UNAUTHORIZED', false)
          },
        },
        debug: env.bool('DATABASE_DEBUG', false),
        pool: {
          min: env.int('DATABASE_POOL_MIN', 2),
          max: env.int('DATABASE_POOL_MAX', 10),
        },
      },
    };
  }
  
  // Default fallback to SQLite
  return {
    connection: {
      client: 'better-sqlite3',
      connection: {
        filename: '.tmp/data.db',
      },
      useNullAsDefault: true,
    },
  };
};