export default {
  datasources: {
    db: {
      provider: 'sqlite',
      url: process.env.DATABASE_URL ?? 'file:./dev.db',
    },
  },
};
