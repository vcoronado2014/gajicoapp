import { Component, OnInit, Input } from '@angular/core';
import { Router } from "@angular/router";
//environments
import { environment } from '../../environments/environment';
import { GajicoService } from '../servicios/gajico.service';
import { ArticulosService } from '../servicios/articulos.service';

declare var $:any;


@Component({
  selector: 'busqueda-articulos-app',
  templateUrl: './busqueda-articulos.component.html',
  styleUrls: ['./busqueda-articulos.component.css']
})
export class BusquedaArticulosComponent implements OnInit {
  loading = false;
  institucion: any = null;
  articulosCompleto: any = [];
  categorias: any = [];
  categoriasSeleccionadas: any = [];
  textoFiltros = [];
  expandido = true;
  //productos filtrados
  articulosFiltrados: any = [];
  //paginacion
  totalLength: any;
  page:number =  1;
  itemsPerPage = 12;
  //texto buscar
  textoBuscar = '';
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
    this.articulosCompleto = this.art.procesarData(data, dataCat);
    this.categorias = this.art.procesarDataCategorias(dataCat);
    console.log(this.articulosCompleto);
    console.log(this.categorias);
    this.articulosFiltrados = this.articulosCompleto;
    //set paginacion
    this.setPaginacion();
    //**************** */
    this.loading = false;
  }
  checkCategoria(categoria, event){
    
    console.log(event);
    if (event.target){
      categoria.Seleccionado = event.target.checked;
      var catSelLista = this.categoriasSeleccionadas.filter(p=>p.Id == categoria.Id);
      var existe = catSelLista.length == 1 ? true: false;
      if (existe){
        var elemento = this.categoriasSeleccionadas.filter(p=>p.Id == categoria.Id)[0];
        elemento.Seleccionado = categoria.Seleccionado;
      }
      else{
        this.categoriasSeleccionadas.push(categoria);
      }
      //console.log(categoria);
      this.construirTextoFiltros();
      console.log(this.textoFiltros);
    }
  }

  construirTextoFiltros(){
    this.textoFiltros = [];
    if (this.categoriasSeleccionadas && this.categoriasSeleccionadas.length > 0){
      this.categoriasSeleccionadas.forEach(cat => {
        if (cat.Seleccionado){
          this.textoFiltros.push(cat.Nombre);
        }
      });
    }
  }
  expandir(){
    if (this.expandido == true){
      this.expandido = false;
    }
    else{
      this.expandido = true;
    }
  }
  unCheckedAll(){
    if (this.categorias && this.categorias.length > 0){
      this.categorias.forEach(cat => {
        cat.Seleccionado = false;
        var elemento = $('#defCheck_' + cat.Id.toString());
        if (elemento[0]){
          elemento[0].checked = false;
        }
      });
    }
  }
  setPaginacion(){
    this.totalLength = this.articulosFiltrados.length;
    this.page = 1;
  }
  limpiarBusqueda(){
    this.textoFiltros = [];
    this.categoriasSeleccionadas = [];
    this.unCheckedAll(); 
    this.obtenerData();
  }
  btnLimpiar(){
    this.limpiarBusqueda();
  }
  
  btnBuscar(){
    this.articulosFiltrados = [];
    this.textoBuscar = '';
    if (this.categoriasSeleccionadas && this.categoriasSeleccionadas.length > 0){
      this.categoriasSeleccionadas.forEach(cat => {
        if (this.articulosCompleto && this.articulosCompleto.length > 0){
          this.articulosCompleto.forEach(arti => {
            if (arti.IdCategoria == cat.Id){
              this.articulosFiltrados.push(arti);
            }
          });
        }
      });
    }
    //set pagiinacion
    this.setPaginacion();

    console.log(this.articulosFiltrados);
  }
  buscarTexto(){
    this.articulosFiltrados = [];
    if (this.textoBuscar == ''){
      //todo
      console.log('todo');
      this.limpiarBusqueda();
    }
    if (this.textoBuscar.length >= 3){
      console.log(this.textoBuscar);
      //tiene categoria seleccionada
      console.log(this.categoriasSeleccionadas);
      if (this.categoriasSeleccionadas && this.categoriasSeleccionadas.length > 0){
        this.categoriasSeleccionadas.forEach(cat => {
          if (this.articulosCompleto && this.articulosCompleto.length > 0){
            this.articulosCompleto.forEach(arti => {
              if (arti.IdCategoria == cat.Id && arti.Titulo.toUpperCase().includes(this.textoBuscar.toUpperCase())){
                this.articulosFiltrados.push(arti);
              }
            });
          }
        });
      }
      else{
        this.articulosFiltrados = this.articulosCompleto.filter(filtered => filtered.Titulo.toUpperCase().includes(this.textoBuscar.toUpperCase()));
      }
      
      //set pagiinacion
      this.setPaginacion();
      console.log(this.articulosFiltrados);
    }
  }

}