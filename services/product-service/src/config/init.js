db = db.getSiblingDB('products');
db.createCollection('products');
db.createCollection('categories');
db.products.createIndex({ name: "text", description: "text" });
db.products.createIndex({ category: 1 });
db.categories.insertMany([
  { name: "Electronics", slug: "electronics", isActive: true },
  { name: "Clothing", slug: "clothing", isActive: true },
  { name: "Books", slug: "books", isActive: true },
  { name: "Home & Garden", slug: "home-garden", isActive: true }
]);
