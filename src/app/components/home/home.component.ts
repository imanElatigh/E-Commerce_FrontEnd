import { Component, OnInit } from '@angular/core';
import { NavbarComponent } from '../navbar/navbar.component';
import { FooterComponent } from '../footer/footer.component';
import { CommonModule } from '@angular/common';
import {
  Product,
  ProductService,
  PageResponse,
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

    // Fetch Alimentaire products
    this.productService.getProductsByCategory('ALIMENTAIRE', 0, 3).subscribe({
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

    // Fetch Electromenager products
    this.productService
      .getProductsByCategory('ELECTROMENAGER', 0, 3)
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

    // Fetch Electronique products
    this.productService.getProductsByCategory('ELECTRONIQUE', 0, 3).subscribe({
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
