const { ChatInputCommandInteraction, EmbedBuilder } = require("discord.js");

module.exports = {
  name: "interactionCreate",
  /**
   *
   * @param {ChatInputCommandInteraction} interaction
   */
  async execute(interaction, client) {
    if (interaction.isChatInputCommand()) {

      const command = client.commands.get(interaction.commandName);
      if (!command)
        return interaction.reply({
          content: "This command is outdated.",
          flags: ['Ephemeral'],
        });

      const cooldowns = command.Cooldown;

      if (command.developer && interaction.user.id !== (client.config.developerId || "457686961151410176"))
        return interaction.reply({
          content: "Comando solo disponible para el desarrollador.",
          flags: ['Ephemeral'],
        });

      if (command.Cooldown) {
        const { Collection } = require("discord.js");
        if (!client.cooldowns) {
          client.cooldowns = new Collection();
        }

        if (!client.cooldowns.has(command.data.name)) {
          client.cooldowns.set(command.data.name, new Collection());
        }

        const now = Date.now();
        const timestamps = client.cooldowns.get(command.data.name);
        const cooldownAmount = command.Cooldown;

        if (timestamps.has(interaction.user.id)) {
          const expirationTime = timestamps.get(interaction.user.id) + cooldownAmount;

          if (now < expirationTime) {
            const timeLeft = (expirationTime - now) / 1000;
            const embed = new EmbedBuilder()
              .setDescription(`Este comando tiene un tiempo de espera. Tienes que esperar **${timeLeft.toFixed(1)}** segundos antes de usarlo de nuevo.`)
              .setColor("Red");

            return interaction.reply({ embeds: [embed], flags: ['Ephemeral'] });
          }
        }

        timestamps.set(interaction.user.id, now);
        setTimeout(() => timestamps.delete(interaction.user.id), cooldownAmount);
      }

      command.execute(interaction, client);
    } else if (interaction.isAutocomplete()) {
      const command = client.commands.get(interaction.commandName);
      if (!command) return;

      try {
        await command.autocomplete(interaction, client);
      } catch (error) {
        console.error("Error en autocompletado:", error);
      }
    } else if (interaction.isButton()) {
      const { customId } = interaction;

      // Soporte para botones del reproductor de música
      if (customId.startsWith("music_")) {
        const queue = client.distube.getQueue(interaction.guild.id);
        if (!queue) return interaction.reply({ content: "⚠️ No hay música reproduciéndose en este servidor.", flags: ['Ephemeral'] });

        try {
          if (customId === "music_pause") {
            if (queue.paused) {
              queue.resume();
              await interaction.reply({ content: "▶️ Música reanudada.", flags: ['Ephemeral'] });
            } else {
              queue.pause();
              await interaction.reply({ content: "⏸️ Música pausada.", flags: ['Ephemeral'] });
            }
          } else if (customId === "music_skip") {
            if (queue.songs.length <= 1) {
              await queue.stop();
              await interaction.reply({ content: "⏹️ Cola finalizada. Saliendo del canal.", flags: ['Ephemeral'] });
            } else {
              await queue.skip();
              await interaction.reply({ content: "⏭️ Canción saltada.", flags: ['Ephemeral'] });
            }
          } else if (customId === "music_stop") {
            await queue.stop();
            await interaction.reply({ content: "⏹️ Reproducción detenida y cola limpiada.", flags: ['Ephemeral'] });
          } else if (customId === "music_loop") {
            const newMode = queue.repeatMode === 0 ? 1 : (queue.repeatMode === 1 ? 2 : 0);
            queue.setRepeatMode(newMode);
            const modes = ["Desactivado", "Repetir Canción", "Repetir Cola"];
            await interaction.reply({ content: `🔁 Modo de bucle cambiado a: **${modes[newMode]}**`, flags: ['Ephemeral'] });
          } else if (customId === "music_volume") {
            const { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require("discord.js");
            const modal = new ModalBuilder()
              .setCustomId("music_volume_modal")
              .setTitle("Ajustar Volumen");

            const volumeInput = new TextInputBuilder()
              .setCustomId("volume_input")
              .setLabel("Nuevo volumen (0 a 100)")
              .setStyle(TextInputStyle.Short)
              .setPlaceholder("Ej: 50")
              .setMinLength(1)
              .setMaxLength(3)
              .setRequired(true);

            const actionRow = new ActionRowBuilder().addComponents(volumeInput);
            modal.addComponents(actionRow);

            await interaction.showModal(modal);
          }
        } catch (err) {
          console.error(err);
          await interaction.reply({ content: `❌ Ocurrió un error al presionar el botón: ${err.message}`, flags: ['Ephemeral'] }).catch(() => {});
        }
        return;
      }

      const { buttons } = client;
      const button = buttons.get(customId);
      if (!button) return;

      try {
        await button.execute(interaction, client);
      } catch (err) {
        console.error(err);
      }
    } else if (interaction.isModalSubmit()) {
      const { customId } = interaction;
      if (customId === "music_volume_modal") {
        const queue = client.distube.getQueue(interaction.guild.id);
        if (!queue) return interaction.reply({ content: "⚠️ No hay música reproduciéndose en este servidor.", flags: ['Ephemeral'] });

        const volume = parseInt(interaction.fields.getTextInputValue("volume_input"));
        if (isNaN(volume) || volume < 0 || volume > 100) {
          return interaction.reply({ content: "⚠️ Por favor, introduce un número válido entre 0 y 100.", flags: ['Ephemeral'] });
        }

        queue.setVolume(volume);
        await interaction.reply({ content: `🔊 Volumen ajustado al **${volume}%**`, flags: ['Ephemeral'] });
      }
    } else {
      return;
    }
  },
};