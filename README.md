# Macromath

Close-up photography optics: extension-tube magnification, the aperture you actually have, diffraction versus pixel pitch, and how many frames the focus stack needs.

## What it computes
- **Magnification**: native + extension / focal length (thin-lens approximation, labeled), plus thin-lens object and image distances.
- **Effective aperture**: the published bellows factor N_eff = N(1+m), with light lost in stops (exact for a symmetrical lens, labeled approximation otherwise).
- **Diffraction**: Airy disk at 550 nm against your sensor's pixel pitch (sensor width / pixel count), with a labeled three-band verdict.
- **Focus stack**: macro DOF ~= 2 c N (1+m) / m^2 (published approximation), frames at 25% overlap (labeled guidance), c = 0.029 mm full-frame convention.

## Anchors
- Bellows factor, thin-lens conjugates, Airy disk: published optics formulas.
- Circle of confusion 0.029 mm, 25% stack overlap, and the verdict bands: conventions and guidance, labeled in-app.

## Files
- `index.html` - landing page
- `app.html` - four chained calculators
- `engine.js` - pure optics engine (node + browser global)
- `test.js` + `expected.json` - 211 checks against an independent Python oracle, published-formula anchors and monotonicity properties

## Run tests
```
node test.js
```
