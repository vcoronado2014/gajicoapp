import { Component, Input, OnInit } from '@angular/core';
import { Router } from "@angular/router";
//environments
import { environment } from '../../environments/environment';
import { GajicoService } from '../servicios/gajico.service';
import { ArticulosService } from '../servicios/articulos.service';
import { UtilesService } from '../servicios/utiles.service';
declare var $: any;
import swal from 'sweetalert2';

@Component({
  selector: 'card-gajico-app',
  templateUrl: './card-gajico.component.html',
  styleUrls: ['./card-gajico.component.css']
})
export class CardGajicoComponent implements OnInit {
  
  @Input() a: any;
  loading = false;
  institucion: any = null;
  articulosCompleto: any = [];
  articuloSeleccionado: any = null;
  constructor(
    private router: Router,
    private gajico: GajicoService,
    private art: ArticulosService,
    private utiles: UtilesService
  ) {

   }

  ngOnInit() {

  }
  onFocusOutEvent(event: any){
    console.log(event.target.value);
  }
  openArticulo(articulo){
    console.log(articulo);
    this.articuloSeleccionado = articulo;
    //this.utiles.OpenModal($('#exampleModal'))
    swal.fire({
      title: '<strong>' + this.articuloSeleccionado.Titulo + '</strong>',
      html: this.obtenerHtml(this.articuloSeleccionado),
      showCloseButton: true,

    })
  }
  obtenerHtml(articulo){
    var html = '<img src="' + articulo.UrlImagen + '" class="d-block card-img-top" alt="icono">' + 
    '<div class="card-body">' + 
    '<p class="card-text">' + articulo.Contenido + '</p>' + 
    '</div>';

    if (!articulo.EsOferta && articulo.TienePrecio){
      html += '<div class="card-footer"><span class="text-center price"><strong> $' + this.formatMoney(parseInt(articulo.PrecioActual),0,',','.') + '</strong></span><small class="iva"> + IVA</small></div>';
    }
    if (articulo.EsOferta && articulo.TienePrecio){
      html += '<div class="card-footer"><div class="row" style="padding-left: 16px;"><del><span class="text-center price"><strong>Antes $' + this.formatMoney(parseInt(articulo.PrecioAnterior),0,',','.') + '</strong></span><small class="iva"> + IVA</small></del></div>';
      html += '<div class="row content" style="padding-left: 16px;"><span class="text-center price"><strong>Ahora $' + this.formatMoney(parseInt(articulo.PrecioActual),0,',','.') + '</strong></span><small class="iva"> + IVA</small></div>';
      html += '</div>';
    }
    return html;
    

  }
  private formatMoney(amount, decimalCount = 2, decimal = ".", thousands = ",") {
    try {
        var i : any;
        decimalCount = Math.abs(decimalCount);
        decimalCount = isNaN(decimalCount) ? 2 : decimalCount;

        const negativeSign = amount < 0 ? "-" : "";

        //let i = parseInt(amount = Math.abs(Number(amount) || 0).toFixed(decimalCount)).toString();
        i = parseInt(amount = Math.abs(Number(amount) || 0).toFixed(decimalCount)).toString();
        let j = (i.length > 3) ? i.length % 3 : 0;

        return negativeSign + (j ? i.substr(0, j) + thousands : '') + i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + thousands) + (decimalCount ? decimal + Math.abs(amount - i).toFixed(decimalCount).slice(2) : "");
    } catch (e) {
        console.log(e)
    }
}

}