interface Config {
  mongodb: {
    uri: string
    options: {
      useNewUrlParser: boolean
      useUnifiedTopology: boolean
    }
  }
  server: {
    port: number
    host: string
  }
  cache: {
    defaultTTL: number
  }
  analytics: {
    updateInterval: number
  }
}

const config: Config = {
  mongodb: {
    uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/healthcare',
    options: {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    },
  },
  server: {
    port: parseInt(process.env.PORT || '3000', 10),
    host: process.env.HOST || 'localhost',
  },
  cache: {
    defaultTTL: 5 * 60 * 1000, // 5 minutes
  },
  analytics: {
    updateInterval: 5 * 60 * 1000, // 5 minutes
  },
}

export default config 