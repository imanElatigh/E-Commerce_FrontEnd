import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { LoginComponent } from './components/login/login.component';
import { SignUpComponent } from './components/sign-up/sign-up.component';
import { ForgotPasswordComponent } from './components/forgot-password/forgot-password.component';
import { ProduitsAlimentairesComponent } from './components/produits-alimentaires/produits-alimentaires.component';
import { ProduitsElectroniquesComponent } from './components/produits-electroniques/produits-electroniques.component';
import { ProduitsElectromenagersComponent } from './components/produits-electromenagers/produits-electromenagers.component';
import { CartComponent } from './components/cart/cart.component';
import { CommandesComponent } from './components/commandes/commandes.component';
import { authGuard } from './auth.guard';
// routes files
export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'login', component: LoginComponent },
  { path: 'signup', component: SignUpComponent },
  { path: 'forgot-password', component: ForgotPasswordComponent },
  { path: 'Produits_Alimentaires', component: ProduitsAlimentairesComponent },
  {
    path: 'Produits_Electromenagers',
    component: ProduitsElectromenagersComponent,
  },
  { path: 'Produits_Electroniques', component: ProduitsElectroniquesComponent },
  { path: 'commands', component: CommandesComponent, canActivate: [authGuard] },
  { path: 'cart', component: CartComponent },
];
