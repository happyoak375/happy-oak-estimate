export const JOB_TEMPLATES: Record<string, { tasks: string; exceptions?: string }> = {
  "Deck Refinishing": {
    tasks: "Move all items and furniture off the deck surfaces.\nSpray deck surfaces with Jo-max to kill mold and mildew.\nPressure wash all deck surfaces.\nSand deck surfaces to prepare for staining.\nApply premium stain to all surfaces.",
    exceptions: "Structural repairs not included unless specified."
  },
  "Interior Painting": {
    tasks: "Cover floors and furniture with drop cloths.\nPatch small holes and cracks in walls.\nSand and prime patched areas.\nApply two coats of premium paint.\nRemove trash and vacuum work area.",
    exceptions: "Moving of heavy electronics/pianos not included."
  },
  "Exterior House Wash": {
    tasks: "Apply eco-friendly detergent to siding.\nLow-pressure wash to remove dirt and oxidation.\nHand-scrub heavily soiled areas.\nClean exterior of all windows.",
    exceptions: "Oxidation removal on gutters may require extra fee."
  }
};