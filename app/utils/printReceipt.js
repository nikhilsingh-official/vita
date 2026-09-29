const PX_PER_MM = 96 / 25.4
const PAPER_WIDTH_MM = 58
const FEED_MM = 12

// Chrome ignores `size: 58mm auto`, so the page height is set to the
// receipt's measured height. `html.printing-receipt` hides everything else.
export function printReceipt(element) {
  const heightMm = Math.ceil(element.getBoundingClientRect().height / PX_PER_MM) + FEED_MM
  const pageStyle = document.createElement('style')
  pageStyle.textContent = `@page { size: ${PAPER_WIDTH_MM}mm ${heightMm}mm; margin: 0; }`
  document.head.append(pageStyle)
  element.classList.add('receipt--printing')
  document.documentElement.classList.add('printing-receipt')

  window.addEventListener(
    'afterprint',
    () => {
      pageStyle.remove()
      element.classList.remove('receipt--printing')
      document.documentElement.classList.remove('printing-receipt')
    },
    { once: true },
  )
  window.print()
}
