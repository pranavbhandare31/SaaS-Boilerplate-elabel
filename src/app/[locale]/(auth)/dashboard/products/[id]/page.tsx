'use client';

import { Pencil, Trash2 } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { Product } from '@/models/Schema';

const PlaceholderImage = () => (
  <div className="flex h-64 w-full items-center justify-center rounded-lg bg-gray-100">
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="size-24 text-gray-300"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
      <circle cx="9" cy="9" r="2" />
      <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
    </svg>
  </div>
);

const InfoRow = ({ label, value }: { label: string; value: string | null | undefined }) => {
  if (!value) {
    return null;
  }
  return (
    <div className="flex justify-between border-b py-2">
      <span className="text-gray-600">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
};

const Badge = ({ children, variant = 'default' }: { children: React.ReactNode; variant?: 'default' | 'success' }) => (
  <span
    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
      variant === 'success' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
    }`}
  >
    {children}
  </span>
);

export default function ProductPreviewPage() {
  const params = useParams();
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await fetch(`/api/products/${params.id}`);
        if (response.ok) {
          const data = await response.json();
          setProduct(data);
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

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const response = await fetch(`/api/products/${params.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        router.push('/dashboard');
      } else {
        const error = await response.json();
        console.error('Failed to delete product:', error.message);
        setDeleting(false);
        setShowDeleteConfirm(false);
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      setDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <p className="text-gray-500">Loading product...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex h-64 items-center justify-center">
        <p className="text-gray-500">Product not found</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* Product Header */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col gap-6 md:flex-row">
            <div className="w-full md:w-1/3">
              {product.imageUrl
                ? (
                    <Image
                      src={product.imageUrl}
                      alt={product.name}
                      width={400}
                      height={256}
                      className="h-64 w-full rounded-lg object-cover"
                    />
                  )
                : (
                    <PlaceholderImage />
                  )}
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold">{product.name}</h1>
              {product.brand && (
                <p className="mt-1 text-lg text-gray-600">{product.brand}</p>
              )}

              <div className="mt-4 flex flex-wrap gap-2">
                {product.organic && <Badge variant="success">Organic</Badge>}
                {product.vegetarian && <Badge variant="success">Vegetarian</Badge>}
                {product.vegan && <Badge variant="success">Vegan</Badge>}
              </div>

              <div className="mt-6 flex flex-wrap gap-3">
                <Link href={`/dashboard/products/${product.id}/qr`}>
                  <Button>Generate QR Label</Button>
                </Link>
                <Link href={`/dashboard/products/${product.id}/edit`}>
                  <Button variant="outline">
                    <Pencil className="mr-2 size-4" />
                    Edit Product
                  </Button>
                </Link>
                <Button
                  variant="destructive"
                  onClick={() => setShowDeleteConfirm(true)}
                >
                  <Trash2 className="mr-2 size-4" />
                  Delete
                </Button>
              </div>

              {/* Delete Confirmation Dialog */}
              {showDeleteConfirm && (
                <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-4">
                  <p className="mb-3 text-sm text-red-800">
                    Are you sure you want to delete this product? This action cannot be undone.
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={handleDelete}
                      disabled={deleting}
                    >
                      {deleting ? 'Deleting...' : 'Yes, Delete'}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowDeleteConfirm(false)}
                      disabled={deleting}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle>Product Information</CardTitle>
        </CardHeader>
        <CardContent>
          <InfoRow label="Wine Type" value={product.wineType} />
          <InfoRow label="Vintage" value={product.vintage} />
          <InfoRow label="Appellation" value={product.appellation} />
          <InfoRow label="Net Volume" value={product.netVolume} />
          <InfoRow label="Alcohol Content" value={product.alcoholContent} />
          <InfoRow label="Sugar Content" value={product.sugarContent} />
          <InfoRow label="Country of Origin" value={product.countryOfOrigin} />
        </CardContent>
      </Card>

      {/* Nutritional Information */}
      <Card>
        <CardHeader>
          <CardTitle>Nutritional Information</CardTitle>
        </CardHeader>
        <CardContent>
          <InfoRow label="Portion Size" value={product.portionSize} />
          <InfoRow label="Energy (kcal)" value={product.kcal} />
          <InfoRow label="Energy (kJ)" value={product.kj} />
          <InfoRow label="Fat" value={product.fat} />
          <InfoRow label="Carbohydrates" value={product.carbohydrates} />
          {product.packagingGases && (
            <InfoRow label="Packaging Gases" value={product.packagingGases} />
          )}
        </CardContent>
      </Card>

      {/* Operator Information */}
      {(product.operatorName || product.operatorAddress || product.operatorType) && (
        <Card>
          <CardHeader>
            <CardTitle>Operator Information</CardTitle>
          </CardHeader>
          <CardContent>
            <InfoRow label="Operator Type" value={product.operatorType} />
            <InfoRow label="Operator Name" value={product.operatorName} />
            <InfoRow label="Operator Address" value={product.operatorAddress} />
            <InfoRow label="Additional Info" value={product.operatorInfo} />
          </CardContent>
        </Card>
      )}

      {/* Product Identifiers */}
      {(product.sku || product.ean) && (
        <Card>
          <CardHeader>
            <CardTitle>Product Identifiers</CardTitle>
          </CardHeader>
          <CardContent>
            <InfoRow label="SKU" value={product.sku} />
            <InfoRow label="EAN" value={product.ean} />
          </CardContent>
        </Card>
      )}

      {/* Links */}
      {(product.externalLink || product.redirectLink) && (
        <Card>
          <CardHeader>
            <CardTitle>Links</CardTitle>
          </CardHeader>
          <CardContent>
            {product.externalLink && (
              <div className="flex justify-between border-b py-2">
                <span className="text-gray-600">External Link</span>
                <a
                  href={product.externalLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  {product.externalLink}
                </a>
              </div>
            )}
            {product.redirectLink && (
              <div className="flex justify-between py-2">
                <span className="text-gray-600">Redirect Link</span>
                <a
                  href={product.redirectLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  {product.redirectLink}
                </a>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Back Button */}
      <div className="flex justify-center">
        <Button variant="outline" onClick={() => router.push('/dashboard')}>
          Back to Dashboard
        </Button>
      </div>
    </div>
  );
}
