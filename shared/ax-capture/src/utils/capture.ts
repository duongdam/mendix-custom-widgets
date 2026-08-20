import html2canvas from "html2canvas-pro";
import type { jsPDF as JsPDFCtor } from "jspdf";
// jsPDF's default ESM build lazy-loads optional add-ons (canvg, dompurify, html2canvas) via
// dynamic import(), which the widget bundler can't code-split into a single output file.
// The UMD build has those add-ons stripped out and only static imports, so it bundles cleanly.
// It ships no bundled types of its own — typed via the "jspdf" import above instead.
// @ts-expect-error -- no declaration file for this subpath
import { jsPDF as UntypedJsPDF } from "jspdf/dist/jspdf.umd.min.js";

const jsPDF = UntypedJsPDF as unknown as typeof JsPDFCtor;

export type CaptureFormat = "png" | "pdf";

function findTargetElement(name: string): HTMLElement | null {
    if (!name) {
        return null;
    }
    return document.querySelector<HTMLElement>(`.mx-name-${CSS.escape(name)}`);
}

function yieldToBrowser(): Promise<void> {
    // A plain macrotask, not requestAnimationFrame: rAF callbacks are suspended while the
    // document is hidden/backgrounded, which would hang the capture indefinitely.
    return new Promise(resolve => setTimeout(resolve, 0));
}

function buildFileName(fileName: string, extension: string): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    return `${fileName}_${year}-${month}-${day}_${now.getTime()}.${extension}`;
}

function triggerDownload(blob: Blob, fileName: string): void {
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = fileName;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    URL.revokeObjectURL(url);
}

function canvasToPngBlob(canvas: HTMLCanvasElement): Promise<Blob> {
    return new Promise((resolve, reject) => {
        canvas.toBlob(blob => {
            if (blob) {
                resolve(blob);
            } else {
                reject(new Error("Failed to encode canvas as PNG"));
            }
        }, "image/png");
    });
}

function downloadAsPdf(canvas: HTMLCanvasElement, fileName: string): void {
    const pdf = new jsPDF({
        orientation: canvas.width >= canvas.height ? "landscape" : "portrait",
        unit: "px",
        format: [canvas.width, canvas.height]
    });
    pdf.addImage(canvas.toDataURL("image/png"), "PNG", 0, 0, canvas.width, canvas.height);
    pdf.save(buildFileName(fileName, "pdf"));
}

export async function captureElement(targetName: string, fileName: string, format: CaptureFormat): Promise<void> {
    const element = findTargetElement(targetName);
    if (!element) {
        console.warn(`AxCapture: no element found with name "${targetName}" (expected class "mx-name-${targetName}")`);
        return;
    }

    // Yield to the browser first so the "capturing" UI state paints before the
    // heavy synchronous DOM-to-canvas work below runs.
    await yieldToBrowser();

    const canvas = await html2canvas(element, {
        backgroundColor: "#ffffff",
        useCORS: true,
        logging: false,
        scale: Math.min(window.devicePixelRatio || 1, 2)
    });

    if (format === "pdf") {
        downloadAsPdf(canvas, fileName);
    } else {
        triggerDownload(await canvasToPngBlob(canvas), buildFileName(fileName, "png"));
    }
}
