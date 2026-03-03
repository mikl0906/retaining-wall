import { Eta } from "eta";
import type { Model } from "./types";

let eta: Eta | null = null;
export const getEta = async () => {
  if (eta) return eta;
  eta = new Eta();
  return eta;
};

export const printHtmlToPdf = (html: string) => {
  const iframe = document.createElement("iframe");
  iframe.style.position = "fixed";
  iframe.style.right = "0";
  iframe.style.bottom = "0";
  iframe.style.width = "0";
  iframe.style.height = "0";
  iframe.style.border = "0";

  document.body.appendChild(iframe);

  const doc = iframe.contentWindow!.document;
  doc.open();
  doc.writeln(html);
  doc.close();

  iframe.contentWindow!.focus();
  iframe.contentWindow!.print();

  // Optional cleanup
  setTimeout(() => {
    document.body.removeChild(iframe);
  }, 1000);
};

export const getReportHtml = async (model: Model) => {
  const eta = await getEta();
  const template = await fetch("/report.eta").then((res) => res.text());
  return eta.renderString(template, { model });
};

export const generateReport = async (model: Model) => {
  const eta = await getEta();
  const template = await fetch("/report.eta").then((res) => res.text());
  const html = eta.renderString(template, { model });
  printHtmlToPdf(html);
};
