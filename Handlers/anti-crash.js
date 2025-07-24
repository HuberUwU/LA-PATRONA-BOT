const { EmbedBuilder, WebhookClient } = require("discord.js");
const { inspect } = require("util");

module.exports = (client) => {
  const embed = new EmbedBuilder().setColor("Red");

  client.on("error", (err) => {
    console.log(err);
  });

  process.on("unhandledRejection", (reason, promise) => {
    console.log(reason, "\n", promise);
  });

  process.on("uncaughtException", (err, origin) => {
    console.log(err, "\n", origin);

  });

  process.on("uncaughtExceptionMonitor", (err, origin) => {
    console.log(err, "\n", origin);

  });

  process.on("warning", (warn) => {
    console.log(warn);

  });
};