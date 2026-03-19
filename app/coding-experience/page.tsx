import TemplateMain from "@/components/TemplateMain";
import LuxSceneGate from "@/components/three/LuxSceneGate";

export default function CodingExperiencePage() {
  return (
    <>
      <LuxSceneGate variant="coding" />
      <TemplateMain templateKey="coding-experience" />
    </>
  );
}

