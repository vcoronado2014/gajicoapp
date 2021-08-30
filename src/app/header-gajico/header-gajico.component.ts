import { Component, OnInit, Input } from '@angular/core';
import { Router } from "@angular/router";
//environments
import { environment } from '../../environments/environment';
import { GajicoService } from '../servicios/gajico.service';

@Component({
  selector: 'header-gajico-app',
  templateUrl: './header-gajico.component.html',
  styleUrls: ['./header-gajico.component.css']
})
export class HeaderGajicoComponent implements OnInit {
  @Input() paginaActiva: any;
  loading = false;
  institucion: any = null;
  esActivoInicio = 'nav-item';
  esActivoNosotros = 'nav-item';
  esActivoGases = 'nav-item';
  esActivoRepuestos = 'nav-item';
  esActivoServicio = 'nav-item';
  esActivoContacto = 'nav-item';
  esActivoLogin = 'nav-item';
  esActivoProductos = 'nav-item';

  constructor(
    private router: Router,
    private gajico: GajicoService,
  ) {

   }

  ngOnInit() {
    if (this.paginaActiva == 'home'){
        this.esActivoInicio = 'nav-item active';
    }
    if (this.paginaActiva == 'nosotros'){
        this.esActivoNosotros = 'nav-item active';
    }
    if (this.paginaActiva == 'gases'){
        this.esActivoGases = 'nav-item active';
    }
    if (this.paginaActiva == 'repuestos'){
        this.esActivoRepuestos = 'nav-item active';
    }
    if (this.paginaActiva == 'servicio'){
        this.esActivoServicio = 'nav-item active';
    }
    if (this.paginaActiva == 'contacto'){
        this.esActivoContacto = 'nav-item active';
    }
    if (this.paginaActiva == 'busqueda-articulos'){
      this.esActivoProductos = 'nav-item active';
    }
    console.log(this.paginaActiva);
  }

}