import React, { useMemo, useState, useEffect, createContext, useContext } from "react";
import { Search, ShoppingCart, User, Star, ChevronRight, X, Plus, Edit, Trash2, Save, AlertTriangle, ChevronDown, LayoutDashboard, Image as ImageIcon, List } from 'lucide-react';

/**
 * Single‑file preview of Citra Cosmetics e‑commerce UI
 * - No routing, no backend; demo-only.
 * - Admin Mode (FAB): add/edit/delete products, manage categories, manage banners.
 * - Tailwind classes for styling (Canvas preview has Tailwind).
 * - Icons via lucide-react (available in Canvas runtime).
 */

// ========= Utils =========
const formatCurrencyIDR = (n) =>
  typeof n === 'number'
    ? new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n)
    : '—';
const safePercent = (orig, curr) => {
  const o = Number(orig), c = Number(curr);
  if (!o || !c || c >= o) return 0;
  return Math.round(((o - c) / o) * 100);
};
const makeId = () => (globalThis?.crypto?.randomUUID ? crypto.randomUUID() : 'id-' + Math.random().toString(36).slice(2) + Date.now());

// ========= Seed Data =========
const initialBanners = [
  'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=1200&h=400&fit=crop&q=80',
  'https://images.unsplash.com/photo-1556912933-91f855057811?w=1200&h=400&fit=crop&q=80',
  'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=1200&h=400&fit=crop&q=80'
];
const initialCategories = [
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
const initialProducts = {
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

// ========= Context =========
const ShopContext = createContext(null);
const useShop = () => useContext(ShopContext);

function ShopProvider({ children }) {
  const [heroBanners, setHeroBanners] = useState(initialBanners);
  const [categories, setCategories] = useState(initialCategories);
  const [products, setProducts] = useState(initialProducts);

  const [activeView, setActiveView] = useState('home');
  const [activeCategory, setActiveCategory] = useState('makeup');
  const [activeSubCategory, setActiveSubCategory] = useState(null);
  const [activeSubSubCategory, setActiveSubSubCategory] = useState(null);
  const [expandedSubCategories, setExpandedSubCategories] = useState({});
  const [cartCount, setCartCount] = useState(3);

  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [showProductForm, setShowProductForm] = useState(false);
  const [showCategoryManager, setShowCategoryManager] = useState(false);
  const [showHomePageManager, setShowHomePageManager] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, title: '', message: '', onConfirm: null });

  const getAllProducts = () => Object.values(products).flat();
  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 2500);
  };
  const openConfirmation = (title, message, onConfirm) => setConfirmModal({ isOpen: true, title, message, onConfirm });
  const closeConfirmation = () => setConfirmModal({ isOpen: false, title: '', message: '', onConfirm: null });

  const navigateToProducts = (catId, subCatId = null, subSubCatId = null) => {
    setActiveView('products');
    setActiveCategory(catId);
    setActiveSubCategory(subCatId);
    setActiveSubSubCategory(subSubCatId);
    if (subCatId) setExpandedSubCategories(prev => ({ ...prev, [subCatId]: true }));
  };
  const toggleSubCategory = (id) => setExpandedSubCategories(prev => ({ ...prev, [id]: !prev[id] }));

  const ctx = useMemo(() => ({
    // data
    heroBanners, setHeroBanners, categories, setCategories, products, setProducts,
    // view
    activeView, setActiveView, activeCategory, setActiveCategory, activeSubCategory, setActiveSubCategory,
    activeSubSubCategory, setActiveSubSubCategory, expandedSubCategories, toggleSubCategory,
    navigateToProducts, getAllProducts,
    // ui
    cartCount, setCartCount, showAdminPanel, setShowAdminPanel, showProductForm, setShowProductForm,
    showCategoryManager, setShowCategoryManager, showHomePageManager, setShowHomePageManager,
    editingProduct, setEditingProduct,
    toast, showToast, confirmModal, openConfirmation, closeConfirmation
  }), [heroBanners, categories, products, activeView, activeCategory, activeSubCategory, activeSubSubCategory, expandedSubCategories, cartCount, showAdminPanel, showProductForm, showCategoryManager, showHomePageManager, editingProduct, toast, confirmModal]);

  return <ShopContext.Provider value={ctx}>{children}</ShopContext.Provider>;
}

// ========= UI Components =========
function Toast({ message, type, show }) {
  return (
    <div role="status" aria-live="polite" className={`fixed top-5 right-5 z-[101] px-6 py-3 rounded-lg text-white shadow-lg transition-all duration-300 transform ${show ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'} ${type === 'success' ? 'bg-green-600' : 'bg-red-600'}`}>{message}</div>
  );
}

function ConfirmModal({ isOpen, title, message, onConfirm, onCancel }) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        <div className="flex items-start gap-4">
          <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
            <AlertTriangle className="h-6 w-6 text-red-600" aria-hidden="true" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg leading-6 font-bold text-gray-900">{title}</h3>
            <p className="text-sm text-gray-600 mt-2">{message}</p>
          </div>
        </div>
        <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse gap-3">
          <button onClick={onConfirm} className="w-full inline-flex justify-center rounded-md px-4 py-2 bg-red-600 text-white hover:bg-red-700 sm:w-auto sm:text-sm">Confirm</button>
          <button onClick={onCancel} className="mt-3 w-full inline-flex justify-center rounded-md px-4 py-2 border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 sm:mt-0 sm:w-auto sm:text-sm">Cancel</button>
        </div>
      </div>
    </div>
  );
}

function ProductCard({ product, showActions }) {
  const { openConfirmation, setProducts, showToast, setShowProductForm, setEditingProduct } = useShop();
  const fallback = 'https://placehold.co/400x400/f87171/ffffff?text=Image';
  const handleDelete = () => {
    openConfirmation('Delete Product', `Hapus "${product.name}"? Tindakan ini tidak bisa dibatalkan.`, () => {
      setProducts(prev => {
        const list = prev[product.category]?.filter(p => p.id !== product.id) ?? [];
        return { ...prev, [product.category]: list };
      });
      showToast('Product deleted!');
    });
  };
  const discount = safePercent(product.originalPrice, product.price);
  return (
    <div className="group relative bg-white rounded-lg shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-200">
      {showActions && (
        <div className="absolute top-2 right-2 z-20 flex gap-1.5">
          <button aria-label="Edit product" onClick={() => { setEditingProduct(product); setShowProductForm(true); }} className="p-2 bg-blue-500 text-white rounded-lg shadow hover:bg-blue-600"><Edit className="w-4 h-4" /></button>
          <button aria-label="Delete product" onClick={handleDelete} className="p-2 bg-red-600 text-white rounded-lg shadow hover:bg-red-700"><Trash2 className="w-4 h-4" /></button>
        </div>
      )}
      <div className="absolute top-3 left-3 z-10 flex flex-col gap-1.5">
        {discount > 0 && <span className="bg-red-600 text-white text-xs font-semibold px-2.5 py-1 rounded-full">-{discount}%</span>}
        {product.isNew && <span className="bg-blue-500 text-white text-xs font-semibold px-2.5 py-1 rounded-full">NEW</span>}
        {product.isBestseller && <span className="bg-amber-500 text-white text-xs font-semibold px-2.5 py-1 rounded-full">BESTSELLER</span>}
      </div>
      <div className="relative aspect-square mb-2 overflow-hidden">
        <img src={product.image} alt={product.name} onError={(e)=>{e.currentTarget.src=fallback}} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" loading="lazy" />
      </div>
      <div className="p-4 pt-0">
        <div className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-1">{product.brand}</div>
        <h3 className="font-semibold text-gray-800 leading-tight text-base mb-2 truncate">{product.name}</h3>
        <div className="flex items-baseline gap-2 mb-2">
          <span className="text-lg font-bold text-red-600">{formatCurrencyIDR(product.price)}</span>
          {product.originalPrice > product.price && <span className="text-sm text-gray-400 line-through">{formatCurrencyIDR(product.originalPrice)}</span>}
        </div>
        <div className="flex items-center gap-1 text-sm text-gray-600"><Star className="w-4 h-4 fill-amber-400 text-amber-400" /><span>{product.rating}</span></div>
      </div>
    </div>
  );
}

function ProductFormModal() {
  const { showProductForm, setShowProductForm, categories, setProducts, showToast, editingProduct, setEditingProduct } = useShop();
  const initialForm = {
    name: '', brand: '', price: '', originalPrice: '', rating: '4.5', reviews: '0', image: '', isNew: false, isBestseller: false, category: 'makeup', subCategory: '', subSubCategory: '', tags: '', description: ''
  };
  const [formData, setFormData] = useState(editingProduct ? {
    ...editingProduct,
    price: String(editingProduct.price),
    originalPrice: String(editingProduct.originalPrice ?? ''),
    rating: String(editingProduct.rating),
    reviews: String(editingProduct.reviews),
    tags: Array.isArray(editingProduct.tags) ? editingProduct.tags.join(', ') : (editingProduct.tags ?? '')
  } : initialForm);

  if (!showProductForm) return null;

  const subCategoryOptions = useMemo(() => categories.find(c => c.id === formData.category)?.subCategories || [], [formData.category, categories]);
  const subSubCategoryOptions = useMemo(() => subCategoryOptions.find(sc => sc.id === formData.subCategory)?.subSubCategories || [], [formData.subCategory, subCategoryOptions]);

  const close = () => { setShowProductForm(false); setEditingProduct(null); };
  const commit = () => {
    const { name, brand, price, category } = formData;
    if (!name || !brand || !price || !category) { return showToast('Name, Brand, Price, Category wajib diisi.', 'error'); }
    const normalized = {
      ...formData,
      id: editingProduct?.id ?? makeId(),
      price: Number(formData.price),
      originalPrice: formData.originalPrice ? Number(formData.originalPrice) : null,
      rating: Number(formData.rating),
      reviews: Number(formData.reviews),
      image: formData.image || 'https://placehold.co/400x400/f87171/ffffff?text=Image',
      tags: formData.tags.split(',').map(t=>t.trim()).filter(Boolean)
    };
    setProducts(prev => {
      const next = { ...prev };
      if (editingProduct && editingProduct.category !== normalized.category) {
        next[editingProduct.category] = (next[editingProduct.category] ?? []).filter(p => p.id !== editingProduct.id);
        next[normalized.category] = [...(next[normalized.category] ?? []), normalized];
      } else {
        const list = next[normalized.category] ?? [];
        const idx = list.findIndex(p => p.id === normalized.id);
        if (idx >= 0) list[idx] = normalized; else list.push(normalized);
        next[normalized.category] = [...list];
      }
      return next;
    });
    showToast(editingProduct ? 'Product updated!' : 'Product added!');
    close();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-800">{editingProduct ? 'Edit Product' : 'Add New Product'}</h2>
          <button onClick={close} className="p-2 rounded-full hover:bg-gray-100" aria-label="Close"><X className="w-6 h-6 text-gray-500" /></button>
        </div>
        <form className="p-6 space-y-4 overflow-y-auto" onSubmit={(e)=>{e.preventDefault(); commit();}}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium mb-1">Name*</label><input value={formData.name} onChange={e=>setFormData({...formData, name:e.target.value})} className="w-full px-3 py-2 border rounded"/></div>
            <div><label className="block text-sm font-medium mb-1">Brand*</label><input value={formData.brand} onChange={e=>setFormData({...formData, brand:e.target.value})} className="w-full px-3 py-2 border rounded"/></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium mb-1">Price (Rp)*</label><input type="number" value={formData.price} onChange={e=>setFormData({...formData, price:e.target.value})} className="w-full px-3 py-2 border rounded"/></div>
            <div><label className="block text-sm font-medium mb-1">Original Price (Rp)</label><input type="number" value={formData.originalPrice} onChange={e=>setFormData({...formData, originalPrice:e.target.value})} className="w-full px-3 py-2 border rounded"/></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Category*</label>
              <select value={formData.category} onChange={e=>setFormData({...formData, category:e.target.value, subCategory:'', subSubCategory:''})} className="w-full px-3 py-2 border rounded">
                {categories.map(c=> <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Sub-Category</label>
              <select value={formData.subCategory} onChange={e=>setFormData({...formData, subCategory:e.target.value, subSubCategory:''})} className="w-full px-3 py-2 border rounded" disabled={subCategoryOptions.length===0}>
                <option value="">Select</option>
                {subCategoryOptions.map(sc=> <option key={sc.id} value={sc.id}>{sc.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Sub-Sub-Category</label>
              <select value={formData.subSubCategory} onChange={e=>setFormData({...formData, subSubCategory:e.target.value})} className="w-full px-3 py-2 border rounded" disabled={subSubCategoryOptions.length===0}>
                <option value="">Select</option>
                {subSubCategoryOptions.map(ssc=> <option key={ssc.id} value={ssc.id}>{ssc.name}</option>)}
              </select>
            </div>
          </div>
          <div><label className="block text-sm font-medium mb-1">Image URL</label><input value={formData.image} onChange={e=>setFormData({...formData, image:e.target.value})} className="w-full px-3 py-2 border rounded" placeholder="https://..."/></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium mb-1">Rating</label><input type="number" step="0.1" min="0" max="5" value={formData.rating} onChange={e=>setFormData({...formData, rating:e.target.value})} className="w-full px-3 py-2 border rounded"/></div>
            <div><label className="block text-sm font-medium mb-1">Reviews</label><input type="number" min="0" value={formData.reviews} onChange={e=>setFormData({...formData, reviews:e.target.value})} className="w-full px-3 py-2 border rounded"/></div>
          </div>
          <div><label className="block text-sm font-medium mb-1">Tags (comma separated)</label><input value={formData.tags} onChange={e=>setFormData({...formData, tags:e.target.value})} className="w-full px-3 py-2 border rounded"/></div>
          <div><label className="block text-sm font-medium mb-1">Description</label><textarea value={formData.description} onChange={e=>setFormData({...formData, description:e.target.value})} className="w-full px-3 py-2 border rounded" rows={3}/></div>
          <div className="flex gap-6 pt-2">
            <label className="flex items-center gap-2"><input type="checkbox" checked={formData.isNew} onChange={e=>setFormData({...formData, isNew:e.target.checked})} className="h-4 w-4 text-red-600 border-gray-300 rounded"/>New Arrival</label>
            <label className="flex items-center gap-2"><input type="checkbox" checked={formData.isBestseller} onChange={e=>setFormData({...formData, isBestseller:e.target.checked})} className="h-4 w-4 text-red-600 border-gray-300 rounded"/>Bestseller</label>
          </div>
        </form>
        <div className="p-6 border-t bg-gray-50 flex justify-end gap-3">
          <button onClick={close} className="px-6 py-2.5 border border-gray-300 rounded-md font-semibold text-gray-700 hover:bg-gray-100">Cancel</button>
          <button onClick={commit} className="px-6 py-2.5 bg-red-600 text-white rounded-md font-semibold hover:bg-red-700 flex items-center gap-2"><Save className="w-5 h-5"/>{editingProduct ? 'Update Product' : 'Add Product'}</button>
        </div>
      </div>
    </div>
  );
}

function CategoryManagerModal() {
  const { showCategoryManager, setShowCategoryManager, categories, setCategories, showToast } = useShop();
  const [mainCatData, setMainCatData] = useState({ name: '', icon: '', image: '' });
  const [newSubCatData, setNewSubCatData] = useState({});
  if (!showCategoryManager) return null;

  const addMain = () => {
    const { name, icon, image } = mainCatData;
    if (!name || !icon || !image) return showToast('Name, Icon, Image wajib.', 'error');
    const id = name.toLowerCase().replace(/\s+/g, '-');
    if (categories.some(c => c.id === id)) return showToast('Nama kategori sudah ada.', 'error');
    setCategories(prev => [...prev, { id, name, icon, image, subCategories: [] }]);
    setMainCatData({ name: '', icon: '', image: '' });
    showToast('Main category added!');
  };
  const deleteMain = (categoryId) => { setCategories(prev => prev.filter(c => c.id !== categoryId)); showToast('Main category deleted!'); };
  const addSub = (catId, name) => {
    const n = (name || '').trim();
    if (!n) return showToast('Sub-category name kosong.', 'error');
    const id = n.toLowerCase().replace(/\s+/g, '-');
    setCategories(prev => prev.map(c => c.id === catId ? { ...c, subCategories: [...c.subCategories, { id, name: n, subSubCategories: [] }] } : c));
    setNewSubCatData(s => ({ ...s, [catId]: '' }));
    showToast('Sub-category added!');
  };
  const deleteSub = (catId, subId) => {
    setCategories(prev => prev.map(c => c.id === catId ? { ...c, subCategories: c.subCategories.filter(s => s.id !== subId) } : c));
    showToast('Sub-category deleted!');
  };
  const deleteSubSub = (catId, subId, sscId) => {
    setCategories(prev => prev.map(c => {
      if (c.id !== catId) return c;
      return { ...c, subCategories: c.subCategories.map(s => s.id === subId ? { ...s, subSubCategories: s.subSubCategories.filter(x => x.id !== sscId) } : s) };
    }));
    showToast('Sub-sub-category deleted!');
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center p-5 border-b">
          <h2 className="text-xl font-bold text-gray-800">Manage Categories</h2>
          <button onClick={() => setShowCategoryManager(false)} className="p-2 rounded-full hover:bg-gray-100" aria-label="Close"><X className="w-5 h-5 text-gray-500"/></button>
        </div>
        <div className="p-5 overflow-y-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-700 border-b pb-2">Main Categories</h3>
            <div className="bg-gray-50 p-3 rounded-md space-y-2">
              <input value={mainCatData.name} onChange={e=>setMainCatData({...mainCatData, name:e.target.value})} placeholder="Category Name*" className="w-full p-2 border rounded"/>
              <div className="flex gap-2">
                <input value={mainCatData.icon} onChange={e=>setMainCatData({...mainCatData, icon:e.target.value})} placeholder="Icon*" className="w-1/4 p-2 border rounded"/>
                <input value={mainCatData.image} onChange={e=>setMainCatData({...mainCatData, image:e.target.value})} placeholder="Image URL*" className="flex-1 p-2 border rounded"/>
              </div>
              <button onClick={addMain} className="w-full p-2 bg-red-600 text-white rounded font-semibold hover:bg-red-700">Add Main Category</button>
            </div>
            <ul className="space-y-2">
              {categories.map(cat => (
                <li key={cat.id} className="flex justify-between items-center bg-white p-2 rounded-md border">
                  <span>{cat.icon} {cat.name}</span>
                  <div className="flex gap-2">
                    <button onClick={()=>deleteMain(cat.id)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-100 rounded-full"><Trash2 className="w-4 h-4"/></button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-700 border-b pb-2">Sub & Sub-Sub Categories</h3>
            {categories.map(cat => (
              <div key={cat.id} className="bg-gray-50 p-3 rounded-md">
                <p className="font-semibold text-gray-600 mb-2">{cat.name}</p>
                <div className="flex gap-2 mb-2">
                  <input value={newSubCatData[cat.id] || ''} onChange={e=>setNewSubCatData({...newSubCatData, [cat.id]: e.target.value})} placeholder="New sub-category name" className="flex-1 p-2 border rounded"/>
                  <button onClick={()=>addSub(cat.id, newSubCatData[cat.id])} className="p-2 px-4 bg-red-600 text-white rounded font-semibold hover:bg-red-700">Add</button>
                </div>
                <ul className="space-y-2">
                  {cat.subCategories.map(sc => (
                    <div key={sc.id} className="pl-4">
                      <li className="flex justify-between items-center bg-white p-2 rounded-md border">
                        <span>{sc.name}</span>
                        <div className="flex gap-2">
                          <button onClick={()=>deleteSub(cat.id, sc.id)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-100 rounded-full"><Trash2 className="w-4 h-4"/></button>
                        </div>
                      </li>
                      <div className="pl-6 border-l ml-2 py-2 space-y-2">
                        {sc.subSubCategories.map(ssc => (
                          <li key={ssc.id} className="flex justify-between items-center bg-white p-2 rounded-md border text-sm">
                            <span>{ssc.name}</span>
                            <button onClick={()=>deleteSubSub(cat.id, sc.id, ssc.id)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-100 rounded-full"><Trash2 className="w-4 h-4"/></button>
                          </li>
                        ))}
                      </div>
                    </div>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function HomePageManagerModal() {
  const { showHomePageManager, setShowHomePageManager, heroBanners, setHeroBanners, showToast } = useShop();
  const [localBanners, setLocalBanners] = useState(heroBanners);
  const [newBannerUrl, setNewBannerUrl] = useState('');
  if (!showHomePageManager) return null;
  const handleSave = () => { setHeroBanners(localBanners); showToast('Home page banners updated!'); setShowHomePageManager(false); };
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center p-5 border-b">
          <h2 className="text-xl font-bold text-gray-800">Manage Home Page Banners</h2>
          <button onClick={() => setShowHomePageManager(false)} className="p-2 rounded-full hover:bg-gray-100" aria-label="Close"><X className="w-5 h-5 text-gray-500"/></button>
        </div>
        <div className="p-5 overflow-y-auto space-y-4">
          <h3 className="text-lg font-semibold text-gray-700">Current Banners</h3>
          {localBanners.map((banner, index) => (
            <div key={index} className="flex items-center gap-2 bg-gray-50 p-2 rounded-md">
              <ImageIcon className="w-5 h-5 text-gray-400"/>
              <input value={banner} onChange={(e)=>{ const next=[...localBanners]; next[index]=e.target.value; setLocalBanners(next); }} className="flex-1 p-2 border rounded-md" placeholder="Image URL"/>
              <button onClick={()=>setLocalBanners(localBanners.filter((_,i)=>i!==index))} className="p-2 text-red-500 hover:bg-red-100 rounded-md" aria-label="Delete banner"><Trash2 className="w-5 h-5"/></button>
            </div>
          ))}
          <div className="pt-4 border-t">
            <h3 className="text-lg font-semibold text-gray-700">Add New Banner</h3>
            <div className="flex items-center gap-2 mt-2">
              <input value={newBannerUrl} onChange={(e)=>setNewBannerUrl(e.target.value)} className="flex-1 p-2 border rounded-md" placeholder="https://images.unsplash.com/..."/>
              <button onClick={()=>{ if (newBannerUrl.trim()){ setLocalBanners([...localBanners, newBannerUrl.trim()]); setNewBannerUrl(''); } }} className="p-2 px-4 bg-red-600 text-white rounded-md font-semibold hover:bg-red-700">Add</button>
            </div>
          </div>
        </div>
        <div className="p-5 border-t bg-gray-50 flex justify-end gap-3">
          <button onClick={()=>setShowHomePageManager(false)} className="px-6 py-2 border border-gray-300 rounded-md font-semibold text-gray-700 hover:bg-gray-100">Cancel</button>
          <button onClick={handleSave} className="px-6 py-2 bg-blue-600 text-white rounded-md font-semibold hover:bg-blue-700">Save Changes</button>
        </div>
      </div>
    </div>
  );
}

// ========= Pages =========
function HomePage() {
  const { heroBanners, categories, getAllProducts, showAdminPanel, navigateToProducts } = useShop();
  const [currentSlide, setCurrentSlide] = useState(0);
  useEffect(()=>{ if (heroBanners.length===0) return; const t=setInterval(()=>setCurrentSlide(s=>(s+1)%heroBanners.length), 5000); return ()=>clearInterval(t); },[heroBanners.length]);
  return (
    <div className="space-y-12">
      <div className="relative w-full aspect-[16/6] overflow-hidden rounded-lg shadow-lg bg-gray-200">
        {heroBanners.length>0 ? (
          <>
            <div className="flex transition-transform duration-700 ease-in-out" style={{ transform: `translateX(-${currentSlide*100}%)`, width: `${heroBanners.length*100}%` }}>
              {heroBanners.map((src,i)=>(<img key={i} src={src} alt={`Banner ${i+1}`} className="w-full h-full object-cover"/>))}
            </div>
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
              {heroBanners.map((_,i)=>(<button key={i} aria-label={`Slide ${i+1}`} onClick={()=>setCurrentSlide(i)} className={`w-3 h-3 rounded-full transition-all duration-300 ${currentSlide===i?'bg-white w-6':'bg-white/50'}`} />))}
            </div>
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center"><p className="text-gray-500">No banners to display. Tambah di admin panel.</p></div>
        )}
      </div>

      <section>
        <div className="text-center mb-8"><h2 className="text-3xl font-bold text-gray-800 tracking-tight">Belanja Berdasarkan Kategori</h2><p className="text-gray-500 mt-2">Temukan produk yang sempurna untuk Anda.</p></div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {categories.map(cat => (
            <div key={cat.id} onClick={()=>navigateToProducts(cat.id)} className="group relative rounded-lg overflow-hidden cursor-pointer aspect-square shadow-sm" role="button" tabIndex={0} onKeyDown={(e)=> e.key==='Enter' && navigateToProducts(cat.id)}>
              <img src={cat.image} alt={cat.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"/>
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"/>
              <div className="absolute bottom-0 left-0 p-5"><h3 className="text-white text-xl font-bold">{cat.icon} {cat.name}</h3></div>
            </div>
          ))}
        </div>
      </section>

      <section>
        <div className="text-center mb-8"><h2 className="text-3xl font-bold text-gray-800 tracking-tight">Produk Terbaru</h2></div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6">
          {getAllProducts().filter(p=>p.isNew).slice(0,5).map(p=> <ProductCard key={p.id} product={p} showActions={showAdminPanel} />)}
        </div>
      </section>

      <section>
        <div className="text-center mb-8"><h2 className="text-3xl font-bold text-gray-800 tracking-tight">Bestsellers</h2></div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6">
          {getAllProducts().filter(p=>p.isBestseller).slice(0,5).map(p=> <ProductCard key={p.id} product={p} showActions={showAdminPanel} />)}
        </div>
      </section>
    </div>
  );
}

function ProductListPage() {
  const { products, categories, activeCategory, activeSubCategory, activeSubSubCategory, navigateToProducts, toggleSubCategory, expandedSubCategories, showAdminPanel, setActiveView } = useShop();
  const displayed = (products[activeCategory] || []).filter(p => (!activeSubCategory || p.subCategory === activeSubCategory) && (!activeSubSubCategory || p.subSubCategory === activeSubSubCategory));
  const catData = categories.find(c => c.id === activeCategory);
  return (
    <div className="flex flex-col lg:flex-row gap-8">
      <aside className="lg:w-1/4">
        <div className="bg-white p-6 rounded-lg shadow-sm sticky top-28 border">
          <h2 className="text-xl font-bold mb-4 text-gray-800">Kategori</h2>
          <ul className="space-y-1">
            {categories.map(cat => (
              <li key={cat.id}>
                <button onClick={()=>navigateToProducts(cat.id, null, null)} className={`w-full text-left font-semibold flex items-center gap-3 py-2.5 px-3.5 rounded-lg transition-colors ${activeCategory===cat.id ? 'bg-red-100 text-red-700' : 'text-gray-600 hover:bg-gray-100'}`}><span className="text-lg">{cat.icon}</span> {cat.name}</button>
                {activeCategory===cat.id && cat.subCategories.length>0 && (
                  <ul className="pl-5 mt-2 space-y-1">
                    {cat.subCategories.map(subCat => (
                      <li key={subCat.id}>
                        <div className="w-full flex justify-between items-center text-left text-sm font-medium text-gray-600 py-1 rounded">
                          <span onClick={()=>navigateToProducts(cat.id, subCat.id, null)} className={`cursor-pointer hover:text-red-600 ${activeSubCategory===subCat.id && !activeSubSubCategory ? 'font-bold text-red-600':''}`}>{subCat.name}</span>
                          {subCat.subSubCategories.length>0 && (
                            <button onClick={()=>toggleSubCategory(subCat.id)} className="p-1" aria-label="Toggle">
                              <ChevronDown className={`w-4 h-4 transition-transform ${expandedSubCategories[subCat.id] ? 'rotate-180' : ''}`}/>
                            </button>
                          )}
                        </div>
                        {expandedSubCategories[subCat.id] && subCat.subSubCategories.length>0 && (
                          <ul className="pl-4 mt-1 space-y-1 border-l-2 border-red-200 ml-2">
                            {subCat.subSubCategories.map(ssc => (
                              <li key={ssc.id}><button onClick={()=>navigateToProducts(cat.id, subCat.id, ssc.id)} className={`text-sm transition-colors ${activeSubSubCategory===ssc.id ? 'font-semibold text-red-600' : 'text-gray-500 hover:text-red-500'}`}>{ssc.name}</button></li>
                            ))}
                          </ul>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>
        </div>
      </aside>

      <div className="flex-1">
        <div className="mb-6">
          <div className="text-sm text-gray-500 flex items-center gap-2"><button onClick={()=>setActiveView('home')} className="hover:underline">Home</button><ChevronRight className="w-4 h-4"/> <span className="font-medium text-gray-700">{catData?.name}</span></div>
          <h1 className="text-4xl font-bold text-gray-800 mt-2">{catData?.name}</h1>
        </div>
        {displayed.length>0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">{displayed.map(p=> <ProductCard key={p.id} product={p} showActions={showAdminPanel} />)}</div>
        ) : (<div className="text-center text-gray-500 py-16">Tidak ada produk di kategori ini.</div>)}
      </div>
    </div>
  );
}

// ========= App =========
function Shell() {
  const { toast, confirmModal, closeConfirmation, showProductForm, showCategoryManager, showHomePageManager, setShowProductForm, setShowCategoryManager, setShowHomePageManager, showAdminPanel, setShowAdminPanel, setEditingProduct, activeView, setActiveView, categories, cartCount } = useShop();
  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <Toast message={toast.message} type={toast.type} show={toast.show} />
      <ConfirmModal {...confirmModal} onCancel={closeConfirmation} />
      {showProductForm && <ProductFormModal />}
      {showCategoryManager && <CategoryManagerModal />}
      {showHomePageManager && <HomePageManagerModal />}

      {/* Admin FAB */}
      <div className="fixed bottom-6 left-6 z-40 flex flex-col gap-3">
        <button onClick={()=>setShowAdminPanel(!showAdminPanel)} className="bg-gray-800 text-white p-4 rounded-full shadow-lg hover:bg-gray-900" title={showAdminPanel ? 'Deactivate Admin Mode' : 'Activate Admin Mode'}>
          {showAdminPanel ? <X className="w-6 h-6"/> : <Edit className="w-6 h-6"/>}
        </button>
        {showAdminPanel && (
          <>
            <button onClick={()=>{ setEditingProduct(null); setShowProductForm(true); }} className="bg-red-600 text-white p-4 rounded-full shadow-lg hover:bg-red-700" title="Add Product"><Plus className="w-6 h-6"/></button>
            <button onClick={()=> setShowCategoryManager(true)} className="bg-red-600 text-white p-4 rounded-full shadow-lg hover:bg-red-700" title="Manage Categories"><List className="w-6 h-6"/></button>
            <button onClick={()=> setShowHomePageManager(true)} className="bg-red-600 text-white p-4 rounded-full shadow-lg hover:bg-red-700" title="Manage Home Page"><LayoutDashboard className="w-6 h-6"/></button>
          </>
        )}
      </div>

      {/* Header */}
      <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md shadow-sm border-b">
        <div className="max-w-screen-xl mx-auto px-4">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center gap-8">
              <h1 className="text-3xl font-bold text-red-600 cursor-pointer" onClick={()=>setActiveView('home')}>Citra Cosmetic</h1>
              <nav className="hidden lg:flex items-center gap-6">
                <button onClick={()=>setActiveView('home')} className={`font-semibold pb-1 border-b-2 ${activeView==='home' ? 'border-red-600 text-red-600' : 'border-transparent text-gray-600 hover:text-red-600'}`}>Home</button>
                <button onClick={()=>setActiveView('products')} className={`font-semibold pb-1 border-b-2 ${activeView==='products' ? 'border-red-600 text-red-600' : 'border-transparent text-gray-600 hover:text-red-600'}`}>Produk</button>
              </nav>
            </div>
            <div className="flex-1 max-w-sm">
              <div className="relative"><input type="text" placeholder="Cari produk..." className="w-full pl-10 pr-4 py-2 border rounded-full bg-gray-100 focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500"/><Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5"/></div>
            </div>
            <div className="flex items-center gap-4">
              {showAdminPanel && <span className="bg-blue-500 text-white text-xs font-bold px-3 py-1.5 rounded-full">ADMIN MODE</span>}
              <button className="p-2 hover:bg-gray-100 rounded-full" aria-label="User"><User className="w-6 h-6 text-gray-600"/></button>
              <button className="relative p-2 hover:bg-gray-100 rounded-full" aria-label="Cart"><ShoppingCart className="w-6 h-6 text-gray-600"/>{cartCount>0 && <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">{cartCount}</span>}</button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-screen-xl mx-auto px-4 py-10">{activeView==='home' ? <HomePage/> : <ProductListPage/>}</main>

      <footer className="bg-white border-t mt-12"><div className="max-w-screen-xl mx-auto py-8 px-4 text-center text-gray-500">&copy; {new Date().getFullYear()} Citra Cosmetic Makassar. All Rights Reserved.</div></footer>
    </div>
  );
}

export default function App() { return (<ShopProvider><Shell/></ShopProvider>); }
