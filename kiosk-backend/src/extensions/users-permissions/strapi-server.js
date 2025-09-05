module.exports = (plugin) => {
  // Set default permissions for public role
  plugin.bootstrap = async () => {
    const publicRole = await strapi
      .query("plugin::users-permissions.role")
      .findOne({ where: { type: "public" } });

    if (publicRole) {
      // Grant read permissions for Exponat
      await strapi
        .query("plugin::users-permissions.permission")
        .updateMany({
          where: {
            role: publicRole.id,
            controller: "exponat",
            action: { $in: ["find", "findOne"] },
          },
          data: {
            enabled: true,
          },
        });

      // Grant read permissions for Kiosk
      await strapi
        .query("plugin::users-permissions.permission")
        .updateMany({
          where: {
            role: publicRole.id,
            controller: "kiosk",
            action: { $in: ["find", "findOne"] },
          },
          data: {
            enabled: true,
          },
        });

      // Grant read permissions for Konfiguration
      await strapi
        .query("plugin::users-permissions.permission")
        .updateMany({
          where: {
            role: publicRole.id,
            controller: "konfiguration",
            action: { $in: ["find"] },
          },
          data: {
            enabled: true,
          },
        });
    }
  };

  return plugin;
};