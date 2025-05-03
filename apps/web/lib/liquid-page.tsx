// not being used rn, saved for future reference
// to use @types/three, run `pnpm add three && pnpm add -D @types/three`

// "use client";
// // no idea how this works; adjusted color palette and slowed down the animation
// // https://codepen.io/DonKarlssonSan/pen/gROawd
// // vibe code to change this

// import { useEffect, useRef } from "react";
// import * as THREE from "three";
// import { IUniform } from "three";

// interface Uniforms {
//   [uniform: string]: IUniform<any>;
//   iGlobalTime: IUniform<number>;
//   iResolution: IUniform<THREE.Vector2>;
//   iAnimationSpeed: IUniform<number>;
// }

// // Helper function to convert hex color to GLSL vec3 string
// const hexToVec3 = (hex: string): string => {
//   const bigint = parseInt(hex.slice(1), 16);
//   const r = (bigint >> 16) & 255;
//   const g = (bigint >> 8) & 255;
//   const b = bigint & 255;
//   return `vec3(${(r / 255).toFixed(3)}, ${(g / 255).toFixed(3)}, ${(b / 255).toFixed(3)})`;
// };

// export default function LiquidPalettePage() {
//   const containerRef = useRef<HTMLDivElement>(null);

//   // --- Configurable Parameters ---
//   const colorPaletteHex = [
//     "#000000", // Black
//     "#FFFFFF", // White
//   ];
//   const animationSpeedFactor = 20.0; // Lower is faster

//   // --- End Configurable Parameters ---

//   // Convert hex palette to GLSL vec3 array string
//   const paletteSize = colorPaletteHex.length;
//   const glslPalette = `vec3 palette[${paletteSize}];\n${colorPaletteHex
//     .map((hex, index) => `  palette[${index}] = ${hexToVec3(hex)};`)
//     .join("\n")}`;

//   // Define the shader strings here
//   const vertexShader = `
//     void main() {
//       gl_Position = vec4(position, 1.0);
//     }
//   `;

//   // Use template literal for the fragment shader, now with iAnimationSpeed uniform
//   const fragmentShader = `
//     uniform vec2 iResolution;
//     uniform float iGlobalTime;
//     uniform float iAnimationSpeed;

//     // Simplex 2D noise
//     vec3 permute(vec3 x) { return mod(((x*34.0)+1.0)*x, 289.0); }

//     float snoise(vec2 v){
//         const vec4 C = vec4(0.211324865405187, 0.366025403784439,
//                             -0.577350269189626, 0.024390243902439);
//         vec2 i  = floor(v + dot(v, C.yy) );
//         vec2 x0 = v -   i + dot(i, C.xx);
//         vec2 i1;
//         i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
//         vec4 x12 = x0.xyxy + C.xxzz;
//         x12.xy -= i1;
//         i = mod(i, 289.0);
//         vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 ))
//                          + i.x + vec3(0.0, i1.x, 1.0 ));
//         vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy),
//                                 dot(x12.zw,x12.zw)), 0.0);
//         m = m*m ;
//         m = m*m ;
//         vec3 x = 2.0 * fract(p * C.www) - 1.0;
//         vec3 h = abs(x) - 0.5;
//         vec3 ox = floor(x + 0.5);
//         vec3 a0 = x - ox;
//         m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );
//         vec3 g;
//         g.x  = a0.x  * x0.x  + h.x  * x0.y;
//         g.yz = a0.yz * x12.xz + h.yz * x12.yw;
//         return 130.0 * dot(m, g);
//     }

//     // Palette interpolation - MODIFIED FOR SHARPNESS
//     vec3 getPaletteColor(float t) {
//       // Define the 2 colors (removed blue and second white)
//       vec3 c1 = vec3(0.125, 0.125, 0.125); // #202020
//       vec3 c2 = vec3(0.941, 0.925, 0.882); // #F0ECE1

//       // Use smoothstep on t to control gradient sharpness
//       float lower_bound = 0.45; // Narrower range for sharper edge
//       float upper_bound = 0.55; // Narrower range for sharper edge
//       float blendFactor = smoothstep(lower_bound, upper_bound, t);

//       // Interpolate directly between the 2 colors based on t (0 to 1)
//       // return mix(c1, c2, t); // Simple mix (blurrier edges)
//       return mix(c1, c2, blendFactor); // Mix using smoothstep factor (sharper edges)

//       /* // Original smooth interpolation (for reference)
//       ${glslPalette}

//       float scaled = t * float(${paletteSize - 1}); // 0..${paletteSize - 1}
//       int idx = int(floor(scaled));
//       int idx2 = idx + 1;
//       if (idx2 >= ${paletteSize}) idx2 = 0;
//       float frac = fract(scaled);
//       return mix(palette[idx], palette[idx2], frac);
//       */
//     }

//     void main(void)
//     {
//         vec2 uv = gl_FragCoord.xy / iResolution.xy;
//         float time = iGlobalTime / iAnimationSpeed;
//         float xnoise = snoise(vec2(uv.x, time + 10000.0));
//         float ynoise = snoise(vec2(uv.y, time + 500.0));
//         vec2 t = vec2(xnoise, ynoise);
//         float s1 = snoise(uv + t / 2.0 + snoise(uv + snoise(uv + t/3.0) / 5.0));
//         float s2 = snoise(uv + snoise(uv + s1) / 7.0);
//         float tColor = fract(s1 * 0.5 + 0.5); // Map s1 from [-1,1] to [0,1]
//         vec3 rgb = getPaletteColor(tColor);
//         gl_FragColor = vec4(rgb, 1.0);
//     }
//   `;

//   useEffect(() => {
//     let container = containerRef.current;
//     let camera: THREE.Camera | null = null;
//     let scene: THREE.Scene | null = null;
//     let renderer: THREE.WebGLRenderer | null = null;
//     let uniforms: Uniforms | null = null;
//     let startTime: number | null = null;
//     let animationId: number | null = null;

//     function init() {
//       if (!container) return;

//       startTime = Date.now();
//       camera = new THREE.Camera();
//       camera.position.z = 1;

//       scene = new THREE.Scene();

//       const geometry = new THREE.PlaneGeometry(16, 9);

//       uniforms = {
//         iGlobalTime: { value: 1.0 },
//         iResolution: { value: new THREE.Vector2() },
//         iAnimationSpeed: { value: animationSpeedFactor },
//       };

//       const material = new THREE.ShaderMaterial({
//         uniforms,
//         vertexShader,
//         fragmentShader,
//       });

//       const mesh = new THREE.Mesh(geometry, material);
//       scene.add(mesh);

//       renderer = new THREE.WebGLRenderer();
//       renderer.setPixelRatio(window.devicePixelRatio);
//       renderer.setSize(window.innerWidth, window.innerHeight);
//       container.appendChild(renderer.domElement);

//       onWindowResize();
//       window.addEventListener("resize", onWindowResize, false);
//     }

//     function onWindowResize() {
//       if (!uniforms || !renderer) return;
//       uniforms.iResolution.value.x = window.innerWidth;
//       uniforms.iResolution.value.y = window.innerHeight;
//       renderer.setSize(window.innerWidth, window.innerHeight);
//     }

//     function animate() {
//       animationId = requestAnimationFrame(animate);
//       render();
//     }

//     function render() {
//       if (!renderer || !scene || !camera || !uniforms || startTime === null)
//         return;
//       const currentTime = Date.now();
//       uniforms.iGlobalTime.value = (currentTime - startTime) * 0.001;
//       renderer.render(scene, camera);
//     }

//     init();
//     animate();

//     // Cleanup on unmount
//     return () => {
//       if (animationId !== null) {
//         cancelAnimationFrame(animationId);
//       }
//       window.removeEventListener("resize", onWindowResize, false);
//       if (renderer) {
//         renderer.dispose();
//         if (renderer.domElement && renderer.domElement.parentNode) {
//           renderer.domElement.parentNode.removeChild(renderer.domElement);
//         }
//       }
//     };
//   }, []);

//   return (
//     <div
//       ref={containerRef}
//       style={{
//         width: "100vw",
//         height: "100vh",
//         overflow: "hidden",
//         margin: 0,
//         padding: 0,
//         position: "fixed",
//         top: 0,
//         left: 0,
//         zIndex: 0,
//       }}
//     />
//   );
// }
