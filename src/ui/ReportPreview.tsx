import { useRef, useEffect } from "react";
import { useModel } from "../modelStore";
import { getEta } from "../reports";

const previewStyle = `
  html, body {
    margin: 0;
    padding: 0;
  }

  body {
    background: #e5e7eb;
    padding: 20px 0;
    overflow-x: hidden;
  }

  .preview-pages {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 20px;
  }

  .preview-page {
    width: min(210mm, calc(100% - 24px));
    aspect-ratio: 210 / 297;
    background: #ffffff;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
  }

  .preview-page-content {
    height: 100%;
    box-sizing: border-box;
    padding: 6.734% 9.524%;
    overflow: hidden;
    background: #ffffff;
  }

  @media print {
    body {
      background: transparent;
      padding: 0;
    }

    .preview-pages {
      gap: 0;
    }

    .preview-page {
      width: 210mm;
      min-height: 297mm;
      box-shadow: none;
      break-after: page;
      page-break-after: always;
    }

    .preview-page-content {
      height: 297mm;
      padding: 20mm;
    }
  }
`;

const paginationScript = `
  (() => {
    if (document.body.dataset.previewPaged === "1") {
      return;
    }
    document.body.dataset.previewPaged = "1";
    const scriptEl = document.currentScript;

    const paginate = () => {
      const blocks = Array.from(document.body.children).filter(
        (node) => node !== scriptEl,
      );

      const container = document.createElement("div");
      container.className = "preview-pages";
      container.style.visibility = "hidden";
      document.body.appendChild(container);

      const createPage = () => {
        const page = document.createElement("section");
        page.className = "preview-page";

        const content = document.createElement("div");
        content.className = "preview-page-content";
        page.appendChild(content);
        container.appendChild(page);

        return content;
      };

      let currentPage = createPage();

      for (const block of blocks) {
        currentPage.appendChild(block);

        if (currentPage.scrollHeight > currentPage.clientHeight + 1) {
          currentPage.removeChild(block);
          currentPage = createPage();
          currentPage.appendChild(block);
        }
      }

      container.style.visibility = "visible";
      if (scriptEl && scriptEl.parentElement) {
        scriptEl.remove();
      }
    };

    requestAnimationFrame(() => {
      requestAnimationFrame(paginate);
    });
  })();
`;

const buildPagedPreviewHtml = (rawHtml: string) => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(rawHtml, "text/html");

  const styleEl = doc.createElement("style");
  styleEl.textContent = previewStyle;
  doc.head.appendChild(styleEl);

  const scriptEl = doc.createElement("script");
  scriptEl.textContent = paginationScript;
  doc.body.appendChild(scriptEl);

  return `<!doctype html>${doc.documentElement.outerHTML}`;
};

export function ReportPreview() {
  const frameRef = useRef<HTMLIFrameElement | null>(null);
  const model = useModel();

  useEffect(() => {
    if (!frameRef.current) return;

    const updateFrame = async () => {
      const eta = await getEta();
      const template = await fetch("/report.eta").then((res) => res.text());
      const html = eta.renderString(template, { model: model });
      const pagedPreviewHtml = buildPagedPreviewHtml(html);

      frameRef.current!.srcdoc = pagedPreviewHtml;
    };
    updateFrame();
  }, [frameRef, model]);

  return (
    <div className="h-full w-full flex flex-col">
      <iframe ref={frameRef} className="flex-1 w-full bg-white" />
    </div>
  );
}
