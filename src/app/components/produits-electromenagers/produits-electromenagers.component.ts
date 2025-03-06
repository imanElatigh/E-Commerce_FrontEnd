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

@Component({
  selector: 'app-produits-electromenagers',
  standalone: true,
  imports: [FooterComponent, NavbarComponent, CommonModule, FormsModule],
  templateUrl: './produits-electromenagers.component.html',
  styleUrl: './produits-electromenagers.component.css',
})
export class ProduitsElectromenagersComponent implements OnInit {
  products: Product[] = [];
  loading = true;
  error = false;

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

  constructor(private productService: ProductService) {}

  ngOnInit(): void {
    this.loadProducts();
  }

  loadProducts(): void {
    this.loading = true;

    // Update pagination parameters in filter options
    this.filterOptions.page = this.currentPage;
    this.filterOptions.size = this.pageSize;

    this.productService
      .getProductsByCategory('ELECTROMENAGER', this.filterOptions)
      .subscribe({
        next: (response: PageResponse<Product>) => {
          this.products = response.content;
          this.totalPages = response.totalPages;
          this.totalElements = response.totalElements;
          this.isLastPage = response.last;
          this.isFirstPage = response.first;
          this.currentPage = response.number;
          this.loading = false;
        },
        error: (err) => {
          console.error('Error fetching ELECTROMENAGER products:', err);
          this.loading = false;
          this.error = true;
          this.products = [];
        },
      });
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
