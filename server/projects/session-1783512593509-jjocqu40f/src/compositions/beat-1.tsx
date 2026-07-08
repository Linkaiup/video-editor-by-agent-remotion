import React from 'react';
import { AbsoluteFill, useCurrentFrame, interpolate, Img, spring } from 'remotion';

/**
 * Generated from VideoSpec DSL
 * ID: beat-1
 * Complexity: complex
 */

const Layer_bg_white: React.FC = () => {
  const frame = useCurrentFrame();
  const fps = 30; // TODO: 从 spec 传入


  // Layer visibility
  const isVisible = frame >= 0 && frame < 75;
  if (!isVisible) return null;



  return (
    <div
      style={{
      position: 'absolute',
      left: '0px',
      top: '0px',
      width: '100%',
      height: '100%',
      backgroundColor: '#FFFFFF',
      opacity: 1,
      zIndex: 0
}}
    />
  );
};

const Layer_asset_main_paper_flip: React.FC = () => {
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
  const anim3 = interpolate(
    frame,
    [8, 55],
    [0, 1],
    { extrapolateRight: 'clamp' }
  );
  const anim4 = interpolate(
    frame,
    [0, 75],
    [1, 1.08],
    { extrapolateRight: 'clamp' }
  );
  const anim5 = interpolate(
    frame,
    [66, 75],
    [1, 0],
    { extrapolateRight: 'clamp' }
  );

  return (
    <Img
      src="http://localhost:3001/projects/session-1783512593509-jjocqu40f/artifacts/capture/assets/1783512587241-686584975-20260708191204_93_95.jpg"
      style={{ ...{
      position: 'absolute',
      left: '10%',
      top: '18%',
      width: '80%',
      height: '54%',
      objectFit: 'cover',
      opacity: 1,
      zIndex: 2
}, opacity: anim1,
          opacity: anim5,
          transform: `perspective(1000px) rotateY(anim2deg) perspective(1000px) rotateX(anim3 * 0deg) rotateY(anim3 * 0deg) rotateZ(anim3 * 360deg) scale(anim4)` }}
    />
  );
};

const Layer_hook_question_text: React.FC = () => {
  const frame = useCurrentFrame();
  const fps = 30; // TODO: 从 spec 传入


  // Layer visibility
  const isVisible = frame >= 8 && frame < 75;
  if (!isVisible) return null;

  const anim1 = interpolate(
    frame,
    [8, 22],
    [80, 0],
    { extrapolateRight: 'clamp' }
  );
  const anim2 = interpolate(
    frame,
    [8, 18],
    [0, 1],
    { extrapolateRight: 'clamp' }
  );
  const anim3 = spring({
    frame: frame - 20,
    fps,
    config: { damping: 8, stiffness: 140, mass: 0.8 },
  });
  const anim4 = interpolate(
    frame,
    [66, 75],
    [1, 0],
    { extrapolateRight: 'clamp' }
  );

  return (
    <div
      style={{ ...{
      position: 'absolute',
      left: '8%',
      top: '75%',
      width: '84%',
      height: '12%',
      color: '#000000',
      fontSize: 72,
      fontFamily: 'Inter',
      fontWeight: 800,
      textAlign: 'center',
      opacity: 1,
      zIndex: 4
}, opacity: anim2,
          opacity: anim4,
          transform: `translateY(anim1%) scale(anim3)` }}
    >
      你注意到了吗？
    </div>
  );
};

const Layer_particle_01: React.FC = () => {
  const frame = useCurrentFrame();
  const fps = 30; // TODO: 从 spec 传入


  // Layer visibility
  const isVisible = frame >= 0 && frame < 75;
  if (!isVisible) return null;

  const anim1 = interpolate(
    frame,
    [2, 8],
    [0, 0.85],
    { extrapolateRight: 'clamp' }
  );
  const anim2 = interpolate(
    frame,
    [2, 50],
    [180, 0],
    { extrapolateRight: 'clamp' }
  );
  const anim3 = interpolate(
    frame,
    [2, 55],
    [0, 360],
    { extrapolateRight: 'clamp' }
  );
  const anim4 = interpolate(
    frame,
    [45, 60],
    [0.85, 0],
    { extrapolateRight: 'clamp' }
  );

  return (
    <div
      style={{ ...{
      position: 'absolute',
      left: '14%',
      top: '18%',
      width: '14px',
      height: '14px',
      backgroundColor: '#000000',
      opacity: 0.85,
      zIndex: 3
}, opacity: anim1,
          opacity: anim4,
          transform: `translateY(anim2%) rotate(anim3deg)` }}
    />
  );
};

const Layer_particle_02: React.FC = () => {
  const frame = useCurrentFrame();
  const fps = 30; // TODO: 从 spec 传入


  // Layer visibility
  const isVisible = frame >= 0 && frame < 75;
  if (!isVisible) return null;

  const anim1 = interpolate(
    frame,
    [4, 10],
    [0, 0.75],
    { extrapolateRight: 'clamp' }
  );
  const anim2 = interpolate(
    frame,
    [4, 58],
    [140, 0],
    { extrapolateRight: 'clamp' }
  );
  const anim3 = interpolate(
    frame,
    [4, 58],
    [0, 240],
    { extrapolateRight: 'clamp' }
  );
  const anim4 = interpolate(
    frame,
    [50, 65],
    [0.75, 0],
    { extrapolateRight: 'clamp' }
  );

  return (
    <div
      style={{ ...{
      position: 'absolute',
      left: '78%',
      top: '22%',
      width: '10px',
      height: '10px',
      backgroundColor: '#000000',
      opacity: 0.75,
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
  const isVisible = frame >= 0 && frame < 75;
  if (!isVisible) return null;

  const anim1 = interpolate(
    frame,
    [10, 16],
    [0, 0.65],
    { extrapolateRight: 'clamp' }
  );
  const anim2 = interpolate(
    frame,
    [10, 62],
    [120, 0],
    { extrapolateRight: 'clamp' }
  );
  const anim3 = interpolate(
    frame,
    [10, 62],
    [1.4, 0.4],
    { extrapolateRight: 'clamp' }
  );
  const anim4 = interpolate(
    frame,
    [52, 68],
    [0.65, 0],
    { extrapolateRight: 'clamp' }
  );

  return (
    <div
      style={{ ...{
      position: 'absolute',
      left: '20%',
      top: '68%',
      width: '18px',
      height: '18px',
      backgroundColor: '#000000',
      opacity: 0.65,
      zIndex: 3
}, opacity: anim1,
          opacity: anim4,
          transform: `translateX(anim2%) scale(anim3)` }}
    />
  );
};

const Layer_particle_04: React.FC = () => {
  const frame = useCurrentFrame();
  const fps = 30; // TODO: 从 spec 传入


  // Layer visibility
  const isVisible = frame >= 0 && frame < 75;
  if (!isVisible) return null;

  const anim1 = interpolate(
    frame,
    [12, 18],
    [0, 0.7],
    { extrapolateRight: 'clamp' }
  );
  const anim2 = interpolate(
    frame,
    [12, 60],
    [150, 0],
    { extrapolateRight: 'clamp' }
  );
  const anim3 = interpolate(
    frame,
    [12, 60],
    [0, 300],
    { extrapolateRight: 'clamp' }
  );
  const anim4 = interpolate(
    frame,
    [50, 66],
    [0.7, 0],
    { extrapolateRight: 'clamp' }
  );

  return (
    <div
      style={{ ...{
      position: 'absolute',
      left: '70%',
      top: '66%',
      width: '12px',
      height: '12px',
      backgroundColor: '#000000',
      opacity: 0.7,
      zIndex: 3
}, opacity: anim1,
          opacity: anim4,
          transform: `translateX(anim2%) rotate(anim3deg)` }}
    />
  );
};

const Layer_crossfade_out_overlay: React.FC = () => {
  const frame = useCurrentFrame();
  const fps = 30; // TODO: 从 spec 传入


  // Layer visibility
  const isVisible = frame >= 60 && frame < 75;
  if (!isVisible) return null;

  const anim1 = interpolate(
    frame,
    [60, 75],
    [0, 1],
    { extrapolateRight: 'clamp' }
  );

  return (
    <div
      style={{ ...{
      position: 'absolute',
      left: '0px',
      top: '0px',
      width: '100%',
      height: '100%',
      backgroundColor: '#FFFFFF',
      opacity: 0,
      zIndex: 10
}, opacity: anim1 }}
    />
  );
};

export const Beat1: React.FC = () => {
  const frame = useCurrentFrame();
  const fps = 30;

  return (
    <AbsoluteFill style={{ backgroundColor: '#FFFFFF' }}>
      <Layer_bg_white />
      <Layer_asset_main_paper_flip />
      <Layer_hook_question_text />
      <Layer_particle_01 />
      <Layer_particle_02 />
      <Layer_particle_03 />
      <Layer_particle_04 />
      <Layer_crossfade_out_overlay />
    </AbsoluteFill>
  );
};