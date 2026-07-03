/** ratio 1 : 1 : 2 : 2 : 1 + actions (fixed width so header/rows align) */
const actionsCol = "2.5rem";

export const movementRowGridClass = [
  `grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,2fr)_${actionsCol}]`,
  "gap-x-4 px-4",
  `sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,2fr)_minmax(0,1fr)_${actionsCol}]`,
  `md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,2fr)_minmax(0,2fr)_minmax(0,1fr)_${actionsCol}]`,
].join(" ");
