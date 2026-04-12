export interface EstimateData {
  estimateName: string;
  clientName: string;
  street: string;
  cityStateZip: string;
  area: string;
  tasks: string; // We'll keep this as a string for the textarea
  exceptions: string;
  totalPrice: string; // Keeping as string for the input field to handle decimals easily
}
