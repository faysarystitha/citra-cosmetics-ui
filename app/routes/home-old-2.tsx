import React, { useMemo, useState, useEffect, createContext, useContext } from "react";
// --- Add these ---
import { Button } from "app/components/ui/button";
import { Input } from "app/components/ui/input";
import { Card, CardContent } from "app/components/ui/card";

// --- Add Heart and Minus to your lucide import ---
import { 
  Search, ShoppingCart, User, Star, ChevronRight, X, Plus, Edit, 
  Trash2, Save, AlertTriangle, ChevronDown, LayoutDashboard, 
  Image as ImageIcon, List, Menu, 
  Heart,
  Minus 
} from 'lucide-react';
import { initialBanners, initialCategories, initialProducts } from "src/mockData-old";

export default function BeautyEcommerce() {
  const [currentBanner, setCurrentBanner] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedSubCategory, setSelectedSubCategory] = useState<string | null>(null);
  const [selectedSubSubCategory, setSelectedSubSubCategory] = useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [cart, setCart] = useState<any[]>([]);
  const [showCart, setShowCart] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showCategoryMenu, setShowCategoryMenu] = useState(false);
  const [favorites, setFavorites] = useState<number[]>([]);
  const [currentPage, setCurrentPage] = useState<'promo' | 'category'>('promo');

  // Flatten all products
  const allProducts = useMemo(() => {
    // return [...initialProducts.makeup, ...initialProducts.skincare];
    return [...initialProducts.skincare];
  }, []);

  // Filter products with category-centric approach
  const filteredProducts = useMemo(() => {
    let products = allProducts;

    if (selectedCategory) {
      products = products.filter(p => p.category === selectedCategory);
    }

    if (selectedSubCategory) {
      products = products.filter(p => p.subCategory === selectedSubCategory);
    }

    if (selectedSubSubCategory) {
      products = products.filter(p => p.subSubCategory === selectedSubSubCategory);
    }

    if (searchQuery) {
      products = products.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    return products;
  }, [allProducts, selectedCategory, selectedSubCategory, selectedSubSubCategory, searchQuery]);

  // Get current category data
  const currentCategoryData = useMemo(() => {
    if (!selectedCategory) return null;
    return initialCategories.find(cat => cat.id === selectedCategory);
  }, [selectedCategory]);

  // Reset sub-categories when main category changes
  React.useEffect(() => {
    setSelectedSubCategory(null);
    setSelectedSubSubCategory(null);
  }, [selectedCategory]);

  // Cart functions
  const addToCart = (product: any) => {
    const existing = cart.find(item => item.id === product.id);
    if (existing) {
      setCart(cart.map(item =>
        item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
      ));
    } else {
      setCart([...cart, { ...product, quantity: 1 }]);
    }
  };

  const updateQuantity = (id: number, delta: number) => {
    setCart(cart.map(item =>
      item.id === id ? { ...item, quantity: Math.max(1, item.quantity + delta) } : item
    ).filter(item => item.quantity > 0));
  };

  const removeFromCart = (id: number) => {
    setCart(cart.filter(item => item.id !== id));
  };

  const toggleFavorite = (id: number) => {
    setFavorites(prev =>
      prev.includes(id) ? prev.filter(fid => fid !== id) : [...prev, id]
    );
  };

  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  // Banner auto-rotate
  React.useEffect(() => {
    const timer = setInterval(() => {
      setCurrentBanner((prev) => (prev + 1) % initialBanners.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b-2 border-rose-700 shadow-md">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden"
                onClick={() => setShowMenu(!showMenu)}
              >
                {showMenu ? <X /> : <Menu />}
              </Button>
              <div 
                className="cursor-pointer"
                onClick={() => {
                  setCurrentPage('promo');
                  setSelectedCategory(null);
                  setSelectedSubCategory(null);
                  setSelectedSubSubCategory(null);
                }}
              >
                <h1 className="text-xl md:text-2xl font-bold text-rose-700">
                  CITRA COSMETIC
                </h1>
                <p className="text-xs text-rose-600 font-medium">MAKASSAR</p>
              </div>
            </div>

            <div className="hidden md:flex flex-1 max-w-md">
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  type="text"
                  placeholder="Search products..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant={currentPage === 'promo' ? 'default' : 'outline'}
                className={`hidden md:flex ${currentPage === 'promo' ? 'bg-rose-700 hover:bg-rose-800 text-white' : 'text-rose-700 border-rose-700 hover:bg-rose-50'}`}
                onClick={() => {
                  setCurrentPage('promo');
                  setSelectedCategory(null);
                  setSelectedSubCategory(null);
                  setSelectedSubSubCategory(null);
                }}
              >
                Promo & Deals
              </Button>
              <Button
                variant={currentPage === 'category' ? 'default' : 'outline'}
                className={`hidden md:flex ${currentPage === 'category' ? 'bg-rose-700 hover:bg-rose-800 text-white' : 'text-rose-700 border-rose-700 hover:bg-rose-50'}`}
                onClick={() => setCurrentPage('category')}
              >
                Shop by Category
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="relative border-rose-700 text-rose-700 hover:bg-rose-50"
                onClick={() => setShowCart(true)}
              >
                <ShoppingCart className="h-5 w-5" />
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-rose-700 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold shadow-lg animate-pulse">
                    {cartCount}
                  </span>
                )}
              </Button>
            </div>
          </div>

          {/* Mobile Search */}
          <div className="md:hidden mt-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                type="text"
                placeholder="Search products..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {showMenu && (
          <div className="lg:hidden border-t bg-background">
            <div className="container mx-auto px-4 py-4 space-y-2">
              <Button
                variant={currentPage === 'promo' ? "default" : "ghost"}
                className="w-full justify-start"
                onClick={() => {
                  setCurrentPage('promo');
                  setSelectedCategory(null);
                  setShowMenu(false);
                }}
              >
                Promo & Deals
              </Button>
              <Button
                variant={currentPage === 'category' ? "default" : "ghost"}
                className="w-full justify-start"
                onClick={() => {
                  setCurrentPage('category');
                  setShowMenu(false);
                }}
              >
                Shop by Category
              </Button>
            </div>
          </div>
        )}
      </header>

      

      {/* HOME PAGE 1: PROMO & DEALS */}
      {currentPage === 'promo' && (
        <>
          {/* Banner Carousel */}
          <div className="relative h-64 md:h-96 overflow-hidden">
            <img
              src={initialBanners[currentBanner]}
              alt="Promotional banner showcasing beauty products with vibrant colors and elegant styling"
              className="w-full h-full object-cover"
            />
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
              {initialBanners.map((_, idx) => (
                <button
                  key={idx}
                  className={`h-2 rounded-full transition-all ${
                    idx === currentBanner ? 'w-8 bg-white' : 'w-2 bg-white/50'
                  }`}
                  onClick={() => setCurrentBanner(idx)}
                />
              ))}
            </div>
          </div>

          {/* Quick Category Access */}
          <div className="container mx-auto px-4 py-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Shop by Category</h2>
              <Button
                variant="outline"
                onClick={() => setCurrentPage('category')}
              >
                View All Categories
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {initialCategories.slice(0, 6).map(cat => (
                <Card
                  key={cat.id}
                  className="cursor-pointer hover:shadow-lg transition-shadow"
                  onClick={() => {
                    setCurrentPage('category');
                    setSelectedCategory(cat.id);
                  }}
                >
                  <CardContent className="p-4">
                    <img
                      src={cat.image}
                      alt={`Category image showing ${cat.name} products with elegant presentation`}
                      className="w-full h-32 object-cover rounded-lg mb-3"
                    />
                    <h3 className="font-semibold text-center text-sm">
                      <span className="mr-2">{cat.icon}</span>
                      {cat.name}
                    </h3>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Best Deals Section */}
          <div className="container mx-auto px-4 py-8 bg-gradient-to-br from-rose-50 via-rose-100 to-red-50 -mx-4 px-4">
            <div className="text-center mb-6">
              <h2 className="text-3xl font-bold text-rose-800 mb-2">Best Deals Today</h2>
              <p className="text-rose-600">Penawaran Terbaik Khusus Hari Ini!</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {allProducts.filter(p => p.originalPrice).slice(0, 4).map(product => (
                <Card key={product.id} className="overflow-hidden hover:shadow-2xl transition-all hover:scale-105 border-2 border-transparent hover:border-rose-300">
                  <div className="relative">
                    <img
                      src={product.image}
                      alt={`Product image of ${product.name} by ${product.brand} showing elegant beauty product packaging`}
                      className="w-full h-48 object-cover cursor-pointer"
                      onClick={() => setSelectedProduct(product)}
                    />
                    <span className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded font-bold">
                      {Math.round((1 - product.price / product.originalPrice) * 100)}% OFF
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute top-2 right-2 bg-white/90 hover:bg-white"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavorite(product.id);
                      }}
                    >
                      <Heart
                        className={`h-5 w-5 ${
                          favorites.includes(product.id) ? 'fill-rose-700 text-rose-700' : ''
                        }`}
                      />
                    </Button>
                  </div>
                  <CardContent className="p-4">
                    <p className="text-xs text-muted-foreground mb-1">{product.brand}</p>
                    <h3
                      className="font-semibold mb-2 line-clamp-2 cursor-pointer hover:text-rose-700"
                      onClick={() => setSelectedProduct(product)}
                    >
                      {product.name}
                    </h3>
                    <div className="flex items-center gap-1 mb-2">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm font-medium">{product.rating}</span>
                    </div>
                    <div className="flex flex-col gap-1 mb-3">
                      <span className="text-lg font-bold text-rose-700">
                        Rp {product.price.toLocaleString()}
                      </span>
                      <span className="text-xs text-muted-foreground line-through">
                        Rp {product.originalPrice.toLocaleString()}
                      </span>
                    </div>
                    <Button className="w-full bg-rose-700 hover:bg-rose-800 shadow-md hover:shadow-lg transition-all" onClick={() => addToCart(product)}>
                      <ShoppingCart className="h-4 w-4 mr-2" />
                      Tambah ke Keranjang
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* New Arrivals */}
          <div className="container mx-auto px-4 py-8">
            <h2 className="text-2xl font-bold mb-6">New Arrivals</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {allProducts.filter(p => p.isNew).slice(0, 4).map(product => (
                <Card key={product.id} className="overflow-hidden hover:shadow-xl transition-shadow">
                  <div className="relative">
                    <img
                      src={product.image}
                      alt={`Product image of ${product.name} by ${product.brand} showing elegant beauty product packaging`}
                      className="w-full h-48 object-cover cursor-pointer"
                      onClick={() => setSelectedProduct(product)}
                    />
                    <span className="absolute top-2 left-2 bg-green-500 text-white text-xs px-2 py-1 rounded">
                      NEW
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute top-2 right-2 bg-white/90 hover:bg-white"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavorite(product.id);
                      }}
                    >
                      <Heart
                        className={`h-5 w-5 ${
                          favorites.includes(product.id) ? 'fill-rose-700 text-rose-700' : ''
                        }`}
                      />
                    </Button>
                  </div>
                  <CardContent className="p-4">
                    <p className="text-xs text-muted-foreground mb-1">{product.brand}</p>
                    <h3
                      className="font-semibold mb-2 line-clamp-2 cursor-pointer hover:text-rose-700"
                      onClick={() => setSelectedProduct(product)}
                    >
                      {product.name}
                    </h3>
                    <div className="flex items-center gap-1 mb-2">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm font-medium">{product.rating}</span>
                    </div>
                    <div className="flex flex-col gap-1 mb-3">
                      <span className="text-lg font-bold text-rose-700">
                        Rp {product.price.toLocaleString()}
                      </span>
                      {product.originalPrice && (
                        <span className="text-xs text-muted-foreground line-through">
                          Rp {product.originalPrice.toLocaleString()}
                        </span>
                      )}
                    </div>
                    <Button className="w-full bg-rose-700 hover:bg-rose-800" onClick={() => addToCart(product)}>
                      Add to Cart
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Bestsellers */}
          <div className="container mx-auto px-4 py-8 bg-muted/50 -mx-4 px-4">
            <h2 className="text-2xl font-bold mb-6">Bestsellers</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {allProducts.filter(p => p.isBestseller).slice(0, 4).map(product => (
                <Card key={product.id} className="overflow-hidden hover:shadow-xl transition-shadow">
                  <div className="relative">
                    <img
                      src={product.image}
                      alt={`Product image of ${product.name} by ${product.brand} showing elegant beauty product packaging`}
                      className="w-full h-48 object-cover cursor-pointer"
                      onClick={() => setSelectedProduct(product)}
                    />
                    <span className="absolute top-2 left-2 bg-yellow-500 text-white text-xs px-2 py-1 rounded">
                      BESTSELLER
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute top-2 right-2 bg-white/90 hover:bg-white"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavorite(product.id);
                      }}
                    >
                      <Heart
                        className={`h-5 w-5 ${
                          favorites.includes(product.id) ? 'fill-rose-700 text-rose-700' : ''
                        }`}
                      />
                    </Button>
                  </div>
                  <CardContent className="p-4">
                    <p className="text-xs text-muted-foreground mb-1">{product.brand}</p>
                    <h3
                      className="font-semibold mb-2 line-clamp-2 cursor-pointer hover:text-rose-700"
                      onClick={() => setSelectedProduct(product)}
                    >
                      {product.name}
                    </h3>
                    <div className="flex items-center gap-1 mb-2">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm font-medium">{product.rating}</span>
                      <span className="text-xs text-muted-foreground">({product.reviews})</span>
                    </div>
                    <div className="flex flex-col gap-1 mb-3">
                      <span className="text-lg font-bold text-rose-700">
                        Rp {product.price.toLocaleString()}
                      </span>
                      {product.originalPrice && (
                        <span className="text-xs text-muted-foreground line-through">
                          Rp {product.originalPrice.toLocaleString()}
                        </span>
                      )}
                    </div>
                    <Button className="w-full bg-rose-700 hover:bg-rose-800" onClick={() => addToCart(product)}>
                      Add to Cart
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </>
      )}

      {/* HOME PAGE 2: CATEGORY CENTRIC BROWSING */}
      {currentPage === 'category' && (
        <div className="container mx-auto px-4 py-6">
          <div className="flex gap-6">
            {/* LEFT SIDEBAR - Category Navigation */}
            <aside className="hidden lg:block w-64 flex-shrink-0">
              <Card className="sticky top-20 border-2 border-rose-200 shadow-lg">
                <CardContent className="p-4">
                  <div className="bg-gradient-to-r from-rose-700 to-rose-900 text-white p-3 -m-4 mb-4 rounded-t-lg">
                    <h2 className="font-bold text-lg">Kategori Produk</h2>
                    <p className="text-xs text-rose-100">Pilih kategori favorit Anda</p>
                  </div>
                  
                  {/* Main Categories */}
                  <div className="space-y-1">
                    <Button
                      variant={!selectedCategory ? "default" : "ghost"}
                      className={`w-full justify-start text-sm ${!selectedCategory ? 'bg-rose-700 hover:bg-rose-800 text-white' : 'hover:bg-rose-50'}`}
                      onClick={() => {
                        setSelectedCategory(null);
                        setSelectedSubCategory(null);
                        setSelectedSubSubCategory(null);
                      }}
                    >
                      Semua Produk
                    </Button>
                    
                    {initialCategories.map(cat => (
                      <div key={cat.id}>
                        <Button
                          variant={selectedCategory === cat.id ? "default" : "ghost"}
                          className={`w-full justify-start text-sm transition-all ${selectedCategory === cat.id ? 'bg-rose-700 hover:bg-rose-800 text-white shadow-md' : 'hover:bg-rose-50 hover:text-rose-700'}`}
                          onClick={() => {
                            setSelectedCategory(cat.id);
                            if (selectedCategory === cat.id) {
                              setSelectedCategory(null);
                              setSelectedSubCategory(null);
                              setSelectedSubSubCategory(null);
                            }
                          }}
                        >
                          <span className="mr-2">{cat.icon}</span>
                          {cat.name}
                          <ChevronRight className={`ml-auto h-4 w-4 transition-transform ${selectedCategory === cat.id ? 'rotate-90' : ''}`} />
                        </Button>
                        
                        {/* Sub Categories */}
                        {selectedCategory === cat.id && (
                          <div className="ml-4 mt-1 space-y-1 border-l-2 border-muted pl-2">
                            <Button
                              variant={!selectedSubCategory ? "secondary" : "ghost"}
                              size="sm"
                              className={`w-full justify-start text-xs ${!selectedSubCategory ? 'bg-rose-100 text-rose-700 hover:bg-rose-200' : 'hover:bg-rose-50'}`}
                              onClick={() => {
                                setSelectedSubCategory(null);
                                setSelectedSubSubCategory(null);
                              }}
                            >
                              Semua {cat.name}
                            </Button>
                            {cat.subCategories.map(subCat => (
                              <div key={subCat.id}>
                                <Button
                                  variant={selectedSubCategory === subCat.id ? "secondary" : "ghost"}
                                  size="sm"
                                  className={`w-full justify-start text-xs ${selectedSubCategory === subCat.id ? 'bg-rose-100 text-rose-700 font-semibold hover:bg-rose-200' : 'hover:bg-rose-50'}`}
                                  onClick={() => {
                                    setSelectedSubCategory(subCat.id);
                                    if (selectedSubCategory === subCat.id) {
                                      setSelectedSubCategory(null);
                                      setSelectedSubSubCategory(null);
                                    }
                                  }}
                                >
                                  {subCat.name}
                                  {subCat.subSubCategories.length > 0 && (
                                    <ChevronRight className={`ml-auto h-3 w-3 transition-transform ${selectedSubCategory === subCat.id ? 'rotate-90' : ''}`} />
                                  )}
                                </Button>
                                
                                {/* Sub-Sub Categories */}
                                {selectedSubCategory === subCat.id && subCat.subSubCategories.length > 0 && (
                                  <div className="ml-3 mt-1 space-y-1 border-l-2 border-muted pl-2">
                                    <Button
                                      variant={!selectedSubSubCategory ? "outline" : "ghost"}
                                      size="sm"
                                      className={`w-full justify-start text-xs ${!selectedSubSubCategory ? 'border-rose-700 text-rose-700 bg-rose-50 font-medium' : 'hover:bg-rose-50'}`}
                                      onClick={() => setSelectedSubSubCategory(null)}
                                    >
                                      Semua
                                    </Button>
                                    {subCat.subSubCategories.map(subSubCat => (
                                      <Button
                                        key={subSubCat.id}
                                        variant={selectedSubSubCategory === subSubCat.id ? "outline" : "ghost"}
                                        size="sm"
                                        className={`w-full justify-start text-xs ${selectedSubSubCategory === subSubCat.id ? 'border-rose-700 text-rose-700 bg-rose-50 font-semibold' : 'hover:bg-rose-50'}`}
                                        onClick={() => setSelectedSubSubCategory(subSubCat.id)}
                                      >
                                        {subSubCat.name}
                                      </Button>
                                    ))}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </aside>

            {/* MAIN CONTENT AREA */}
            <div className="flex-1">
              {/* Mobile Category Selector */}
              <div className="lg:hidden mb-4">
                <Card className="border-2 border-rose-200 shadow-md">
                  <CardContent className="p-3">
                    <Button
                      variant="outline"
                      className="w-full justify-between border-rose-700 text-rose-700 hover:bg-rose-50"
                      onClick={() => setShowCategoryMenu(!showCategoryMenu)}
                    >
                      <span className="flex items-center gap-2">
                        <Menu className="h-4 w-4" />
                        {selectedSubSubCategory
                          ? currentCategoryData?.subCategories
                              .find(s => s.id === selectedSubCategory)
                              ?.subSubCategories.find(ss => ss.id === selectedSubSubCategory)?.name
                          : selectedSubCategory
                          ? currentCategoryData?.subCategories.find(s => s.id === selectedSubCategory)?.name
                          : selectedCategory
                          ? currentCategoryData?.name
                          : 'All Categories'}
                      </span>
                      <ChevronRight className={`h-4 w-4 transition-transform ${showCategoryMenu ? 'rotate-90' : ''}`} />
                    </Button>
                  </CardContent>
                </Card>
                
                {/* Mobile Category Menu */}
                {showCategoryMenu && (
                  <Card className="mt-2">
                    <CardContent className="p-3 max-h-96 overflow-y-auto">
                      <div className="space-y-1">
                        <Button
                          variant={!selectedCategory ? "default" : "ghost"}
                          size="sm"
                          className="w-full justify-start"
                          onClick={() => {
                            setSelectedCategory(null);
                            setSelectedSubCategory(null);
                            setSelectedSubSubCategory(null);
                            setShowCategoryMenu(false);
                          }}
                        >
                          All Products
                        </Button>
                        {initialCategories.map(cat => (
                          <div key={cat.id}>
                            <Button
                              variant={selectedCategory === cat.id ? "default" : "ghost"}
                              size="sm"
                              className="w-full justify-start"
                              onClick={() => setSelectedCategory(cat.id)}
                            >
                              <span className="mr-2">{cat.icon}</span>
                              {cat.name}
                            </Button>
                            {selectedCategory === cat.id && (
                              <div className="ml-4 space-y-1 mt-1">
                                {cat.subCategories.map(subCat => (
                                  <div key={subCat.id}>
                                    <Button
                                      variant={selectedSubCategory === subCat.id ? "secondary" : "ghost"}
                                      size="sm"
                                      className="w-full justify-start text-xs"
                                      onClick={() => setSelectedSubCategory(subCat.id)}
                                    >
                                      {subCat.name}
                                    </Button>
                                    {selectedSubCategory === subCat.id && subCat.subSubCategories.length > 0 && (
                                      <div className="ml-3 space-y-1 mt-1">
                                        {subCat.subSubCategories.map(subSubCat => (
                                          <Button
                                            key={subSubCat.id}
                                            variant={selectedSubSubCategory === subSubCat.id ? "outline" : "ghost"}
                                            size="sm"
                                            className="w-full justify-start text-xs"
                                            onClick={() => {
                                              setSelectedSubSubCategory(subSubCat.id);
                                              setShowCategoryMenu(false);
                                            }}
                                          >
                                            {subSubCat.name}
                                          </Button>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Breadcrumb Navigation */}
              {(selectedCategory || selectedSubCategory || selectedSubSubCategory) && (
                <div className="bg-rose-50 p-3 rounded-lg mb-4 border-l-4 border-rose-700">
                  <div className="flex items-center gap-2 text-sm flex-wrap">
                    <button
                      className="text-rose-700 hover:underline font-medium"
                      onClick={() => {
                        setSelectedCategory(null);
                        setSelectedSubCategory(null);
                        setSelectedSubSubCategory(null);
                      }}
                    >
                      Semua Kategori
                    </button>
                  {selectedCategory && (
                    <>
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      <button
                        className="text-rose-700 hover:underline font-medium"
                        onClick={() => {
                          setSelectedSubCategory(null);
                          setSelectedSubSubCategory(null);
                        }}
                      >
                        {currentCategoryData?.name}
                      </button>
                    </>
                  )}
                  {selectedSubCategory && (
                    <>
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      <button
                        className="text-rose-700 hover:underline font-medium"
                        onClick={() => setSelectedSubSubCategory(null)}
                      >
                        {currentCategoryData?.subCategories.find(s => s.id === selectedSubCategory)?.name}
                      </button>
                    </>
                  )}
                  {selectedSubSubCategory && (
                    <>
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      <span className="text-rose-900 font-bold">
                        {currentCategoryData?.subCategories
                          .find(s => s.id === selectedSubCategory)
                          ?.subSubCategories.find(ss => ss.id === selectedSubSubCategory)?.name}
                      </span>
                    </>
                  )}
                </div>
              </div>
              )}

              {/* All Categories Grid - Show when no category selected */}
              {!selectedCategory && (
                <div>
                  <div className="bg-gradient-to-r from-rose-700 to-rose-900 text-white p-6 rounded-lg mb-6 shadow-lg">
                    <h2 className="text-3xl font-bold mb-2">Jelajahi Kategori</h2>
                    <p className="text-rose-100">Temukan produk kecantikan pilihan Anda</p>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
                    {initialCategories.map(cat => (
                      <Card
                        key={cat.id}
                        className="cursor-pointer hover:shadow-xl transition-all hover:scale-105 hover:border-rose-700 border-2 border-transparent"
                        onClick={() => setSelectedCategory(cat.id)}
                      >
                        <CardContent className="p-4">
                          <div className="relative overflow-hidden rounded-lg mb-3 group">
                            <img
                              src={cat.image}
                              alt={`Category image showing ${cat.name} products with elegant presentation`}
                              className="w-full h-32 object-cover transition-transform group-hover:scale-110"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-rose-900/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                          </div>
                          <h3 className="font-bold text-center text-rose-800">
                            <span className="mr-2 text-xl">{cat.icon}</span>
                            {cat.name}
                          </h3>
                          <p className="text-xs text-rose-600 text-center mt-1 font-medium">
                            {cat.subCategories.length} subkategori
                          </p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {/* Products Grid */}
              {selectedCategory && (
                <div>
                  <div className="bg-gradient-to-r from-rose-700 to-rose-900 text-white p-6 rounded-lg mb-6 shadow-lg">
                    <div>
                      <h2 className="text-3xl font-bold mb-2">
                        {selectedSubSubCategory
                          ? currentCategoryData?.subCategories
                              .find(s => s.id === selectedSubCategory)
                              ?.subSubCategories.find(ss => ss.id === selectedSubSubCategory)?.name
                          : selectedSubCategory
                          ? currentCategoryData?.subCategories.find(s => s.id === selectedSubCategory)?.name
                          : currentCategoryData?.name}
                      </h2>
                      <p className="text-rose-100">
                        Menampilkan {filteredProducts.length} produk
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
                {filteredProducts.map(product => (
              <Card key={product.id} className="overflow-hidden hover:shadow-xl transition-shadow">
                <div className="relative">
                  <img
                    src={product.image}
                    alt={`Product image of ${product.name} by ${product.brand} showing elegant beauty product packaging`}
                    className="w-full h-48 object-cover cursor-pointer"
                    onClick={() => setSelectedProduct(product)}
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-2 right-2 bg-white/90 hover:bg-white"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFavorite(product.id);
                    }}
                  >
                    <Heart
                        className={`h-5 w-5 ${
                          favorites.includes(product.id) ? 'fill-rose-700 text-rose-700' : ''
                        }`}
                      />
                  </Button>
                  {product.isNew && (
                    <span className="absolute top-2 left-2 bg-green-500 text-white text-xs px-2 py-1 rounded">
                      NEW
                    </span>
                  )}
                  {product.isBestseller && (
                    <span className="absolute top-2 left-2 bg-yellow-500 text-white text-xs px-2 py-1 rounded">
                      BESTSELLER
                    </span>
                  )}
                </div>
                <CardContent className="p-4">
                  <p className="text-xs text-muted-foreground mb-1">{product.brand}</p>
                  <h3
                    className="font-semibold mb-2 line-clamp-2 cursor-pointer hover:text-rose-700"
                    onClick={() => setSelectedProduct(product)}
                  >
                    {product.name}
                  </h3>
                  <div className="flex items-center gap-1 mb-2">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm font-medium">{product.rating}</span>
                    <span className="text-xs text-muted-foreground">({product.reviews})</span>
                  </div>
                  <div className="flex flex-col gap-1 mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-bold text-rose-700">
                        Rp {product.price.toLocaleString()}
                      </span>
                    </div>
                    {product.originalPrice && (
                      <span className="text-xs text-muted-foreground line-through">
                        Rp {product.originalPrice.toLocaleString()}
                      </span>
                    )}
                  </div>
                  <Button
                    className="w-full bg-rose-700 hover:bg-rose-800"
                    onClick={() => addToCart(product)}
                  >
                    Add to Cart
                  </Button>
                </CardContent>
              </Card>
            ))}
              </div>

                  {filteredProducts.length === 0 && (
                    <div className="text-center py-12 bg-rose-50 rounded-lg border-2 border-rose-200">
                      <div className="text-6xl mb-4">🔍</div>
                      <p className="text-rose-800 font-semibold text-lg mb-2">Produk tidak ditemukan</p>
                      <p className="text-rose-600 mb-4">Tidak ada produk dalam kategori ini</p>
                      <Button
                        className="mt-4 bg-rose-700 hover:bg-rose-800"
                        onClick={() => {
                          setSelectedCategory(null);
                          setSelectedSubCategory(null);
                          setSelectedSubSubCategory(null);
                        }}
                      >
                        Jelajahi Semua Kategori
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Product Detail Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setSelectedProduct(null)}>
          <Card className="max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <CardContent className="p-0">
              <div className="relative">
                <img
                  src={selectedProduct.image}
                  alt={`Detailed product image of ${selectedProduct.name} by ${selectedProduct.brand} with high quality presentation`}
                  className="w-full h-64 md:h-96 object-cover"
                />
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-4 right-4 bg-white/90"
                  onClick={() => setSelectedProduct(null)}
                >
                  <X />
                </Button>
              </div>
              <div className="p-6">
                <p className="text-sm text-muted-foreground mb-2">{selectedProduct.brand}</p>
                <h2 className="text-2xl font-bold mb-4">{selectedProduct.name}</h2>
                <div className="flex items-center gap-2 mb-4">
                  <div className="flex items-center gap-1">
                    <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                    <span className="font-medium">{selectedProduct.rating}</span>
                  </div>
                  <span className="text-muted-foreground">({selectedProduct.reviews} reviews)</span>
                </div>
                <p className="text-muted-foreground mb-6">{selectedProduct.description}</p>
                <div className="flex flex-wrap gap-2 mb-6">
                  {selectedProduct.tags.map((tag: string) => (
                    <span key={tag} className="bg-muted px-3 py-1 rounded-full text-sm">
                      {tag}
                    </span>
                  ))}
                </div>
                <div className="flex items-center gap-4 mb-6">
                  <div>
                    <span className="text-3xl font-bold text-rose-700">
                      Rp {selectedProduct.price.toLocaleString()}
                    </span>
                    {selectedProduct.originalPrice && (
                      <span className="text-lg text-muted-foreground line-through ml-3">
                        Rp {selectedProduct.originalPrice.toLocaleString()}
                      </span>
                    )}
                  </div>
                </div>
                <Button
                  className="w-full bg-rose-700 hover:bg-rose-800"
                  size="lg"
                  onClick={() => {
                    addToCart(selectedProduct);
                    setSelectedProduct(null);
                  }}
                >
                  Add to Cart
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Shopping Cart Sidebar */}
      {showCart && (
        <div className="fixed inset-0 bg-black/50 z-50 flex justify-end" onClick={() => setShowCart(false)}>
          <div
            className="bg-white w-full max-w-md h-full overflow-y-auto shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6 pb-4 border-b-2 border-rose-700">
                <div>
                  <h2 className="text-2xl font-bold text-rose-800">Keranjang Belanja</h2>
                  <p className="text-sm text-rose-600">{cartCount} item</p>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setShowCart(false)}>
                  <X />
                </Button>
              </div>

              {cart.length === 0 ? (
                <div className="text-center py-12 bg-rose-50 rounded-lg">
                  <ShoppingCart className="h-16 w-16 mx-auto text-rose-300 mb-4" />
                  <p className="text-rose-800 font-semibold text-lg mb-2">Keranjang Kosong</p>
                  <p className="text-rose-600 text-sm">Mulai belanja sekarang!</p>
                </div>
              ) : (
                <>
                  <div className="space-y-4 mb-6">
                    {cart.map(item => (
                      <Card key={item.id}>
                        <CardContent className="p-4">
                          <div className="flex gap-4">
                            <img
                              src={item.image}
                              alt={`Cart item image of ${item.name} by ${item.brand}`}
                              className="w-20 h-20 object-cover rounded"
                            />
                            <div className="flex-1">
                              <h3 className="font-semibold line-clamp-1">{item.name}</h3>
                              <p className="text-sm text-muted-foreground">{item.brand}</p>
                              <p className="text-rose-700 font-bold mt-1">
                                Rp {item.price.toLocaleString()}
                              </p>
                              <div className="flex items-center gap-2 mt-2">
                                <Button
                                  variant="outline"
                                  size="icon"
                                  className="h-8 w-8"
                                  onClick={() => updateQuantity(item.id, -1)}
                                >
                                  <Minus className="h-3 w-3" />
                                </Button>
                                <span className="w-8 text-center">{item.quantity}</span>
                                <Button
                                  variant="outline"
                                  size="icon"
                                  className="h-8 w-8"
                                  onClick={() => updateQuantity(item.id, 1)}
                                >
                                  <Plus className="h-3 w-3" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 ml-auto"
                                  onClick={() => removeFromCart(item.id)}
                                >
                                  <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  <div className="border-t-2 border-rose-200 pt-4 space-y-3 bg-rose-50 -mx-6 px-6 py-4">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-semibold text-rose-800">Total Belanja:</span>
                      <span className="text-2xl font-bold text-rose-700">Rp {cartTotal.toLocaleString()}</span>
                    </div>
                    <Button className="w-full bg-rose-700 hover:bg-rose-800 shadow-lg hover:shadow-xl transition-all text-lg py-6" size="lg">
                      Checkout Sekarang
                      <ChevronRight className="ml-2 h-5 w-5" />
                    </Button>
                    <p className="text-xs text-center text-rose-600">Gratis ongkir untuk pembelian di atas Rp 200.000</p>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-gradient-to-r from-rose-800 to-rose-900 mt-12 py-8 text-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-4">
            <h3 className="text-2xl font-bold mb-2">CITRA COSMETIC MAKASSAR</h3>
            <p className="text-rose-100">Pusat Kecantikan Terpercaya di Makassar</p>
          </div>
          <div className="border-t border-rose-700 pt-4 text-center text-rose-200 text-sm">
            <p>&copy; 2024 Citra Cosmetic Makassar. Hak Cipta Dilindungi.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
