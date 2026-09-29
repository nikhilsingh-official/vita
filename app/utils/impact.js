const ACTUAL_ITEMS_BASIS = 'Actual counts'

export function getItemsLabel(impact) {
  return impact.itemsBasis === ACTUAL_ITEMS_BASIS ? 'Items served' : 'Items recorded'
}

export function sumAmountRaised(stalls) {
  return stalls.reduce((total, stall) => total + (stall.impact.amountRaised ?? 0), 0)
}

export function getAmountLabel(stall) {
  return stall.status === 'upcoming' ? 'Expected amount' : 'Amount raised'
}
