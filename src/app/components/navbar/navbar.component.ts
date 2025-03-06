import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CartService } from '../../core/services/cart.service';
import { AuthService } from '../../core/services/auth.service';
import { OrderService } from '../../core/services/order.service';
import { ToastService } from '../../core/services/toast.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css',
})
export class NavbarComponent implements OnInit {
  isCartOpen = false;
  cartItemCount = 0;
  cartItems: any[] = [];
  cartTotal = 0;
  isAuthenticated = false;

  // Checkout fields
  showShippingForm = false;
  shippingAddress = '';
  isSubmitting = false;

  constructor(
    private cartService: CartService,
    private authService: AuthService,
    private orderService: OrderService,
    private toastService: ToastService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Subscribe to cart changes
    this.cartService.cartItems$.subscribe((items) => {
      this.cartItems = items;
      this.cartItemCount = this.cartService.getCartCount();
      this.cartTotal = this.cartService.getCartTotal();
    });

    // Check if user is authenticated via localStorage
    this.checkAuthentication();

    // Optional: Subscribe to auth changes if your auth service emits them
    this.authService.authStatus$.subscribe(() => {
      this.checkAuthentication();
    });
  }

  checkAuthentication(): void {
    // Check if token exists in localStorage
    const token = localStorage.getItem('token');
    this.isAuthenticated = !!token;
  }

  toggleCart() {
    this.isCartOpen = !this.isCartOpen;
    // Reset checkout state when toggling cart
    this.showShippingForm = false;
  }

  removeItem(productId: number): void {
    this.cartService.removeFromCart(productId);
    this.toastService.info('Produit supprimé du panier');
  }

  updateQuantity(productId: number, newQuantity: number): void {
    this.cartService.updateQuantity(productId, newQuantity);
  }

  proceedToCheckout(): void {
    // Check if user is authenticated
    if (!this.authService.isAuthenticated()) {
      // Redirect to login page if not authenticated
      this.toastService.warning('Veuillez vous connecter pour continuer');
      this.authService.redirectToLogin();
      this.toggleCart(); // Close the cart
      return;
    }

    // If authenticated, show shipping form
    this.showShippingForm = true;
  }

  confirmOrder(): void {
    if (!this.shippingAddress.trim()) {
      this.toastService.warning('Veuillez entrer une adresse de livraison');
      return;
    }

    // Set loading state
    this.isSubmitting = true;

    // Call the order service to place the order
    this.orderService
      .createOrder(this.shippingAddress, this.cartItems)
      .subscribe({
        next: (response) => {
          console.log('Order placed successfully:', response);

          // If status is 200 OK, clear localStorage
          if (typeof window !== 'undefined') {
            localStorage.removeItem('shopping_cart');
          }

          // Clear cart after successful order
          this.cartService.clearCart();

          // Reset checkout state
          this.showShippingForm = false;
          this.isSubmitting = false;

          // Close cart
          this.toggleCart();

          // Show success toast
          this.toastService.success(
            'Votre commande a été confirmée avec succès!'
          );
        },
        error: (error) => {
          console.error('Error placing order:', error);
          this.isSubmitting = false;

          let errorMessage =
            'Une erreur est survenue lors de la confirmation de votre commande.';

          if (error.status === 401) {
            errorMessage = 'Votre session a expiré. Veuillez vous reconnecter.';
            this.toastService.error(errorMessage);
            this.authService.redirectToLogin();
            this.toggleCart();
          } else {
            this.toastService.error(errorMessage);
          }
        },
      });
  }

  backToCart(): void {
    this.showShippingForm = false;
  }
}
