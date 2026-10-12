'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

type ProductFormData = {
  name: string;
  brand: string;
  netVolume: string;
  vintage: string;
  wineType: string;
  sugarContent: string;
  appellation: string;
  alcoholContent: string;
  packagingGases: string;
  portionSize: string;
  kcal: string;
  kj: string;
  fat: string;
  carbohydrates: string;
  organic: boolean;
  vegetarian: boolean;
  vegan: boolean;
  operatorType: string;
  operatorName: string;
  operatorAddress: string;
  operatorInfo: string;
  countryOfOrigin: string;
  sku: string;
  ean: string;
  externalLink: string;
  redirectLink: string;
  imageUrl: string;
};

export default function EditProductPage() {
  const params = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<ProductFormData>({
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

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await fetch(`/api/products/${params.id}`);
        if (response.ok) {
          const product = await response.json();
          setFormData({
            name: product.name || '',
            brand: product.brand || '',
            netVolume: product.netVolume || '',
            vintage: product.vintage || '',
            wineType: product.wineType || '',
            sugarContent: product.sugarContent || '',
            appellation: product.appellation || '',
            alcoholContent: product.alcoholContent || '',
            packagingGases: product.packagingGases || '',
            portionSize: product.portionSize || '',
            kcal: product.kcal || '',
            kj: product.kj || '',
            fat: product.fat || '',
            carbohydrates: product.carbohydrates || '',
            organic: product.organic || false,
            vegetarian: product.vegetarian || false,
            vegan: product.vegan || false,
            operatorType: product.operatorType || '',
            operatorName: product.operatorName || '',
            operatorAddress: product.operatorAddress || '',
            operatorInfo: product.operatorInfo || '',
            countryOfOrigin: product.countryOfOrigin || '',
            sku: product.sku || '',
            ean: product.ean || '',
            externalLink: product.externalLink || '',
            redirectLink: product.redirectLink || '',
            imageUrl: product.imageUrl || '',
          });
        } else {
          router.push('/dashboard');
        }
      } catch (error) {
        console.error('Error fetching product:', error);
        router.push('/dashboard');
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchProduct();
    }
  }, [params.id, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const response = await fetch(`/api/products/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        router.push(`/dashboard/products/${params.id}`);
      } else {
        const error = await response.json();
        console.error('Failed to update product:', error.message);
      }
    } catch (error) {
      console.error('Error updating product:', error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <p className="text-gray-500">Loading product...</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle>Edit Product</CardTitle>
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
                  <Label htmlFor="packagingGases">Packaging Gases</Label>
                  <Input
                    id="packagingGases"
                    name="packagingGases"
                    value={formData.packagingGases}
                    onChange={handleChange}
                    placeholder="Enter packaging gases"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="kcal">Energy (kcal)</Label>
                  <Input
                    id="kcal"
                    name="kcal"
                    value={formData.kcal}
                    onChange={handleChange}
                    placeholder="e.g., 85"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="kj">Energy (kJ)</Label>
                  <Input
                    id="kj"
                    name="kj"
                    value={formData.kj}
                    onChange={handleChange}
                    placeholder="e.g., 356"
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
                    placeholder="e.g., 2.6g"
                  />
                </div>
              </div>
            </div>

            {/* Dietary Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Dietary Information</h3>
              <div className="flex flex-wrap gap-6">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="organic"
                    name="organic"
                    checked={formData.organic}
                    onChange={handleChange}
                    className="size-4 rounded border-gray-300"
                  />
                  <Label htmlFor="organic">Organic</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="vegetarian"
                    name="vegetarian"
                    checked={formData.vegetarian}
                    onChange={handleChange}
                    className="size-4 rounded border-gray-300"
                  />
                  <Label htmlFor="vegetarian">Vegetarian</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="vegan"
                    name="vegan"
                    checked={formData.vegan}
                    onChange={handleChange}
                    className="size-4 rounded border-gray-300"
                  />
                  <Label htmlFor="vegan">Vegan</Label>
                </div>
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
                <div className="space-y-2">
                  <Label htmlFor="operatorAddress">Operator Address</Label>
                  <Input
                    id="operatorAddress"
                    name="operatorAddress"
                    value={formData.operatorAddress}
                    onChange={handleChange}
                    placeholder="Enter operator address"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="operatorInfo">Additional Operator Info</Label>
                  <Input
                    id="operatorInfo"
                    name="operatorInfo"
                    value={formData.operatorInfo}
                    onChange={handleChange}
                    placeholder="Enter additional info"
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
                    placeholder="Enter country of origin"
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
                  <Label htmlFor="imageUrl">Image URL</Label>
                  <Input
                    id="imageUrl"
                    name="imageUrl"
                    value={formData.imageUrl}
                    onChange={handleChange}
                    placeholder="Enter image URL"
                  />
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
                    placeholder="https://..."
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="redirectLink">Redirect Link</Label>
                  <Input
                    id="redirectLink"
                    name="redirectLink"
                    value={formData.redirectLink}
                    onChange={handleChange}
                    placeholder="https://..."
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
              <Button type="submit" disabled={saving}>
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
