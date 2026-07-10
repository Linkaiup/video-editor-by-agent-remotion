import React from 'react';
import { Composition, Sequence, registerRoot } from 'remotion';
import { Beat1 } from './compositions/beat-1';
import { Beat2 } from './compositions/beat-2';
import { Beat3 } from './compositions/beat-3';
import { Beat4 } from './compositions/beat-4';
import { Beat5 } from './compositions/beat-5';

// 主视频组件
const GeneratedVideo: React.FC = () => {
  return (
    <div style={{ flex: 1, backgroundColor: '#fff' }}>
      <Sequence from={0} durationInFrames={60}>
        <Beat1 />
      </Sequence>
      <Sequence from={60} durationInFrames={60}>
        <Beat2 />
      </Sequence>
      <Sequence from={120} durationInFrames={60}>
        <Beat3 />
      </Sequence>
      <Sequence from={180} durationInFrames={60}>
        <Beat4 />
      </Sequence>
      <Sequence from={240} durationInFrames={60}>
        <Beat5 />
      </Sequence>
    </div>
  );
};

// Remotion Root
export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="GeneratedVideo"
        component={GeneratedVideo}
        durationInFrames={300}
        fps={30}
        width={1920}
        height={1080}
      />
    </>
  );
};

// 注册根组件
registerRoot(RemotionRoot);
