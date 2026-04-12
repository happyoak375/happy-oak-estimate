import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { EstimateData } from "@/types/estimate";

export const PDFService = {
  generateEstimatePDF(estimate: EstimateData) {
    const doc = new jsPDF();
    const footerY = 270;

    const today = new Date();
    const formattedDate = `${String(today.getMonth() + 1).padStart(2, "0")}/${String(today.getDate()).padStart(2, "0")}/${today.getFullYear()}`;

    // --- Header ---
    doc.setFontSize(12);
    doc.setFont("times", "bold");
    doc.text("23 Quimby Ln #853", 105, 12, { align: "center" });
    doc.text("Bernardsville, NJ 07924", 105, 17, { align: "center" });

    doc.setFontSize(15);
    doc.text("PROPOSAL", 105, 25, { align: "center" });

    doc.setDrawColor(200);
    doc.line(85, 37, 200, 37);

    // --- Job & Client Details ---
    let y = 45;
    
    // Left: Project Info
    doc.setFontSize(14);
    doc.setFont("times", "bold");
    doc.text("PROJECT", 10, y);
    doc.setFontSize(12);
    doc.setFont("times", "normal");
    doc.text(estimate.estimateName || "Estimate", 10, y + 6);

    // Center: Client Info
    doc.text(estimate.clientName || "Client Name", 105, y, { align: "center" });
    doc.text(estimate.street || "", 105, y + 6, { align: "center" });
    doc.text(estimate.cityStateZip || "", 105, y + 12, { align: "center" });

    // Right: Date
    doc.text(formattedDate, 200, y, { align: "right" });

    y += 22;

    // --- Area of Work ---
    if (estimate.area) {
      doc.setFont("times", "bold");
      const areaLines = doc.splitTextToSize(`Areas of work: ${estimate.area}`, 180);
      doc.text(areaLines, 10, y);
      y += (areaLines.length * 6) + 4;
    }

    doc.setFont("times", "bold");
    doc.text("Scope of Work:", 10, y);
    
    // --- Scope of Work (Using AutoTable for perfect formatting) ---
    // We split the tasks from the textarea by newlines and format them
    const tasksArray = estimate.tasks.split('\n').filter(t => t.trim() !== '').map(t => [`• ${t.trim()}`]);

    autoTable(doc, {
      startY: y + 4,
      body: tasksArray,
      theme: 'plain',
      styles: { font: "times", fontSize: 12, cellPadding: 2 },
      columnStyles: { 0: { cellWidth: 180 } },
    });

    // Get the Y position where the table ended
    y = (doc as any).lastAutoTable.finalY + 10;

    // --- Pricing ---
    const priceNum = Number(estimate.totalPrice);
    const priceText = Number.isFinite(priceNum) ? priceNum.toFixed(2) : "0.00";

    doc.setFont("times", "bold");
    doc.text(`Total: $${priceText}`, 200, y, { align: "right" });

    // --- Exceptions & Footer ---
    y += 8;
    doc.setFontSize(10);
    doc.setFont("times", "italic");

    let materialsLine = "All tools and materials necessary to do the job are included";
    if (estimate.exceptions) {
      materialsLine += ` except ${estimate.exceptions}`;
    }
    const matLines = doc.splitTextToSize(materialsLine, 180);
    doc.text(matLines, 10, y);

    // Static Footer
    doc.setDrawColor(200);
    doc.line(110, footerY - 8, 200, footerY - 8);
    doc.setTextColor(120);
    
    doc.text("Please let me know if you have any questions, suggestions or if you want to make changes.", 105, footerY, { align: "center", maxWidth: 180 });
    doc.text("Please call or text at 908-801-7100 or write to happyoak375@gmail.com", 105, footerY + 6, { align: "center", maxWidth: 180 });

    // --- Save the File ---
    const safeName = (estimate.clientName || "Client").replace(/[^a-z0-9]/gi, '_').toLowerCase();
    doc.save(`Proposal_${safeName}_${formattedDate.replace(/\//g, '')}.pdf`);
  }
};