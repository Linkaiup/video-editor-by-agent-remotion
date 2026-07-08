import React from 'react';
import { AbsoluteFill, useCurrentFrame, interpolate, Img, spring } from 'remotion';

/**
 * Generated from VideoSpec DSL
 * ID: beat-4
 * Complexity: complex
 */

const Layer_background_card: React.FC = () => {
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
    [0, 28],
    [0, 180],
    { extrapolateRight: 'clamp' }
  );

  return (
    <div
      style={{ ...{
      position: 'absolute',
      left: '7%',
      top: '8%',
      width: '86%',
      height: '84%',
      backgroundColor: '#FFFFFF',
      opacity: 1,
      zIndex: 0
}, opacity: anim1,
          transform: `perspective(1000px) rotateY(anim2deg)` }}
    />
  );
};

const Layer_main_image: React.FC = () => {
  const frame = useCurrentFrame();
  const fps = 30; // TODO: 从 spec 传入


  // Layer visibility
  const isVisible = frame >= 0 && frame < 75;
  if (!isVisible) return null;

  const anim1 = interpolate(
    frame,
    [0, 10],
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
    [0, 42],
    [0, 1],
    { extrapolateRight: 'clamp' }
  );
  const anim4 = interpolate(
    frame,
    [0, 75],
    [1, 1.06],
    { extrapolateRight: 'clamp' }
  );

  return (
    <Img
      src="http://localhost:3001/projects/session-1783512593509-jjocqu40f/artifacts/capture/assets/1783512587241-686584975-20260708191204_93_95.jpg"
      style={{ ...{
      position: 'absolute',
      left: '18%',
      top: '13%',
      width: '64%',
      height: '58%',
      opacity: 1,
      zIndex: 2,
      objectFit: 'cover'
}, opacity: anim1,
          transform: `rotateY(anim2deg) perspective(1000px) rotateX(anim3 * 0deg) rotateY(anim3 * 0deg) rotateZ(anim3 * 360deg) scale(anim4)` }}
    />
  );
};

const Layer_closing_title: React.FC = () => {
  const frame = useCurrentFrame();
  const fps = 30; // TODO: 从 spec 传入


  // Layer visibility
  const isVisible = frame >= 20 && frame < 75;
  if (!isVisible) return null;

  const anim1 = interpolate(
    frame,
    [20, 32],
    [0, 1],
    { extrapolateRight: 'clamp' }
  );
  const anim2 = interpolate(
    frame,
    [20, 34],
    [42, 0],
    { extrapolateRight: 'clamp' }
  );
  const anim3 = spring({
    frame: frame - 28,
    fps,
    config: { damping: 14, stiffness: 120 },
  });

  return (
    <div
      style={{ ...{
      position: 'absolute',
      left: '10%',
      top: '73%',
      width: '80%',
      height: '8%',
      color: '#000000',
      fontSize: 58,
      fontFamily: 'Inter',
      fontWeight: 800,
      textAlign: 'center',
      opacity: 1,
      zIndex: 4
}, opacity: anim1,
          transform: `translateY(anim2%) scale(anim3)` }}
    >
      总结要点
    </div>
  );
};

const Layer_closing_cta: React.FC = () => {
  const frame = useCurrentFrame();
  const fps = 30; // TODO: 从 spec 传入


  // Layer visibility
  const isVisible = frame >= 42 && frame < 75;
  if (!isVisible) return null;

  const anim1 = interpolate(
    frame,
    [42, 52],
    [0, 1],
    { extrapolateRight: 'clamp' }
  );
  const anim2 = interpolate(
    frame,
    [42, 56],
    [30, 0],
    { extrapolateRight: 'clamp' }
  );
  const anim3 = spring({
    frame: frame - 56,
    fps,
    config: { damping: 10, stiffness: 100, mass: 1 },
  });

  return (
    <div
      style={{ ...{
      position: 'absolute',
      left: '10%',
      top: '82%',
      width: '80%',
      height: '7%',
      color: '#000000',
      fontSize: 36,
      fontFamily: 'Inter',
      fontWeight: 600,
      textAlign: 'center',
      opacity: 1,
      zIndex: 5
}, opacity: anim1,
          transform: `translateY(anim2%) scale(anim3)` }}
    >
      现在，开启下一步行动
    </div>
  );
};

const Layer_particle_01: React.FC = () => {
  const frame = useCurrentFrame();
  const fps = 30; // TODO: 从 spec 传入


  // Layer visibility
  const isVisible = frame >= 18 && frame < 75;
  if (!isVisible) return null;

  const anim1 = interpolate(
    frame,
    [18, 24],
    [0, 0.28],
    { extrapolateRight: 'clamp' }
  );
  const anim2 = interpolate(
    frame,
    [18, 75],
    [115, 0],
    { extrapolateRight: 'clamp' }
  );
  const anim3 = interpolate(
    frame,
    [58, 75],
    [0.28, 0],
    { extrapolateRight: 'clamp' }
  );

  return (
    <div
      style={{ ...{
      position: 'absolute',
      left: '16%',
      top: '76%',
      width: '8px',
      height: '8px',
      backgroundColor: '#000000',
      opacity: 0.28,
      zIndex: 3
}, opacity: anim1,
          opacity: anim3,
          transform: `translateY(anim2%)` }}
    />
  );
};

const Layer_particle_02: React.FC = () => {
  const frame = useCurrentFrame();
  const fps = 30; // TODO: 从 spec 传入


  // Layer visibility
  const isVisible = frame >= 22 && frame < 75;
  if (!isVisible) return null;

  const anim1 = interpolate(
    frame,
    [22, 28],
    [0, 0.22],
    { extrapolateRight: 'clamp' }
  );
  const anim2 = interpolate(
    frame,
    [22, 75],
    [95, 0],
    { extrapolateRight: 'clamp' }
  );
  const anim3 = interpolate(
    frame,
    [22, 75],
    [0, 360],
    { extrapolateRight: 'clamp' }
  );
  const anim4 = interpolate(
    frame,
    [60, 75],
    [0.22, 0],
    { extrapolateRight: 'clamp' }
  );

  return (
    <div
      style={{ ...{
      position: 'absolute',
      left: '84%',
      top: '74%',
      width: '10px',
      height: '10px',
      backgroundColor: '#000000',
      opacity: 0.22,
      zIndex: 3
}, opacity: anim1,
          opacity: anim4,
          transform: `translateY(anim2%) rotate(anim3deg)` }}
    />
  );
};

const Layer_particle_03: React.FC = () => {
  const frame = useCurrentFrame();
  const fps = 30; // TODO: 从 spec 传入


  // Layer visibility
  const isVisible = frame >= 28 && frame < 75;
  if (!isVisible) return null;

  const anim1 = interpolate(
    frame,
    [28, 34],
    [0, 0.2],
    { extrapolateRight: 'clamp' }
  );
  const anim2 = interpolate(
    frame,
    [28, 75],
    [130, 0],
    { extrapolateRight: 'clamp' }
  );
  const anim3 = interpolate(
    frame,
    [62, 75],
    [0.2, 0],
    { extrapolateRight: 'clamp' }
  );

  return (
    <div
      style={{ ...{
      position: 'absolute',
      left: '27%',
      top: '83%',
      width: '6px',
      height: '6px',
      backgroundColor: '#000000',
      opacity: 0.2,
      zIndex: 3
}, opacity: anim1,
          opacity: anim3,
          transform: `translateY(anim2%)` }}
    />
  );
};

const Layer_particle_04: React.FC = () => {
  const frame = useCurrentFrame();
  const fps = 30; // TODO: 从 spec 传入


  // Layer visibility
  const isVisible = frame >= 32 && frame < 75;
  if (!isVisible) return null;

  const anim1 = interpolate(
    frame,
    [32, 38],
    [0, 0.24],
    { extrapolateRight: 'clamp' }
  );
  const anim2 = interpolate(
    frame,
    [32, 75],
    [125, 0],
    { extrapolateRight: 'clamp' }
  );
  const anim3 = interpolate(
    frame,
    [32, 75],
    [0, 90],
    { extrapolateRight: 'clamp' }
  );
  const anim4 = interpolate(
    frame,
    [62, 75],
    [0.24, 0],
    { extrapolateRight: 'clamp' }
  );

  return (
    <div
      style={{ ...{
      position: 'absolute',
      left: '72%',
      top: '82%',
      width: '7px',
      height: '7px',
      backgroundColor: '#000000',
      opacity: 0.24,
      zIndex: 3
}, opacity: anim1,
          opacity: anim4,
          transform: `translateY(anim2%) rotate(anim3deg)` }}
    />
  );
};

export const Beat4: React.FC = () => {
  const frame = useCurrentFrame();
  const fps = 30;

  return (
    <AbsoluteFill style={{ backgroundColor: '#FFFFFF' }}>
      <Layer_background_card />
      <Layer_main_image />
      <Layer_closing_title />
      <Layer_closing_cta />
      <Layer_particle_01 />
      <Layer_particle_02 />
      <Layer_particle_03 />
      <Layer_particle_04 />
    </AbsoluteFill>
  );
};