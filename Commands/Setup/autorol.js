const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const autorolschema = require('../../Schemas/autorolschema');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('autorol')
        .setDescription('Configura o elimina el sistema de autorol en tu servidor.')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addSubcommand(subcommand =>
            subcommand
                .setName('setup')
                .setDescription('Configura el sistema de autorol en tu servidor.')
                .addRoleOption(option => option.setName('role1').setDescription('Menciona el primer rol que quieres agregar.').setRequired(true))
                .addRoleOption(option => option.setName('role2').setDescription('Menciona el segundo rol que quieres agregar.').setRequired(false))
                .addRoleOption(option => option.setName('role3').setDescription('Menciona el tercer rol que quieres agregar.').setRequired(false))
                .addRoleOption(option => option.setName('role4').setDescription('Menciona el cuarto rol que quieres agregar.').setRequired(false))
                .addRoleOption(option => option.setName('role5').setDescription('Menciona el quinto rol que quieres agregar.').setRequired(false))
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('delete')
                .setDescription('Elimina el sistema de autorol configurado en el servidor.')
        ),

    async execute(interaction) {
        const sub = interaction.options.getSubcommand();

        // 1. Validar que el bot tenga permisos de Gestionar Roles
        if (!interaction.guild.members.me.permissions.has(PermissionFlagsBits.ManageRoles)) {
            const embed = new EmbedBuilder()
                .setDescription('⚠️ **El bot no tiene los permisos necesarios (Gestionar Roles) en este servidor.**')
                .setColor('Red');
            return await interaction.reply({ embeds: [embed], flags: ['Ephemeral'] });
        }

        if (sub === 'setup') {
            return await executeSetup(interaction);
        } else if (sub === 'delete') {
            return await executeDelete(interaction);
        }
    },
};

async function executeSetup(interaction) {
    const role1 = interaction.options.getRole('role1');
    const role2 = interaction.options.getRole('role2');
    const role3 = interaction.options.getRole('role3');
    const role4 = interaction.options.getRole('role4');
    const role5 = interaction.options.getRole('role5');

    const selectedRoles = [role1, role2, role3, role4, role5].filter(Boolean);
    const botHighestRole = interaction.guild.members.me.roles.highest;

    // 2. Validar jerarquía y tipo de roles elegidos
    for (const role of selectedRoles) {
        if (role.position >= botHighestRole.position) {
            const embed = new EmbedBuilder()
                .setDescription(`⚠️ **No puedo asignar el rol ${role} porque está en una posición superior o igual a mi rol más alto.**\nPor favor, mueve mi rol de bot hacia arriba en los ajustes del servidor y vuelve a intentarlo.`)
                .setColor('Orange');
            return await interaction.reply({ embeds: [embed], flags: ['Ephemeral'] });
        }
        if (role.managed) {
            const embed = new EmbedBuilder()
                .setDescription(`⚠️ **El rol ${role} es un rol gestionado automáticamente por otra integración o bot y no puede ser asignado.**`)
                .setColor('Orange');
            return await interaction.reply({ embeds: [embed], flags: ['Ephemeral'] });
        }
        if (role.id === interaction.guild.id) {
            const embed = new EmbedBuilder()
                .setDescription(`⚠️ **No puedes seleccionar el rol @everyone.**`)
                .setColor('Orange');
            return await interaction.reply({ embeds: [embed], flags: ['Ephemeral'] });
        }
    }

    const data = await autorolschema.findOne({ serverId: interaction.guild.id });

    if (data) {
        const embed = new EmbedBuilder()
            .setDescription(':x: El sistema de autorol ya fue configurado anteriormente...\nElimina primero el sistema de autorol con `/autorol delete` y vuelve a configurarlo.')
            .setColor('Red');

        return await interaction.reply({ embeds: [embed], flags: ['Ephemeral'] });
    } else {
        const setupData = {
            serverId: interaction.guild.id,
            roleId1: role1.id,
            roleId2: role2 ? role2.id : null,
            roleId3: role3 ? role3.id : null,
            roleId4: role4 ? role4.id : null,
            roleId5: role5 ? role5.id : null,
        };

        await autorolschema.create(setupData);

        const rolesList = selectedRoles.map(role => `${role}`).join(', ');

        const embed = new EmbedBuilder()
            .setTitle('✅ Autorol Configurado')
            .setDescription(`El sistema de autorol ha sido configurado exitosamente para los nuevos miembros.\n\n**• Roles configurados:** ${rolesList}`)
            .setColor('Green')
            .setTimestamp();

        return await interaction.reply({ embeds: [embed], flags: ['Ephemeral'] });
    }
}

async function executeDelete(interaction) {
    const data = await autorolschema.findOne({ serverId: interaction.guild.id });

    if (!data) {
        const embed = new EmbedBuilder()
            .setDescription(':x: El sistema de autorol no está configurado en este servidor.')
            .setColor('Red');

        return await interaction.reply({ embeds: [embed], flags: ['Ephemeral'] });
    } else {
        await autorolschema.deleteOne({ serverId: interaction.guild.id });

        const embed = new EmbedBuilder()
            .setDescription('✅ Sistema de autorol eliminado exitosamente!')
            .setColor('Green');

        return await interaction.reply({ embeds: [embed], flags: ['Ephemeral'] });
    }
}