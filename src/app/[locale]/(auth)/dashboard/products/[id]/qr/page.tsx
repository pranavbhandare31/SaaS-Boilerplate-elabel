'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { Product } from '@/models/Schema';

// Simple QR Code component using a free API
const QRCode = ({ value, size = 200 }: { value: string; size?: number }) => {
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(value)}`;

  return (
    <Image
      src={qrUrl}
      alt="QR Code"
      width={size}
      height={size}
      className="rounded-lg"
      unoptimized
    />
  );
};

const getProductUrl = (productId: string | string[] | undefined) => {
  if (typeof window !== 'undefined' && productId) {
    const id = Array.isArray(productId) ? productId[0] : productId;
    return `${window.location.origin}/public/products/${id}`;
  }
  return '';
};

export default function QRLabelPage() {
  const params = useParams();
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const printRef = useRef<HTMLDivElement>(null);

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

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = async () => {
    if (!product) {
      return;
    }

    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(getProductUrl(params.id))}`;

    try {
      const response = await fetch(qrUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `qr-${product.name.replace(/\s+/g, '-').toLowerCase()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading QR code:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <p className="text-gray-500">Loading...</p>
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
    <div className="mx-auto max-w-2xl space-y-6">
      {/* QR Label Preview */}
      <Card>
        <CardHeader>
          <CardTitle>
            QR Label for
            {' '}
            {product.name}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div
            ref={printRef}
            className="flex flex-col items-center rounded-lg border-2 border-dashed border-gray-200 bg-white p-8"
          >
            {/* Product Info Header */}
            <div className="mb-4 text-center">
              <h2 className="text-xl font-bold">{product.name}</h2>
              {product.brand && (
                <p className="text-gray-600">{product.brand}</p>
              )}
            </div>

            {/* QR Code */}
            <div className="my-4">
              <QRCode value={getProductUrl(params.id)} size={200} />
            </div>

            {/* Product Details */}
            <div className="mt-4 w-full max-w-xs space-y-2 text-center text-sm">
              {product.wineType && (
                <p>
                  <span className="text-gray-500">Type:</span>
                  {' '}
                  {product.wineType}
                </p>
              )}
              {product.vintage && (
                <p>
                  <span className="text-gray-500">Vintage:</span>
                  {' '}
                  {product.vintage}
                </p>
              )}
              {product.netVolume && (
                <p>
                  <span className="text-gray-500">Volume:</span>
                  {' '}
                  {product.netVolume}
                </p>
              )}
              {product.alcoholContent && (
                <p>
                  <span className="text-gray-500">Alcohol:</span>
                  {' '}
                  {product.alcoholContent}
                </p>
              )}
              {product.countryOfOrigin && (
                <p>
                  <span className="text-gray-500">Origin:</span>
                  {' '}
                  {product.countryOfOrigin}
                </p>
              )}
            </div>

            {/* Dietary Badges */}
            <div className="mt-4 flex flex-wrap justify-center gap-2">
              {product.organic && (
                <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-800">
                  Organic
                </span>
              )}
              {product.vegetarian && (
                <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-800">
                  Vegetarian
                </span>
              )}
              {product.vegan && (
                <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-800">
                  Vegan
                </span>
              )}
            </div>

            {/* Scan Instruction */}
            <p className="mt-6 text-xs text-gray-400">
              Scan QR code for full product information
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Label Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <Button onClick={handlePrint} className="flex items-center gap-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="size-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="6 9 6 2 18 2 18 9" />
                <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
                <rect width="12" height="8" x="6" y="14" />
              </svg>
              Print Label
            </Button>
            <Button variant="outline" onClick={handleDownload} className="flex items-center gap-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="size-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" x2="12" y1="15" y2="3" />
              </svg>
              Download QR Code
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-center gap-4">
        <Link href={`/dashboard/products/${params.id}`}>
          <Button variant="outline">View Product Details</Button>
        </Link>
        <Button variant="outline" onClick={() => router.push('/dashboard')}>
          Back to Dashboard
        </Button>
      </div>
    </div>
  );
}
