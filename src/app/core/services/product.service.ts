import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { ApiService } from './api.service';

export interface Product {
  id: number;
  name: string;
  category: 'ALIMENTAIRE' | 'ELECTROMENAGER' | 'ELECTRONIQUE';
  image: string;
  description: string;
  price: number;
  stockQuantity: number;
}

export interface PageResponse<T> {
  content: T[];
  pageable: {
    pageNumber: number;
    pageSize: number;
    sort: {
      empty: boolean;
      sorted: boolean;
      unsorted: boolean;
    };
    offset: number;
    paged: boolean;
    unpaged: boolean;
  };
  last: boolean;
  totalPages: number;
  totalElements: number;
  size: number;
  number: number;
  sort: {
    empty: boolean;
    sorted: boolean;
    unsorted: boolean;
  };
  first: boolean;
  numberOfElements: number;
  empty: boolean;
}

export interface ProductFilterOptions {
  name?: string;
  minPrice?: number;
  maxPrice?: number;
  page?: number;
  size?: number;
}

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  constructor(private apiService: ApiService) {}

  /**
   * Get products with pagination and optional category/filters
   * @param options Optional filters including category, name search, min/max price, page number, and page size
   * @returns Observable of PageResponse<Product>
   */
  getProductsByCategory(
    category?: 'ALIMENTAIRE' | 'ELECTROMENAGER' | 'ELECTRONIQUE',
    options: ProductFilterOptions = {}
  ): Observable<PageResponse<Product>> {
    const { name, minPrice, maxPrice, page = 0, size = 8 } = options;

    // Build query parameters
    let queryParams = `page=${page}&size=${size}`;

    // Add category if provided
    if (category) {
      queryParams += `&category=${category}`;
    }

    // Add optional filters if they exist
    if (name !== undefined && name !== '') {
      queryParams += `&name=${encodeURIComponent(name)}`;
    }

    if (minPrice !== undefined && !isNaN(minPrice)) {
      queryParams += `&minPrice=${minPrice}`;
    }

    if (maxPrice !== undefined && !isNaN(maxPrice)) {
      queryParams += `&maxPrice=${maxPrice}`;
    }

    return this.apiService
      .get<PageResponse<Product>>(`/api/produits/search?${queryParams}`)
      .pipe(
        map((response) => {
          // If the response is already in the expected format, return it
          if (response && response.content && Array.isArray(response.content)) {
            return response;
          }
          // If the response is an array, convert it to the expected format
          else if (Array.isArray(response)) {
            return {
              content: response,
              pageable: {
                pageNumber: page,
                pageSize: size,
                sort: { empty: true, sorted: false, unsorted: true },
                offset: page * size,
                paged: true,
                unpaged: false,
              },
              last: response.length < size,
              totalPages:
                Math.ceil(response.length / size) +
                (response.length === size ? 1 : 0),
              totalElements:
                response.length + (response.length === size ? size : 0),
              size: size,
              number: page,
              sort: { empty: true, sorted: false, unsorted: true },
              first: page === 0,
              numberOfElements: response.length,
              empty: response.length === 0,
            };
          }
          // Fallback for unexpected response format
          else {
            console.error('Unexpected API response format', response);
            return {
              content: [],
              pageable: {
                pageNumber: page,
                pageSize: size,
                sort: { empty: true, sorted: false, unsorted: true },
                offset: page * size,
                paged: true,
                unpaged: false,
              },
              last: true,
              totalPages: 0,
              totalElements: 0,
              size: size,
              number: page,
              sort: { empty: true, sorted: false, unsorted: true },
              first: page === 0,
              numberOfElements: 0,
              empty: true,
            };
          }
        })
      );
  }
}
