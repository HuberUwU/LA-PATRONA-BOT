const autorolschema = require('../../Schemas/autorolschema');

module.exports = {
    name: 'guildMemberAdd',
    async execute(member) {
        // 1. Verificar si el bot tiene el permiso de gestionar roles en el servidor
        if (!member.guild.members.me.permissions.has('ManageRoles')) return;

        const data = await autorolschema.findOne({ serverId: member.guild.id });
        if (!data) return;

        // 2. Filtrar IDs de roles válidos existentes
        const roleIds = [data.roleId1, data.roleId2, data.roleId3, data.roleId4, data.roleId5]
            .filter(Boolean);

        if (roleIds.length > 0) {
            try {
                // 3. Obtener sólo los roles que realmente existen en el caché y que el bot puede asignar por jerarquía
                const botHighestRole = member.guild.members.me.roles.highest;
                const rolesToAdd = roleIds.filter(roleId => {
                    const role = member.guild.roles.cache.get(roleId);
                    return role && role.position < botHighestRole.position && !role.managed;
                });

                if (rolesToAdd.length > 0) {
                    await member.roles.add(rolesToAdd);
                }
            } catch (error) {
                console.error(':x: Error al agregar roles de autorol:', error);
            }
        }
    },
};