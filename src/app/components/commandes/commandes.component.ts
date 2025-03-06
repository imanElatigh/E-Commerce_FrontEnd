import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from '../navbar/navbar.component';
import {
  OrderService,
  OrderResponse,
  PageResponse,
  OrderStatus,
} from '../../core/services/order.service';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-commandes',
  standalone: true,
  imports: [CommonModule, NavbarComponent, RouterModule, FormsModule],
  templateUrl: './commandes.component.html',
  styleUrl: './commandes.component.css',
})
export class CommandesComponent implements OnInit {
  orders: OrderResponse[] = [];
  selectedOrder: OrderResponse | null = null;
  showOrderDetails = false;
  loading = true;
  error = '';

  // Pagination
  currentPage = 0;
  pageSize = 5;
  totalPages = 0;
  totalElements = 0;

  constructor(private orderService: OrderService) {}

  ngOnInit(): void {
    this.fetchOrders();
  }

  @HostListener('document:keydown.escape', ['$event'])
  handleEscapeKey(event: KeyboardEvent): void {
    if (this.showOrderDetails) {
      this.closeOrderDetails();
    }
  }

  fetchOrders(): void {
    this.loading = true;
    this.orderService.getUserOrders(this.currentPage, this.pageSize).subscribe({
      next: (response: PageResponse<OrderResponse>) => {
        this.orders = response.content;
        this.totalPages = response.totalPages;
        this.totalElements = response.totalElements;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error fetching orders:', err);
        this.error =
          'Impossible de récupérer vos commandes. Veuillez réessayer plus tard.';
        this.loading = false;
      },
    });
  }

  changePage(page: number): void {
    if (page >= 0 && page < this.totalPages) {
      this.currentPage = page;
      this.fetchOrders();
    }
  }

  nextPage(): void {
    this.changePage(this.currentPage + 1);
  }

  prevPage(): void {
    this.changePage(this.currentPage - 1);
  }

  viewOrderDetails(orderId: number): void {
    this.loading = true;
    this.showOrderDetails = true; // Show sidebar immediately with loading state

    this.orderService.getOrderById(orderId).subscribe({
      next: (data) => {
        this.selectedOrder = data;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading order details', error);
        this.error =
          'Impossible de charger les détails de la commande. Veuillez réessayer.';
        this.loading = false;
        this.showOrderDetails = false;
      },
    });
  }

  closeOrderDetails(): void {
    this.showOrderDetails = false;
    // Wait for sidebar animation to complete before clearing the data
    setTimeout(() => {
      if (!this.showOrderDetails) {
        this.selectedOrder = null;
      }
    }, 300);
  }

  canCancelOrder(status: string): boolean {
    // User can cancel only if the order is not shipped, delivered, or already cancelled
    return !['SHIPPED', 'DELIVERED', 'CANCELLED'].includes(status);
  }

  // Custom popup state
  showCancelConfirmPopup = false;
  orderIdToCancel: number | null = null;

  openCancelConfirmPopup(orderId: number, event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    this.orderIdToCancel = orderId;
    this.showCancelConfirmPopup = true;
  }

  closeCancelConfirmPopup(): void {
    this.showCancelConfirmPopup = false;
    this.orderIdToCancel = null;
  }

  cancelOrder(): void {
    if (!this.orderIdToCancel) return;

    const orderId = this.orderIdToCancel;
    this.showCancelConfirmPopup = false;
    this.loading = true;

    this.orderService.updateOrderStatus(orderId, 'CANCELLED').subscribe({
      next: (updatedOrder) => {
        // Update order in the list
        const index = this.orders.findIndex((order) => order.id === orderId);
        if (index !== -1) {
          this.orders[index] = updatedOrder;
        }

        // If showing details of this order, update the details too
        if (this.selectedOrder && this.selectedOrder.id === orderId) {
          this.selectedOrder = updatedOrder;
        }

        this.loading = false;
        // Show success message if needed
        this.error = ''; // Clear any existing error
      },
      error: (error) => {
        console.error('Error cancelling order', error);
        this.error = "Impossible d'annuler la commande. Veuillez réessayer.";
        this.loading = false;
      },
    });
  }

  getFormattedDate(dateString: string | undefined): string {
    if (!dateString) return 'Date inconnue';

    const date = new Date(dateString);
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    };

    return date.toLocaleDateString('fr-FR', options);
  }

  getStatusClass(status: string): string {
    return this.orderService.getStatusClass(status);
  }

  getStatusTranslation(status: string): string {
    return this.orderService.getStatusTranslation(status);
  }

  // Helper method to display order items in a readable format
  getOrderItemsText(order: OrderResponse): string {
    if (!order.orderItems || order.orderItems.length === 0) {
      return 'Aucun produit';
    }

    // Limit to first 3 items for display
    const displayItems = order.orderItems.slice(0, 3);
    const itemTexts = displayItems.map(
      (item) => `${item.product.name} (x${item.quantity})`
    );

    // Add ellipsis if there are more items
    if (order.orderItems.length > 3) {
      return `${itemTexts.join(', ')} et ${order.orderItems.length - 3} autres`;
    }

    return itemTexts.join(', ');
  }

  calculateTotalItems(order: OrderResponse): number {
    return order.orderItems.reduce((total, item) => total + item.quantity, 0);
  }

  formatPrice(price: number): string {
    return price.toFixed(2) + ' MRU';
  }
}
