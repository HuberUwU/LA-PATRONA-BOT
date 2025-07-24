const { Activity, ActivityType } = require("discord.js");
const { loadCommands } = require("../../Handlers/commandHandler");
const config = require("../../config.json");
const mongoose = require("mongoose");

module.exports = {
  name: "ready",
  once: true,
 async execute(client) {
    console.log("El cliente ya esta listo");

   await mongoose.connect(config.mongopass, {

   });

   if (mongoose.connect) {
     console.log("Conectado a la base de datos");
   }

    

    loadCommands(client);
  },
};
