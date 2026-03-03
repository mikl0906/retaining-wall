import { useRef, useEffect } from "react";
import { useModel } from "../modelStore";
import { getEta } from "../reports";

export function ReportPreview() {
  const frameRef = useRef<HTMLIFrameElement | null>(null);
  const model = useModel();

  useEffect(() => {
    if (!frameRef.current) return;

    const updateFrame = async () => {
      const eta = await getEta();
      const template = await fetch("/report.eta").then((res) => res.text());
      const html = eta.renderString(template, { model: model });

      frameRef.current!.srcdoc = html;
    };
    updateFrame();
  }, [frameRef, model]);

  return <iframe ref={frameRef} className="bg-white h-full w-full"></iframe>;
}
