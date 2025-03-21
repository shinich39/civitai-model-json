import mongoose from "mongoose";
const Schema = mongoose.Schema;

const s = new Schema({
  "modelId": {
    $type: Number,
    required: true,
    index: true,
  },
  "versionId": {
    $type: Number,
    required: true,
    index: true,
  },
  "id": {
    $type: Number,
    required: true,
    unique: true,
  },
  "url": String,
  "hash": String,
  "width": Number,
  "height": Number,
  "createdAt": Date,
  "postId": Number,
  "stats": {
    "cryCount": Number,
    "laughCount": Number,
    "likeCount": Number,
    "dislikeCount": Number,
    "heartCount": Number,
    "commentCount": Number,
  },
  "meta": Schema.Types.Mixed,
  //   "VAE": String,
  //   "Size": String, // "768x1024"
  //   "seed": Number,
  //   "Model": String,
  //   "steps": Number,
  //   "hashes": {
  //     "vae": String,
  //     "model": String,
  //   },
  //   "prompt": String,
  //   "Version": String,
  //   "sampler": String,
  //   "cfgScale": Number,
  //   "resources": [
  //     {
  //       "hash": String,
  //       "name": String,
  //       "type": String,
  //     }
  //   ],
  //   "Model hash": String,
  //   "Hires steps": String,
  //   "Hires upscale": String,
  //   "Hires upscaler": String,
  //   "negativePrompt": String,
  //   "Denoising strength": String,
  // },
}, {
  typeKey: "$type",
});

// s.pre("save", async function(next) {
//   next();
// });

export default mongoose.model('Image', s);