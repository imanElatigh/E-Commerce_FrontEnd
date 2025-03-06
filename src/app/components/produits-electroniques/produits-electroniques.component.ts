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
  selector: 'app-produits-electroniques',
  standalone: true,
  imports: [FooterComponent, NavbarComponent, CommonModule, FormsModule],
  templateUrl: './produits-electroniques.component.html',
  styleUrl: './produits-electroniques.component.css',
})
export class ProduitsElectroniquesComponent implements OnInit {
  products: Product[] = [];
  loading = true;
  error = false;

  // Track quantities for each product
  productQuantities: { [productId: number]: number } = {};

  // Pagination properties
  currentPage = 0;
  pageSize = 8;
  totalPages = 0;
  totalElements = 0;
  isLastPage = false;
  isFirstPage = true;

  // Filter options
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

    // Update pagination parameters in filter options
    this.filterOptions.page = this.currentPage;
    this.filterOptions.size = this.pageSize;

    this.productService
      .getProductsByCategory('ELECTRONIQUE', this.filterOptions)
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
          console.error('Error fetching ELECTRONIQUE products:', err);
          this.loading = false;
          this.error = true;
          this.products = [];
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

  increaseQuantity(productId: number, stockQuantity: number): void {
    // Prevent increasing beyond available stock
    if (this.productQuantities[productId] < stockQuantity) {
      this.productQuantities[productId]++;
    }
  }

  // Method to add product to cart
  addToCart(product: Product): void {
    const quantity =
      product.id !== undefined ? this.productQuantities[product.id] : 1;
    this.cartService.addToCart(product, quantity);
  }

  applyFilters(): void {
    // Reset to first page when applying filters
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
      // Scroll to top when changing pages
      window.scrollTo(0, 0);
    }
  }

  previousPage(): void {
    if (!this.isFirstPage) {
      this.currentPage--;
      this.loadProducts();
      // Scroll to top when changing pages
      window.scrollTo(0, 0);
    }
  }

  goToPage(page: number): void {
    if (page >= 0 && page < this.totalPages && page !== this.currentPage) {
      this.currentPage = page;
      this.loadProducts();
      // Scroll to top when changing pages
      window.scrollTo(0, 0);
    }
  }

  // Helper method to generate page number array for pagination controls
  getPageNumbers(): number[] {
    // For small number of pages, show all page numbers
    if (this.totalPages <= 5) {
      return Array.from({ length: this.totalPages }, (_, i) => i);
    }

    // For larger number of pages, show a window around current page
    let startPage = Math.max(0, this.currentPage - 1);
    let endPage = Math.min(this.totalPages - 1, this.currentPage + 1);

    // Adjust window to always show 3 page numbers if possible
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

  // Helper method to check if we should show ellipsis
  showStartEllipsis(): boolean {
    return this.currentPage > 2;
  }

  showEndEllipsis(): boolean {
    return this.currentPage < this.totalPages - 3;
  }
}
