import type { Core } from '@strapi/strapi';

export default {
  /**
   * An asynchronous register function that runs before
   * your application is initialized.
   *
   * This gives you an opportunity to extend code.
   */
  register(/* { strapi }: { strapi: Core.Strapi } */) {},

  /**
   * An asynchronous bootstrap function that runs before
   * your application gets started.
   *
   * This gives you an opportunity to set up your data model,
   * run jobs, or perform some special logic.
   */
  async bootstrap({ strapi }: { strapi: Core.Strapi }) {
    // Configure Public Role for API Access
    const publicRole = await strapi
      .query('plugin::users-permissions.role')
      .findOne({ where: { type: 'public' } });

    if (publicRole) {
      // Define all permissions that should be enabled for public access
      const permissions = [
        // Exponat permissions (CRUD)
        { action: 'api::exponat.exponat.find' },
        { action: 'api::exponat.exponat.findOne' },
        { action: 'api::exponat.exponat.create' },
        { action: 'api::exponat.exponat.update' },
        { action: 'api::exponat.exponat.delete' },
        // Playlist permissions (CRUD)
        { action: 'api::playlist.playlist.find' },
        { action: 'api::playlist.playlist.findOne' },
        { action: 'api::playlist.playlist.create' },
        { action: 'api::playlist.playlist.update' },
        { action: 'api::playlist.playlist.delete' },
        // Kiosk permissions (read-only)
        { action: 'api::kiosk.kiosk.find' },
        { action: 'api::kiosk.kiosk.findOne' },
        // Konfiguration permissions (if it exists)
        { action: 'api::konfiguration.konfiguration.find' },
        // Mediathek permissions (CRUD)
        { action: 'api::mediathek.mediathek.find' },
        { action: 'api::mediathek.mediathek.findOne' },
        { action: 'api::mediathek.mediathek.create' },
        { action: 'api::mediathek.mediathek.update' },
        { action: 'api::mediathek.mediathek.delete' },
      ];

      for (const perm of permissions) {
        try {
          // Check if permission already exists
          const existingPermission = await strapi
            .query('plugin::users-permissions.permission')
            .findOne({
              where: {
                action: perm.action,
                role: publicRole.id,
              },
            });

          if (existingPermission) {
            // Enable the permission if it exists but is disabled
            if (!existingPermission.enabled) {
              await strapi.query('plugin::users-permissions.permission').update({
                where: { id: existingPermission.id },
                data: { enabled: true },
              });
              console.log(`✅ Enabled permission: ${perm.action}`);
            }
          } else {
            // Create the permission if it doesn't exist
            await strapi.query('plugin::users-permissions.permission').create({
              data: {
                action: perm.action,
                role: publicRole.id,
                enabled: true,
              },
            });
            console.log(`✅ Created permission: ${perm.action}`);
          }
        } catch (error) {
          console.log(`⚠️ Skipping permission ${perm.action}: ${error.message}`);
        }
      }
      console.log('✓ API permissions configured for public access');
    }
  },
};
