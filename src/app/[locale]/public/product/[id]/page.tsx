
import { db } from '@/libs/DB';
import { ingredients, productIngredients, products } from '@/models/Schema';
import { notFound } from 'next/navigation';
import { getTranslations, unstable_setRequestLocale } from 'next-intl/server';
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
  unstable_setRequestLocale(params.locale);
  const t = await getTranslations({ locale: params.locale, namespace: 'product' });
  const productId = Number.parseInt(params.id, 10);
  if (Number.isNaN(productId)) {
    notFound();
  }

  const product = await db
    .select()
    .from(products)
    .where(eq(products.id, productId))
    .limit(1);

  if (!product || product.length === 0) {
    notFound();
  }

  const p = product[0]!;

  const productIngredientsList = await db
    .select({
      id: ingredients.id,
      name: ingredients.name,
      category: ingredients.category,
      eNumber: ingredients.eNumber,
      allergens: ingredients.allergens,
      details: ingredients.details,
    })
    .from(productIngredients)
    .innerJoin(ingredients, eq(productIngredients.ingredientId, ingredients.id))
    .where(eq(productIngredients.productId, productId));

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
            <StatusIcon active={p.organic} label={t('organic')} />
            <StatusIcon active={p.vegan} label={t('vegan')} />
            <StatusIcon active={p.vegetarian} label={t('vegetarian')} />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2 mb-6">
            {p.vintage && <div><strong>{t('vintage')}:</strong> {p.vintage}</div>}
            {p.wineType && <div><strong>{t('wineType')}:</strong> {p.wineType}</div>}
            {p.appellation && <div><strong>{t('appellation')}:</strong> {p.appellation}</div>}
            {p.alcoholContent && <div><strong>{t('alcoholContent')}:</strong> {p.alcoholContent}%</div>}
            {p.sugarContent && <div><strong>{t('sugarContent')}:</strong> {p.sugarContent}</div>}
            {p.netVolume && <div><strong>{t('netVolume')}:</strong> {p.netVolume}</div>}
            {p.portionSize && <div><strong>{t('portionSize')}:</strong> {p.portionSize}</div>}
            {p.packagingGases && <div><strong>{t('packagingGases')}:</strong> {p.packagingGases}</div>}
            {p.countryOfOrigin && <div><strong>{t('countryOfOrigin')}:</strong> {p.countryOfOrigin}</div>}
            {p.operatorName && <div><strong>{t('operatorName')}:</strong> {p.operatorName}</div>}
            {p.operatorAddress && <div><strong>{t('operatorAddress')}:</strong> {p.operatorAddress}</div>}
            {p.operatorInfo && <div><strong>{t('operatorInfo')}:</strong> {p.operatorInfo}</div>}
            {p.sku && <div><strong>{t('sku')}:</strong> {p.sku}</div>}
            {p.ean && <div><strong>{t('ean')}:</strong> {p.ean}</div>}
          </div>

          {/* Ingredients & Allergens Section */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-2">{t('ingredients_allergens_title')}</h2>
            {productIngredientsList.length > 0 ? (
              <ul className="list-disc pl-5 text-sm space-y-1">
                {productIngredientsList.map(ing => (
                  <li key={ing.id}>
                    <span className="font-medium">{ing.name}</span>
                    {ing.eNumber && <span className="text-gray-500"> ({ing.eNumber})</span>}
                    {ing.category && <span className="text-gray-500"> - {ing.category}</span>}
                    {ing.allergens && ing.allergens.length > 0 && (
                      <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-amber-100 text-amber-800">
                        {t('allergens_prefix')}: {ing.allergens.join(', ')}
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-500">{t('no_ingredients')}</p>
            )}
          </div>

          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-2">{t('nutritional_info_title')}</h2>
            <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-sm">
              {p.kcal && <div><strong>{t('kcal')}:</strong> {p.kcal}</div>}
              {p.kj && <div><strong>{t('kj')}:</strong> {p.kj}</div>}
              {p.fat && <div><strong>{t('fat')}:</strong> {p.fat}</div>}
              {p.carbohydrates && <div><strong>{t('carbohydrates')}:</strong> {p.carbohydrates}</div>}
            </div>
          </div>

          {p.externalLink && (
            <a href={p.externalLink} target="_blank" rel="noopener noreferrer" className="inline-block mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition">
              {t('externalLink')}
            </a>
          )}
        </div>
      </Card>
    </main>
  );
}
