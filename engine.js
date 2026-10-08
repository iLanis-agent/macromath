// Macromath engine - close-up photography optics.
// Anchors (labeled in-app):
//  - Thin-lens extension math: m = extension / focal length; object distance u = f(1 + 1/m).
//    Labeled thin-lens approximation; real lenses vary.
//  - Effective f-number N_eff = N(1 + m): the published bellows factor, exact for a
//    symmetrical lens (pupil magnification 1), labeled approximation otherwise.
//  - Airy disk diameter = 2.44 x lambda x N_eff with lambda = 550 nm (green light).
//  - Circle of confusion 0.029 mm for full frame (common convention, labeled).
//  - Macro DOF ~= 2 c N (1 + m) / m^2 (published approximation).
//  - Focus-stack overlap 25% is labeled guidance.
const LAMBDA_MM = 0.00055;      // 550 nm
const COC_FF = 0.029;           // mm, labeled convention
const STACK_OVERLAP = 0.75;     // labeled: advance 75% of DOF per frame

function magnification(focalMm, extensionMm, nativeMag){
  if (!(focalMm > 0)) throw new Error('focal length must be positive');
  if (!(extensionMm >= 0)) throw new Error('extension cannot be negative');
  const native = nativeMag || 0;
  if (!(native >= 0)) throw new Error('native magnification cannot be negative');
  const m = native + extensionMm / focalMm;
  return { focalMm, extensionMm, nativeMag: native, m };
}

// Object distance from the lens at magnification m (thin lens, exact within the model).
function focusDistance(focalMm, m){
  if (!(focalMm > 0)) throw new Error('focal length must be positive');
  if (!(m > 0)) throw new Error('magnification must be positive');
  const u = focalMm * (1 + 1 / m);
  const imageDist = focalMm * (1 + m);
  return { focalMm, m, objectDist: u, imageDist };
}

// Bellows factor: effective f-number and light lost in stops.
function effectiveAperture(nominalN, m){
  if (!(nominalN > 0)) throw new Error('aperture must be positive');
  if (!(m >= 0)) throw new Error('magnification cannot be negative');
  const nEff = nominalN * (1 + m);
  const stopsLost = Math.log2((1 + m) * (1 + m));
  return { nominalN, m, nEff, stopsLost };
}

// Diffraction: Airy disk vs pixel pitch. Labeled verdict, not an image-quality verdict.
function diffraction(nEff, sensorWmm, pixelsW){
  if (!(nEff > 0)) throw new Error('effective aperture must be positive');
  if (!(sensorWmm > 0)) throw new Error('sensor width must be positive');
  if (!(pixelsW > 0)) throw new Error('pixel count must be positive');
  const airyUm = 2.44 * LAMBDA_MM * nEff * 1000;     // micrometers
  const pitchUm = sensorWmm * 1000 / pixelsW;
  const ratio = airyUm / pitchUm;
  const verdict = ratio > 2 ? 'Airy disk over 2x pixel pitch - diffraction softening likely (labeled estimate)'
    : ratio > 1 ? 'Airy disk at pixel-pitch scale - softening starts (labeled estimate)'
    : 'Airy disk below pixel pitch - diffraction not the limit (labeled estimate)';
  return { nEff, sensorWmm, pixelsW, airyUm, pitchUm, ratio, verdict };
}

// Focus stack: frames to cover depthMm at magnification m and aperture N.
function focusStack(depthMm, m, nominalN, cocMm){
  if (!(depthMm > 0)) throw new Error('subject depth must be positive');
  if (!(m > 0)) throw new Error('magnification must be positive');
  if (!(nominalN > 0)) throw new Error('aperture must be positive');
  const coc = (cocMm === undefined || cocMm === null) ? COC_FF : cocMm;
  if (!(coc > 0)) throw new Error('circle of confusion must be positive');
  const dof = 2 * coc * nominalN * (1 + m) / (m * m);
  const step = dof * STACK_OVERLAP;
  const frames = Math.ceil(depthMm / step);
  return { depthMm, m, nominalN, coc, dof, step, frames };
}

const API = { LAMBDA_MM, COC_FF, STACK_OVERLAP,
  magnification, focusDistance, effectiveAperture, diffraction, focusStack };
if (typeof module !== 'undefined' && module.exports) module.exports = API;
if (typeof window !== 'undefined') window.Macromath = API;
