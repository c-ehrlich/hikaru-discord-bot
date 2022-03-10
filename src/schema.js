const mongoose = require('mongoose');
const mongoURI = process.env.MONGO_URI;

mongoose.connect(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
const hikaruUserSchema = new mongoose.Schema({
  discordId: { type: String, required: true },
  watched: { type: [Number] },
});
const HikaruUser = mongoose.model('HikaruUser', hikaruUserSchema);

module.exports = { HikaruUser };
