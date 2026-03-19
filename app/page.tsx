import TemplateMain from "@/components/TemplateMain";
import LuxSceneGate from "@/components/three/LuxSceneGate";

export default function HomePage() {
  return (
    <>
      <LuxSceneGate variant="home" />
      <TemplateMain templateKey="home" />
    </>
  );
}

