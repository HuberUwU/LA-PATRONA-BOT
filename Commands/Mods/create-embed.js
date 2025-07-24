const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');







module.exports = {

    data: new SlashCommandBuilder()

        .setName('create-embed')

        .setDescription('Creare un embed en el canal que utilices este comando.')

        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)

        .addStringOption(option =>

            option.setName('title')

                .setDescription('*Titulo de el embed.')

                .setRequired(true)

        )

        .addStringOption(option =>

            option.setName('description')

                .setDescription('*Descripción de el embed.')

                .setRequired(true)

        )

        .addStringOption(option =>

            option.setName('color')

                .setDescription('*Elige un color.')

                .setRequired(true)

                .setMaxLength(6)

 
.setChoices(

          { name: "Morado", value: "8A2BE2" },

          { name: "Verde", value: "52A666" },

          { name: "Rojo", value: "FF0000" },

          { name: "Yellow", value: "FFF68F" },

          { name: "Azul", value: "6495ED" },
          { name: "Orange", value: "FF8D00" },
         { name: "Negro", value: "000001" }

        )                     
        )

        .addStringOption(option =>

            option.setName('image')

                .setDescription('Pega una url de una imagen. (Se mostrara en la parte de abajo del embed)')

                .setRequired(false)

        )

        .addStringOption(option =>

            option.setName('thumbnail')

                .setDescription('Pega una url de una imagen. (Se mostrara en pequeño en la parte superior derecha del embed)')

                .setRequired(false)

        ),

        

     async execute(interaction) {

        const { options } = interaction;



        const title = options.getString('title');

        const description = options.getString('description');

        const color = options.getString('color');

        const image = options.getString('image');

        const thumbnail = options.getString('thumbnail');

        const fieldn = options.getString('field-name') || "** **";

        const fieldv = options.getString('field-value') || " ";

        const file = options.getAttachment('file')



        const embed = new EmbedBuilder()

            .setTitle(title)

            .setDescription(description)

            .setColor(`#${color}`)

            .setImage(image)

            .setThumbnail(thumbnail)

            .setTimestamp()



.setFooter({ text: interaction.member.user.tag, iconURL: interaction.member.displayAvatarURL({ dynamic: true }) })

     

              interaction.channel.send({ embeds: [embed]});

        await interaction.reply({content: `Embed enviado en este canal correctamente 
`,
 ephemeral: true,       });


    },

};