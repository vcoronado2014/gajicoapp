import { BrowserModule } from '@angular/platform-browser';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import { NgModule } from '@angular/core';
import { ToastrModule } from 'ng6-toastr-notifications';
import { NgxLoadingModule } from 'ngx-loading';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { DataTablesModule } from 'angular-datatables';
import { NgxMaskModule, IConfig } from 'ngx-mask';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
//servicios
import { ServicioLoginService } from './servicios/servicio-login-service';
import { UtilesService } from './servicios/utiles.service';
import { GajicoService } from './servicios/gajico.service';
import { PdfService } from './servicios/pdf.service';

//pages
import { LoginComponent } from './login/login.component';
import { HeaderAppComponent } from './header-app/header-app.component';
import { InicioComponent } from './inicio/inicio.component';
import { ClientesComponent } from './clientes/clientes.component';
import { ProveedorComponent } from './proveedor/proveedor.component';
import { FacturaVentaComponent } from './factura-venta/factura-venta.component';
import { FacturaCompraComponent } from './factura-compra/factura-compra.component';
import { FacturasComponent } from './facturas/facturas.component';
import { ProductosComponent } from './productos/productos.component';
import { MenuParametrosComponent } from './menu-parametros/menu-parametros.component';
import { ComprasComponent } from './compras/compras.component';
import { ArriendoComponent } from './arriendo/arriendo.component';
import { PrestamoComponent } from './prestamo/prestamo.component';
//plugin
import {MatGridListModule} from '@angular/material/grid-list';
import {MatToolbarModule} from '@angular/material/toolbar';
import {MatCardModule} from '@angular/material/card';
import {MatButtonModule} from '@angular/material/button';
import {MatTableModule} from '@angular/material/table';
import {MatPaginatorModule} from '@angular/material/paginator';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule } from '@angular/material/dialog';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatTabsModule } from '@angular/material/tabs';
import { MatNativeDateModule, MAT_DATE_LOCALE } from '@angular/material';
import {CdkTableModule} from '@angular/cdk/table';
import { Ng2CompleterModule } from "ng2-completer";
//pipes
import { CurrencyFormat } from './pipes/CurrencyFormat';
import { FilterPipe } from './pipes/filter'


@NgModule({
  declarations: [
    InicioComponent,
    HeaderAppComponent,
    AppComponent,
    LoginComponent,
    ClientesComponent,
    ProveedorComponent,
    FacturaVentaComponent,
    FacturaCompraComponent,
    FacturasComponent,
    ProductosComponent,
    MenuParametrosComponent,
    ComprasComponent,
    ArriendoComponent,
    PrestamoComponent,
    CurrencyFormat,
    FilterPipe,
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    Ng2CompleterModule,
    DataTablesModule,
    MatGridListModule,
    MatToolbarModule,
    MatCardModule,
    MatButtonModule,
    MatTableModule,
    MatPaginatorModule,
    MatIconModule,
    MatDatepickerModule,
    CdkTableModule,
    MatDialogModule,
    MatFormFieldModule,
    MatNativeDateModule,
    MatTabsModule,
    BrowserAnimationsModule, ToastrModule.forRoot(), NgxLoadingModule.forRoot({}),NgxMaskModule.forRoot()
  ],
  providers: [
    { provide: MAT_DATE_LOCALE, useValue: 'es-CL' },
    MatDatepickerModule,
    ServicioLoginService,
    UtilesService,
    GajicoService,
    PdfService,
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
