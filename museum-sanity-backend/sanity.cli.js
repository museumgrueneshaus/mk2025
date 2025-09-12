import {defineCliConfig} from 'sanity/cli'

const projectId = process.env.SANITY_STUDIO_PROJECT_ID || '832k5je1'
const dataset = process.env.SANITY_STUDIO_DATASET || 'production'

export default defineCliConfig({
  api: {
    projectId,
    dataset,
  },
  // Avoid interactive hostname prompt on future deploys
  studioHost: process.env.SANITY_STUDIO_HOST || 'museumghbackend',
})
