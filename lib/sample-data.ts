const sampleData = {
  categories: [
    {
      name: 'Kardus',
    },
    {
      name: 'Elektronik',
    },
    {
      name: 'Plastik',
    },
    {
      name: 'Kaleng',
    },
  ],
  products: [
    {
      name: 'Kardus Bekas',
      slug: 'kardus-bekas',
      images: ['/assets/images/kardus.jpg'],
      price: '500',
      stock: 10,
      description: 'Kardus bekas ini dijual dalam satuan kilogram.',
      isFeatured: true,
    },
    {
      name: 'Plastik Kresek',
      slug: 'plastik-kresek',
      images: ['/assets/images/plastik.jpg'],
      price: '250',
      stock: 50,
      description: 'Plastik kresek bekas ini dijual dalam satuan pcs.',
      isFeatured: true,
    },
    {
      name: 'Kaleng Bekas',
      slug: 'kaleng-bekas',
      images: ['/assets/images/kaleng.jpg'],
      price: '500',
      stock: 20,
      description: 'Kaleng bekas ini dijual dalam satuan kilogram.',
    },
    {
      name: 'Baterai AA',
      slug: 'baterai-aa-bekas',
      images: ['/assets/images/baterai-aa.jpg'],
      price: '700',
      stock: 10,
      description: 'Baterai AA bekas ini dijual dalam satuan kilogram.',
    },
  ],
}

export default sampleData
