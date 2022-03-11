const mongoose = require('mongoose');
const mongoURI = process.env.MONGO_URI;

mongoose.connect(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const videoViewSchema = new mongoose.Schema({
  discordId: { type: String, required: true, unique: false },
  index: { type: Number, required: true, unique: false },
  date: { type: Date, required: true, default: Date.now(), unique: false },
}).index({ discordId: 1, index: 1 }, { unique: true });

const VideoView = mongoose.model('VideoView', videoViewSchema);

module.exports = { VideoView };
