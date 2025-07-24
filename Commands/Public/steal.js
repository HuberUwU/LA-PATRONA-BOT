const { SlashCommandBuilder } = require("@discordjs/builders");

const { default: axios } = require("axios");

const { EmbedBuilder, PermissionsBitField } = require("discord.js");



module.exports = {

  data: new SlashCommandBuilder()

    .setName("steal")

    .setDescription("Agrega el emoji de otro servidor al tuyo.")

    .addStringOption((option) =>

      option

        .setName("emoji")

        .setDescription("Emoji que quieres añadir al servidor")

        .setRequired(true)

    )

    .addStringOption((option) =>

      option

        .setName("name")

        .setDescription("Nombre de el emoji")

        .setRequired(true)

    ),

  async execute(interaction) {

    if (

      !interaction.member.permissions.has(

        PermissionsBitField.Flags.Administrator

      )

    )

      return await interaction.reply({

        content:

          "You must be a Administrator and your role must have the **Administrator** permission to perform this action.",

        ephemeral: true,

      });



    let emoji = interaction.options.getString("emoji")?.trim();

    const name = interaction.options.getString("name");



    if (emoji.startsWith("<") && emoji.endsWith(">")) {

      const id = emoji.match(/\d{15,}/g)[0];



      const type = await axios

        .get(`https://cdn.discordapp.com/emojis/${id}.gif`)

        .then((image) => {

          if (image) return "gif";

          else return "png";

        })

        .catch((err) => {

          return "png";

        });



      emoji = `https://cdn.discordapp.com/emojis/${id}.${type}?quality=lossless`;

    }



    if (!emoji.startsWith("http")) {

      return await interaction.reply({

        content: "No puedes añadie emojis por defecto de discord!",

        ephemeral: true,

      });

    }



    if (!emoji.startsWith("https")) {

      return await interaction.reply({

        content: "No puedes añadir emojis por defecto de discord!",

        ephemeral: true,

      });

    }



    interaction.guild.emojis

      .create({ attachment: `${emoji}`, name: `${name}` })

      .then((emoji) => {

        const embed = new EmbedBuilder()

          .setColor("Blue")

          .setDescription(`Emoji agregado: ${emoji}, con el nombre: ${name}`);



        return interaction.reply({ embeds: [embed] });

      })

      .catch((err) => {

        interaction.reply({

          content:

            "No puedes agregar este emoji debido a que alcanzaste el limite de emojis en este servidor",

          ephemeral: true,

        });

      });

  },

};

