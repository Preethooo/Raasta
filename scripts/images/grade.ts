// Raasta "house grade": a restrained filmic look applied to every library photo so
// images from many photographers read as one professional set.
//   - gentle S-curve contrast with slightly lifted blacks
//   - calmer, less "postcard" saturation; warm highlights, cool shadows
//   - soft vignette to pull the eye inwards
import sharp from 'sharp';

export async function grade(input: Buffer, width: number, height: number): Promise<Buffer> {
  const vignette = Buffer.from(
    `<svg width="${width}" height="${height}"><defs><radialGradient id="v" cx="50%" cy="48%" r="75%">
      <stop offset="55%" stop-color="#000" stop-opacity="0"/><stop offset="100%" stop-color="#000" stop-opacity="0.38"/>
    </radialGradient></defs><rect width="100%" height="100%" fill="url(#v)"/></svg>`,
  );
  return sharp(input)
    .linear(1.14, -14) // contrast, with blacks held just above crushed
    .modulate({ saturation: 0.86, brightness: 1.02 })
    .recomb([
      [1.04, 0.02, -0.02], // warm highlights
      [0.0, 1.0, 0.0],
      [-0.03, 0.03, 1.02], // a touch of teal in the shadows
    ])
    .gamma(1.05)
    .composite([{ input: vignette, blend: 'multiply' }])
    .toBuffer();
}
