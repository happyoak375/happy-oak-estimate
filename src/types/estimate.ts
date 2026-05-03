/**
 * Represents the current lifecycle stage of an estimate.
 */
export type EstimateStatus = "Draft" | "Sent" | "Approved" | "Declined";

/**
 * Defines a specific area or room within a painting job.
 */
export interface JobArea {
  /** Unique identifier for the job area (e.g., a UUID or generated string) */
  id: string;
  /** Name of the area (e.g., "Master Bedroom", "Exterior Deck") */
  areaName: string;
  /** Detailed description of the painting tasks to be performed */
  tasks: string;
  /** Any specific exclusions or special notes for this area */
  exceptions?: string;
  /** 
   * The cost associated with this area. 
   * @note Consider standardizing this to a strict `number` in the database to prevent string concatenation math errors.
   */
  price: string | number;
}

/**
 * Core data structure for a project estimate/proposal.
 */
export interface EstimateData {
  /** Unique identifier for the estimate (usually matches the Firestore document ID) */
  id?: string;
  /** Internal or descriptive name for the estimate */
  estimateName: string;
  /** Full name of the client */
  clientName: string;
  /** Client's email address for sending proposals via automated mailings */
  clientEmail?: string;
  /** Project street address */
  street: string;
  /** Project city, state, and ZIP code */
  cityStateZip: string;
  /** Toggle to determine if individual area prices should be visible to the client on the PDF */
  showLineItemPrices: boolean;
  /** Current status of the document */
  status: EstimateStatus;
  /** Global material exceptions or specific paints/finishes excluded or required */
  materialExceptions?: string;
  /** List of all areas and tasks included in this estimate */
  jobAreas: JobArea[];
  
  // --- SUGGESTIONS FOR FUTURE SCALABILITY ---
  
  /** Timestamp when the estimate was created */
  // createdAt?: number | Date; 
  /** Timestamp when the estimate was last modified */
  // updatedAt?: number | Date;
  /** The total calculated price of all job areas */
  // totalAmount?: number; 
}