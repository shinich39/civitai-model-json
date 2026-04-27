# civitai-model-json

Collect civitai checkpoint metadata from uploaded sample images.

## Files

- data/latest.json

```js
{
  "modelCount": 10105,
  "versionCount": 22115,
  "itemCount": 22049,
  "updatedAt": 1742586672963
}
```

- data/checkpoints.json

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

- data/most-used-words.csv

```csv
masterpiece,163917
best_quality,148366
1girl,106319
solo,86751
looking_at_viewer,57928
absurdres,47324
long_hair,41784
realistic,41074
8k,39246
highly_detailed,34587
depth_of_field,32082
highres,30872
very_aesthetic,27252
upper_body,26817
score_8_up,26316
smile,26286
score_9,24819
score_7_up,23370
ultra-detailed,23209
photorealistic,22629
outdoors,22397
sharp_focus,22347
high_quality,21139
intricate_details,20930
black_hair,20681
newest,20467
bokeh,20149
amazing_quality,19859
detailed,19521
blue_eyes,19455
short_hair,17877
portrait,17842
cinematic,17768
hdr,17129
full_body,16974
dynamic_angle,16916
standing,16261
film_grain,15692
long_sleeves,15662
1boy,15542
intricate,15486
cowboy_shot,15383
4k,15284
blush,14457
simple_background,14422
colorful,14183
cinematic_lighting,14082
closed_mouth,14072
detailed_background,13596
illustration,13196
dynamic_pose,12621
night,12414
jewelry,12078
blonde_hair,12072
scenery,11922
high_resolution,11918
white_hair,11829
shirt,11772
bangs,11619
red_eyes,11479
extremely_detailed,11462
open_mouth,11229
high_contrast,11108
ultra_detailed,10991
brown_hair,10896
raw_photo,10647
volumetric_lighting,10621
detailed_eyes,10324
sitting,10245
dress,10227
beautiful,10056
medium_breasts,10010
white_shirt,9888
detailed_face,9864
earrings,9847
hair_ornament,9698
male_focus,9547
cute,9501
green_eyes,9466
sky,9187
dutch_angle,9174
no_humans,9100
official_art,8822
hair_between_eyes,8817
soft_lighting,8617
indoors,8600
high_detail,8526
close-up,8343
dark,8342
professional,8273
brown_eyes,8259
fantasy,8244
white_background,8210
epic,8156
score_6_up,8151
holding,7760
dramatic_lighting,7695
skirt,7569
break,7480
flower,7405
from_side,7307
```

See data/most-used-words.csv for more details

## References

- [Civitai API](https://developer.civitai.com/docs/category/api)