
import { db } from '@/libs/DB';
import { products } from '@/models/Schema';
import { notFound } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Card } from '@/components/ui/card';
import { eq } from 'drizzle-orm';

interface ProductPageProps {
  params: { id: string; locale: string };
}

function StatusIcon({ active, label }: { active?: boolean | null; label: string }) {
  if (!active) return null;
  return (
    <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 rounded text-xs font-medium mr-2">
      <svg width="16" height="16" fill="currentColor" className="inline-block"><circle cx="8" cy="8" r="7" stroke="green" strokeWidth="2" fill="white" /><circle cx="8" cy="8" r="4" fill="green" /></svg>
      {label}
    </span>
  );
}

export default async function ProductPage({ params }: ProductPageProps) {
  const t = useTranslations('product');
  const productId = parseInt(params.id, 10);
  const product = await db
    .select()
    .from(products)
    .where(eq(products.id, productId))
    .limit(1);

  if (!product || product.length === 0) {
    notFound();
  }

  const p = product[0]!;

  return (
    <main className="flex justify-center items-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-200">
      <Card className="max-w-2xl w-full p-0 shadow-xl overflow-hidden">
        {/* Product Image */}
        {p.imageUrl && (
          <div className="w-full h-64 bg-gray-100 flex items-center justify-center overflow-hidden">
            <img src={p.imageUrl} alt={p.name} className="object-contain h-full w-full" />
          </div>
        )}
        <div className="p-8">
          <h1 className="text-3xl font-bold mb-2 text-gray-900">{p.name}</h1>
          {p.brand && <div className="text-lg text-gray-600 mb-4">{p.brand}</div>}

          <div className="flex flex-wrap gap-2 mb-4">
            <StatusIcon active={p.organic} label="Organic" />
            <StatusIcon active={p.vegan} label="Vegan" />
            <StatusIcon active={p.vegetarian} label="Vegetarian" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2 mb-6">
            {p.vintage && <div><strong>{t('vintage') || 'Vintage'}:</strong> {p.vintage}</div>}
            {p.wineType && <div><strong>{t('wineType') || 'Type'}:</strong> {p.wineType}</div>}
            {p.appellation && <div><strong>{t('appellation') || 'Appellation'}:</strong> {p.appellation}</div>}
            {p.alcoholContent && <div><strong>{t('alcoholContent') || 'Alcohol'}:</strong> {p.alcoholContent}%</div>}
            {p.sugarContent && <div><strong>{t('sugarContent') || 'Sugar'}:</strong> {p.sugarContent}</div>}
            {p.netVolume && <div><strong>{t('netVolume') || 'Net Volume'}:</strong> {p.netVolume}</div>}
            {p.portionSize && <div><strong>{t('portionSize') || 'Portion Size'}:</strong> {p.portionSize}</div>}
            {p.packagingGases && <div><strong>{t('packagingGases') || 'Packaging Gases'}:</strong> {p.packagingGases}</div>}
            {p.countryOfOrigin && <div><strong>{t('countryOfOrigin') || 'Country'}:</strong> {p.countryOfOrigin}</div>}
            {p.operatorName && <div><strong>{t('operatorName') || 'Operator'}:</strong> {p.operatorName}</div>}
            {p.operatorAddress && <div><strong>{t('operatorAddress') || 'Operator Address'}:</strong> {p.operatorAddress}</div>}
            {p.operatorInfo && <div><strong>{t('operatorInfo') || 'Operator Info'}:</strong> {p.operatorInfo}</div>}
            {p.sku && <div><strong>{t('sku') || 'SKU'}:</strong> {p.sku}</div>}
            {p.ean && <div><strong>{t('ean') || 'EAN'}:</strong> {p.ean}</div>}
          </div>

          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-2">Nutritional Information</h2>
            <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-sm">
              {p.kcal && <div><strong>Kcal:</strong> {p.kcal}</div>}
              {p.kj && <div><strong>KJ:</strong> {p.kj}</div>}
              {p.fat && <div><strong>Fat:</strong> {p.fat}</div>}
              {p.carbohydrates && <div><strong>Carbs:</strong> {p.carbohydrates}</div>}
            </div>
          </div>

          {p.externalLink && (
            <a href={p.externalLink} target="_blank" rel="noopener noreferrer" className="inline-block mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition">
              {t('externalLink') || 'More Info'}
            </a>
          )}
        </div>
      </Card>
    </main>
  );
}
