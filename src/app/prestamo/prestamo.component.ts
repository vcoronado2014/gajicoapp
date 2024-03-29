import { Component, OnInit, ViewContainerRef, ViewChild, OnDestroy, ElementRef } from '@angular/core';
import { FormsModule, ReactiveFormsModule, FormGroup, FormControl, Validators, FormArray, FormBuilder } from '@angular/forms';
import { Router } from "@angular/router";
import { Observable } from 'rxjs';
import { Subject } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../environments/environment';

import { HttpErrorResponse } from '@angular/common/http';
import { ToastrManager } from 'ng6-toastr-notifications';

//servicios
//import { GlobalService } from '../servicios/global.service';
import { GajicoService, User, Proveedor } from '../servicios/gajico.service';
import { UtilesService } from '../servicios/utiles.service';
import { PdfService } from '../servicios/pdf.service';

//completer
import { CompleterService, CompleterData } from 'ng2-completer';
import { DataTableDirective } from 'angular-datatables';

//dialog
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA, MatTable, MatTableDataSource } from '@angular/material';

declare var $:any;
import * as moment from 'moment';
import swal from 'sweetalert2';

@Component({
  selector: 'app-prestamo',
  templateUrl: './prestamo.component.html',
  styleUrls: ['./prestamo.component.css']
})
export class PrestamoComponent implements OnInit, OnDestroy {
    @ViewChild(DataTableDirective, { static: false })

    dtElement: DataTableDirective;
    //dtOptions: DataTables.Settings = {};
    dtOptions: any = {};
    prestamos: any = [];
    persons: any;
    // We use this trigger because fetching the list of persons can be quite long,
    // thus we ensure the data is fetched before rendering
    dtTrigger: Subject<any> = new Subject();

    editando = false;
    ausIdEditando = 0;
    forma: FormGroup;
    formaDevolver: FormGroup;
    //loading
    loading = false;
    //variables
    nodIdLogueado;
    rolIdLogueado;
    usuarioEditando;
    tituloModal;
    usuDesactivarActivar;
    nombreUsuarioLogueado;
    isChecked = 0;
    rutBuscar = '';
    dvBuscar = '';
    clienteEncontrado = null;
    prestamoDevolver = null;
    consolidado : any = [];
    datasource: any = [];
    displayedColumns: string[] = ['NombreProducto', 'Serie', 'Capacidad', 'Llenos', 'Vacios'];
    //fechas
    fechaPrestamo;
    maxDate;
    listaCodigosProd;
    listaNombresProd;
    productoAgregando = null;

    constructor(
        private fb: FormBuilder,
        private router: Router,
        //private global: GlobalService,
        private gajico: GajicoService,
        private toastr: ToastrManager,
        private httpClient: HttpClient,
        public completerService: CompleterService,
        public utiles: UtilesService,
        public dialog: MatDialog,
        public pdf: PdfService,
        private _vcr: ViewContainerRef
    ) {
        //this.toastr.setRootViewContainerRef(_vcr);
    }
    
    obtenerCodigosProductos() {
        //indicador valor
    
        this.loading = true;
        this.gajico.postTextos(1).subscribe(
          data => {
            if (data) {
              this.listaCodigosProd = data;
            }
          },
          err => {
            console.error(err);
            this.loading = false;
            this.showToast('error', err, 'Error');
          },
          () => {
            this.loading = false;
            console.log('get info Regiones');
          }
        );
    
      }
    crear(){
        this.limpiar();
    }
    generarPdfConsolidado(action){
        if (this.consolidado){
            this.pdf.generatePdfConsolidado(action, this.consolidado, this.clienteEncontrado);
        }
    }
    quitarPrestamo(prestamo){
        
        swal.fire(
            {
              title: '¿Estás seguro de eliminar este préstamo?',
              text: 'Se eliminará el préstamo seleccionado',
              icon: 'warning',
              showCancelButton: true,
              confirmButtonText: 'SI, QUIERO ELIMINAR!',
              cancelButtonText: 'NO, CANCELAR TODO!',
            }
          ).then((value) => {
            if (value.dismiss) {
              swal.fire('Cancelado');
            }
            else{
                prestamo.Eliminado = 1
                this.procesoGuardado(prestamo, '', false);
            }
          });
    }
    devolverPrestamo(){
        if (this.prestamoDevolver){
            var serie = '';
            if (this.formaDevolver.controls.nuevoCodigoDevolver.value != undefined && this.formaDevolver.controls.nuevoCodigoDevolver.value != null){
                serie = this.formaDevolver.controls.nuevoCodigoDevolver.value.toUpperCase();
            }
            var observaciones = '';
            if (this.formaDevolver.controls.nuevoObservacionesDevolver.value != undefined && this.formaDevolver.controls.nuevoObservacionesDevolver.value != null){
                observaciones = this.formaDevolver.controls.nuevoObservacionesDevolver.value.toUpperCase();
            }
            this.prestamoDevolver.Estado = 1;
            this.prestamoDevolver.EstadoStr = 'Devuelto';
            this.prestamoDevolver.FechaDevolucion = this.formaDevolver.controls.nuevoFechaDevolver.value;
            this.prestamoDevolver.NroSerie = serie;
            this.prestamoDevolver.Observaciones = observaciones;
            this.prestamoDevolver.EsLleno = this.formaDevolver.controls.nuevoLlenoDevolver.value;
            this.procesoGuardado(this.prestamoDevolver, '#exampleModalCenterD', true);
        }
      }
    procesoGuardado(prestamo, modalCerrar, cierraModal){
        this.loading = true;
        this.gajico.postPrestamo(prestamo).subscribe(
          (data: any) => {
            var datos = data;
            if (datos){
              //this.showToast('error', datos.TextoMensaje, 'Error');
              //ok, generamos la busqueda nuevamente
                this.buscar();
                this.limpiar();
                if (cierraModal){
                    this.utiles.CerrarModal($(modalCerrar));
                }

            }
            else {
              this.showToast('error', 'Error al guardar', 'Error');
            }
    
          },
          err => {
            console.error(err);
            this.showToast('error', err, 'Error');
            this.loading = false;
          },
          () => {
            console.log('save completed');
            //this.showToast('success', 'Guardado con éxito', 'Cliente');
            this.loading = false;
    
          }
        );
        //this.limpiar();
      }
    guardar(){
        if (this.productoAgregando != null){
            if (this.forma.valid){
                //capturamos los elementos necesarios para guardarlos
                var factura = 0;
                if (this.forma.controls.nuevoNumeroFactura.value != undefined && this.forma.controls.nuevoNumeroFactura.value != null){
                    factura = parseInt(this.forma.controls.nuevoNumeroFactura.value);
                }
                var observaciones = '';
                if (this.forma.controls.nuevoObservaciones.value != undefined && this.forma.controls.nuevoObservaciones.value != null){
                    observaciones = this.forma.controls.nuevoObservaciones.value;
                }
                var entidad = {
                    Id : 0,
                    ClienteId: this.clienteEncontrado.Id,
                    FechaPrestamo: this.utiles.validaFechaEntera(this.forma.controls.nuevoFecha.value),
                    FechaDevolucion: '',
                    Cantidad: 1,
                    NroFactura: factura,
                    Estado: this.forma.controls.nuevoEstado.value,
                    NroSerie: this.forma.controls.nuevoSerie.value,
                    Capacidad: this.forma.controls.nuevoCapacidad.value,
                    Eliminado: 0,
                    Observaciones: observaciones,
                    EsLLeno: this.forma.controls.nuevoLleno.value,
                    ProdId: this.productoAgregando.Id,
                }
                //ahora guardamos
                this.procesoGuardado(entidad, '#modalEdicion', true);

            }
            else{
                var sms = this.utiles.entregaErrorForma(this.forma);
                this.showToast('error', sms, 'Campos requeridos');
            }
            
        }
    }
    keyDowEnterProducto(event, tipoBusqueda) {
        //console.log(event);
        var texto = event.target.value;
    
        //ambos elementos deben existir para realizar la llamada
        if (texto && texto.length > 0) {
          //ahora realizamos la busqueda
          this.loading = true;
          this.gajico.postProductosTexto(this.nodIdLogueado, tipoBusqueda, texto).subscribe(
            data => {
              if (data) {
                //cargar la forma con la data
                var producto = data;
                //this.productoCreando = producto;
                this.productoAgregando = producto[0];
                if (this.productoAgregando && this.productoAgregando.Id > 0){
                    this.forma.controls.nuevoNombre.setValue(this.productoAgregando.NomProduc);
                    console.log(this.productoAgregando);
                }
                else{
                    this.productoAgregando = null;
                }

                //this.showToast('success', 'Correcto', 'Recuperado');
              }
            },
            err => {
              console.error(err);
              this.loading = false;
              this.showToast('error', err, 'Error');
            },
            () => {
              this.loading = false;
              console.log('get info Regiones');
            }
          );
    
    
        }
    
      }
    cargarForma() {

        this.forma = new FormGroup({
            'nuevoCodigo': new FormControl('', [Validators.required, Validators.minLength(3)]),
            'nuevoNombre': new FormControl({value: '', disabled: true}),
            'nuevoEstado': new FormControl(0, Validators.required),
            'nuevoLleno': new FormControl(0, Validators.required),
            'nuevoFecha': new FormControl(this.utiles.retornaFechaFormateada(moment()), Validators.required),
            'nuevoSerie': new FormControl(''),
            'nuevoCapacidad': new FormControl('0', Validators.required),
            'nuevoNumeroFactura': new FormControl(''),
            'nuevoObservaciones': new FormControl('')
        });

        console.log(this.forma.valid + ' ' + this.forma.status);
    }
    retornaFecha(fechaMoment){
        var retorno = '';
        var year = fechaMoment.year();
        var mes = fechaMoment.month() + 1;
        var dia = fechaMoment.date();
        var mesStr = '';
        var diaStr = '';
        if (mes < 10){
            mesStr = '0' + mes.toString();
        }
        else{
            mesStr = mes.toString();
        }
    
        if (dia < 10){
            diaStr = '0' + dia.toString();
        }
        else{
            diaStr = dia.toString();
        }
    
        retorno = year +'-' + mesStr + '-' + diaStr;
    
        return retorno;
      }
    getTotalLlenos() {
        return this.consolidado.map(t => t.Llenos).reduce((acc, value) => acc + value, 0);
    }
    getTotaVacios() {
        return this.consolidado.map(t => t.Vacios).reduce((acc, value) => acc + value, 0);
    }
    ngOnInit() {
        moment.locale('es');
        if (sessionStorage.getItem("USER_LOGUED_IN")) {
            var usuarioLogueado = JSON.parse(sessionStorage.getItem("USER_LOGUED_IN"));
            if (usuarioLogueado.AutentificacionUsuario) {
                this.nodIdLogueado = usuarioLogueado.AutentificacionUsuario.InstId;
                this.rolIdLogueado = usuarioLogueado.Rol.Id;
                this.nombreUsuarioLogueado = usuarioLogueado.AutentificacionUsuario.NombreUsuario;
            }
        }
        var fechaTer = moment();
        var maxima = moment().add(1, 'days');
        this.fechaPrestamo = this.retornaFecha(fechaTer);
        this.maxDate = this.retornaFecha(maxima);
        this.dtOptions = this.utiles.InicializeOptionsPrestamo(this.dtOptions, 8, 'Listado de Préstamos Gajico ltda.');
        //this.cargarClientes(this.nodIdLogueado);
        this.obtenerCodigosProductos();
        this.obtenerNombresProductos();
        this.cargarPrestamos(-1, '0');
        this.cargarConsolidado(-1, '0');
        this.cargarForma();
        this.cargarFormaDevolver();

    }
    obtenerNombresProductos() {
        //indicador valor
    
        this.loading = true;
        this.gajico.postTextos(2).subscribe(
          data => {
            if (data) {
              this.listaNombresProd = data;
            }
          },
          err => {
            console.error(err);
            this.loading = false;
            this.showToast('error', err, 'Error');
          },
          () => {
            this.loading = false;
            console.log('get info Regiones');
          }
        );
    
      }
    cargarFormaDevolver() {
        this.loading = true;
        this.formaDevolver = new FormGroup({
          'nuevoCodigoDevolver': new FormControl(''),
          'nuevoObservacionesDevolver': new FormControl(''),
          'nuevoLlenoDevolver': new FormControl('0'),
          'nuevoFechaDevolver': new FormControl({ value: this.utiles.retornaFechaFormateada(moment()), disabled: true })
        });
        //this.formaDevolver.controls.nuevoObservacionesDevolver.setValue(this.formaPrestamo.controls.nuevoObservacionesPrestamo.value);
        this.loading = false;
      }
      abrirModalPrestamoDevolver(prestamo){
        this.limpiarPrestamoDevolver();
        console.log(prestamo);
        this.prestamoDevolver = prestamo;
        this.formaDevolver.controls.nuevoObservacionesDevolver.setValue(prestamo.Observaciones);
      }
    buscar() {
        var rut = this.rutBuscar;
        var dv = this.dvBuscar;
        console.log(rut);
        var elementos = {
            Rut: rut,
            Dv: dv
        }
        if (rut && rut.length > 0 && dv && dv.length > 0) {
            this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
                // Destroy the table first
                dtInstance.destroy();
                // Call the dtTrigger to rerender again
                this.dtOptions = this.utiles.InicializeOptionsPrestamo(this.dtOptions, 8, 'Listado de préstamos gajico ltda.');
                this.loading = true;
                const headers = new Headers;
                const body = JSON.stringify(
                  {
                    InstId: this.nodIdLogueado,
                    Rut: rut,
                    Dv: dv
                  }
                );
                headers.append('Access-Control-Allow-Origin', '*');
                let url = environment.API_ENDPOINT + 'Cliente';
                let httpHeaders = new HttpHeaders({
                  'Content-Type': 'application/json',
                  'Cache-Control': 'no-cache'
                });
                httpHeaders.set('Access-Control-Allow-Origin', '*');
                let options = { headers: httpHeaders };

                this.httpClient.post(url, body, options).subscribe((res: Observable<User[]>) => {
                    var cliente = res[0];
                    if (cliente){
                        this.clienteEncontrado = cliente;
                        console.log(this.clienteEncontrado);
                        this.gajico.getPrestamos(cliente.Id, '0').subscribe(
                            data => {
                                if (data) {
                                    this.prestamos = data;
                                    this.gajico.getPrestamosConsolidado(cliente.Id, '0').subscribe(
                                        dataC => {
                                            this.consolidado = dataC;
                                            if (this.consolidado.length > 0) {
                                                var indice = 1;
                                                this.consolidado.forEach(elemento => {
                                                    elemento.Indice = indice;
                                                    indice++;
                                                });
                                            }
                                            this.datasource = new MatTableDataSource(this.consolidado);
                                            this.dtTrigger.next();
                                            this.loading = false;
                                        }
                                    )

                                }
                            },
                            err => {
                              console.error(err);
                              this.loading = false;
                              this.showToast('error', err, 'Error');
                            },
                            () => {
                              this.loading = false;
                              console.log('get info prestamos');
                            }
                          );
                    }
                    else {
                        this.showToast('warning', 'No hay resultados', 'No encontrado');
                        this.prestamos = [];
                        this.dtTrigger.next();
                        this.loading = false;
                    }
                });

              });
        }
        else {
            this.showToast('error', 'Debe ingresar Rut y digito verficador', 'Error');
        }
    }
    cargarPrestamos(clienteId, eliminado) {
        //indicador valor
        this.loading = true;
        this.gajico.getPrestamos(clienteId, eliminado).subscribe(
            data => {
                if (data) {
                    this.prestamos = data;
                    this.dtTrigger.next();
                    this.loading = false;
                    console.log(this.prestamos);
                    //this.showToast('success', 'Correcto', 'Recuperado');
                }
                else{
                    this.prestamos = [];
                    this.dtTrigger.next();
                    this.loading = false;
                }
            },
            err => {
                console.error(err);
                this.loading = false;
                this.showToast('error', err, 'Error');
            },
            () => {
                this.loading = false;
                console.log('get info prestamos');
            }
        );

    }
    cargarConsolidado(clienteId, eliminado) {
        //indicador valor
        this.loading = true;
        this.gajico.getPrestamosConsolidado(clienteId, eliminado).subscribe(
            data => {
                if (data) {
                    this.consolidado = data;
                    if (this.consolidado.length > 0){
                        var indice = 1;
                        this.consolidado.forEach(elemento => {
                            elemento.Indice = indice;
                            indice++;
                        });
                    }
                    //this.datasource = Observable<Consolidado>(this.consolidado);
                    this.datasource = new MatTableDataSource(this.consolidado);
                    this.loading = false;
                }
            },
            err => {
                console.error(err);
                this.loading = false;
                this.showToast('error', err, 'Error');
            },
            () => {
                this.loading = false;
                console.log('get info prestamos');
            }
        );

    }

    limpiarGrilla() {
        this.clienteEncontrado = null;
        this.rutBuscar = '';
        this.dvBuscar = '';
        this.prestamos = [];
        this.consolidado = [];
        this.datasource = [];
        this.rerender();
    }
    limpiarPrestamoDevolver() {
        this.editando = false;
        this.formaDevolver.reset({});
        this.prestamoDevolver = null;
        this.formaDevolver.controls.nuevoFechaDevolver.setValue(this.utiles.retornaFechaFormateada(moment()));
        this.formaDevolver.controls.nuevoLlenoDevolver.setValue(0);

    }
    limpiar() {
        this.editando = false;
        this.forma.reset({});
        this.tituloModal = 'Nuevo Préstamo';
        this.forma.controls.nuevoCapacidad.setValue(0);
        this.forma.controls.nuevoEstado.setValue(0);
        this.forma.controls.nuevoLleno.setValue(0);
        this.forma.controls.nuevoFecha.setValue(this.utiles.retornaFechaFormateada(moment()));
        this.productoAgregando = null;

    }

    rerender() {
        this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
            // Destroy the table first
            dtInstance.destroy();
            // Call the dtTrigger to rerender again
            this.dtOptions = this.utiles.InicializeOptionsPrestamo(this.dtOptions, 8, 'Listado de préstamos Gajico ltda.');
            this.dtTrigger.next();
        });
    }

    keyDowEnter(event) {
        console.log(event);
        var rut = this.forma.controls.nuevoRut.value;
        var dv = this.forma.controls.nuevoDig.value;
        var elementos = {
            Rut: rut,
            Dv: dv
        }
        //ambos elementos deben existir para realizar la llamada
        if (rut && rut.length > 0 && dv && dv.length > 0) {
            //ahora realizamos la busqueda
            var cliente;
            this.loading = true;
            const headers = new Headers;
            const body = JSON.stringify(
                {
                    InstId: this.nodIdLogueado,
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

            this.httpClient.post(url, body, options).subscribe((res: Observable<Proveedor[]>) => {

                if (res) {
                    cliente = res[0];
                    this.usuarioEditando = cliente;
                    //this.editar(cliente);
                    this.loading = false;
                }
                else {
                    this.loading = false;
                }
            });
        }

    }
    buscarCliente(nodId, rut, dv) {
        var cliente = null;
        this.loading = true;
        const headers = new Headers;
        const body = JSON.stringify(
            {
                InstId: nodId,
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

        this.httpClient.post(url, body, options).subscribe((res: Observable<Proveedor[]>) => {

            if (res) {
                //el usuario existe
                //this.usuarioEditando = data[0];
                //preguntamos si desea recuperar los datos del cliente
                //si dice que si entonces mostramos la info y seteamos al usuario editanto
                cliente = res[0];
                this.loading = false;
            }
            else {
                //el usuario no existe, deberiamos mandar el foco al nombre

                this.loading = false;
            }
        });

        return cliente;
    }

    ngOnDestroy(): void {
        // Do not forget to unsubscribe the event
        this.dtTrigger.unsubscribe();
    }
    upperCaseF(a) {
        setTimeout(function () {
            a.target.value = a.target.value.toUpperCase();
        }, 1);
    }

    seleccionar(usu) {

        var entidad = {
            AusId: usu.Id,
            Id: usu.Id,
            Rut: usu.RutProved,
            Dv: usu.DigProved,
            Nombres: usu.NomProved.toUpperCase(),
            Region: usu.CiuProved.toUpperCase(),
            Giro: usu.GirProved.toUpperCase(),
            Comuna: usu.ComProved.toUpperCase(),
            Direccion: usu.DirProved.toUpperCase(),
            Telefonos: usu.TelProved,
            Correo: usu.CorreoProved.toUpperCase(),
            Fax: usu.FaxProved
        }
        this.usuDesactivarActivar = entidad;

    }
    rerenderNod(rut, dv) {
        var elementos = {
            Rut: rut,
            Dv: dv
        }
        if (rut && rut.length > 0 && dv && dv.length > 0) {
            this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
                // Destroy the table first
                dtInstance.destroy();
                // Call the dtTrigger to rerender again
                this.dtOptions = this.utiles.InicializeOptionsPrestamo(this.dtOptions, 8, 'Listado de préstamos gajico ltda.');
                this.loading = true;
                const headers = new Headers;
                const body = JSON.stringify(
                    {
                        InstId: this.nodIdLogueado,
                        Rut: rut,
                        Dv: dv
                    }
                );
                headers.append('Access-Control-Allow-Origin', '*');
                let url = environment.API_ENDPOINT + 'Cliente';
                let httpHeaders = new HttpHeaders({
                    'Content-Type': 'application/json',
                    'Cache-Control': 'no-cache'
                });
                httpHeaders.set('Access-Control-Allow-Origin', '*');
                let options = { headers: httpHeaders };

                this.httpClient.post(url, body, options).subscribe((res: Observable<User[]>) => {
                    var cliente = res[0];
                    if (cliente) {
                        this.clienteEncontrado = cliente;
                        console.log(this.clienteEncontrado);
                        this.gajico.getPrestamos(cliente.Id, '0').subscribe(
                            data => {
                                if (data) {
                                    this.prestamos = data;
                                    this.gajico.getPrestamosConsolidado(cliente.Id, '0').subscribe(
                                        dataC => {
                                            this.consolidado = dataC;
                                            if (this.consolidado.length > 0) {
                                                var indice = 1;
                                                this.consolidado.forEach(elemento => {
                                                    elemento.Indice = indice;
                                                    indice++;
                                                });
                                            }
                                            this.datasource = new MatTableDataSource(this.consolidado);
                                            this.dtTrigger.next();
                                            this.loading = false;
                                        }
                                    )
                                }
                            },
                            err => {
                                console.error(err);
                                this.loading = false;
                                this.showToast('error', err, 'Error');
                            },
                            () => {
                                this.loading = false;
                                console.log('get info prestamos');
                            }
                        );
                    }
                    else {
                        this.showToast('warning', 'No hay resultados', 'No encontrado');
                        this.prestamos = [];
                        this.dtTrigger.next();
                        this.loading = false;
                    }
                });

            });
        }
        else {
            this.showToast('error', 'Debe ingresar Rut y digito verficador', 'Error');
        }

    }

      /*
    activar() {
        if (this.usuDesactivarActivar && this.usuDesactivarActivar.Id > 0) {
            this.usuDesactivarActivar.Eliminado = 0;
            this.loading = true;
            this.gajico.putProveedor(this.usuDesactivarActivar).subscribe(
                data => {
                    var cliente = data;
                    this.rerenderNod(this.nodIdLogueado);
                },
                err => {
                    console.error(err);
                    this.showToast('error', err, 'Error');
                    this.loading = false;

                },
                () => {
                    console.log('save completed');
                    this.showToast('success', 'Activado con éxito', 'Proveedor');
                    //cierre del modal
                    this.utiles.CerrarModal($('#exampleModalCenter1'));
                    //$("#exampleModalCenter").modal("toggle");
                    this.loading = false;

                }
            );
        }
    }
    desactivar() {

        //antes verificamos que se encuentre seleccionado el usuario a desactivar
        if (this.usuDesactivarActivar && this.usuDesactivarActivar.Id > 0) {
            this.usuDesactivarActivar.Eliminado = 1;
            this.loading = true;
            this.gajico.putProveedor(this.usuDesactivarActivar).subscribe(
                data => {
                    var cliente = data;
                    this.rerenderNod(this.nodIdLogueado);
                },
                err => {
                    console.error(err);
                    this.showToast('error', err, 'Error');
                    this.loading = false;

                },
                () => {
                    console.log('save completed');
                    this.showToast('success', 'Eliminado con éxito', 'Proveedor');
                    //cierre del modal
                    this.utiles.CerrarModal($('#exampleModalCenter'));
                    //$("#exampleModalCenter").modal("toggle");
                    this.loading = false;

                }
            );
        }
    }

    guardar() {
        if (this.forma.valid) {
            //correcto
            //ahora los demas elementos
            //nombre usuario
            var rut = '';
            if (this.forma.controls.nuevoRut) {
                if (this.forma.controls.nuevoRut.value != null) {
                    rut = String(this.forma.controls.nuevoRut.value);
                }
            }
            var dv = '';
            if (this.forma.controls.nuevoDig) {
                if (this.forma.controls.nuevoDig.value != null) {
                    dv = String(this.forma.controls.nuevoDig.value);
                }
            }
            //validacion del rut
            if (!this.utiles.validaRut(rut, dv)){
                return this.showToast('error', 'Rut inválido', 'Rut inválido');
            }

            var nombres = '';
            if (this.forma.controls.nuevoNombre) {
                if (this.forma.controls.nuevoNombre.value != null) {
                    nombres = String(this.forma.controls.nuevoNombre.value);
                }
            }
            var giro = '';
            if (this.forma.controls.nuevoGiro) {
                if (this.forma.controls.nuevoGiro.value != null) {
                    giro = String(this.forma.controls.nuevoGiro.value);
                }
            }
            var comuna = '';
            if (this.forma.controls.nuevoComuna) {
                if (this.forma.controls.nuevoComuna.value != null) {
                    comuna = String(this.forma.controls.nuevoComuna.value);
                }
            }
            var ciudad = '';
            if (this.forma.controls.nuevoRegion) {
                if (this.forma.controls.nuevoRegion.value != null) {
                    ciudad = String(this.forma.controls.nuevoRegion.value);
                }
            }
            var direccion = '';
            if (this.forma.controls.nuevoDireccion) {
                if (this.forma.controls.nuevoDireccion.value != null) {
                    direccion = String(this.forma.controls.nuevoDireccion.value);
                }
            }
            var telefonos = '';
            if (this.forma.controls.nuevoTelefonos) {
                if (this.forma.controls.nuevoTelefonos.value != null) {
                    telefonos = String(this.forma.controls.nuevoTelefonos.value);
                }
            }
            var correo = '';
            if (this.forma.controls.nuevoCorreo) {
                if (this.forma.controls.nuevoCorreo.value != null) {
                    correo = String(this.forma.controls.nuevoCorreo.value);
                }
            }
            var fax = '';
            if (this.forma.controls.nuevoFax) {
                if (this.forma.controls.nuevoFax.value != null) {
                    fax = String(this.forma.controls.nuevoFax.value);
                }
            }
            
            if (String(this.forma.controls.nuevoComuna.value) == '' || String(this.forma.controls.nuevoComuna.value) == 'Seleccione') {
                return this.showToast('error', 'Seleccione Comuna', 'Requerido');
            }
            if (String(this.forma.controls.nuevoGiro.value) == '') {
                return this.showToast('error', 'Seleccione Giro', 'Requerido');
            }
            if (String(this.forma.controls.nuevoRegion.value) == '' || String(this.forma.controls.nuevoRegion.value) == 'Seleccione') {
                return this.showToast('error', 'Seleccione Región', 'Requerido');
            }
            //ahora creamos la entidad a enviar
            var entidad = {
                Editando: this.editando,
                AusId: this.ausIdEditando,
                Rut: rut,
                Dv: dv,
                Nombres: nombres.toUpperCase(),
                Region: ciudad.toUpperCase(),
                Giro: giro.toUpperCase(),
                Comuna: comuna.toUpperCase(),
                Direccion: direccion.toUpperCase(),
                Telefonos: telefonos,
                Correo: correo.toUpperCase(),
                Fax: fax,
                Eliminado: 0
            }
            this.loading = true;
            this.gajico.putProveedor(entidad).subscribe(
                data => {
                    var cliente = data;
                    this.rerenderNod(this.nodIdLogueado);
                },
                err => {
                    console.error(err);
                    this.showToast('error', err, 'Error');
                    this.loading = false;

                },
                () => {
                    console.log('save completed');
                    this.showToast('success', 'Guardado con éxito', 'Proveedor');
                    //cierre del modal
                    this.utiles.CerrarModal($('#modalEdicion'));
                    this.loading = false;

                }
            );
        }
        else {
            //procesar forma
            var sms = this.utiles.entregaErrorForma(this.forma);
            this.showToast('error', sms, 'Requeridos');
        }
    }
    crear() {
        this.editando = false;
        this.forma.reset({});
        this.tituloModal = 'Creando Proveedor';
        //nodo del usuario
        //this.obtenerNodos(false, this.nodIdLogueado);
        this.forma.controls.nuevoRut.enable();
        this.forma.controls.nuevoDig.enable();
        this.forma.controls.nuevoRegion.setValue("Seleccione");

    }
*/
    showToast(tipo, mensaje, titulo) {
        if (tipo == 'success') {
            this.toastr.successToastr(mensaje, titulo);
        }
        if (tipo == 'error') {
            this.toastr.errorToastr(mensaje, titulo);
        }
        if (tipo == 'info') {
            this.toastr.infoToastr(mensaje, titulo);
        }
        if (tipo == 'warning') {
            this.toastr.warningToastr(mensaje, titulo);
        }

    }
}
export interface Consolidado {
    Indice: number;
    NombreProducto: string;
    Capacidad: number;
    Llenos: number;
    Vacios: number;
}


