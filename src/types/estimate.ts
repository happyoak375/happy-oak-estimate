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
  street: string;
  cityStateZip: string;
  jobAreas: JobArea[];
  showLineItemPrices: boolean;
}
