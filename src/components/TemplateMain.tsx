import type { TemplateKey } from "@/lib/templateMain";
import { getTemplateMainHtml } from "@/lib/templateMain";

export default function TemplateMain({ templateKey }: { templateKey: TemplateKey }) {
  const html = getTemplateMainHtml(templateKey);

  return <div dangerouslySetInnerHTML={{ __html: html }} />;
}

