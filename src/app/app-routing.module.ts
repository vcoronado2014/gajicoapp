import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
//pages
import { LoginComponent } from './login/login.component';
import { InicioComponent } from './inicio/inicio.component';
import { ClientesComponent } from './clientes/clientes.component';
import { ProveedorComponent } from './proveedor/proveedor.component';
import { FacturaVentaComponent } from './factura-venta/factura-venta.component';
import { FacturasComponent } from './facturas/facturas.component';
import { ProductosComponent } from './productos/productos.component';
import { MenuParametrosComponent } from './menu-parametros/menu-parametros.component';
import { ComprasComponent } from './compras/compras.component';
import { PrestamoComponent } from './prestamo/prestamo.component';

const routes: Routes = [
  { path: '', component: LoginComponent },
  { path: 'inicio', component: InicioComponent },
  { path: 'login', component: LoginComponent },
  { path: 'clientes', component: ClientesComponent },
  { path: 'proveedores', component: ProveedorComponent },
  { path: 'factura-venta', component: FacturaVentaComponent },
  { path: 'facturas', component: FacturasComponent },
  { path: 'productos', component: ProductosComponent },
  { path: 'parametros', component: MenuParametrosComponent },
  { path: 'compras', component: ComprasComponent },
  { path: 'prestamos', component: PrestamoComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
