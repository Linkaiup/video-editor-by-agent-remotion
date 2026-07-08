import { useCurrentFrame, useVideoConfig, interpolate, spring } from 'remotion';

export const HelloWorld: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, height, fps } = useVideoConfig();

  // Fade in animation
  const opacity = interpolate(frame, [0, 30], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Scale animation with spring
  const scale = spring({
    frame: frame - 10,
    fps,
    config: {
      damping: 100,
      stiffness: 200,
    },
  });

  return (
    <div
      style={{
        flex: 1,
        backgroundColor: '#F7F4EF',
        justifyContent: 'center',
        alignItems: 'center',
        display: 'flex',
        flexDirection: 'column',
        width,
        height,
      }}
    >
      <div
        style={{
          opacity,
          transform: `scale(${scale})`,
        }}
      >
        <h1
          style={{
            fontSize: 120,
            fontWeight: 700,
            fontFamily: 'Inter, sans-serif',
            color: '#1F2421',
            marginBottom: 20,
            textAlign: 'center',
          }}
        >
          Remotion Agent
        </h1>
        <p
          style={{
            fontSize: 40,
            fontWeight: 300,
            fontFamily: 'Inter, sans-serif',
            color: '#5C635D',
            textAlign: 'center',
            maxWidth: 800,
          }}
        >
          AI-powered video editing with natural language
        </p>
      </div>
    </div>
  );
};
