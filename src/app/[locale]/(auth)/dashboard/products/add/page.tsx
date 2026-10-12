'use client';

import { upload } from '@vercel/blob/client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function AddProductPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);
  const [imageUploadError, setImageUploadError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    brand: '',
    netVolume: '',
    vintage: '',
    wineType: '',
    sugarContent: '',
    appellation: '',
    alcoholContent: '',
    packagingGases: '',
    portionSize: '',
    kcal: '',
    kj: '',
    fat: '',
    carbohydrates: '',
    organic: false,
    vegetarian: false,
    vegan: false,
    operatorType: '',
    operatorName: '',
    operatorAddress: '',
    operatorInfo: '',
    countryOfOrigin: '',
    sku: '',
    ean: '',
    externalLink: '',
    redirectLink: '',
    imageUrl: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImageUploadError('');
    setImageUploading(true);

    try {
      const newBlob = await upload(file.name, file, {
        access: 'public',
        handleUploadUrl: '/api/products/upload',
      });

      setFormData(prev => ({ ...prev, imageUrl: newBlob.url }));
    } catch (err: any) {
      setImageUploadError(String(err?.message ?? err));
      console.error('Image upload error', err);
    } finally {
      setImageUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const product = await response.json();
        router.push(`/dashboard/products/${product.id}`);
      } else {
        const error = await response.json();
        console.error('Failed to create product:', error.message);
      }
    } catch (error) {
      console.error('Error creating product:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle>Add New Product</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Basic Information</h3>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Product Name *</Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    placeholder="Enter product name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="brand">Brand</Label>
                  <Input
                    id="brand"
                    name="brand"
                    value={formData.brand}
                    onChange={handleChange}
                    placeholder="Enter brand name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="netVolume">Net Volume</Label>
                  <Input
                    id="netVolume"
                    name="netVolume"
                    value={formData.netVolume}
                    onChange={handleChange}
                    placeholder="e.g., 750ml"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="vintage">Vintage</Label>
                  <Input
                    id="vintage"
                    name="vintage"
                    value={formData.vintage}
                    onChange={handleChange}
                    placeholder="e.g., 2020"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="wineType">Wine Type</Label>
                  <Input
                    id="wineType"
                    name="wineType"
                    value={formData.wineType}
                    onChange={handleChange}
                    placeholder="e.g., Red, White, Rosé"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sugarContent">Sugar Content</Label>
                  <Input
                    id="sugarContent"
                    name="sugarContent"
                    value={formData.sugarContent}
                    onChange={handleChange}
                    placeholder="e.g., Dry, Semi-dry"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="appellation">Appellation</Label>
                  <Input
                    id="appellation"
                    name="appellation"
                    value={formData.appellation}
                    onChange={handleChange}
                    placeholder="Enter appellation"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="alcoholContent">Alcohol Content</Label>
                  <Input
                    id="alcoholContent"
                    name="alcoholContent"
                    value={formData.alcoholContent}
                    onChange={handleChange}
                    placeholder="e.g., 13.5%"
                  />
                </div>
              </div>
            </div>

            {/* Nutritional Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Nutritional Information</h3>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="portionSize">Portion Size</Label>
                  <Input
                    id="portionSize"
                    name="portionSize"
                    value={formData.portionSize}
                    onChange={handleChange}
                    placeholder="e.g., 100ml"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="kcal">Calories (kcal)</Label>
                  <Input
                    id="kcal"
                    name="kcal"
                    value={formData.kcal}
                    onChange={handleChange}
                    placeholder="Enter kcal"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="kj">Energy (kJ)</Label>
                  <Input
                    id="kj"
                    name="kj"
                    value={formData.kj}
                    onChange={handleChange}
                    placeholder="Enter kJ"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fat">Fat</Label>
                  <Input
                    id="fat"
                    name="fat"
                    value={formData.fat}
                    onChange={handleChange}
                    placeholder="e.g., 0g"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="carbohydrates">Carbohydrates</Label>
                  <Input
                    id="carbohydrates"
                    name="carbohydrates"
                    value={formData.carbohydrates}
                    onChange={handleChange}
                    placeholder="e.g., 2g"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="packagingGases">Packaging Gases</Label>
                  <Input
                    id="packagingGases"
                    name="packagingGases"
                    value={formData.packagingGases}
                    onChange={handleChange}
                    placeholder="Enter packaging gases"
                  />
                </div>
              </div>
            </div>

            {/* Dietary Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Dietary Information</h3>
              <div className="flex flex-wrap gap-6">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="organic"
                    checked={formData.organic}
                    onChange={handleChange}
                    className="size-4"
                  />
                  <span>Organic</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="vegetarian"
                    checked={formData.vegetarian}
                    onChange={handleChange}
                    className="size-4"
                  />
                  <span>Vegetarian</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="vegan"
                    checked={formData.vegan}
                    onChange={handleChange}
                    className="size-4"
                  />
                  <span>Vegan</span>
                </label>
              </div>
            </div>

            {/* Operator Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Operator Information</h3>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="operatorType">Operator Type</Label>
                  <Input
                    id="operatorType"
                    name="operatorType"
                    value={formData.operatorType}
                    onChange={handleChange}
                    placeholder="e.g., Producer, Importer"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="operatorName">Operator Name</Label>
                  <Input
                    id="operatorName"
                    name="operatorName"
                    value={formData.operatorName}
                    onChange={handleChange}
                    placeholder="Enter operator name"
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="operatorAddress">Operator Address</Label>
                  <Input
                    id="operatorAddress"
                    name="operatorAddress"
                    value={formData.operatorAddress}
                    onChange={handleChange}
                    placeholder="Enter operator address"
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="operatorInfo">Additional Operator Info</Label>
                  <Input
                    id="operatorInfo"
                    name="operatorInfo"
                    value={formData.operatorInfo}
                    onChange={handleChange}
                    placeholder="Enter additional operator information"
                  />
                </div>
              </div>
            </div>

            {/* Product Identifiers */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Product Identifiers</h3>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="countryOfOrigin">Country of Origin</Label>
                  <Input
                    id="countryOfOrigin"
                    name="countryOfOrigin"
                    value={formData.countryOfOrigin}
                    onChange={handleChange}
                    placeholder="e.g., France"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sku">SKU</Label>
                  <Input
                    id="sku"
                    name="sku"
                    value={formData.sku}
                    onChange={handleChange}
                    placeholder="Enter SKU"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ean">EAN</Label>
                  <Input
                    id="ean"
                    name="ean"
                    value={formData.ean}
                    onChange={handleChange}
                    placeholder="Enter EAN barcode"
                  />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="imageFile">Image</Label>
                    <div className="flex items-center gap-3">
                      <input
                        id="imageFile"
                        name="imageFile"
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        disabled={imageUploading}
                        className="rounded-md border p-1 text-sm"
                      />
                      <Input
                        id="imageUrl"
                        name="imageUrl"
                        value={formData.imageUrl}
                        onChange={handleChange}
                        placeholder="Or enter image URL"
                      />
                    </div>
                    {imageUploading && <div className="text-sm text-muted-foreground">Uploading image…</div>}
                    {imageUploadError && <div className="text-sm text-red-600">{imageUploadError}</div>}
                    {formData.imageUrl && (
                      <img src={formData.imageUrl} alt="preview" className="mt-2 max-h-32 rounded-md object-contain" />
                    )}
                </div>
              </div>
            </div>

            {/* Links */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Links</h3>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="externalLink">External Link</Label>
                  <Input
                    id="externalLink"
                    name="externalLink"
                    value={formData.externalLink}
                    onChange={handleChange}
                    placeholder="Enter external URL"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="redirectLink">Redirect Link</Label>
                  <Input
                    id="redirectLink"
                    name="redirectLink"
                    value={formData.redirectLink}
                    onChange={handleChange}
                    placeholder="Enter redirect URL"
                  />
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Creating...' : 'Create Product'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
