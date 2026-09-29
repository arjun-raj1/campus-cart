-- Supabase Schema for Campus Cart
-- Run this in your Supabase SQL Editor to create the necessary tables.

CREATE TABLE products (
  "id" uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  "name" text DEFAULT '',
  "price" numeric DEFAULT 0,
  "category" text DEFAULT '',
  "description" text DEFAULT '',
  "seller" text DEFAULT 'Anonymous',
  "phone" text DEFAULT '',
  "image" text DEFAULT '',
  "status" text DEFAULT 'available',
  "createdAt" timestamp with time zone DEFAULT now()
);

CREATE TABLE orders (
  "id" uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  "productId" uuid REFERENCES products(id) ON DELETE CASCADE,
  "productName" text,
  "productImage" text,
  "category" text,
  "price" numeric,
  "seller" text,
  "sellerPhone" text,
  "buyerName" text DEFAULT 'Anonymous',
  "buyerPhone" text DEFAULT '',
  "buyerEmail" text DEFAULT '',
  "note" text DEFAULT '',
  "status" text DEFAULT 'confirmed',
  "orderedAt" timestamp with time zone DEFAULT now()
);

-- Note: Because we use camelCase columns to match the existing frontend, 
-- when writing raw SQL queries, you must wrap column names in double quotes, e.g., "productId"
