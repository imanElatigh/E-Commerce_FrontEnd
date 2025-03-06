import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { CartItem } from './cart.service';

export interface OrderItem {
  productId: number;
  quantity: number;
}

export interface OrderResponse {
  id: number;
  user: {
    id: number;
    fullName: string;
    phone: string;
  };
  totalAmount: number;
  shippingAddress: string;
  status: OrderStatus;
  orderItems: {
    id: number;
    product: {
      id: number;
      name: string;
    };
    quantity: number;
    priceAtOrder: number;
  }[];
  createdAt?: string;
}

export interface OrderRequest {
  userId: number | null;
  shippingAddress: string;
  orderItems: OrderItem[];
}

export type OrderStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'PROCESSING'
  | 'SHIPPED'
  | 'DELIVERED'
  | 'CANCELLED';

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
  providedIn: 'root',
})
export class OrderService {
  constructor(private apiService: ApiService) {}

  /**
   * Creates a new order with the exact payload structure required
   * @param shippingAddress The shipping address for the order
   * @param cartItems The cart items to be ordered
   * @returns Observable of the created order
   */
  createOrder(shippingAddress: string, cartItems: CartItem[]): Observable<any> {
    // Get userId from localStorage
    const userIdStr = localStorage.getItem('user_id');
    const userId = userIdStr ? parseInt(userIdStr, 10) : null;

    if (!userId) {
      console.log('User ID not found');
    }

    // Convert cart items to order items format
    const orderItems: OrderItem[] = cartItems.map((item) => ({
      productId: item.product.id,
      quantity: item.quantity,
    }));

    // Create order request payload exactly as specified
    const orderRequest: OrderRequest = {
      userId,
      shippingAddress,
      orderItems,
    };

    // Send POST request to create order
    return this.apiService.post<any>('/api/orders', orderRequest);
  }

  /**
   * Get all orders for the current user with pagination
   * @param page Page number (starting from 0)
   * @param size Number of items per page
   * @returns Observable of PageResponse<OrderResponse>
   */
  getUserOrders(
    page: number = 0,
    size: number = 10
  ): Observable<PageResponse<OrderResponse>> {
    return this.apiService.get<PageResponse<OrderResponse>>(
      `/api/orders?page=${page}&size=${size}`
    );
  }

  /**
   * Get an order by ID
   * @param id Order ID
   * @returns Observable of OrderResponse
   */
  getOrderById(id: number): Observable<OrderResponse> {
    return this.apiService.get<OrderResponse>(`/api/orders/${id}`);
  }

  /**
   * Update order status (typically admin only)
   * @param id Order ID
   * @param status New status
   * @returns Observable of OrderResponse
   */
  updateOrderStatus(
    id: number,
    status: OrderStatus
  ): Observable<OrderResponse> {
    return this.apiService.patch<OrderResponse>(`/api/orders/${id}`, {
      status,
    });
  }

  /**
   * Get translated status text
   * @param status Status code
   * @returns Translated status text
   */
  getStatusTranslation(status: string): string {
    switch (status) {
      case 'PENDING':
        return 'En attente';
      case 'CONFIRMED':
        return 'Confirmée';
      case 'PROCESSING':
        return 'En traitement';
      case 'SHIPPED':
        return 'Expédiée';
      case 'DELIVERED':
        return 'Livrée';
      case 'CANCELLED':
        return 'Annulée';
      default:
        return status;
    }
  }

  /**
   * Get status CSS class
   * @param status Status code
   * @returns CSS class for the status
   */
  getStatusClass(status: string): string {
    switch (status) {
      case 'PENDING':
        return 'pending';
      case 'CONFIRMED':
        return 'confirmed';
      case 'PROCESSING':
        return 'processing';
      case 'SHIPPED':
        return 'shipped';
      case 'DELIVERED':
        return 'delivered';
      case 'CANCELLED':
        return 'canceled';
      default:
        return '';
    }
  }
}
