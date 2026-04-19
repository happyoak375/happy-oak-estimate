export interface JobArea {
  id: string;
  areaName: string;
  tasks: string;
  exceptions: string;
  price: string;
}

export interface EstimateData {
  estimateName: string;
  clientName: string;
  clientEmail: string;
  status?: string;
  street: string;
  cityStateZip: string;
  jobAreas: JobArea[];
  showLineItemPrices: boolean;
}
