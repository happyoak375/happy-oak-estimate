import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { EstimateData } from "@/types/estimate";

export const PDFService = {
  async generateEstimatePDF(estimate: EstimateData) {
    const doc = new jsPDF();
    const footerY = 270;

    const today = new Date();
    const formattedDate = `${String(today.getMonth() + 1).padStart(2, "0")}/${String(today.getDate()).padStart(2, "0")}/${today.getFullYear()}`;

    // --- Load Logo ---
    const img = new window.Image();
    img.src = "/logo.png";
    await new Promise((resolve) => {
      img.onload = resolve;
      img.onerror = resolve;
    });

    doc.addImage(img, "PNG", 10, 10, 40, 25);

    // --- Header Company Info ---
    doc.setFontSize(10);
    doc.setFont("times", "normal");
    doc.text("23 Quimby Ln #853", 200, 15, { align: "right" });
    doc.text("Bernardsville, NJ 07924", 200, 20, { align: "right" });
    doc.text("Phone: 908-801-7100", 200, 25, { align: "right" });
    doc.text("Email: happyoak375@gmail.com", 200, 30, { align: "right" });

    doc.setFontSize(18);
    doc.setFont("times", "bold");
    doc.text("PROPOSAL", 105, 40, { align: "center" });

    doc.setDrawColor(34, 139, 34);
    doc.setLineWidth(0.5);
    doc.line(10, 45, 200, 45);

    // --- Job & Client Details ---
    let y = 55;

    doc.setFontSize(12);
    doc.setFont("times", "bold");
    doc.text("PROJECT DETAILS", 10, y);
    doc.setFontSize(11);
    doc.setFont("times", "normal");
    doc.text(`Name: ${estimate.estimateName || "Estimate"}`, 10, y + 6);

    doc.setFontSize(12);
    doc.setFont("times", "bold");
    doc.text("PREPARED FOR", 200, y, { align: "right" });
    doc.setFontSize(11);
    doc.setFont("times", "normal");
    doc.text(estimate.clientName || "Client Name", 200, y + 6, {
      align: "right",
    });
    doc.text(estimate.street || "", 200, y + 12, { align: "right" });
    doc.text(estimate.cityStateZip || "", 200, y + 18, { align: "right" });

    doc.setFont("times", "bold");
    doc.text(`Date: ${formattedDate}`, 200, y + 26, { align: "right" });

    y += 35;

    // --- Dynamic Scope of Work Tables ---
    let grandTotal = 0;

    estimate.jobAreas.forEach((area, index) => {
      if (y > 220) {
        doc.addPage();
        y = 20;
      }

      // --- Area Header (Now with Green Background and White Text) ---
      doc.setFillColor(34, 139, 34); 
      doc.rect(10, y - 5, 190, 7, "F"); 
      
      doc.setFontSize(12);
      doc.setFont("times", "bold");
      doc.setTextColor(255, 255, 255); 
      doc.text(area.areaName || "General Area", 12, y); 
      doc.setTextColor(0, 0, 0); 

      y += 4;

      // --- Process Tasks ---
      const tasksArray = area.tasks
        .split("\n")
        .filter((t) => t.trim() !== "")
        .map((t) => [`• ${t.trim()}`]);

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
          cellPadding: { top: 2, right: 2, bottom: 0, left: 2 } 
        },
        styles: { font: "times", fontSize: 13, cellPadding: { top: 0.5, right: 2, bottom: 0.5, left: 2 } },
      });

      y = (doc as any).lastAutoTable.finalY + 6;

      const areaPrice = Number(area.price) || 0;
      grandTotal += areaPrice;

      if (estimate.showLineItemPrices) {
        doc.setFontSize(11);
        doc.setFont("times", "italic");
        doc.text(`Area Subtotal: $${areaPrice.toFixed(2)}`, 200, y, {
          align: "right",
        });
        y += 15;
      } else {
        y += 10; 
      }
    });

    if (y > 230) {
      doc.addPage();
      y = 20;
    }

    doc.setFontSize(14);
    doc.setFont("times", "bold");
    doc.text(`TOTAL INVESTMENT: $${grandTotal.toFixed(2)}`, 200, y, {
      align: "right",
    });

    // --- Footer ---
    doc.setFontSize(10);
    doc.setFont("times", "italic");
    doc.setTextColor(80);

    const allExceptions = estimate.jobAreas
      .map((area) => area.exceptions?.trim())
      .filter((exc) => exc && exc !== "");
    const uniqueExceptions = Array.from(new Set(allExceptions));

    let materialsLine = "All tools and materials necessary to do the job are included";
    if (uniqueExceptions.length > 0) {
      materialsLine += ` except: ${uniqueExceptions.join(", ")}.`;
    } else {
      materialsLine += ".";
    }

    const matLines = doc.splitTextToSize(materialsLine, 180);
    doc.text(matLines, 10, footerY - 15);

    doc.setDrawColor(200);
    doc.line(10, footerY - 5, 200, footerY - 5);

    doc.setFont("times", "normal");
    doc.text(
      "Thank you for your business. Please let us know if you have any questions or requested changes.",
      105,
      footerY,
      { align: "center" },
    );

    // --- Save the File (DOWNLOAD ONLY) ---
    const rightNow = new Date();
    const mm = String(rightNow.getMonth() + 1).padStart(2, "0");
    const dd = String(rightNow.getDate()).padStart(2, "0");
    const yyyy = rightNow.getFullYear();
    const dateString = `${mm}${dd}${yyyy}`;

    const safeEstimateName = (estimate.estimateName || "Estimate")
      .replace(/[^a-z0-9]/gi, "_")
      .replace(/_+/g, "_"); 

    doc.save(`Proposal-${dateString}-${safeEstimateName}.pdf`);
  },

  async generateEstimatePDFBase64(estimate: EstimateData) {
    const doc = new jsPDF();
    const footerY = 270;

    const today = new Date();
    const formattedDate = `${String(today.getMonth() + 1).padStart(2, "0")}/${String(today.getDate()).padStart(2, "0")}/${today.getFullYear()}`;

    // --- Load Logo ---
    const img = new window.Image();
    img.src = "/logo.png";
    await new Promise((resolve) => {
      img.onload = resolve;
      img.onerror = resolve;
    });

    doc.addImage(img, "PNG", 10, 10, 40, 25);

    // --- Header Company Info ---
    doc.setFontSize(10);
    doc.setFont("times", "normal");
    doc.text("23 Quimby Ln #853", 200, 15, { align: "right" });
    doc.text("Bernardsville, NJ 07924", 200, 20, { align: "right" });
    doc.text("Phone: 908-801-7100", 200, 25, { align: "right" });
    doc.text("Email: happyoak375@gmail.com", 200, 30, { align: "right" });

    doc.setFontSize(18);
    doc.setFont("times", "bold");
    doc.text("PROPOSAL", 105, 40, { align: "center" });

    doc.setDrawColor(34, 139, 34);
    doc.setLineWidth(0.5);
    doc.line(10, 45, 200, 45);

    let y = 55;

    doc.setFontSize(12);
    doc.setFont("times", "bold");
    doc.text("PROJECT DETAILS", 10, y);
    doc.setFontSize(11);
    doc.setFont("times", "normal");
    doc.text(`Name: ${estimate.estimateName || "Estimate"}`, 10, y + 6);

    doc.setFontSize(12);
    doc.setFont("times", "bold");
    doc.text("PREPARED FOR", 200, y, { align: "right" });
    doc.setFontSize(11);
    doc.setFont("times", "normal");
    doc.text(estimate.clientName || "Client Name", 200, y + 6, {
      align: "right",
    });
    doc.text(estimate.street || "", 200, y + 12, { align: "right" });
    doc.text(estimate.cityStateZip || "", 200, y + 18, { align: "right" });

    doc.setFont("times", "bold");
    doc.text(`Date: ${formattedDate}`, 200, y + 26, { align: "right" });

    y += 35;

    let grandTotal = 0;

    estimate.jobAreas.forEach((area, index) => {
      if (y > 220) {
        doc.addPage();
        y = 20;
      }

      // --- Area Header (Synced styles) ---
      doc.setFillColor(34, 139, 34); 
      doc.rect(10, y - 5, 190, 7, "F"); 
      
      doc.setFontSize(12);
      doc.setFont("times", "bold");
      doc.setTextColor(255, 255, 255); 
      doc.text(area.areaName || "General Area", 12, y); 
      doc.setTextColor(0, 0, 0); 

      y += 4;

      // --- Process Tasks (Synced styles) ---
      const tasksArray = area.tasks
        .split("\n")
        .filter((t) => t.trim() !== "")
        .map((t) => [`• ${t.trim()}`]);

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
          cellPadding: { top: 2, right: 2, bottom: 0, left: 2 } 
        },
        styles: { font: "times", fontSize: 13, cellPadding: { top: 0.5, right: 2, bottom: 0.5, left: 2 } },
      });

      y = (doc as any).lastAutoTable.finalY + 6;

      const areaPrice = Number(area.price) || 0;
      grandTotal += areaPrice;

      if (estimate.showLineItemPrices) {
        doc.setFontSize(11);
        doc.setFont("times", "italic");
        doc.text(`Area Subtotal: $${areaPrice.toFixed(2)}`, 200, y, {
          align: "right",
        });
        y += 15;
      } else {
        y += 10; 
      }
    });

    if (y > 230) {
      doc.addPage();
      y = 20;
    }

    doc.setFontSize(14);
    doc.setFont("times", "bold");
    doc.text(`TOTAL INVESTMENT: $${grandTotal.toFixed(2)}`, 200, y, {
      align: "right",
    });

    // --- Footer ---
    doc.setFontSize(10);
    doc.setFont("times", "italic");
    doc.setTextColor(80);

    const allExceptions = estimate.jobAreas
      .map((area) => area.exceptions?.trim())
      .filter((exc) => exc && exc !== "");
    const uniqueExceptions = Array.from(new Set(allExceptions));

    let materialsLine = "All tools and materials necessary to do the job are included";
    if (uniqueExceptions.length > 0) {
      materialsLine += ` except: ${uniqueExceptions.join(", ")}.`;
    } else {
      materialsLine += ".";
    }

    const matLines = doc.splitTextToSize(materialsLine, 180);
    doc.text(matLines, 10, footerY - 15);

    doc.setDrawColor(200);
    doc.line(10, footerY - 5, 200, footerY - 5);

    doc.setFont("times", "normal");
    doc.text(
      "Thank you for your business. Please let us know if you have any questions or requested changes.",
      105,
      footerY,
      { align: "center" },
    );

    // --- Return the File Data (FOR EMAIL ATTACHMENT ONLY) ---
    return doc.output("datauristring").split(",")[1];
  },
};