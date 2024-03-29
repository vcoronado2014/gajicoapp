import { Injectable, Component } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
//import { Http, Headers, Response } from '@angular/http';
import { environment } from '../../environments/environment';

//import 'rxjs/add/operator/map';
import { Observable } from 'rxjs';
import { useAnimation, ɵAnimationGroupPlayer } from '@angular/animations';
//import 'rxjs/add/operator/retry';
//import { HttpErrorResponse } from '@angular/common/http';

@Injectable()
export class GajicoService{
    private usersObs : Observable<User[]>;
    private productObs : Observable<Productos[]>;
    private facturaObs : Observable<Factura[]>;
    private compraObs : Observable<Factura[]>;
    //variables para generar los post de manera dinamica
    headerDynamic: Headers = new Headers;

    constructor(
        private httpClient: HttpClient,
        //private http: Http
    ) {


    }
    //dinamico
    construyePost(body, nombreControlador){
        const headers = new Headers;
        const bodyDinamic = body;

        headers.append('Access-Control-Allow-Origin', '*');
        let url = environment.API_ENDPOINT + nombreControlador;
        let httpHeaders = new HttpHeaders({
            'Content-Type' : 'application/json',
            'Cache-Control': 'no-cache'
        });
        httpHeaders.set('Access-Control-Allow-Origin', '*');
        let options = { headers: httpHeaders };

        let data = this.httpClient.post(url, bodyDinamic, options);
        return data;

    }

    construyePut(body, nombreControlador){
        const headers = new Headers;
        const bodyDinamic = body;

        headers.append('Access-Control-Allow-Origin', '*');
        let url = environment.API_ENDPOINT + nombreControlador;
        let httpHeaders = new HttpHeaders({
            'Content-Type' : 'application/json',
            'Cache-Control': 'no-cache'
        });
        httpHeaders.set('Access-Control-Allow-Origin', '*');
        let options = { headers: httpHeaders };

        let data = this.httpClient.put(url, bodyDinamic, options);
        return data;

    }


    postClientes(instId)  {
        const headers = new Headers;
        const body = JSON.stringify(
            {
                InstId: instId
            }
        );
        headers.append('Access-Control-Allow-Origin', '*');
        let url = environment.API_ENDPOINT + 'Cliente';
        let httpHeaders = new HttpHeaders({
            'Content-Type' : 'application/json',
            'Cache-Control': 'no-cache'
        });
        httpHeaders.set('Access-Control-Allow-Origin', '*');
        let options = { headers: httpHeaders };

        let data = this.httpClient.post(url, body, options);
        return data;
    }
    postRegiones(instId) {

        const headers = new Headers;
        const body = JSON.stringify(
            {
                InstId: instId
            }
        );
        headers.append('Access-Control-Allow-Origin', '*');
        let url = environment.API_ENDPOINT + 'ObtenerRegiones';
        let httpHeaders = new HttpHeaders({
            'Content-Type' : 'application/json',
            'Cache-Control': 'no-cache'
        });
        httpHeaders.set('Access-Control-Allow-Origin', '*');
        let options = { headers: httpHeaders };

        let data = this.httpClient.post(url, body, options);
        return data;


    }
    postClientesP(instId) {
       const headers = new Headers;
       const body = JSON.stringify(
           {
               InstId: instId
           }
       );
       headers.append('Access-Control-Allow-Origin', '*');
       let url = environment.API_ENDPOINT + 'Cliente';
       let httpHeaders = new HttpHeaders({
           'Content-Type' : 'application/json',
           'Cache-Control': 'no-cache'
       });
       httpHeaders.set('Access-Control-Allow-Origin', '*');
       let options = { headers: httpHeaders };

       let data = this.httpClient.post(url, body, options);
       return data;

    }
    //postClientesArr(instId, rut, dv): Observable<User[]>{
    postClientesArr(instId, rut, dv){
       const headers = new Headers;
        const body = JSON.stringify(
            {
                InstId: instId,
                Rut: rut,
                Dv: dv
            }
        );
       headers.append('Access-Control-Allow-Origin', '*');
       let url = environment.API_ENDPOINT + 'Cliente';
       let httpHeaders = new HttpHeaders({
           'Content-Type' : 'application/json',
           'Cache-Control': 'no-cache'
       });
       httpHeaders.set('Access-Control-Allow-Origin', '*');
       let options = { headers: httpHeaders };
       
       this.httpClient.post(url, body, options).subscribe((res: Observable<User[]>)=>{
        this.usersObs = res;
       });
       return this.usersObs;

    }
    postGiros(instId) {
        const headers = new Headers;
        const body = JSON.stringify(
            {
                InstId: instId
            }
        );
        headers.append('Access-Control-Allow-Origin', '*');
        let url = environment.API_ENDPOINT + 'Giro';
        let httpHeaders = new HttpHeaders({
            'Content-Type' : 'application/json',
            'Cache-Control': 'no-cache'
        });
        httpHeaders.set('Access-Control-Allow-Origin', '*');
        let options = { headers: httpHeaders };
 
        let data = this.httpClient.post(url, body, options);
        return data;
    }
    postComunas(regId, id) {
        const headers = new Headers;
        const body = JSON.stringify(
            {
                RegId: regId,
                Id: id
            }
        );
        headers.append('Access-Control-Allow-Origin', '*');
        let url = environment.API_ENDPOINT + 'ObtenerComunas';

        let httpHeaders = new HttpHeaders({
            'Content-Type' : 'application/json',
            'Cache-Control': 'no-cache'
        });
        httpHeaders.set('Access-Control-Allow-Origin', '*');
        let options = { headers: httpHeaders };
 
        let data = this.httpClient.post(url, body, options);
        return data;

    }
    putGiro(nombre) {
        const headers = new Headers;
        const body = JSON.stringify(
            {
                Nombre: nombre
            }
        );
        headers.append('Access-Control-Allow-Origin', '*');
        let url = environment.API_ENDPOINT + 'Giro';
        let httpHeaders = new HttpHeaders({
            'Content-Type' : 'application/json',
            'Cache-Control': 'no-cache'
        });
        httpHeaders.set('Access-Control-Allow-Origin', '*');
        let options = { headers: httpHeaders };
 
        let repos = this.httpClient.put(url, body, options);

        return repos;
    }
    

    putCliente(cliente) {
        const headers = new Headers;
        
        const body = JSON.stringify(cliente);
        
       //const body = cliente;
        headers.append('Access-Control-Allow-Origin', '*');
        let url = environment.API_ENDPOINT + 'Cliente';
        let httpHeaders = new HttpHeaders({
            'Content-Type' : 'application/json',
            'Cache-Control': 'no-cache'
        });
        httpHeaders.set('Access-Control-Allow-Origin', '*');
        let options = { headers: httpHeaders };
 
        let repos = this.httpClient.put(url, body, options);

        return repos;
    }

    putProveedor(proveedor) {
        const headers = new Headers;
        
        const body = JSON.stringify(proveedor);
        
       //const body = cliente;
        headers.append('Access-Control-Allow-Origin', '*');
        let url = environment.API_ENDPOINT + 'Proveedor';
        let httpHeaders = new HttpHeaders({
            'Content-Type' : 'application/json',
            'Cache-Control': 'no-cache'
        });
        httpHeaders.set('Access-Control-Allow-Origin', '*');
        let options = { headers: httpHeaders };
 
        let repos = this.httpClient.put(url, body, options);

        return repos;

    }
    postProductosTexto(instId, tipoBusqueda, texto) {
        const headers = new Headers;
        const body = JSON.stringify(
            {
                InstId: instId,
                TipoBusqueda: tipoBusqueda.toString(),
                CodigoBuscar: texto
            }
        );
        headers.append('Access-Control-Allow-Origin', '*');
        let url = environment.API_ENDPOINT + 'ObtenerProducto';

        let httpHeaders = new HttpHeaders({
            'Content-Type' : 'application/json',
            'Cache-Control': 'no-cache'
        });
        httpHeaders.set('Access-Control-Allow-Origin', '*');
        let options = { headers: httpHeaders };
 
        let data = this.httpClient.post(url, body, options);
        return data;
    }
    putParametros(id, instId, numeroDocumento, iva, stockMinimoCantidad, stockMinimoMetros) {

        const headers = new Headers;
        
        const body = JSON.stringify(
            {
                Id: id.toString(),
                InstId: instId.toString(),
                NumeroDocumento: numeroDocumento,
                Iva: iva.toString(),
                StockMinimoCantidad: stockMinimoCantidad.toString(),
                StockMinimoMetros: stockMinimoMetros.toString()
            }
        );
        
       //const body = cliente;
        headers.append('Access-Control-Allow-Origin', '*');
        let url = environment.API_ENDPOINT + 'Parametros';
        let httpHeaders = new HttpHeaders({
            'Content-Type' : 'application/json',
            'Cache-Control': 'no-cache'
        });
        httpHeaders.set('Access-Control-Allow-Origin', '*');
        let options = { headers: httpHeaders };
 
        let repos = this.httpClient.put(url, body, options);

        return repos;
    }
    postBancos(instId) {
        const headers = new Headers;
        const body = JSON.stringify(
            {
                InstId: instId
            }
        );
        headers.append('Access-Control-Allow-Origin', '*');
        let url = environment.API_ENDPOINT + 'Banco';

        let httpHeaders = new HttpHeaders({
            'Content-Type': 'application/json',
            'Cache-Control': 'no-cache'
        });
        httpHeaders.set('Access-Control-Allow-Origin', '*');
        let options = { headers: httpHeaders };

        let data = this.httpClient.post(url, body, options);
        return data;
    }
    postParametros(instId) {
        const body = JSON.stringify(
            {
                InstId: instId
            }
        );
        return this.construyePost(body, 'Parametros');
    }
    postArriendos(rut) {
        const body = JSON.stringify(
            {
                Rut: rut
            }
        );
        return this.construyePost(body, 'Arriendos');
    }
    //siendo 1 = codigo_producto, 2 = nombre_producto
    postTextos(tipoDocumento) {
        const body = JSON.stringify(
            {
                TipoDocumento: tipoDocumento
            }
        );
        return this.construyePost(body, 'ListadosPlanos');
    }
    putInstitucion(institucion) {

        const body = JSON.stringify(institucion);
        //return this.construyePut(body, 'Institucion');
        return this.construyePost(body, 'Institucion');
    }
    putBanco(nombre) {
        const body = JSON.stringify({
            Nombre: nombre
        });
        return this.construyePut(body, 'Banco');

    }
    putProductos(producto) {
        const body = JSON.stringify(producto);
        return this.construyePut(body, 'Productos');
    }
    //productos
    postProductosArr(instId, codigoBuscar){

        const headers = new Headers;
        const body = JSON.stringify(
            {
                InstId: instId,
                CodigoBuscar: codigoBuscar
            }
        );
        headers.append('Access-Control-Allow-Origin', '*');
        let url = environment.API_ENDPOINT + 'Productos';
        let httpHeaders = new HttpHeaders({
            'Content-Type': 'application/json',
            'Cache-Control': 'no-cache'
        });
        httpHeaders.set('Access-Control-Allow-Origin', '*');
        let options = { headers: httpHeaders };

        this.httpClient.post(url, body, options).subscribe((res: Observable<Productos[]>) => {
            this.productObs = res;
        });
        return this.productObs;

    }
    postFacturaArr(fechaInicio, fechaTermino){
        const headers = new Headers;
        const body = JSON.stringify(
            {
                FechaInicio: fechaInicio,
                FechaTermino: fechaTermino
            }
        );
        headers.append('Access-Control-Allow-Origin', '*');
        let url = environment.API_ENDPOINT + 'Factura';
        let httpHeaders = new HttpHeaders({
            'Content-Type': 'application/json',
            'Cache-Control': 'no-cache'
        });
        httpHeaders.set('Access-Control-Allow-Origin', '*');
        let options = { headers: httpHeaders };

        this.httpClient.post(url, body, options).subscribe((res: Observable<Factura[]>) => {
            this.facturaObs = res;
        });
        return this.facturaObs;
    }
    postCompraArr(fechaInicio, fechaTermino): Observable<Factura[]>{
        const headers = new Headers;
        const body = JSON.stringify(
            {
                FechaInicio: fechaInicio,
                FechaTermino: fechaTermino
            }
        );
        headers.append('Access-Control-Allow-Origin', '*');
        let url = environment.API_ENDPOINT + 'Compra';
        let httpHeaders = new HttpHeaders({
            'Content-Type': 'application/json',
            'Cache-Control': 'no-cache'
        });
        httpHeaders.set('Access-Control-Allow-Origin', '*');
        let options = { headers: httpHeaders };

        this.httpClient.post(url, body, options).subscribe((res: Observable<Factura[]>) => {
            this.compraObs = res;
        });
        return this.compraObs;
    }
    postFacturaVenta(factura, cliente, detalle, arriendos, prestamos){
        const body = JSON.stringify(
            {
                Factura: factura,
                Cliente: cliente,
                Detalle: detalle,
                Arriendos: arriendos,
                Prestamos: prestamos
            }
        );
        return this.construyePost(body, 'FacturaVenta');
    }
    postFacturaCompra(factura, cliente, detalle){
        const body = JSON.stringify(
            {
                Factura: factura,
                Cliente: cliente,
                Detalle: detalle
            }
        );
        return this.construyePost(body, 'FacturaCompra');
    }
    postProveedorArr(instId, rut, dv){
        const headers = new Headers;
        const body = JSON.stringify(
            {
                InstId: instId,
                Rut: rut,
                Dv: dv
            }
        );
        headers.append('Access-Control-Allow-Origin', '*');
        let url = environment.API_ENDPOINT + 'Proveedor';
        let httpHeaders = new HttpHeaders({
            'Content-Type': 'application/json',
            'Cache-Control': 'no-cache'
        });
        httpHeaders.set('Access-Control-Allow-Origin', '*');
        let options = { headers: httpHeaders };

        this.httpClient.post(url, body, options).subscribe((res: Observable<User[]>) => {
            this.usersObs = res;
        });
        return this.usersObs;

    }
    getIVA(instId){
        let url = environment.API_ENDPOINT + 'Iva?instId=' + instId;
        let httpHeaders = new HttpHeaders({
            'Content-Type': 'application/json',
            'Cache-Control': 'no-cache'
        });
        httpHeaders.set('Access-Control-Allow-Origin', '*');
        let options = { headers: httpHeaders };
        let data = this.httpClient.get(url, options);
        return data;
    }
    getProdPrestamos(instId){
        let url = environment.API_ENDPOINT + 'ProdPrestamo?instId=' + instId;
        let httpHeaders = new HttpHeaders({
            'Content-Type': 'application/json',
            'Cache-Control': 'no-cache'
        });
        httpHeaders.set('Access-Control-Allow-Origin', '*');
        let options = { headers: httpHeaders };
        let data = this.httpClient.get(url, options);
        return data;
    }
    getPrestamos(clienteId, eliminado){
        let url = environment.API_ENDPOINT + 'Prestamos?clienteId=' + clienteId + '&eliminado=' + eliminado;
        let httpHeaders = new HttpHeaders({
            'Content-Type': 'application/json',
            'Cache-Control': 'no-cache'
        });
        httpHeaders.set('Access-Control-Allow-Origin', '*');
        let options = { headers: httpHeaders };
        let data = this.httpClient.get(url, options);
        return data;
    }
    getFacturaNumero(numeroFactura, tipoFactura){
        let url = environment.API_ENDPOINT + 'Factura?numeroFactura=' + numeroFactura + '&tipoFactura=' + tipoFactura;
        let httpHeaders = new HttpHeaders({
            'Content-Type': 'application/json',
            'Cache-Control': 'no-cache'
        });
        httpHeaders.set('Access-Control-Allow-Origin', '*');
        let options = { headers: httpHeaders };
        let data = this.httpClient.get(url, options);
        return data;
    }
    getPrestamosConsolidado(clienteId, eliminado){
        let url = environment.API_ENDPOINT + 'Prestamos?clienteId=' + clienteId + '&eliminado=' + eliminado + '&consolidado=1';
        let httpHeaders = new HttpHeaders({
            'Content-Type': 'application/json',
            'Cache-Control': 'no-cache'
        });
        httpHeaders.set('Access-Control-Allow-Origin', '*');
        let options = { headers: httpHeaders };
        let data = this.httpClient.get(url, options);
        return data;
    }
    postPrestamo(prestamo){
        const body = JSON.stringify(
            {
                Prestamo: prestamo
            }
        );
        return this.construyePost(body, 'Prestamos');
    }
    getArriendo(id){
        let url = environment.API_ENDPOINT + 'Arriendos?id=' + id;
        let httpHeaders = new HttpHeaders({
            'Content-Type': 'application/json',
            'Cache-Control': 'no-cache'
        });
        httpHeaders.set('Access-Control-Allow-Origin', '*');
        let options = { headers: httpHeaders };
        let data = this.httpClient.get(url, options);
        return data;
    }
    putArriendo(arriendo){
        const body = JSON.stringify(
            {
                Arriendo: arriendo
            }
        );
        return this.construyePut(body, 'Arriendos');
    }
    //articulos
    postArticulo(File, id, visible, usaImagen, usaTitulo, titulo, contenido,
        eliminado, instId, prodId, esOferta, precioAnterior, precioActual, idCategoria){
        let model = new FormData();
        model.append("UploadedImage", File);
        model.append("Id", id.toString());
        model.append("Visible", visible.toString());
        model.append("UsaImagen", usaImagen.toString());
        model.append("UsaTitulo", usaTitulo.toString());
        model.append("Titulo", titulo);
        model.append("Contenido", contenido);
        model.append("Eliminado", eliminado.toString());
        model.append("InstId", instId.toString());
        model.append("ProdId", prodId.toString());
        model.append("EsOferta", esOferta.toString());
        model.append("PrecioAnterior", precioAnterior.toString());
        model.append("PrecioActual", precioActual.toString());
        model.append("IdCategoria", idCategoria.toString());

        let url = environment.API_ENDPOINT + 'Articulo';

        let data = this.httpClient.post(url, model, {});
        return data;

        }
        getArticulo(instId, prodId){
            let url = environment.API_ENDPOINT + 'Articulo?instId=' + instId + '&prodId=' + prodId;
            let httpHeaders = new HttpHeaders({
                'Content-Type': 'application/json',
                'Cache-Control': 'no-cache'
            });
            httpHeaders.set('Access-Control-Allow-Origin', '*');
            let options = { headers: httpHeaders };
            let data = this.httpClient.get(url, options);
            return data;
        }
        deleteArticulo(id){
            const headers = new Headers;
            headers.append('Access-Control-Allow-Origin', '*');
            let url = environment.API_ENDPOINT + 'Articulo?id=' + id;
    
            let httpHeaders = new HttpHeaders({
                'Content-Type' : 'application/json',
                'Cache-Control': 'no-cache'
            });
            httpHeaders.set('Access-Control-Allow-Origin', '*');
            let options = { headers: httpHeaders };
     
            let data = this.httpClient.post(url, {}, options);
            return data;
        }
        getCategorias(eliminado){
            let url = environment.API_ENDPOINT + 'Categoria?eliminado=' + eliminado;
            let httpHeaders = new HttpHeaders({
                'Content-Type': 'application/json',
                'Cache-Control': 'no-cache'
            });
            httpHeaders.set('Access-Control-Allow-Origin', '*');
            let options = { headers: httpHeaders };
            let data = this.httpClient.get(url, options);
            return data;
        }
        getInstitucion(idInstitucion){
            let url = environment.API_ENDPOINT + 'Institucion?idInstitucion=' + idInstitucion;
            let httpHeaders = new HttpHeaders({
                'Content-Type': 'application/json',
                'Cache-Control': 'no-cache'
            });
            httpHeaders.set('Access-Control-Allow-Origin', '*');
            let options = { headers: httpHeaders };
            let data = this.httpClient.get(url, options);
            return data;
        }
        getContacto(instId){
            let url = environment.API_ENDPOINT + 'Correo?idInstitucion=' + instId.toString();
            let httpHeaders = new HttpHeaders({
                'Content-Type': 'application/json',
                'Cache-Control': 'no-cache'
            });
            httpHeaders.set('Access-Control-Allow-Origin', '*');
            let options = { headers: httpHeaders };
            let data = this.httpClient.get(url, options);
            return data;
        }
        postContacto(correoDestino, mensaje, nombre, telefono, correoOrigen, instId){
            let url = environment.API_ENDPOINT + 'Correo?correoDestino=' + correoDestino + '&mensaje=' + mensaje
            +'&nombre=' + nombre + '&telefono=' + telefono + '&correoOrigen=' + correoOrigen + '&instId=' + instId;
            let httpHeaders = new HttpHeaders({
                'Content-Type' : 'application/json',
                'Cache-Control': 'no-cache'
            });
            httpHeaders.set('Access-Control-Allow-Origin', '*');
            let options = { headers: httpHeaders };
     
            let data = this.httpClient.post(url, {}, options);
            return data;
        }
        insertarCategoria(nombre){
            let url = environment.API_ENDPOINT + 'Categoria?nombre=' + nombre;
            let httpHeaders = new HttpHeaders({
                'Content-Type' : 'application/json',
                'Cache-Control': 'no-cache'
            });
            httpHeaders.set('Access-Control-Allow-Origin', '*');
            let options = { headers: httpHeaders };
     
            let data = this.httpClient.post(url, {}, options);
            return data;
        }
        eliminarCategoria(id){
            let url = environment.API_ENDPOINT + 'Categoria?id=' + id;
            let httpHeaders = new HttpHeaders({
                'Content-Type' : 'application/json',
                'Cache-Control': 'no-cache'
            });
            httpHeaders.set('Access-Control-Allow-Origin', '*');
            let options = { headers: httpHeaders };
     
            let data = this.httpClient.post(url, {}, options);
            return data;
        }
        postProductos(nodId){
            const headers = new Headers;
            const body = JSON.stringify(
                {
                  InstId: nodId.toString(),
                  CodigoBuscar: null,
                  Eliminado: '0'
                }
            );
            headers.append('Access-Control-Allow-Origin', '*');
            let url = environment.API_ENDPOINT + 'Productos';
            let httpHeaders = new HttpHeaders({
                'Content-Type': 'application/json',
                'Cache-Control': 'no-cache'
            });
            httpHeaders.set('Access-Control-Allow-Origin', '*');
            let options = { headers: httpHeaders };
            let data = this.httpClient.post(url, body, options);
            
            return data;
        }

}
//creacion de la interface
export interface User {
    RutClient: string;
    DigClient: string;
    NomClient: string;
    GirClient: string;
    DirClient: string;
    ComClient: string;
    CiuClient: string;
    TelClient: string;
    FaxClient: string;
    AneClient: string;
    ConClient: string;
    Id: number;
    Eliminado: number;
    CorreoClient: string;
    FleLocal: string;
    FleDomici: string;
    DesClient: string;
  }
  export interface Proveedor {
    RutProved: string;
    DigProved: string;
    NomProved: string;
    GirProved: string;
    DirProved: string;
    ComProved: string;
    CiuProved: string;
    TelProved: string;
    FaxProved: string;
    AneProved: string;
    Id: number;
    Eliminado: number;
    CorreoProved: string;
  }
  export interface Productos {
    CodProduc: string;
    NomProduc: string;
    EstProduc: string;
    VolProduc: string;
    ValProduc: string;
    StoProduc: string;
    ArrProduc: string;
    PreProduc: string;
    GarProduc: string;
    Id: number;
    Eliminado: number;
  }
  export interface Factura {
    TipFactur: string;
    NumFactur: string;
    RutFactur: string;
    DigFactur: string;
    FeeFactur: string;
    ValFactur: string;
    EstFactur: string;
    ConFactur: string;
    GuiFactur: string;
    SalFactur: string;
    FesFactur: string;
    CheFactur: string;
    BanFactur: string;
    FveFactur: string;
    FevFactur: string;
    Neto: string,
    Iva: string,
    Total: string,
    Id: number;
    Eliminado: number;
    Detalle: Detalle[];
    Cliente: User;
    Proveedor: Proveedor;
  }
  export interface Detalle{
    TipDetall: string;
    NumDetall: string;
    CanDetall: string;
    VolDetall: string;
    ProDetall: string;
    RecDetall: string;
    PreDetall: string;
    NetDetall: string;
    IvaDetall: string;
    CilDetall: string;
    DiaDetall: string;
    ArrDetall: string;
    CafDetall: string;
    MofDetall: string;
    NomProduc: string;
    Id: number;
    Eliminado: number;
  }