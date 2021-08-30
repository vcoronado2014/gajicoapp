import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
//pages
import { LoginComponent } from './login/login.component';
import { InicioComponent } from './inicio/inicio.component';
import { ClientesComponent } from './clientes/clientes.component';
import { ProveedorComponent } from './proveedor/proveedor.component';
import { FacturaVentaComponent } from './factura-venta/factura-venta.component';
import { FacturaCompraComponent } from './factura-compra/factura-compra.component';
import { FacturasComponent } from './facturas/facturas.component';
import { ProductosComponent } from './productos/productos.component';
import { MenuParametrosComponent } from './menu-parametros/menu-parametros.component';
import { ComprasComponent } from './compras/compras.component';
import { PrestamoComponent } from './prestamo/prestamo.component';
import { ArriendoComponent } from './arriendo/arriendo.component';
import { ArticuloComponent } from './articulo/articulo.component';
import { HomeGajicoComponent } from './home-gajico/home-gajico.component';
import { BusquedaArticulosComponent } from './busqueda-articulos/busqueda-articulos.component';
import { NosotrosGajicoComponent } from './nosotros-gajico/nosotros-gajico.component';
import { ContactoGajicoComponent } from './contacto-gajico/contacto-gajico.component';

const routes: Routes = [
  { path: '', component: HomeGajicoComponent },
  { path: 'home', component: HomeGajicoComponent },
  { path: 'nosotros', component: NosotrosGajicoComponent },
  { path: 'busqueda-articulos', component: BusquedaArticulosComponent },
  { path: 'contacto', component: ContactoGajicoComponent },
  { path: 'inicio', component: InicioComponent },
  { path: 'login', component: LoginComponent },
  { path: 'clientes', component: ClientesComponent },
  { path: 'proveedores', component: ProveedorComponent },
  { path: 'factura-venta', component: FacturaVentaComponent },
  { path: 'factura-compra', component: FacturaCompraComponent },
  { path: 'facturas', component: FacturasComponent },
  { path: 'productos', component: ProductosComponent },
  { path: 'parametros', component: MenuParametrosComponent },
  { path: 'compras', component: ComprasComponent },
  { path: 'prestamos', component: PrestamoComponent },
  { path: 'arriendos', component: ArriendoComponent },
  { path: 'articulo', component: ArticuloComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
