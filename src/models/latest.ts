import mongoose from "mongoose";
const Schema = mongoose.Schema;

const s = new Schema({
  url: String,
}, {
  typeKey: "$type",
  capped: {
    size: 1024,
    max: 1
  }
});

// s.pre("save", async function(next) {
//   next();
// });

export default mongoose.model('Latest', s);