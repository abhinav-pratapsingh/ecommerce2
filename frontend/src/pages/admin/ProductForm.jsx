import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Upload, X, ArrowLeft } from 'lucide-react'
import productService from '../../services/productService'
import { Loader } from '../../components/common/Loader'
import toast from 'react-hot-toast'

const EMPTY = { name: '', description: '', price: '', category: '', brand: '', stock: '' }

const ProductForm = ({ mode }) => {
  const { id }   = useParams()
  const navigate = useNavigate()

  const [form,       setForm]       = useState(EMPTY)
  const [categories, setCategories] = useState([])
  const [images,     setImages]     = useState([])
  const [uploading,  setUploading]  = useState(false)
  const [saving,     setSaving]     = useState(false)
  const [loading,    setLoading]    = useState(mode === 'edit')

  useEffect(() => {
    productService.getCategories().then(res => setCategories(res.data.data.categories))
    if (mode === 'edit' && id) {
      productService.getById(id).then(res => {
        const p = res.data.data.product
        setForm({ name: p.name, description: p.description, price: p.price, category: p.category?._id || p.category, brand: p.brand || '', stock: p.stock })
        setImages(p.images || [])
      }).finally(() => setLoading(false))
    }
  }, [id, mode])

  const updateField = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name || !form.price || !form.category || !form.stock) {
      toast.error('Please fill in all required fields'); return
    }
    setSaving(true)
    try {
      const payload = { ...form, price: parseFloat(form.price), stock: parseInt(form.stock, 10) }
      let productId = id
      if (mode === 'create') {
        const res = await productService.create(payload)
        productId = res.data.data.product._id
      } else {
        await productService.update(id, payload)
      }

      // Upload pending new images
      if (images.some(img => img.file)) {
        const formData = new FormData()
        images.filter(img => img.file).forEach(img => formData.append('images', img.file))
        await productService.uploadImages(productId, formData)
      }

      toast.success(mode === 'create' ? 'Product created!' : 'Product updated!')
      navigate('/admin/products')
    } finally { setSaving(false) }
  }

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files)
    const previews = files.map(f => ({ url: URL.createObjectURL(f), file: f, temp: true }))
    setImages(imgs => [...imgs, ...previews])
  }

  const removeImage = (idx) => setImages(imgs => imgs.filter((_, i) => i !== idx))

  if (loading) return <div className="flex items-center justify-center h-64"><Loader size="lg" /></div>

  return (
    <div className="max-w-3xl space-y-6 animate-fade-in">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate('/admin/products')} className="text-ink-muted hover:text-ink transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="font-display font-black text-2xl">{mode === 'create' ? 'Add Product' : 'Edit Product'}</h1>
          <p className="text-ink-muted text-sm">{mode === 'create' ? 'Create a new listing' : `Editing: ${form.name}`}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic info */}
        <div className="card p-6 space-y-5">
          <h2 className="font-display font-bold">Basic Information</h2>
          <div>
            <label className="text-sm text-ink-muted mb-1.5 block">Product Name *</label>
            <input value={form.name} onChange={e => updateField('name', e.target.value)}
              className="input-field" placeholder="Enter product name" required />
          </div>
          <div>
            <label className="text-sm text-ink-muted mb-1.5 block">Description *</label>
            <textarea value={form.description} onChange={e => updateField('description', e.target.value)}
              className="input-field resize-none" rows={4} placeholder="Describe the product..." required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-ink-muted mb-1.5 block">Brand</label>
              <input value={form.brand} onChange={e => updateField('brand', e.target.value)}
                className="input-field" placeholder="Brand name" />
            </div>
            <div>
              <label className="text-sm text-ink-muted mb-1.5 block">Category *</label>
              <select value={form.category} onChange={e => updateField('category', e.target.value)}
                className="input-field" required>
                <option value="">Select category</option>
                {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="text-sm text-ink-muted mb-1.5 block">Price ($) *</label>
              <input type="number" step="0.01" min="0" value={form.price} onChange={e => updateField('price', e.target.value)}
                className="input-field" placeholder="0.00" required />
            </div>
            <div>
              <label className="text-sm text-ink-muted mb-1.5 block">Stock *</label>
              <input type="number" min="0" value={form.stock} onChange={e => updateField('stock', e.target.value)}
                className="input-field" placeholder="0" required />
            </div>
          </div>
        </div>

        {/* Images */}
        <div className="card p-6 space-y-4">
          <h2 className="font-display font-bold">Product Images</h2>
          <div className="flex flex-wrap gap-3">
            {images.map((img, i) => (
              <div key={i} className="relative w-24 h-24 rounded-xl overflow-hidden border border-surface-border group">
                <img src={img.url} alt="" className="w-full h-full object-cover" />
                {img.temp && <div className="absolute top-1 left-1 w-2 h-2 bg-brand-500 rounded-full" title="New image" />}
                <button type="button" onClick={() => removeImage(i)}
                  className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <X className="w-5 h-5 text-white" />
                </button>
              </div>
            ))}
            {images.length < 10 && (
              <label className="w-24 h-24 rounded-xl border-2 border-dashed border-surface-border hover:border-brand-500 flex flex-col items-center justify-center gap-1 cursor-pointer transition-colors">
                <Upload className="w-5 h-5 text-ink-faint" />
                <span className="text-[10px] text-ink-faint">Upload</span>
                <input type="file" accept="image/*" multiple className="hidden" onChange={handleFileSelect} />
              </label>
            )}
          </div>
          <p className="text-ink-faint text-xs">Max 10 images. New images (marked with blue dot) will upload on save.</p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <button type="submit" disabled={saving} className="btn-primary flex items-center gap-2 px-8">
            {saving ? <><Loader size="sm" /> Saving...</> : mode === 'create' ? 'Create Product' : 'Save Changes'}
          </button>
          <button type="button" onClick={() => navigate('/admin/products')} className="btn-secondary">Cancel</button>
        </div>
      </form>
    </div>
  )
}

export const CreateProduct = () => <ProductForm mode="create" />
export const EditProduct   = () => <ProductForm mode="edit" />

