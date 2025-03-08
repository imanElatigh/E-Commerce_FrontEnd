import { Component, OnInit } from '@angular/core';
import { FooterComponent } from '../footer/footer.component';
import { NavbarComponent } from '../navbar/navbar.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  PageResponse,
  Product,
  ProductService,
  ProductFilterOptions,
} from '../../core/services/product.service';
import { CartService } from '../../core/services/cart.service';

@Component({
  selector: 'app-produits-alimentaires',
  standalone: true,
  imports: [FooterComponent, NavbarComponent, CommonModule, FormsModule],
  templateUrl: './produits-alimentaires.component.html',
  styleUrl: './produits-alimentaires.component.css',
})
export class ProduitsAlimentairesComponent implements OnInit {
  products: Product[] = [];
  loading = true;
  error = false;


  productQuantities: { [productId: number]: number } = {};


  currentPage = 0;
  pageSize = 8;
  totalPages = 0;
  totalElements = 0;
  isLastPage = false;
  isFirstPage = true;


  filterOptions: ProductFilterOptions = {
    name: '',
    minPrice: undefined,
    maxPrice: undefined,
    page: 0,
    size: 8,
  };

  constructor(
    private productService: ProductService,
    private cartService: CartService
  ) {}

  ngOnInit(): void {
    this.loadProducts();
  }

  loadProducts(): void {
    this.loading = true;


    this.filterOptions.page = this.currentPage;
    this.filterOptions.size = this.pageSize;

    this.productService
      .getProductsByCategory('ALIMENTAIRE', this.filterOptions)
      .subscribe({
        next: (response: PageResponse<Product>) => {
          this.products = response.content;
          this.initProductQuantities(this.products);
          this.totalPages = response.totalPages;
          this.totalElements = response.totalElements;
          this.isLastPage = response.last;
          this.isFirstPage = response.first;
          this.currentPage = response.number;
          this.loading = false;
        },
        error: (err) => {
          console.error('Error fetching ALIMENTAIRE products:', err);
          this.loading = false;
          this.error = true;
          this.products = [];
        },
      });
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

  increaseQuantity(productId: number, stockQuantity: number): void {

    if (this.productQuantities[productId] < stockQuantity) {
      this.productQuantities[productId]++;
    }
  }


  addToCart(product: Product): void {
    const quantity =
      product.id !== undefined ? this.productQuantities[product.id] : 1;
    this.cartService.addToCart(product, quantity);
  }

  applyFilters(): void {

    this.currentPage = 0;
    this.loadProducts();
  }

  resetFilters(): void {
    this.filterOptions = {
      name: '',
      minPrice: undefined,
      maxPrice: undefined,
      page: 0,
      size: this.pageSize,
    };
    this.currentPage = 0;
    this.loadProducts();
  }

  nextPage(): void {
    if (!this.isLastPage) {
      this.currentPage++;
      this.loadProducts();

      window.scrollTo(0, 0);
    }
  }

  previousPage(): void {
    if (!this.isFirstPage) {
      this.currentPage--;
      this.loadProducts();

      window.scrollTo(0, 0);
    }
  }

  goToPage(page: number): void {
    if (page >= 0 && page < this.totalPages && page !== this.currentPage) {
      this.currentPage = page;
      this.loadProducts();

      window.scrollTo(0, 0);
    }
  }


  getPageNumbers(): number[] {

    if (this.totalPages <= 5) {
      return Array.from({ length: this.totalPages }, (_, i) => i);
    }


    let startPage = Math.max(0, this.currentPage - 1);
    let endPage = Math.min(this.totalPages - 1, this.currentPage + 1);


    if (endPage - startPage < 2) {
      if (startPage === 0) {
        endPage = Math.min(this.totalPages - 1, 2);
      } else if (endPage === this.totalPages - 1) {
        startPage = Math.max(0, this.totalPages - 3);
      }
    }

    return Array.from(
      { length: endPage - startPage + 1 },
      (_, i) => startPage + i
    );
  }


  showStartEllipsis(): boolean {
    return this.currentPage > 2;
  }

  showEndEllipsis(): boolean {
    return this.currentPage < this.totalPages - 3;
  }
}
