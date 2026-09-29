const testimonialImages = [
  ['1000067785', 'Handwritten note describing the Project Vita stall as a wholesome experience and its community work as commendable'],
  ['1000067786', 'Handwritten note praising how Project Vita has grown, its products and the good cause it supports'],
  ['1000067787', 'Handwritten note praising Project Vita for helping students contribute to the community through enjoyable, meaningful meals'],
  ['1000067788', 'Handwritten note praising the organisation of Project Vita and the benefit its work brings to society'],
  ['1000067789', 'Handwritten note celebrating Project Vita food stalls at school events'],
  ['1000067790', 'Handwritten note saying Project Vita does great work for the community and that the writer loves its stalls'],
  ['1000067791', 'Handwritten note congratulating everyone involved in Project Vita for supporting the local community and social good'],
  ['1000067792', 'Handwritten note reflecting on how each Project Vita event contributes to helping others'],
  ['1000067793', 'Handwritten note appreciating the students behind Project Vita and their work for the surrounding community'],
  ['1000067794', 'Handwritten note describing Project Vita as a platform that gives students opportunities to use their learning for a good cause'],
  ['1000067795', 'Handwritten note praising Project Vita products, reasonable prices and the care shown by the team'],
]

export const testimonials = testimonialImages.map(([id, alt]) => ({
  id,
  src: `/testimonials/${id}.jpg`,
  alt,
}))
