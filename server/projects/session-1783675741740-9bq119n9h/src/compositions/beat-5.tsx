import React from 'react';
import { useCurrentFrame, AbsoluteFill, Sequence, interpolate } from 'remotion';

/**
 * Beat: Closing
 * Duration: 2s
 * Mood: Inspiring
 * Techniques: slide_right
 * Generated: Template Strategy (Enhanced with Sequential Timing)
 */
export const Beat5: React.FC = () => {
  const frame = useCurrentFrame();

  const anim1 = interpolate(
    frame,
    [0, 60],
    [100, 0],
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
          transform: `translateX(${anim1}%)`,
        }}
        alt="Asset 1"
      />

      {/* Narration text (if any) */}
      
    </AbsoluteFill>
  );
};
