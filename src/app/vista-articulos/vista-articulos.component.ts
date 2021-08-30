import { Component, OnInit } from '@angular/core';
import { Router } from "@angular/router";
//environments
import { environment } from '../../environments/environment';
import { GajicoService } from '../servicios/gajico.service';
import { ArticulosService } from '../servicios/articulos.service';

@Component({
  selector: 'vista-articulos-app',
  templateUrl: './vista-articulos.component.html',
  styleUrls: ['./vista-articulos.component.css']
})
export class VistaArticulosComponent implements OnInit {
  loading = false;
  institucion: any = null;
  articulosCompleto: any = [];
  articulosOferta: any = [];
  constructor(
    private router: Router,
    private gajico: GajicoService,
    private art: ArticulosService
  ) {

   }

  ngOnInit() {
    this.obtenerData();
  }
  private async obtenerData(){
    this.loading = true;
    const data = await this.gajico.postProductos(3).toPromise();
    //console.log(data);
    this.loading = false;
    this.loading = true;
    const dataCat = await this.gajico.getCategorias(0).toPromise();
    console.log(dataCat);
    this.articulosCompleto = this.art.procesarData(data, dataCat);
    console.log(this.articulosCompleto);
    this.articulosOferta = this.art.entregaOfertas(this.articulosCompleto);
    console.log(this.articulosOferta);
    this.loading = false;
  }
}