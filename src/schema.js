const mongoose = require('mongoose');
const mongoURI = process.env.MONGO_URI;

mongoose.connect(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const hikaruUserSchema = new mongoose.Schema({
  discordId: { type: String, required: true },
  watched: { type: [Number], default: [] },
  total: { type: Number, default: 0 },
}).post('save', async (doc) => {
  if (doc.total !== doc.watched.length) {
    /**
     * Update Monthly watch count
     */
    const date = new Date();
    const month = 12 * date.getFullYear() + date.getMonth() + 1;
    let monthlyViews = await MonthlyViews.findOne({
      discordId: doc.discordId,
      month,
    });
    if (!monthlyViews) {
      monthlyViews = await MonthlyViews.create({
        discordId: doc.discordId,
        month,
      });
    }
    monthlyViews.watched += doc.watched.length - doc.total;
    console.log('monthly views', monthlyViews);
    monthlyViews.save();

    /**
     * Update total
     */
    doc.total = doc.watched.length;
    console.log(doc.total);
    doc.save();
  }
});

const monthlyViewsSchema = new mongoose.Schema({
  discordId: { type: String },
  // we use integer values for the month, starting from January 1AD
  // for example march 2022 = (12 * 2022 + 3)
  month: { type: Number },
  watched: { type: Number, default: 0 },
});

const HikaruUser = mongoose.model('HikaruUser', hikaruUserSchema);
const MonthlyViews = mongoose.model('MonthlyViews', monthlyViewsSchema);

module.exports = { HikaruUser, MonthlyViews };
