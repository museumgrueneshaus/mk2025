module.exports = async () => {
  // Set permissions for public access to the API
  const publicRole = await strapi
    .query("plugin::users-permissions.role")
    .findOne({ where: { type: "public" } });

  if (publicRole) {
    const permissions = await strapi
      .query("plugin::users-permissions.permission")
      .findMany({ where: { role: publicRole.id } });

    // Enable all CRUD operations for exponat
    const exponatPermissions = [
      "api::exponat.exponat.find",
      "api::exponat.exponat.findOne",
      "api::exponat.exponat.create",
      "api::exponat.exponat.update",
      "api::exponat.exponat.delete"
    ];

    // Enable all CRUD operations for playlist
    const playlistPermissions = [
      "api::playlist.playlist.find",
      "api::playlist.playlist.findOne",
      "api::playlist.playlist.create",
      "api::playlist.playlist.update",
      "api::playlist.playlist.delete"
    ];

    // Enable all CRUD operations for kiosk
    const kioskPermissions = [
      "api::kiosk.kiosk.find",
      "api::kiosk.kiosk.findOne",
      "api::kiosk.kiosk.create",
      "api::kiosk.kiosk.update",
      "api::kiosk.kiosk.delete"
    ];

    const allPermissions = [...exponatPermissions, ...playlistPermissions, ...kioskPermissions];

    for (const action of allPermissions) {
      const permission = permissions.find((p) => p.action === action);
      if (permission && !permission.enabled) {
        await strapi
          .query("plugin::users-permissions.permission")
          .update({
            where: { id: permission.id },
            data: { enabled: true },
          });
      }
    }

    console.log("✓ API permissions configured for public access");
  }
};