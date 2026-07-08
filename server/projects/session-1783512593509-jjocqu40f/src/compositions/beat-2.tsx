import React from 'react';
import { AbsoluteFill, useCurrentFrame, interpolate, Img, spring } from 'remotion';

/**
 * Generated from VideoSpec DSL
 * ID: beat-2
 * Complexity: complex
 */

const Layer_content_image_main: React.FC = () => {
  const frame = useCurrentFrame();
  const fps = 30; // TODO: 从 spec 传入


  // Layer visibility
  const isVisible = frame >= 0 && frame < 75;
  if (!isVisible) return null;

  const anim1 = interpolate(
    frame,
    [0, 12],
    [0, 1],
    { extrapolateRight: 'clamp' }
  );
  const anim2 = interpolate(
    frame,
    [0, 24],
    [0, 180],
    { extrapolateRight: 'clamp' }
  );
  const anim3 = interpolate(
    frame,
    [8, 45],
    [0, 1],
    { extrapolateRight: 'clamp' }
  );
  const anim4 = interpolate(
    frame,
    [0, 75],
    [1, 1.04],
    { extrapolateRight: 'clamp' }
  );
  const anim5 = interpolate(
    frame,
    [63, 75],
    [1, 0],
    { extrapolateRight: 'clamp' }
  );

  return (
    <Img
      src="http://localhost:3001/projects/session-1783512593509-jjocqu40f/artifacts/capture/assets/1783512587241-686584975-20260708191204_93_95.jpg"
      style={{ ...{
      position: 'absolute',
      left: '50%',
      top: '50%',
      width: '82%',
      height: '78%',
      opacity: 1,
      zIndex: 2,
      objectFit: 'contain',
      backgroundColor: '#FFFFFF'
}, opacity: anim1,
          opacity: anim5,
          transform: `rotateY(anim2deg) perspective(1000px) rotateX(anim3 * 0deg) rotateY(anim3 * 0deg) rotateZ(anim3 * 360deg) scale(anim4)` }}
    />
  );
};

const Layer_content_title: React.FC = () => {
  const frame = useCurrentFrame();
  const fps = 30; // TODO: 从 spec 传入


  // Layer visibility
  const isVisible = frame >= 10 && frame < 65;
  if (!isVisible) return null;

  const anim1 = interpolate(
    frame,
    [10, 20],
    [0, 1],
    { extrapolateRight: 'clamp' }
  );
  const anim2 = interpolate(
    frame,
    [10, 22],
    [28, 0],
    { extrapolateRight: 'clamp' }
  );
  const anim3 = interpolate(
    frame,
    [57, 65],
    [1, 0],
    { extrapolateRight: 'clamp' }
  );

  return (
    <div
      style={{ ...{
      position: 'absolute',
      left: '50%',
      top: '84%',
      width: '70%',
      height: '80px',
      opacity: 1,
      zIndex: 4,
      color: '#000000',
      fontSize: 48,
      fontFamily: 'Inter',
      fontWeight: 700,
      textAlign: 'center'
}, opacity: anim1,
          opacity: anim3,
          transform: `translateY(anim2%)` }}
    >
      核心内容
    </div>
  );
};

const Layer_particle_1: React.FC = () => {
  const frame = useCurrentFrame();
  const fps = 30; // TODO: 从 spec 传入


  // Layer visibility
  const isVisible = frame >= 6 && frame < 64;
  if (!isVisible) return null;

  const anim1 = interpolate(
    frame,
    [6, 14],
    [0, 0.22],
    { extrapolateRight: 'clamp' }
  );
  const anim2 = interpolate(
    frame,
    [6, 64],
    [42, 0],
    { extrapolateRight: 'clamp' }
  );
  const anim3 = interpolate(
    frame,
    [52, 64],
    [0.22, 0],
    { extrapolateRight: 'clamp' }
  );

  return (
    <div
      style={{ ...{
      position: 'absolute',
      left: '18%',
      top: '28%',
      width: '8px',
      height: '8px',
      opacity: 0.22,
      zIndex: 1,
      backgroundColor: '#000000'
}, opacity: anim1,
          opacity: anim3,
          transform: `translateY(anim2%)` }}
    />
  );
};

const Layer_particle_2: React.FC = () => {
  const frame = useCurrentFrame();
  const fps = 30; // TODO: 从 spec 传入


  // Layer visibility
  const isVisible = frame >= 12 && frame < 66;
  if (!isVisible) return null;

  const anim1 = interpolate(
    frame,
    [12, 20],
    [0, 0.18],
    { extrapolateRight: 'clamp' }
  );
  const anim2 = interpolate(
    frame,
    [12, 66],
    [34, 0],
    { extrapolateRight: 'clamp' }
  );
  const anim3 = spring({
    frame: frame - 20,
    fps,
    config: { damping: 10, stiffness: 100, mass: 1 },
  });
  const anim4 = interpolate(
    frame,
    [54, 66],
    [0.18, 0],
    { extrapolateRight: 'clamp' }
  );

  return (
    <div
      style={{ ...{
      position: 'absolute',
      left: '78%',
      top: '34%',
      width: '6px',
      height: '6px',
      opacity: 0.18,
      zIndex: 1,
      backgroundColor: '#000000'
}, opacity: anim1,
          opacity: anim4,
          transform: `translateX(anim2%) scale(anim3)` }}
    />
  );
};

const Layer_particle_3: React.FC = () => {
  const frame = useCurrentFrame();
  const fps = 30; // TODO: 从 spec 传入


  // Layer visibility
  const isVisible = frame >= 16 && frame < 64;
  if (!isVisible) return null;

  const anim1 = interpolate(
    frame,
    [16, 24],
    [0, 0.14],
    { extrapolateRight: 'clamp' }
  );
  const anim2 = interpolate(
    frame,
    [16, 64],
    [30, 0],
    { extrapolateRight: 'clamp' }
  );
  const anim3 = interpolate(
    frame,
    [52, 64],
    [0.14, 0],
    { extrapolateRight: 'clamp' }
  );

  return (
    <div
      style={{ ...{
      position: 'absolute',
      left: '66%',
      top: '72%',
      width: '10px',
      height: '10px',
      opacity: 0.14,
      zIndex: 1,
      backgroundColor: '#000000'
}, opacity: anim1,
          opacity: anim3,
          transform: `translateX(anim2%)` }}
    />
  );
};

export const Beat2: React.FC = () => {
  const frame = useCurrentFrame();
  const fps = 30;

  return (
    <AbsoluteFill style={{ backgroundColor: '#FFFFFF' }}>
      <Layer_content_image_main />
      <Layer_content_title />
      <Layer_particle_1 />
      <Layer_particle_2 />
      <Layer_particle_3 />
    </AbsoluteFill>
  );
};