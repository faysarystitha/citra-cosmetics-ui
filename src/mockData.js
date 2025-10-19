// ========= Seed Data =========
export const initialBanners = [
  'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=1200&h=400&fit=crop&q=80',
  'https://images.unsplash.com/photo-1556912933-91f855057811?w=1200&h=400&fit=crop&q=80',
  'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=1200&h=400&fit=crop&q=80'
];
export const initialCategories = [
  {
    id: 'makeup', name: 'Makeup', icon: '💄',
    image: 'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=400&h=400&fit=crop',
    subCategories: [
      { id: 'face', name: 'Face', subSubCategories: [{ id: 'foundation', name: 'Foundation' }, { id: 'cushion', name: 'Cushion' }] },
      { id: 'eyes', name: 'Eyes', subSubCategories: [] },
      { id: 'lips', name: 'Lips', subSubCategories: [] }
    ]
  },
  {
    id: 'skincare', name: 'Skincare', icon: '✨',
    image: 'https://images.unsplash.com/photo-1556228852-6d45a7d8e821?w=400&h=400&fit=crop',
    subCategories: [
      { id: 'cleanser', name: 'Cleanser', subSubCategories: [] },
      { id: 'moisturizer', name: 'Moisturizer', subSubCategories: [] },
      { id: 'serum', name: 'Serum', subSubCategories: [] }
    ]
  }
];
export const initialProducts = {
  makeup: [
    {
      id: 1,
      name: 'ROSE ALL DAY Liquid Lipstick',
      brand: 'BEAUTY CO',
      price: 89000, originalPrice: 125000,
      rating: 4.8, reviews: 1240,
      image: 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=400&h=400&fit=crop',
      isBestseller: true, category: 'makeup', subCategory: 'lips', subSubCategory: null,
      description: 'Lipstik cair matte tahan lama.',
      tags: ['matte','long-lasting']
    },
    {
      id: 2,
      name: 'Flawless Foundation Pro',
      brand: 'GLOW BEAUTY',
      price: 156000, originalPrice: 220000,
      rating: 4.7, reviews: 856,
      image: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=400&h=400&fit=crop',
      isNew: true, category: 'makeup', subCategory: 'face', subSubCategory: 'foundation',
      description: 'Foundation cakupan penuh.',
      tags: ['full-coverage','oil-free']
    }
  ],
  skincare: [
    {
      id: 4,
      name: 'Vitamin C Brightening Serum',
      brand: 'CLEAN SKIN',
      price: 298000, originalPrice: 420000,
      rating: 4.6, reviews: 1890,
      image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=400&fit=crop',
      isNew: true, isBestseller: true,
      category: 'skincare', subCategory: 'serum', subSubCategory: null,
      description: 'Serum pencerah Vitamin C.',
      tags: ['brightening','antioxidant']
    }
  ]
};