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


  categories = [
    { id: 'ALIMENTAIRE', name: 'Alimentaire' },
    { id: 'ELECTROMENAGER', name: 'Électroménager' },
    { id: 'ELECTRONIQUE', name: 'Électronique' },
  ];


  selectedCategory: string | undefined = undefined;

  constructor(
    private productService: ProductService,
    private cartService: CartService
  ) {}

  ngOnInit(): void {
    this.fetchProductsByCategory();
  }

  fetchProductsByCategory(): void {

    this.alimentaireProducts = [];
    this.electromenagerProducts = [];
    this.electroniqueProducts = [];


    const filterOptions: ProductFilterOptions = {
      page: 0,
      size: 3,
    };


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

      this.alimentaireProducts = [];
      this.loading.alimentaire = false;
    }


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

      this.electromenagerProducts = [];
      this.loading.electromenager = false;
    }


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

      this.electroniqueProducts = [];
      this.loading.electronique = false;
    }
  }


  filterByCategory(category?: string): void {
    this.selectedCategory = category;
    this.fetchProductsByCategory();
  }


  initProductQuantities(products: Product[]): void {
    products.forEach((product) => {
      if (product.id !== undefined) {
        this.productQuantities[product.id] = 1;
      }
    });
  }


  decreaseQuantity(productId: number): void {
    if (this.productQuantities[productId] > 1) {
      this.productQuantities[productId]--;
    }
  }

  increaseQuantity(productId: number): void {
    this.productQuantities[productId]++;
  }


  addToCart(product: Product): void {
    const quantity =
      product.id !== undefined ? this.productQuantities[product.id] : 1;
    this.cartService.addToCart(product, quantity);
  }
}
