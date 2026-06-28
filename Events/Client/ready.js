const { Activity, ActivityType, Events } = require("discord.js");
const { loadCommands } = require("../../Handlers/commandHandler");
const config = require("../../config.json");
const mongoose = require("mongoose");

module.exports = {
  name: Events.ClientReady,
  once: true,
  async execute(client) {
    console.log("El cliente ya esta listo");

    try {
      await mongoose.connect(config.mongopass);
      console.log("Conectado a la base de datos");
    } catch (error) {
      console.error("❌ Error al conectar a la base de datos:", error.message);
      console.log("⚠️ El bot continuará iniciándose, pero las funciones que requieren base de datos (AFK, autorol) no funcionarán.");
    }

    loadCommands(client);
  },
};
