import React from 'react';
import { AbsoluteFill, useCurrentFrame, interpolate, Img } from 'remotion';

/**
 * Generated from VideoSpec DSL
 * ID: beat-3
 * Complexity: complex
 */

const Layer_image_core_content: React.FC = () => {
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
    [10, 55],
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
      width: '78%',
      height: '78%',
      opacity: 1,
      zIndex: 2,
      objectFit: 'contain'
}, opacity: anim1,
          opacity: anim5,
          transform: `perspective(1000px) rotateY(anim2deg) perspective(1000px) rotateX(anim3 * 0deg) rotateY(anim3 * 0deg) rotateZ(anim3 * 360deg) scale(anim4)` }}
    />
  );
};

const Layer_title_key_points: React.FC = () => {
  const frame = useCurrentFrame();
  const fps = 30; // TODO: 从 spec 传入


  // Layer visibility
  const isVisible = frame >= 0 && frame < 75;
  if (!isVisible) return null;

  const anim1 = interpolate(
    frame,
    [8, 18],
    [0, 1],
    { extrapolateRight: 'clamp' }
  );
  const anim2 = interpolate(
    frame,
    [8, 22],
    [24, 0],
    { extrapolateRight: 'clamp' }
  );
  const anim3 = interpolate(
    frame,
    [63, 75],
    [1, 0],
    { extrapolateRight: 'clamp' }
  );

  return (
    <div
      style={{ ...{
      position: 'absolute',
      left: '50%',
      top: '12%',
      width: '80%',
      height: '10%',
      opacity: 1,
      zIndex: 4,
      color: '#000000',
      fontSize: 54,
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

const Layer_subtitle_professional_info: React.FC = () => {
  const frame = useCurrentFrame();
  const fps = 30; // TODO: 从 spec 传入


  // Layer visibility
  const isVisible = frame >= 0 && frame < 75;
  if (!isVisible) return null;

  const anim1 = interpolate(
    frame,
    [16, 28],
    [0, 1],
    { extrapolateRight: 'clamp' }
  );
  const anim2 = interpolate(
    frame,
    [16, 30],
    [18, 0],
    { extrapolateRight: 'clamp' }
  );
  const anim3 = interpolate(
    frame,
    [63, 75],
    [1, 0],
    { extrapolateRight: 'clamp' }
  );

  return (
    <div
      style={{ ...{
      position: 'absolute',
      left: '50%',
      top: '86%',
      width: '70%',
      height: '8%',
      opacity: 1,
      zIndex: 4,
      color: '#000000',
      fontSize: 32,
      fontFamily: 'Inter',
      fontWeight: 500,
      textAlign: 'center'
}, opacity: anim1,
          opacity: anim3,
          transform: `translateY(anim2%)` }}
    >
      展示关键信息点
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
    [12, 22],
    [0, 1],
    { extrapolateRight: 'clamp' }
  );
  const anim2 = interpolate(
    frame,
    [12, 58],
    [42, 0],
    { extrapolateRight: 'clamp' }
  );
  const anim3 = interpolate(
    frame,
    [48, 65],
    [1, 0],
    { extrapolateRight: 'clamp' }
  );

  return (
    <div
      style={{ ...{
      position: 'absolute',
      left: '18%',
      top: '68%',
      width: '8px',
      height: '8px',
      opacity: 0.35,
      zIndex: 1,
      backgroundColor: '#000000'
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
  const isVisible = frame >= 0 && frame < 75;
  if (!isVisible) return null;

  const anim1 = interpolate(
    frame,
    [15, 25],
    [0, 1],
    { extrapolateRight: 'clamp' }
  );
  const anim2 = interpolate(
    frame,
    [15, 60],
    [54, 0],
    { extrapolateRight: 'clamp' }
  );
  const anim3 = interpolate(
    frame,
    [50, 68],
    [1, 0],
    { extrapolateRight: 'clamp' }
  );

  return (
    <div
      style={{ ...{
      position: 'absolute',
      left: '78%',
      top: '65%',
      width: '6px',
      height: '6px',
      opacity: 0.28,
      zIndex: 1,
      backgroundColor: '#000000'
}, opacity: anim1,
          opacity: anim3,
          transform: `translateY(anim2%)` }}
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
    [18, 28],
    [0, 1],
    { extrapolateRight: 'clamp' }
  );
  const anim2 = interpolate(
    frame,
    [18, 58],
    [28, 0],
    { extrapolateRight: 'clamp' }
  );
  const anim3 = interpolate(
    frame,
    [50, 70],
    [1, 0],
    { extrapolateRight: 'clamp' }
  );

  return (
    <div
      style={{ ...{
      position: 'absolute',
      left: '24%',
      top: '34%',
      width: '5px',
      height: '5px',
      opacity: 0.22,
      zIndex: 1,
      backgroundColor: '#000000'
}, opacity: anim1,
          opacity: anim3,
          transform: `translateX(anim2%)` }}
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
    [20, 30],
    [0, 1],
    { extrapolateRight: 'clamp' }
  );
  const anim2 = interpolate(
    frame,
    [20, 62],
    [36, 0],
    { extrapolateRight: 'clamp' }
  );
  const anim3 = interpolate(
    frame,
    [52, 72],
    [1, 0],
    { extrapolateRight: 'clamp' }
  );

  return (
    <div
      style={{ ...{
      position: 'absolute',
      left: '72%',
      top: '30%',
      width: '7px',
      height: '7px',
      opacity: 0.24,
      zIndex: 1,
      backgroundColor: '#000000'
}, opacity: anim1,
          opacity: anim3,
          transform: `translateX(anim2%)` }}
    />
  );
};

const Layer_soft_frame_line: React.FC = () => {
  const frame = useCurrentFrame();
  const fps = 30; // TODO: 从 spec 传入


  // Layer visibility
  const isVisible = frame >= 0 && frame < 75;
  if (!isVisible) return null;

  const anim1 = interpolate(
    frame,
    [12, 26],
    [0, 1],
    { extrapolateRight: 'clamp' }
  );
  const anim2 = interpolate(
    frame,
    [12, 55],
    [0.98, 1],
    { extrapolateRight: 'clamp' }
  );
  const anim3 = interpolate(
    frame,
    [60, 75],
    [1, 0],
    { extrapolateRight: 'clamp' }
  );

  return (
    <div
      style={{ ...{
      position: 'absolute',
      left: '50%',
      top: '50%',
      width: '82%',
      height: '82%',
      opacity: 0.08,
      zIndex: 3,
      backgroundColor: '#000000'
}, opacity: anim1,
          opacity: anim3,
          transform: `scale(anim2)` }}
    />
  );
};

export const Beat3: React.FC = () => {
  const frame = useCurrentFrame();
  const fps = 30;

  return (
    <AbsoluteFill style={{ backgroundColor: '#FFFFFF' }}>
      <Layer_image_core_content />
      <Layer_title_key_points />
      <Layer_subtitle_professional_info />
      <Layer_particle_01 />
      <Layer_particle_02 />
      <Layer_particle_03 />
      <Layer_particle_04 />
      <Layer_soft_frame_line />
    </AbsoluteFill>
  );
};