import { describe, expect, it } from 'vitest';
import enMessages from './en.json';
import frMessages from './fr.json';

describe('Internationalization / Translation Verification', () => {
  it('should have the "product" namespace in both en.json and fr.json', () => {
    expect(enMessages).toHaveProperty('product');
    expect(frMessages).toHaveProperty('product');
  });

  const requiredProductKeys = [
    'vintage',
    'wineType',
    'appellation',
    'alcoholContent',
    'sugarContent',
    'netVolume',
    'portionSize',
    'packagingGases',
    'countryOfOrigin',
    'operatorName',
    'operatorAddress',
    'operatorInfo',
    'sku',
    'ean',
    'externalLink',
    'ingredients_allergens_title',
    'allergens_prefix',
    'no_ingredients',
    'nutritional_info_title',
    'kcal',
    'kj',
    'fat',
    'carbohydrates',
    'organic',
    'vegan',
    'vegetarian',
  ] as const;

  it('should have all required product keys in en.json with non-empty string values', () => {
    const enProduct = (enMessages as Record<string, any>).product;
    for (const key of requiredProductKeys) {
      expect(enProduct[key], `Missing English key: product.${key}`).toBeDefined();
      expect(typeof enProduct[key]).toBe('string');
      expect(enProduct[key].trim().length).toBeGreaterThan(0);
    }
  });

  it('should have all required product keys in fr.json with non-empty string values', () => {
    const frProduct = (frMessages as Record<string, any>).product;
    for (const key of requiredProductKeys) {
      expect(frProduct[key], `Missing French key: product.${key}`).toBeDefined();
      expect(typeof frProduct[key]).toBe('string');
      expect(frProduct[key].trim().length).toBeGreaterThan(0);
    }
  });

  it('should have matching key parity between en.json and fr.json under product', () => {
    const enKeys = Object.keys((enMessages as Record<string, any>).product).sort();
    const frKeys = Object.keys((frMessages as Record<string, any>).product).sort();
    expect(frKeys).toEqual(enKeys);
  });

  it('should have distinct French translations and not untranslated English fallbacks', () => {
    const enProduct = (enMessages as Record<string, any>).product;
    const frProduct = (frMessages as Record<string, any>).product;

    // Check specific keys that must differ between English and French
    expect(frProduct.vintage).not.toEqual(enProduct.vintage);
    expect(frProduct.vintage).toBe('Millésime');

    expect(frProduct.wineType).not.toEqual(enProduct.wineType);
    expect(frProduct.wineType).toBe('Type de vin');

    expect(frProduct.ingredients_allergens_title).not.toEqual(enProduct.ingredients_allergens_title);
    expect(frProduct.ingredients_allergens_title).toBe('Ingrédients et allergènes');

    expect(frProduct.allergens_prefix).not.toEqual(enProduct.allergens_prefix);
    expect(frProduct.allergens_prefix).toBe('Allergènes');

    expect(frProduct.nutritional_info_title).not.toEqual(enProduct.nutritional_info_title);
    expect(frProduct.nutritional_info_title).toBe('Informations nutritionnelles');

    expect(frProduct.organic).not.toEqual(enProduct.organic);
    expect(frProduct.organic).toBe('Biologique');
  });

  it('should translate correctly using next-intl createTranslator for both locales without fallback errors', () => {
    const { createTranslator } = require('next-intl');
    const tEn = createTranslator({ locale: 'en', messages: enMessages, namespace: 'product' });
    const tFr = createTranslator({ locale: 'fr', messages: frMessages, namespace: 'product' });

    expect(tEn('vintage')).toBe('Vintage');
    expect(tFr('vintage')).toBe('Millésime');

    expect(tEn('ingredients_allergens_title')).toBe('Ingredients & Allergens');
    expect(tFr('ingredients_allergens_title')).toBe('Ingrédients et allergènes');

    expect(tEn('allergens_prefix')).toBe('Allergens');
    expect(tFr('allergens_prefix')).toBe('Allergènes');

    expect(tEn('no_ingredients')).toBe('No ingredients specified.');
    expect(tFr('no_ingredients')).toBe('Aucun ingrédient spécifié.');

    expect(tEn('nutritional_info_title')).toBe('Nutritional Information');
    expect(tFr('nutritional_info_title')).toBe('Informations nutritionnelles');

    expect(tEn('kcal')).toBe('Kcal');
    expect(tFr('kcal')).toBe('Kcal');

    expect(tEn('fat')).toBe('Fat');
    expect(tFr('fat')).toBe('Matières grasses');

    expect(tEn('carbohydrates')).toBe('Carbs');
    expect(tFr('carbohydrates')).toBe('Glucides');

    expect(tEn('organic')).toBe('Organic');
    expect(tFr('organic')).toBe('Biologique');

    expect(tEn('vegan')).toBe('Vegan');
    expect(tFr('vegan')).toBe('Végétalien');

    expect(tEn('vegetarian')).toBe('Vegetarian');
    expect(tFr('vegetarian')).toBe('Végétarien');
  });
});
