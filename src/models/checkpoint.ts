import mongoose from "mongoose";
const Schema = mongoose.Schema;

const s = new Schema({
  "id": {
    $type: Number,
    required: true,
    unique: true,
  },
  "name": String,
  "description": String,
  // "type": String, // Checkpoint
  "stats": {
    downloadCount: Number,
    favoriteCount: Number,
    thumbsUpCount: Number,
    thumbsDownCount: Number,
    commentCount: Number,
    ratingCount: Number,
    rating: Number,
    tippedAmountCount: Number,
  },
  "creator": {
    "username": {
      $type: String,
      required: true,
    },
  },
  "tags": [String],
  "modelVersions": [{
    "id": {
      $type: Number,
      required: true,
    },
    "index": Number,
    "name": String,
    "baseModel": String,
    "baseModelType": String,
    "publishedAt": Date,
    "updatedAt": Date,
    "createdAt": Date,
    "description": String,
    "trainedWords": [String],
    "stats": {
      "downloadCount": Number,
      "ratingCount": Number,
      "rating": Number,
      "thumbsUpCount": Number,
      "thumbsDownCount": Number
    },
    "files": [
      {
        "id": Number,
        "sizeKB": Number,
        "name": String,
        "type": String, // "Model"
        "metadata": {
          "format": String,
          "size": String,
          "fp": String,
        },
        "hashes": {
          "AutoV1": String,
          "AutoV2": String,
          "AutoV3": String,
          "SHA256": String,
          "CRC32": String,
          "BLAKE3": String,
        },
        "downloadUrl": String,
      }
    ],
  }],
  createdAt: {
    $type: Date,
    default: Date.now,
    required: true,
  },
  updatedAt: {
    $type: Date,
    default: Date.now,
    required: true,
  },
}, {
  typeKey: "$type",
});

// s.pre("save", async function(next) {
//   next();
// });

export default mongoose.model('Checkpoint', s);