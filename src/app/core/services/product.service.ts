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

@Injectable({
  providedIn: 'root'
})
export class ProductService {

  constructor(private apiService: ApiService) { }

  /**
   * Get products by category with pagination
   * @param category The product category (ALIMENTAIRE, ELECTROMENAGER, ELECTRONIQUE)
   * @param page Page number (starting from 0)
   * @param size Number of items per page
   * @returns Observable of PageResponse<Product>
   */
  getProductsByCategory(
    category: 'ALIMENTAIRE' | 'ELECTROMENAGER' | 'ELECTRONIQUE',
    page: number = 0,
    size: number = 8
  ): Observable<PageResponse<Product>> {
    return this.apiService.get<PageResponse<Product>>(
      `/api/produits/search?category=${category}&page=${page}&size=${size}`
    ).pipe(
      map(response => {
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
              unpaged: false
            },
            last: response.length < size,
            totalPages: Math.ceil(response.length / size) + (response.length === size ? 1 : 0),
            totalElements: response.length + (response.length === size ? size : 0),
            size: size,
            number: page,
            sort: { empty: true, sorted: false, unsorted: true },
            first: page === 0,
            numberOfElements: response.length,
            empty: response.length === 0
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
              unpaged: false
            },
            last: true,
            totalPages: 0,
            totalElements: 0,
            size: size,
            number: page,
            sort: { empty: true, sorted: false, unsorted: true },
            first: page === 0,
            numberOfElements: 0,
            empty: true
          };
        }
      })
    );
  }
}
