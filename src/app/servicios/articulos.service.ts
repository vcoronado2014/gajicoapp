import { Injectable, Component } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
//import { Http, Headers, Response } from '@angular/http';
import { environment } from '../../environments/environment';
//servicio gajico
import { GajicoService } from './gajico.service';

//import 'rxjs/add/operator/map';
import { Observable } from 'rxjs';


@Injectable()
export class ArticulosService{
listaProductosArticulos: any = [];
loading = false;

    constructor( 
        private httpClient: HttpClient,
        public gajico: GajicoService,
      ){
        
      }


      async obtenerProductosArticulos(instId){
        return await this.gajico.postProductos(instId).subscribe((rs:any)=>{
            this.listaProductosArticulos = rs;
            
        }, error=>{
            console.log(error);
            this.listaProductosArticulos = [];
        })
      }

      procesarData(data, categorias){
        var articulos = [];
        if (data && data.length > 0){
          data.forEach(producto => {
            let urlImagenBase = environment.URL_FOTOS;
            let catMiscelano = categorias.filter(p=>p.Nombre.toLowerCase() == "Misceláneos".toLowerCase()).length == 1 ? 
            categorias.filter(p=>p.Nombre.toLowerCase() == "Misceláneos".toLowerCase())[0] : null;
            let prodId = producto.Id;
            let catId = 0;
            let titulo = '';
            let instId = 3;
            let contenido = '';
            let precioActual = 0;
            let precioAnterior = 0;
            let urlImagen = '';
            let catSeleccionado = null;
            let tienePrecio = false;
            let esOferta = false;
            if (producto.Articulo != null){
              //tiene artículo
              let catArticulo = categorias.filter(p=>p.Id == producto.Articulo.IdCategoria).length == 1 ? 
              categorias.filter(p=>p.Id == producto.Articulo.IdCategoria)[0] : null;
              urlImagen = urlImagenBase + producto.Articulo.UrlImagen;
              catSeleccionado = catArticulo;
              catId = catSeleccionado.Id;
              titulo = producto.Articulo.Titulo;
              contenido = producto.Articulo.Contenido;
              precioActual = producto.Articulo.PrecioActual;
              precioAnterior = producto.Articulo.PrecioAnterior;
              if (precioAnterior > 0 || precioActual > 0){
                tienePrecio = true;
              }
              if (precioActual < precioAnterior){
                esOferta = true;
              }
            }
            else{
              //no tiene articulo
              urlImagen = urlImagenBase + 'NO_disponible.jpeg';
              catSeleccionado = catMiscelano;
              catId = catSeleccionado.Id;
              titulo = producto.NomProduc;
            }
            let entidad = {
              Id: prodId,
              UrlImagen: urlImagen,
              IdCategoria: catId,
              Titulo: titulo,
              InstId: instId,
              Contenido: contenido,
              TienePrecio: tienePrecio,
              EsOferta: esOferta,
              Categoria: catSeleccionado,
              PrecioAnterior: precioAnterior,
              PrecioActual: precioActual,
              index: prodId
            }
            //insertamos a la lista
            articulos.push(entidad);

          });
        }

        return articulos;
      }
      procesarDataCategorias(categorias){
        var cat = [];
        categorias.forEach(categoria => {
          categoria.Seleccionado = false;
          cat.push(categoria);
        });
        return cat;
      }
      entregaOfertas(listaProcesada){
        //entregará una lista con los 10 primero articulos en oferta
        //si no encuentra entregará los demas de acuerdo a la lista
        let arr = [];
        let enOferta = listaProcesada.filter(p=>p.EsOferta == true);
        if (enOferta.length < 12){
          let sinOferta = listaProcesada.filter(p=>p.EsOferta == false).slice(0, 12 - enOferta.length);
          arr = enOferta.concat(sinOferta);
        }
        else{
          arr = enOferta.slice(0, 12);
        }
        return arr;
      }


}