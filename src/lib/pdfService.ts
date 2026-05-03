import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { EstimateData } from "@/types/estimate";

type AutoTableDocument = jsPDF & {
  lastAutoTable?: {
    finalY: number;
  };
};

/**
 * Safely retrieves the Y-coordinate where the last autoTable ended.
 * Crucial for dynamic pagination when tasks overflow a single page.
 */
function getLastAutoTableY(doc: jsPDF) {
  return (doc as AutoTableDocument).lastAutoTable?.finalY || 20;
}

/**
 * Generates a standardized, timestamped file name for the PDF download.
 * Cleans the estimate name to prevent invalid characters in the filename.
 */
function getProposalFileName(estimate: EstimateData) {
  const rightNow = new Date();
  const dateString = `${String(rightNow.getMonth() + 1).padStart(2, "0")}${String(
    rightNow.getDate(),
  ).padStart(2, "0")}${rightNow.getFullYear()}`;
  const safeEstimateName = (estimate.estimateName || "Estimate").replace(/[^a-z0-9]/gi, "_");

  return `Proposal-${dateString}-${safeEstimateName}.pdf`;
}

/**
 * Asynchronously loads the company logo for the PDF header.
 * @note Includes an SSR guard. If this runs on the Next.js server (e.g., API route), 
 * it gracefully returns null to prevent a `window is not defined` crash.
 */
async function loadLogo() {
  if (typeof window === "undefined") {
    console.warn("loadLogo called on the server. Logo skipped to prevent SSR crash.");
    return null;
  }

  const img = new window.Image();
  img.src = "/logo.png";

  await new Promise<void>((resolve) => {
    img.onload = () => resolve();
    img.onerror = () => resolve();
  });

  return img;
}

/**
 * Constructs the entire visual layout of the PDF document.
 * Handles styling, dynamic pagination, and nested data tables.
 */
async function buildEstimatePDF(estimate: EstimateData) {
  const doc = new jsPDF();
  const footerY = 280;

  const today = new Date();
  const formattedDate = `${String(today.getMonth() + 1).padStart(2, "0")}/${String(
    today.getDate(),
  ).padStart(2, "0")}/${today.getFullYear()}`;

  // Apply SSR guard check before adding image
  const img = await loadLogo();
  if (img) {
    doc.addImage(img, "PNG", 10, 10, 40, 25);
  }

  doc.setFontSize(10);
  doc.setFont("times", "normal");
  doc.text("23 Quimby Ln #853", 200, 15, { align: "right" });
  doc.text("Bernardsville, NJ 07924", 200, 20, { align: "right" });
  doc.text("Phone: 908-801-7100", 200, 25, { align: "right" });
  doc.text("Email: happyoak375@gmail.com", 200, 30, { align: "right" });

  doc.setFontSize(18);
  doc.setFont("times", "bold");
  doc.text("PROPOSAL", 105, 38, { align: "center" });

  doc.setDrawColor(34, 139, 34);
  doc.setLineWidth(0.5);
  doc.line(10, 42, 200, 42);

  let y = 50;

  doc.setFontSize(11);
  doc.setFont("times", "bold");
  doc.text("PROJECT DETAILS", 10, y);
  doc.setFont("times", "normal");
  doc.text(`Name: ${estimate.estimateName || "Estimate"}`, 10, y + 5);

  doc.setFont("times", "bold");
  doc.text("PREPARED FOR", 200, y, { align: "right" });
  doc.setFont("times", "normal");
  doc.text(estimate.clientName || "Client Name", 200, y + 5, { align: "right" });
  doc.text(estimate.street || "", 200, y + 10, { align: "right" });
  doc.text(estimate.cityStateZip || "", 200, y + 15, { align: "right" });

  doc.setFont("times", "bold");
  doc.text(`Date: ${formattedDate}`, 200, y + 22, { align: "right" });

  y += 30;

  let grandTotal = 0;

  estimate.jobAreas.forEach((area) => {
    if (y > 250) {
      doc.addPage();
      y = 20;
    }

    const areaPrice = Number(area.price) || 0;
    grandTotal += areaPrice;

    doc.setFillColor(34, 139, 34);
    doc.rect(10, y - 5, 190, 7, "F");

    doc.setFontSize(12);
    doc.setFont("times", "bold");
    doc.setTextColor(255, 255, 255);
    doc.text(area.areaName || "General Area", 12, y);

    if (estimate.showLineItemPrices) {
      doc.text(`$${areaPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}`, 198, y, {
        align: "right",
      });
    }

    doc.setTextColor(0, 0, 0);
    y += 2;

    const tasksArray = area.tasks
      .split("\n")
      .filter((task) => task.trim() !== "")
      .map((task) => [`• ${task.trim()}`]);

    autoTable(doc, {
      startY: y,
      head: [["SCOPE OF WORK"]],
      body: tasksArray.length > 0 ? tasksArray : [["No tasks provided"]],
      theme: "plain",
      headStyles: {
        fillColor: [255, 255, 255],
        textColor: [34, 139, 34],
        font: "times",
        fontStyle: "bold",
        cellPadding: { top: 1, right: 2, bottom: 0, left: 2 },
      },
      styles: {
        font: "times",
        fontSize: 11,
        cellPadding: { top: 0.5, right: 2, bottom: 0.5, left: 2 },
      },
    });

    y = getLastAutoTableY(doc) + 4;

    if (area.exceptions && area.exceptions.trim() !== "") {
      doc.setFontSize(10);
      doc.setFont("times", "italic");
      doc.setTextColor(100, 100, 100);
      doc.text(`Exceptions: ${area.exceptions.trim()}`, 12, y);
      doc.setTextColor(0, 0, 0);
      y += 6;
    } else {
      y += 4;
    }
  });

  if (y > 255) {
    doc.addPage();
    y = 20;
  }

  doc.setFontSize(14);
  doc.setFont("times", "bold");
  doc.text(`TOTAL INVESTMENT: $${grandTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}`, 200, y, {
    align: "right",
  });

  doc.setFontSize(9);
  doc.setFont("times", "italic");
  doc.setTextColor(80);

  let materialsLine = "All tools and materials necessary to do the job are included";
  if (estimate.materialExceptions && estimate.materialExceptions.trim() !== "") {
    materialsLine += ` except: ${estimate.materialExceptions.trim()}.`;
  } else {
    materialsLine += ".";
  }

  const matLines = doc.splitTextToSize(materialsLine, 180);
  doc.text(matLines, 10, footerY - 12);

  doc.setDrawColor(200);
  doc.line(10, footerY - 5, 200, footerY - 5);

  doc.setFont("times", "normal");
  doc.text(
    "Thank you for your business. Please let us know if you have any questions or requested changes.",
    105,
    footerY,
    { align: "center" },
  );

  return doc;
}

/**
 * Service to handle the generation and exporting of PDF proposals.
 */
export const PDFService = {
  /**
   * Generates the PDF and immediately triggers a browser download.
   */
  async generateEstimatePDF(estimate: EstimateData) {
    const doc = await buildEstimatePDF(estimate);
    doc.save(getProposalFileName(estimate));
  },

  /**
   * Generates the PDF and returns it as a Base64 string.
   * Useful for attaching the document to automated emails.
   */
  async generateEstimatePDFBase64(estimate: EstimateData) {
    const doc = await buildEstimatePDF(estimate);
    return doc.output("datauristring").split(",")[1];
  },
};