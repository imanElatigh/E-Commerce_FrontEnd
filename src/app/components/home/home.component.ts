import { Component, OnInit } from '@angular/core';
import { NavbarComponent } from '../navbar/navbar.component';
import { FooterComponent } from '../footer/footer.component';
import { CommonModule } from '@angular/common';
import {
  Product,
  ProductService,
  PageResponse,
  ProductFilterOptions,
} from '../../core/services/product.service';
import { CartService } from '../../core/services/cart.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [NavbarComponent, FooterComponent, CommonModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
})
export class HomeComponent implements OnInit {
  alimentaireProducts: Product[] = [];
  electromenagerProducts: Product[] = [];
  electroniqueProducts: Product[] = [];

  // Track quantities for each product
  productQuantities: { [productId: number]: number } = {};

  loading = {
    alimentaire: true,
    electromenager: true,
    electronique: true,
  };

  error = {
    alimentaire: false,
    electromenager: false,
    electronique: false,
  };

  // Define categories
  categories = [
    { id: 'ALIMENTAIRE', name: 'Alimentaire' },
    { id: 'ELECTROMENAGER', name: 'Électroménager' },
    { id: 'ELECTRONIQUE', name: 'Électronique' },
  ];

  // Currently selected category
  selectedCategory: string | undefined = undefined;

  constructor(
    private productService: ProductService,
    private cartService: CartService
  ) {}

  ngOnInit(): void {
    this.fetchProductsByCategory();
  }

  fetchProductsByCategory(): void {
    // Initialize arrays to prevent errors
    this.alimentaireProducts = [];
    this.electromenagerProducts = [];
    this.electroniqueProducts = [];

    // Filter options object with only category and size
    const filterOptions: ProductFilterOptions = {
      page: 0,
      size: 3,
    };

    // Fetch Alimentaire products (only if no category selected or if ALIMENTAIRE selected)
    if (!this.selectedCategory || this.selectedCategory === 'ALIMENTAIRE') {
      this.loading.alimentaire = true;
      this.productService
        .getProductsByCategory('ALIMENTAIRE', filterOptions)
        .subscribe({
          next: (response: PageResponse<Product>) => {
            this.alimentaireProducts = response.content;
            this.initProductQuantities(this.alimentaireProducts);
            this.loading.alimentaire = false;
          },
          error: (err) => {
            console.error('Error fetching ALIMENTAIRE products:', err);
            this.loading.alimentaire = false;
            this.error.alimentaire = true;
          },
        });
    } else {
      // If a different category is selected, empty this array
      this.alimentaireProducts = [];
      this.loading.alimentaire = false;
    }

    // Fetch Electromenager products (only if no category selected or if ELECTROMENAGER selected)
    if (!this.selectedCategory || this.selectedCategory === 'ELECTROMENAGER') {
      this.loading.electromenager = true;
      this.productService
        .getProductsByCategory('ELECTROMENAGER', filterOptions)
        .subscribe({
          next: (response: PageResponse<Product>) => {
            this.electromenagerProducts = response.content;
            this.initProductQuantities(this.electromenagerProducts);
            this.loading.electromenager = false;
          },
          error: (err) => {
            console.error('Error fetching ELECTROMENAGER products:', err);
            this.loading.electromenager = false;
            this.error.electromenager = true;
          },
        });
    } else {
      // If a different category is selected, empty this array
      this.electromenagerProducts = [];
      this.loading.electromenager = false;
    }

    // Fetch Electronique products (only if no category selected or if ELECTRONIQUE selected)
    if (!this.selectedCategory || this.selectedCategory === 'ELECTRONIQUE') {
      this.loading.electronique = true;
      this.productService
        .getProductsByCategory('ELECTRONIQUE', filterOptions)
        .subscribe({
          next: (response: PageResponse<Product>) => {
            this.electroniqueProducts = response.content;
            this.initProductQuantities(this.electroniqueProducts);
            this.loading.electronique = false;
          },
          error: (err) => {
            console.error('Error fetching ELECTRONIQUE products:', err);
            this.loading.electronique = false;
            this.error.electronique = true;
          },
        });
    } else {
      // If a different category is selected, empty this array
      this.electroniqueProducts = [];
      this.loading.electronique = false;
    }
  }

  // Method to filter by category
  filterByCategory(category?: string): void {
    this.selectedCategory = category;
    this.fetchProductsByCategory();
  }

  // Initialize product quantities
  initProductQuantities(products: Product[]): void {
    products.forEach((product) => {
      if (product.id !== undefined) {
        this.productQuantities[product.id] = 1;
      }
    });
  }

  // Methods for quantity controls
  decreaseQuantity(productId: number): void {
    if (this.productQuantities[productId] > 1) {
      this.productQuantities[productId]--;
    }
  }

  increaseQuantity(productId: number): void {
    this.productQuantities[productId]++;
  }

  // Method to add product to cart
  addToCart(product: Product): void {
    const quantity =
      product.id !== undefined ? this.productQuantities[product.id] : 1;
    this.cartService.addToCart(product, quantity);
  }
}
