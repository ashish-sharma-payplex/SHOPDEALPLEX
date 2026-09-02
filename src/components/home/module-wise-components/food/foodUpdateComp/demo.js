import { useEffect, useState } from 'react';
import axios from 'axios';
import { Container, TextField, Grid, Card, CardContent, Typography, CardMedia, CircularProgress } from '@mui/material';

export default function Homedemo() {
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);  // Holds all the fetched products
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredProducts, setFilteredProducts] = useState([]);  // Holds filtered products based on search query

  // Fetch categories and products
  useEffect(() => {
    async function fetchCategories() {
      try {
        setLoading(true);

        // Fetch categories data
        const response = await axios.get('https://dealplex.in/api/v1/categories', {
          headers: {
            'moduleId': '5',
            'zoneId': JSON.stringify([15, 17]),
            'Content-Type': 'application/json',
          },
        });

     
        // console.log("Categories Data: ", response.data);  // Log the response for debugging

        const categoryData = response.data.categories || [];
        setCategories(categoryData);

        // Fetch products for each category and subcategory
        let allProducts = [];  // Array to store all products fetched
        for (let category of categoryData) {
          for (let subCategory of category.subCategories) {
            const subCategoryId = subCategory.id;
            const url = `https://dealplex.in/api/v1/categories/items/list?category_ids=[${subCategoryId}]&limit=100&offset=1`;

            // console.log(`Fetching products for Subcategory ID: ${subCategoryId}`);  // Log subcategory ID

            try {
              const prodResp = await axios.get(url, {
                headers: {
                  'moduleId': '5',
                  'zoneId': JSON.stringify([15, 17]),
                  'Content-Type': 'application/json',
                },
              });

              // Log the full product response and the items inside it
              // console.log(`Response from Product API for subCategory (${subCategory.name}):`, prodResp);
              // console.log(`Product items in response:`, prodResp.data.items);

              let productsData = prodResp.data.items || [];
              if (productsData.length === 0) {
                // console.warn(`No products found for subCategory: ${subCategory.name} (ID: ${subCategoryId})`);
              }

              // Add category and subcategory info to each product
              productsData = productsData.map(product => ({
                ...product,
                categoryName: category.name,
                subCategoryName: subCategory.name,
              }));

              // Add the fetched products to the allProducts array
              allProducts = [...allProducts, ...productsData];
            } catch (err) {
              // console.error('Error fetching products for subCategory', subCategoryId, err);
            }
          }
        }

        // console.log("All Products: ", allProducts);  // Log all products after fetching

        // Set all fetched products to the state
        setProducts(allProducts);
        setFilteredProducts(allProducts);  // Initially set filtered products to all fetched products
      } catch (error) {
        // console.error('Error fetching categories', error);
      } finally {
        setLoading(false);
      }
    }

    fetchCategories();
  }, []);

  // Search functionality for filtering products based on search query
  useEffect(() => {
    // console.log("Search Query: ", searchQuery);  // Log search query

    if (searchQuery) {
      const filtered = products.filter((product) =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.categoryName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.subCategoryName.toLowerCase().includes(searchQuery.toLowerCase())
      );

      // console.log("Filtered Products: ", filtered);  // Log filtered products

      setFilteredProducts(filtered);  // Update filtered products
    } else {
      setFilteredProducts(products);  // If no search query, show all products
    }
  }, [searchQuery, products]);  // Re-run this effect when products or searchQuery changes

  return (
    <Container>
      {/* Search bar */}
      <TextField
        label="Search Products"
        variant="outlined"
        fullWidth
        margin="normal"
        onChange={(e) => setSearchQuery(e.target.value)}  // Update search query
      />

      {/* Loading indicator or product cards */}
      {loading ? (
        <CircularProgress />
      ) : (
        <Grid container spacing={3}>
          {filteredProducts.map((product) => (
            <Grid item xs={12} sm={6} md={4} key={product.id}>
              <ProductCard product={product} />
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
}

// Product card component
function ProductCard({ product }) {
  return (
    <Card>
      <CardMedia
        component="img"
        height="140"
        image={product.image || '/default-image.jpg'}  // Fallback image if product image is not available
        alt={product.name}
      />
      <CardContent>
        <Typography variant="h6">{product.name}</Typography>
        <Typography color="textSecondary">{product.categoryName}</Typography>
        <Typography color="textSecondary">{product.subCategoryName}</Typography>
        <Typography variant="body2" color="textSecondary">
          {product.price ? `₹${product.price}` : 'Price not available'}
        </Typography>
      </CardContent>
    </Card>
  );
}
