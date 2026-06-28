async function loadEvents(client) {
  const { loadFiles } = require("../Functions/fileLoader");
  const ascii = require("ascii-table");
  const table = new ascii().setHeading("Events", "Status");

  if (client.events.size > 0) {
    for (const [file, eventData] of client.events) {
      eventData.emitter.removeListener(eventData.name, eventData.execute);
    }
    client.events.clear();
  }

  const Files = await loadFiles("Events");

  Files.forEach((file) => {
    const event = require(file);

    const execute = (...args) => event.execute(...args, client);
    const emitter = event.rest ? client.rest : client;

    if (event.once) emitter.once(event.name, execute);
    else emitter.on(event.name, execute);

    client.events.set(file, { name: event.name, execute, emitter });

    table.addRow(event.name, "🟩");
  });

  return console.log(table.toString(), "\nLoaded Events.");
}

module.exports = { loadEvents };