const { model, Schema } = require("mongoose");

let ticketSchema = new Schema({
    Guild: String,
    StaffRole: String,
});

module.exports = model("ticketSchema", ticketSchema);
