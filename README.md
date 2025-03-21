# civitai-model-json

## Files

- dist/latest.json

```js
{
  "modelCount": 10105,
  "versionCount": 22115,
  "itemCount": 22049,
  "updatedAt": 1742586672963
}
```

- dist/checkpoints.json

```js
{
  modelId: 112902,
  modelName: 'DreamShaper XL',
  versionId: 251662,
  versionName: 'Turbo DPM++ SDE',
  updatedAt: 1701815535105,
  files: [ 'dreamshaperXL_turboDPMSDE.safetensors' ],
  hashes: [
    '676F0D60C8E860146D5E8A0D802599CADD04E7CADF85C283F189F41F01C9E359'
  ],
  metas: [
    {
      id: 6406776,
      size: '1216x768',
      pp: 'cinematic film still, close up, photo of a cute winged dragon Pokémon, in the style of hyper-realistic fantasy,, sony fe 12-24mm f/2.8 gm, close up, 32k uhd, light navy and light amber, kushan empirem, amazing quality, wallpaper, analog film grain <lora:aesthetic_anime_v1s:0.8> <lora:AnalogRedmondV2-Analog-AnalogRedmAF:0.8> <lora:add-detail-xl:1.1>',
      np: 'Pikachu, (low quality, worst quality:1.4), cgi,  text, signature, watermark, extra limbs, ((nipples))',
      seed: 3333380574,
      steps: 8,
      sampler: 'DPM++ SDE Karras',
      denoise: '0.52',
      cfg: 2
    },
    ...
  ],
  workflows: [
    '{"prompt":{"4":{"inputs":{"text":"plastic smooth deformed","clip":{"inputs":{"lora_name":"xl\\\\dev\\\\fantasy_rpg_portrait_00001.safetensors","strength_model":1,"strength_clip":1,"model":{"inputs":{"lora_name":"xl\\\\dev\\\\cyberpunk_neon_00003_ex.safetensors","strength_model":1,"strength_clip":1,"model":{"inputs":{"ckpt_name":"merges\\\\mergymerge_turbo_v1_safer.safetensors"},"class_type":"CheckpointLoaderSimple"},"clip":{"inputs":{"ckpt_name":"merges\\\\mergymerge_turbo_v1_safer.safetensors"},"class_type":"CheckpointLoaderSimple"}},"class_type":"LoraLoader"},"clip":{"inputs":{"lora_name":"xl\\\\dev\\\\cyberpunk_neon_00003_ex.safetensors","strength_model":1,"strength_clip":1,"model":{"inputs":{"ckpt_name":"merges\\\\mergymerge_turbo_v1_safer.safetensors"},"class_type":"CheckpointLoaderSimple"},"clip":{"inputs":{"ckpt_name":"merges\\\\mergymerge_turbo_v1_safer.safetensors"},"class_type":"CheckpointLoaderSimple"}},"class_type":"LoraLoader"}},"class_type":"LoraLoader"}},"class_type":"CLIPTextEncode"},"5":{"inputs":{"seed":521067735078931,"steps":10,"cfg":2,"sampler_name":"dpmpp_sde","scheduler":"karras","denoise":1,"model":{"inputs":{"lora_name":"xl\\\\dev\\\\fantasy_rpg_portrait_00001.safetensors","strength_model":1,"strength_clip":1,"model":{"inputs":{"lora_name":"xl\\...',
    ...
  ]
}
```

## References

- [Civitai API](https://developer.civitai.com/docs/category/api)