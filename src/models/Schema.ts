import { boolean, integer, pgTable, serial, text, timestamp, varchar } from 'drizzle-orm/pg-core';
import { z } from 'zod';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  username: varchar('username', { length: 50 }).notNull().unique(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  password: varchar('password', { length: 255 }).notNull(),
  isEmailConfirmed: boolean('is_email_confirmed').default(false).notNull(),
  emailConfirmationToken: varchar('email_confirmation_token', { length: 255 }),
  emailConfirmationTokenExpiry: timestamp('email_confirmation_token_expiry'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const products = pgTable('products', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  brand: text('brand'),
  netVolume: text('net_volume'),
  vintage: text('vintage'),
  wineType: text('wine_type'),
  sugarContent: text('sugar_content'),
  appellation: text('appellation'),
  alcoholContent: text('alcohol_content'),
  packagingGases: text('packaging_gases'),
  portionSize: text('portion_size'),
  kcal: text('kcal'),
  kj: text('kj'),
  fat: text('fat'),
  carbohydrates: text('carbohydrates'),
  organic: boolean('organic').default(false),
  vegetarian: boolean('vegetarian').default(false),
  vegan: boolean('vegan').default(false),
  operatorType: text('operator_type'),
  operatorName: text('operator_name'),
  operatorAddress: text('operator_address'),
  operatorInfo: text('operator_info'),
  countryOfOrigin: text('country_of_origin'),
  sku: text('sku'),
  ean: text('ean'),
  externalLink: text('external_link'),
  redirectLink: text('redirect_link'),
  imageUrl: text('image_url'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
  createdBy: integer('created_by'),
});

export const ingredients = pgTable('ingredients', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  category: text('category'),
  eNumber: text('e_number'),
  allergens: text('allergens').array(),
  details: text('details'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
  createdBy: integer('created_by'),
});

export const insertUserSchema = z.object({
  username: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(1),
});

export const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const registerSchema = z
  .object({
    username: z.string().min(3, 'Username must be at least 3 characters'),
    email: z.string().email('Please enter a valid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string(),
  })
  .refine(data => data.password === data.confirmPassword, {
    message: 'Passwords don\'t match',
    path: ['confirmPassword'],
  });

export const insertProductSchema = z.object({
  name: z.string().min(1),
  brand: z.string().nullish(),
  netVolume: z.string().nullish(),
  vintage: z.string().nullish(),
  wineType: z.string().nullish(),
  sugarContent: z.string().nullish(),
  appellation: z.string().nullish(),
  alcoholContent: z.string().nullish(),
  packagingGases: z.string().nullish(),
  portionSize: z.string().nullish(),
  kcal: z.string().nullish(),
  kj: z.string().nullish(),
  fat: z.string().nullish(),
  carbohydrates: z.string().nullish(),
  organic: z.boolean().nullish(),
  vegetarian: z.boolean().nullish(),
  vegan: z.boolean().nullish(),
  operatorType: z.string().nullish(),
  operatorName: z.string().nullish(),
  operatorAddress: z.string().nullish(),
  operatorInfo: z.string().nullish(),
  countryOfOrigin: z.string().nullish(),
  sku: z.string().nullish(),
  ean: z.string().nullish(),
  externalLink: z.string().nullish(),
  redirectLink: z.string().nullish(),
  imageUrl: z.string().nullish(),
  createdBy: z.number().nullish(),
});

export const importProductSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  brand: z.string().optional(),
  netVolume: z.string().optional(),
  vintage: z
    .union([z.string(), z.number()])
    .transform(val => String(val))
    .optional(),
  wineType: z.string().optional(),
  sugarContent: z.string().optional(),
  appellation: z.string().optional(),
  alcoholContent: z
    .union([z.string(), z.number()])
    .transform(val => String(val))
    .optional(),
  packagingGases: z.string().optional(),
  portionSize: z.string().optional(),
  kcal: z
    .union([z.string(), z.number()])
    .transform(val => String(val))
    .optional(),
  kj: z
    .union([z.string(), z.number()])
    .transform(val => String(val))
    .optional(),
  fat: z
    .union([z.string(), z.number()])
    .transform(val => String(val))
    .optional(),
  carbohydrates: z
    .union([z.string(), z.number()])
    .transform(val => String(val))
    .optional(),
  organic: z.boolean().default(false),
  vegetarian: z.boolean().default(false),
  vegan: z.boolean().default(false),
  operatorType: z.string().optional(),
  operatorName: z.string().optional(),
  operatorAddress: z.string().optional(),
  operatorInfo: z.string().optional(),
  countryOfOrigin: z.string().optional(),
  sku: z
    .union([z.string(), z.number()])
    .transform(val => String(val))
    .optional(),
  ean: z.string().optional(),
  externalLink: z.string().optional(),
  redirectLink: z.string().optional(),
  imageUrl: z.string().optional(),
  createdBy: z.number().optional(),
});

export const insertIngredientSchema = z.object({
  name: z.string().min(1),
  category: z.string().nullish(),
  eNumber: z.string().nullish(),
  allergens: z.array(z.string()).nullish(),
  details: z.string().nullish(),
  createdBy: z.number().nullish(),
});

export type User = typeof users.$inferSelect;
export type Product = typeof products.$inferSelect;
export type Ingredient = typeof ingredients.$inferSelect;
