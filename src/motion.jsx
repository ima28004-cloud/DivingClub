import { useEffect, useState } from 'react';

const palette = [
  [6, 48, 59],
  [7, 40, 54],
  [8, 33, 52],
  [9, 26, 49],
  [12, 20, 45],
  [14, 17, 42],
  [16, 15, 40],
];

const reducedMotionQuery = '(prefers-reduced-motion: reduce)';
const motionProperties = ['--progress', '--water', '--water-light', '--hero-dim', '--hero-drift'];

export function useDiveMotion(sections, mainRef) {
  const [reading, setReading] = useState({ depth: 0, activeSection: sections[0].id });

  useEffect(() => {
    const main = mainRef.current;
    const root = document.documentElement;
    const reducedMotion = window.matchMedia(reducedMotionQuery);
    const scenes = sections.map(({ id }) => main.querySelector(`#${CSS.escape(id)}`));
    const maxDepth = sections.at(-1).depth;
    let frame;
    let stops;
    let lastDepth = 0;
    let lastActive = 0;

    function updateDive() {
      frame = undefined;
      const scroll = Math.max(0, window.scrollY);
      const end = stops.at(-1);
      const nextStop = stops.findIndex((stop) => stop > scroll);
      const index = nextStop < 0 ? stops.length - 2 : Math.max(0, nextStop - 1);
      const distance = stops[index + 1] - stops[index];
      const fraction = scroll >= end ? 1 : Math.min(1, Math.max(0, (scroll - stops[index]) / Math.max(1, distance)));
      const startDepth = sections[index].depth;
      const endDepth = sections[index + 1].depth;
      const depth = startDepth + (endDepth - startDepth) * fraction;
      const roundedDepth = Math.round(depth);
      const active = scroll >= end - 1 ? sections.length - 1 : index + Number(fraction > 0.55);

      if (lastDepth !== roundedDepth || lastActive !== active) {
        setReading({ depth: roundedDepth, activeSection: sections[active].id });
        lastDepth = roundedDepth;
        lastActive = active;
      }

      const color = palette[index].map((start, channel) => (
        Math.round(start + (palette[index + 1][channel] - start) * fraction)
      ));
      root.style.setProperty('--progress', `${depth / maxDepth * 100}%`);
      root.style.setProperty('--water', `rgb(${color.join(' ')})`);
      root.style.setProperty('--water-light', String(0.8 - depth * 0.024));
      root.style.setProperty('--hero-dim', String(Math.min(0.58, scroll / Math.max(1, stops[1]) * 0.58)));
      root.style.setProperty('--hero-drift', reducedMotion.matches ? '0px' : `${Math.min(scroll * 0.11, 74)}px`);
    }

    function queueUpdate() {
      if (frame === undefined) frame = window.requestAnimationFrame(updateDive);
    }

    function measureStops() {
      const maxScroll = Math.max(0, root.scrollHeight - window.innerHeight);
      stops = scenes.map((scene) => Math.min(maxScroll, Math.round(scene.getBoundingClientRect().top + window.scrollY)));
      queueUpdate();
    }

    function configureMotion() {
      root.classList.toggle('motion', !reducedMotion.matches);
      queueUpdate();
    }

    const observer = new ResizeObserver(measureStops);
    observer.observe(main);
    window.addEventListener('scroll', queueUpdate, { passive: true });
    window.addEventListener('resize', measureStops, { passive: true });
    window.addEventListener('pageshow', measureStops);
    reducedMotion.addEventListener('change', configureMotion);
    measureStops();
    configureMotion();

    return () => {
      observer.disconnect();
      window.removeEventListener('scroll', queueUpdate);
      window.removeEventListener('resize', measureStops);
      window.removeEventListener('pageshow', measureStops);
      reducedMotion.removeEventListener('change', configureMotion);
      window.cancelAnimationFrame(frame);
      root.classList.remove('motion');
      motionProperties.forEach((name) => root.style.removeProperty(name));
    };
  }, [mainRef, sections]);

  return reading;
}

const bubbles = Array.from({ length: 22 }, (_, index) => {
  const left = index < 11;
  const offset = 0.9 + (index * 17 % 41) / 10;

  return {
    '--lane': `${left ? offset : 100 - offset}%`,
    '--size': `${3 + index * 5 % 8}px`,
    '--rise-time': `${11 + index * 5 % 13}s`,
    '--delay': `${-index * 1.37}s`,
    '--drift': `${left ? 11 : -11}px`,
  };
});

export function OceanBubbles() {
  return (
    <div className="ocean-bubbles" aria-hidden="true">
      {bubbles.map((style) => <i key={style['--delay']} style={style} />)}
    </div>
  );
}

const vertexSource = `
  attribute vec2 position;
  varying vec2 uv;
  void main() {
    uv = position * 0.5 + 0.5;
    gl_Position = vec4(position, 0.0, 1.0);
  }
`;

const fragmentSource = `
  precision mediump float;
  varying vec2 uv;
  uniform sampler2D source;
  uniform vec2 pointer;
  uniform vec2 crop;
  uniform vec2 origin;
  uniform float aspect;
  uniform float time;
  uniform float strength;
  uniform float lettering;
  void main() {
    vec2 delta = (uv - pointer) * vec2(aspect, 1.0);
    float radius = length(delta);
    float ripple = sin(radius * 32.0 - time * 8.0)
      * exp(-radius * 4.5) * smoothstep(0.0, 0.05, radius) * strength;
    vec2 direction = delta / max(radius, 0.025);
    float amplitude = mix(0.022, 0.032, lettering);
    vec2 displacement = direction * ripple * amplitude / vec2(aspect, 1.0);
    vec2 sampleUV = clamp(uv + displacement, 0.001, 0.999) * crop + origin;
    vec4 sampleColor = texture2D(source, sampleUV);
    sampleColor.rgb += ripple * 0.075 * vec3(0.50, 1.0, 1.0) * (1.0 - lettering);
    gl_FragColor = sampleColor;
  }
`;

function compileShader(gl, kind, source) {
  const shader = gl.createShader(kind);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const error = new Error(gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    throw error;
  }
  return shader;
}

function createRenderer(canvas, isText) {
  const gl = canvas.getContext('webgl', { alpha: isText, premultipliedAlpha: true });
  if (!gl) return null;

  const program = gl.createProgram();
  let vertex;
  let fragment;
  try {
    vertex = compileShader(gl, gl.VERTEX_SHADER, vertexSource);
    fragment = compileShader(gl, gl.FRAGMENT_SHADER, fragmentSource);
    gl.attachShader(program, vertex);
    gl.attachShader(program, fragment);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(program));
  } catch (error) {
    gl.deleteProgram(program);
    throw error;
  } finally {
    if (vertex) gl.deleteShader(vertex);
    if (fragment) gl.deleteShader(fragment);
  }

  gl.useProgram(program);
  const quad = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, quad);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
  const position = gl.getAttribLocation(program, 'position');
  gl.enableVertexAttribArray(position);
  gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);

  const texture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
  gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, isText);

  const uniformNames = ['pointer', 'crop', 'origin', 'aspect', 'time', 'strength', 'lettering'];
  const uniforms = Object.fromEntries(uniformNames.map((name) => [name, gl.getUniformLocation(program, name)]));
  gl.uniform1f(uniforms.lettering, Number(isText));

  function dispose() {
    gl.deleteTexture(texture);
    gl.deleteBuffer(quad);
    gl.deleteProgram(program);
  }

  return { gl, uniforms, dispose };
}

function textTexture(heading, bounds, ratio) {
  const bitmap = document.createElement('canvas');
  bitmap.width = Math.round(bounds.width * ratio);
  bitmap.height = Math.round(bounds.height * ratio);
  const context = bitmap.getContext('2d');
  context.scale(ratio, ratio);
  context.fillStyle = getComputedStyle(heading).getPropertyValue('--ink').trim();

  const walker = document.createTreeWalker(heading, NodeFilter.SHOW_TEXT);
  const range = document.createRange();
  for (let node = walker.nextNode(); node; node = walker.nextNode()) {
    const style = getComputedStyle(node.parentElement);
    context.font = `${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;
    context.letterSpacing = style.letterSpacing;
    const metrics = context.measureText('М');

    // Use the position of every word to keep the canvas aligned after wrapping.
    for (const match of node.textContent.matchAll(/\S+/g)) {
      const word = match[0];
      range.setStart(node, match.index);
      range.setEnd(node, match.index + word.length);
      const box = range.getBoundingClientRect();
      const ascent = metrics.fontBoundingBoxAscent ?? box.height * 0.8;
      const descent = metrics.fontBoundingBoxDescent ?? box.height * 0.2;
      const baseline = (box.height + ascent - descent) / 2;
      context.fillText(word, box.left - bounds.left, box.top - bounds.top + baseline);
    }
  }

  return bitmap;
}

function enableRefraction(element) {
  const isText = element.hasAttribute('data-water-text');
  const content = element.querySelector(isText ? 'h1' : 'img');
  const canvas = document.createElement('canvas');
  canvas.setAttribute('aria-hidden', 'true');
  canvas.hidden = true;

  const renderer = createRenderer(canvas, isText);
  if (!renderer) return null;

  const { gl, uniforms, dispose } = renderer;
  const pointerTarget = element.classList.contains('hero-media') ? element.closest('.hero') : element;
  let animation;
  let dirty = true;
  let energy = 0;
  let pointer;

  function restoreStatic() {
    canvas.hidden = true;
    element.classList.remove('is-refracting');
  }

  function uploadTexture(bounds) {
    const { width, height } = bounds;
    if (!width || !height || (!isText && !content.naturalWidth)) return false;

    const ratio = Math.min(window.devicePixelRatio || 1, 1.5, 1800 / width);
    canvas.width = Math.round(width * ratio);
    canvas.height = Math.round(height * ratio);
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.uniform1f(uniforms.aspect, width / height);

    const bitmap = isText ? textTexture(content, bounds, ratio) : content;
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, bitmap);
    const imageAspect = isText ? bitmap.width / bitmap.height : bitmap.naturalWidth / bitmap.naturalHeight;
    const viewAspect = width / height;
    const cropX = Math.min(1, viewAspect / imageAspect);
    const cropY = Math.min(1, imageAspect / viewAspect);
    const [focusX, focusY] = isText ? [0.5, 0.5] : getComputedStyle(content).objectPosition
      .split(' ').map((value) => parseFloat(value) / 100);
    gl.uniform2f(uniforms.crop, cropX, cropY);
    gl.uniform2f(uniforms.origin, (1 - cropX) * focusX, (1 - cropY) * (1 - focusY));
    dirty = false;
    return true;
  }

  function draw(now) {
    animation = undefined;
    if (energy < 0.018 || gl.isContextLost()) {
      restoreStatic();
      return;
    }

    const bounds = element.getBoundingClientRect();
    try {
      if (dirty && !uploadTexture(bounds)) {
        restoreStatic();
        return;
      }
    } catch {
      restoreStatic();
      pointerTarget.removeEventListener('pointermove', move);
      return;
    }

    gl.uniform2f(uniforms.pointer, (pointer.x - bounds.left) / bounds.width, 1 - (pointer.y - bounds.top) / bounds.height);
    gl.uniform1f(uniforms.time, (now % 24000) / 1000);
    gl.uniform1f(uniforms.strength, energy);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    canvas.hidden = false;
    element.classList.add('is-refracting');
    energy *= 0.94;
    animation = window.requestAnimationFrame(draw);
  }

  function move(event) {
    if (event.pointerType === 'touch') return;
    pointer = { x: event.clientX, y: event.clientY };
    energy = 1;
    if (animation === undefined) animation = window.requestAnimationFrame(draw);
  }

  function markDirty() {
    dirty = true;
  }

  element.append(canvas);
  const observer = new ResizeObserver(markDirty);
  observer.observe(element);
  content.addEventListener('load', markDirty);
  pointerTarget.addEventListener('pointermove', move, { passive: true });
  canvas.addEventListener('webglcontextlost', restoreStatic);

  return () => {
    window.cancelAnimationFrame(animation);
    observer.disconnect();
    content.removeEventListener('load', markDirty);
    pointerTarget.removeEventListener('pointermove', move);
    canvas.removeEventListener('webglcontextlost', restoreStatic);
    restoreStatic();
    canvas.remove();
    dispose();
  };
}

export function useWaterRefraction(heroRef) {
  useEffect(() => {
    const reducedMotion = window.matchMedia(reducedMotionQuery);
    const finePointer = window.matchMedia('(any-pointer: fine)');
    const targets = heroRef.current.querySelectorAll('[data-water], [data-water-text]');
    let cleanups = [];

    function configureRefraction() {
      cleanups.forEach((cleanup) => cleanup());
      cleanups = [];
      if (reducedMotion.matches || !finePointer.matches) return;

      for (const target of targets) {
        try {
          const cleanup = enableRefraction(target);
          if (cleanup) cleanups.push(cleanup);
        } catch {
          // The image and heading remain visible if the graphics driver rejects WebGL.
        }
      }
    }

    reducedMotion.addEventListener('change', configureRefraction);
    finePointer.addEventListener('change', configureRefraction);
    configureRefraction();

    return () => {
      reducedMotion.removeEventListener('change', configureRefraction);
      finePointer.removeEventListener('change', configureRefraction);
      cleanups.forEach((cleanup) => cleanup());
    };
  }, [heroRef]);
}
