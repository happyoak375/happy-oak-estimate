export const JOB_TEMPLATES: Record<string, { tasks: string; exceptions?: string }> = {
  "Deck Refinishing": {
    tasks: "Move all items and furniture off the deck surfaces.\nSpray deck surfaces with Jo-max to kill mold and mildew.\nPressure wash all deck surfaces.\nScrape any loose paint on all surfaces.\nSand deck surfaces to prepare for staining.\nApply premium stain to deck floor boards.\nStain handrails and spindles.",
  },
  "Deck Restoration": {
    tasks: "Move all items and furniture off the deck surfaces.\nSpray deck surfaces with Jo-max to kill mold and mildew.\nPressure wash all deck surfaces.\nApply stain remover on all surfaces to remove old stain.\nSand deck surfaces to prepare for staining.\nApply premium stain to deck floor boards.\nPaint handrails and spindles.",
  },
  "Interior Painting (General)": {
    tasks: "Cover floors and furniture with drop cloths and plastic.\nPatch small holes and cracks in ceiling, walls and molding.\nApply premium caulking to baseboards, trim, and gaps.\nSand and spot-prime patched areas.\nApply two coats of premium interior paint to walls and trim.\nPaint doors and windows'\nRemove trash and vacuum work area."
  },
  "Exterior House Wash": {
    tasks: "Apply Jo-Max to house surfaces to kill mold and mildew.\nPressure wash to remove dirt, mildew, and mold.\n"
  },
  "Exterior Painting & Trim": {
    tasks: "Power wash exterior surfaces to remove loose debris and dirt.\nScrape peeling areas and feather-sand edges smooth.\nApply premium exterior primer to raw wood and Azek/PVC trim.\nApply premium exterior caulking to joints and seams to prevent water intrusion.\nApply two coats of premium coatings.",
    exceptions: "Replacement of rotten wood is not included unless specified in a Carpentry line item."
  },
  "Carpentry Repairs": {
    tasks: "Carefully remove rotted or damaged wood from designated areas.\nMeasure, cut, and install premium replacement wood or Azek/PVC boards.\nSecure all new materials with galvanized or stainless steel fasteners.\nFill nail holes and sand flush, ready for paint."
  },
  "Bathroom / Moisture-Area Painting": {
    tasks: "Protect vanity, tub, and fixtures with plastic shielding.\nTreat surfaces with mold/mildew-killing solutions where necessary.\nApply premium waterproof caulking to trim and wet-area borders.\nApply moisture-resistant, premium interior paint to walls and ceiling.",
    exceptions: "Plumbing modifications, hardware installation, or tile work not included."
  },
  "Basement / Mud Room Refinishing": {
    tasks: "Clear out and protect the work area with heavy-duty drop cloths.\nRepair scuffs, dings, and drywall damage common in high-traffic zones.\nApply premium, scuff-resistant paint to walls and trim for maximum durability.\nClean and reset the space.",
    exceptions: "Waterproofing of foundation walls is not included unless specified."
  },
  "Light Electrical / Fixture Swap": {
    tasks: "Safely disconnect power to the designated work area.\nRemove existing light fixtures or outlet covers.\nInstall new client-provided fixtures, switches, or faceplates.\nTest connections to ensure proper functionality.",
    exceptions: "Major rewiring, panel upgrades, or supplying the actual fixtures is not included."
  },
  "Gutters clean up": {
    tasks: "Clean gutters around the house."
  }
};