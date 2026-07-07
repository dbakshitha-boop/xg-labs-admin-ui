import React, { useState, useRef } from 'react';
import { Brand } from '../types';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from './ui/dialog';
import { Plus, Trash2, Star, Edit, Image as ImageIcon, Check, StarOff } from 'lucide-react';
import { Switch } from './ui/switch';

interface BrandDashboardProps {
  brands: Brand[];
  onAdd: (brand: Omit<Brand, 'id'>) => void;
  onUpdate: (id: string, data: Partial<Brand>) => void;
  onDelete: (id: string) => void;
}

export function BrandDashboard({ brands, onAdd, onUpdate, onDelete }: BrandDashboardProps) {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingBrand, setEditingBrand] = useState<Brand | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  
  const [formData, setFormData] = useState<Partial<Brand>>({
    name: '',
    logo: '',
    website: '',
    isFeatured: false
  });

  const handleOpenAdd = () => {
    setFormData({ name: '', logo: '', website: '', isFeatured: false });
    setIsAddOpen(true);
  };

  const handleOpenEdit = (brand: Brand) => {
    setEditingBrand(brand);
    setFormData({ ...brand });
    setIsAddOpen(true);
  };

  const handleSave = () => {
    if (!formData.name || !formData.logo) return;

    if (editingBrand) {
      onUpdate(editingBrand.id, formData);
    } else {
      onAdd(formData as Omit<Brand, 'id'>);
    }
    
    setIsAddOpen(false);
    setEditingBrand(null);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to remove this brand?')) {
      onDelete(id);
    }
  };

  const handleLogoUpload = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const file = files[0];
    const reader = new FileReader();

    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setFormData({ ...formData, logo: reader.result });
      }
    };

    reader.readAsDataURL(file);
  };

  const toggleFeatured = (brand: Brand) => {
    onUpdate(brand.id, { isFeatured: !brand.isFeatured });
  };

  // Split brands into Featured (Center Row) and Standard
  const featuredBrands = brands.filter(b => b.isFeatured);
  const standardBrands = brands.filter(b => !b.isFeatured);

  return (
    <div className="container mx-auto py-8 px-6 space-y-8 max-w-7xl">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
           <h1 className="text-2xl font-bold tracking-tight text-gray-900 flex items-center gap-2">
              <Star className="w-6 h-6" />
              Trusted By Brands
           </h1>
           <p className="text-gray-500 mt-1">Manage the logos displayed in the "Trusted By" section.</p>
        </div>
        <Button onClick={handleOpenAdd} className="gap-2">
            <Plus className="w-4 h-4" /> Add Brand
        </Button>
      </div>

      {/* Featured Brands Section */}
      <div className="space-y-4">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-semibold text-gray-900">Featured Brands (Center Row)</h3>
            <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100 border-none">
                {featuredBrands.length} High Priority
            </Badge>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {featuredBrands.map(brand => (
                <BrandCard 
                    key={brand.id} 
                    brand={brand} 
                    onEdit={() => handleOpenEdit(brand)} 
                    onDelete={() => handleDelete(brand.id)}
                    onToggleFeatured={() => toggleFeatured(brand)}
                />
            ))}
            {featuredBrands.length === 0 && (
                <div className="col-span-full py-12 text-center border-2 border-dashed rounded-lg bg-gray-50">
                    <p className="text-gray-500">No featured brands selected. Star a brand to move it here.</p>
                </div>
            )}
          </div>
      </div>

      {/* Standard Brands Section */}
      <div className="space-y-4 pt-8 border-t">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-semibold text-gray-900">Standard Brands</h3>
            <Badge variant="secondary">{standardBrands.length}</Badge>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {standardBrands.map(brand => (
                <BrandCard 
                    key={brand.id} 
                    brand={brand} 
                    onEdit={() => handleOpenEdit(brand)} 
                    onDelete={() => handleDelete(brand.id)}
                    onToggleFeatured={() => toggleFeatured(brand)}
                />
            ))}
             {standardBrands.length === 0 && (
                <div className="col-span-full py-12 text-center border-2 border-dashed rounded-lg bg-gray-50">
                    <p className="text-gray-500">No standard brands.</p>
                </div>
            )}
          </div>
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={isAddOpen} onOpenChange={(open) => {
          if(!open) {
              setIsAddOpen(false);
              setEditingBrand(null);
          }
      }}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>{editingBrand ? 'Edit Brand' : 'Add New Brand'}</DialogTitle>
                <DialogDescription>
                    Add a company logo to display in the trusted section.
                </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
                <div className="space-y-2">
                    <Label>Company Name</Label>
                    <Input 
                        value={formData.name} 
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        placeholder="e.g. Acme Corp"
                    />
                </div>

                <div className="space-y-2">
                    <Label>Website (Optional)</Label>
                    <Input 
                        value={formData.website || ''} 
                        onChange={(e) => setFormData({...formData, website: e.target.value})}
                        placeholder="https://example.com"
                    />
                </div>
                
                <div className="space-y-2">
                    <Label>Logo URL</Label>
                    <div className="flex gap-2 items-center">
                        <Input 
                            value={formData.logo} 
                            onChange={(e) => setFormData({...formData, logo: e.target.value})}
                            placeholder="https://..."
                        />
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => handleLogoUpload(e.target.files)}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={() => fileInputRef.current?.click()}
                          aria-label="Upload logo from computer"
                        >
                          <ImageIcon className="w-4 h-4" />
                        </Button>
                    </div>
                    {formData.logo && (
                        <div className="mt-2 p-4 bg-black rounded-lg flex justify-center">
                            <img src={formData.logo} alt="Preview" className="h-12 object-contain filter invert" /> 
                            {/* Inverted filter just for checking if it's white-on-transparent, though usually we want to see the real thing. 
                                Since the design has black background, let's assume logos are white or light. 
                                I'll wrap it in black bg.
                            */}
                        </div>
                    )}
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="space-y-0.5">
                        <Label className="text-base">Featured Brand</Label>
                        <p className="text-sm text-gray-500">Show in the highlighted center row</p>
                    </div>
                    <Switch 
                        checked={formData.isFeatured} 
                        onCheckedChange={(checked) => setFormData({...formData, isFeatured: checked})}
                    />
                </div>
            </div>

            <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddOpen(false)}>Cancel</Button>
                <Button onClick={handleSave}>{editingBrand ? 'Save Changes' : 'Add Brand'}</Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function BrandCard({ brand, onEdit, onDelete, onToggleFeatured }: { 
    brand: Brand, 
    onEdit: () => void, 
    onDelete: () => void,
    onToggleFeatured: () => void
}) {
    return (
        <Card className="group relative overflow-hidden hover:shadow-md transition-all border-zinc-200">
            <CardContent className="p-6 flex flex-col items-center justify-center gap-4 min-h-[160px] bg-zinc-950">
                {/* Actions Overlay */}
                <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button size="icon" variant="secondary" className="h-7 w-7" onClick={onEdit}>
                        <Edit className="w-3 h-3" />
                    </Button>
                    <Button size="icon" variant="destructive" className="h-7 w-7" onClick={onDelete}>
                        <Trash2 className="w-3 h-3" />
                    </Button>
                </div>

                {/* Star Toggle */}
                <button 
                    onClick={onToggleFeatured}
                    className={`absolute top-2 left-2 p-1.5 rounded-full transition-colors ${brand.isFeatured ? 'text-yellow-400 bg-yellow-400/10' : 'text-zinc-600 hover:text-zinc-400'}`}
                >
                    {brand.isFeatured ? <Star className="w-4 h-4 fill-yellow-400" /> : <Star className="w-4 h-4" />}
                </button>

                <div className="w-full h-12 flex items-center justify-center">
                    {brand.logo ? (
                        <img src={brand.logo} alt={brand.name} className="max-h-full max-w-full object-contain brightness-0 invert opacity-80 group-hover:opacity-100 transition-opacity" />
                    ) : (
                        <ImageIcon className="w-8 h-8 text-zinc-700" />
                    )}
                </div>
                <p className="text-xs text-zinc-500 font-medium">{brand.name}</p>
            </CardContent>
        </Card>
    );
}
