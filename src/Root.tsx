import { Composition, registerRoot } from 'remotion';
import { HelloWorld } from './compositions/HelloWorld';
import { comp_1783414654750_j64zsm2nf as Comp_comp_1783414654750_j64zsm2nf } from './compositions/comp-1783414654750-j64zsm2nf';

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="HelloWorld"
        component={HelloWorld}
        durationInFrames={150}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="comp-1783414654750-j64zsm2nf"
        component={Comp_comp_1783414654750_j64zsm2nf}
        durationInFrames={150}
        fps={30}
        width={1920}
        height={1080}
      />
    </>
  );
};

registerRoot(RemotionRoot);
