// scripts/svg-to-og.mjs
import sharp from "sharp";
import fs from "fs";
import path from "path";

const svg = fs.readFileSync("scripts/logo.svg");

const logoSize = 420;

const logoPng = await sharp(svg)
  .resize(logoSize, logoSize, {
    fit: "contain",
  })
  .png()
  .toBuffer();

await sharp({
  create: {
    width: 1200,
    height: 630,
    channels: 4,
    background: "#ffffff",
  },
})
  .composite([
    {
      input: logoPng,
      left: Math.round((1200 - logoSize) / 2),
      top: Math.round((630 - logoSize) / 2),
    },
  ])
  .png()
  .toFile("src/app/twitter-image.png");

console.log("Saved src/app/twitter-image.png");
