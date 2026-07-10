import React from 'react';
import { useCurrentFrame, AbsoluteFill, Sequence, interpolate } from 'remotion';

/**
 * Beat: Opening
 * Duration: 2s
 * Mood: Energetic
 * Techniques: clockwise_rotation
 * Generated: Template Strategy (Enhanced with Sequential Timing)
 */
export const Beat1: React.FC = () => {
  const frame = useCurrentFrame();

  const anim1 = interpolate(
    frame,
    [0, 60],
    [0, 90],
    { extrapolateRight: 'clamp' }
  );

  return (
    <AbsoluteFill
      style={{
        backgroundColor: '#FFFFFF',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {/* Assets with animations */}
      
      <img
        src="http://localhost:3001/projects/session-1783675741740-9bq119n9h/artifacts/capture/assets/1783675741178-20323911-20260708191204_93_95.jpg"
        style={{
          position: 'absolute',
          width: '80%',
          height: 'auto',
          objectFit: 'contain',
          transform: `rotate(${anim1}deg)`,
        }}
        alt="Asset 1"
      />

      {/* Narration text (if any) */}
      
    </AbsoluteFill>
  );
};
