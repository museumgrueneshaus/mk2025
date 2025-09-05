import { factories } from '@strapi/strapi';

export default factories.createCoreController('api::kiosk.kiosk', ({ strapi }) => ({
  async find(ctx) {
    ctx.query = { ...ctx.query, populate: 'deep' };
    return super.find(ctx);
  },
  
  async findOne(ctx) {
    ctx.query = { ...ctx.query, populate: 'deep' };
    return super.findOne(ctx);
  }
}));