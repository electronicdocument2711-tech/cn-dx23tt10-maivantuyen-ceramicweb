type Html2PdfFactory = () => {
  set: (options: Record<string, unknown>) => {
    from: (element: HTMLElement) => {
      save: () => Promise<void>;
    };
  };
};

type PdfMargin = [number, number, number, number];

export interface ExportElementToPdfOptions {
  element: HTMLElement;
  fileName: string;
  margin?: PdfMargin;
  avoidPageBreakSelectors?: string[];
}

export const sanitizePdfFileName = (value?: string) => {
  if (!value) return "";

  return value
    .trim()
    .replace(/[^\p{L}\p{N}_-]+/gu, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .toLowerCase();
};

export const exportElementToA4Pdf = async ({
  element,
  fileName,
  margin = [8, 8, 8, 8],
  avoidPageBreakSelectors = ["thead", "tr"],
}: ExportElementToPdfOptions) => {
  const html2PdfModule = await import("html2pdf.js");
  const html2pdf = (html2PdfModule.default ||
    html2PdfModule) as unknown as Html2PdfFactory;

  await html2pdf()
    .set({
      filename: fileName,
      margin,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: {
        scale: 2,
        useCORS: true,
        scrollY: 0,
      },
      jsPDF: {
        unit: "mm",
        format: "a4",
        orientation: "portrait",
      },
      pagebreak: {
        mode: ["css", "legacy"],
        avoid: avoidPageBreakSelectors,
      },
    })
    .from(element)
    .save();
};
