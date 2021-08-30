import { Component, OnInit, ViewContainerRef, ViewChild, ElementRef, Input } from '@angular/core';
import { FormsModule, ReactiveFormsModule, FormGroup, FormControl, Validators, FormArray, FormBuilder } from '@angular/forms';
import { Router } from "@angular/router";
import { Subject } from 'rxjs';
import { Observable } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../environments/environment';

import { ToastrManager } from 'ng6-toastr-notifications';

//servicios
import { UtilesService } from '../servicios/utiles.service';
import { GajicoService, User, Proveedor } from '../servicios/gajico.service';
//completer
import { CompleterService, CompleterData } from 'ng2-completer';
import { DataTableDirective } from 'angular-datatables';
//dialog
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';

declare var $: any;
import swal from 'sweetalert2';
import * as moment from 'moment';

@Component({
  selector: 'app-arriendo',
  templateUrl: './arriendo.component.html',
  styleUrls: ['./arriendo.component.css']
})
export class ArriendoComponent implements OnInit {
  @ViewChild(DataTableDirective, { static: false })

  dtElement: DataTableDirective;
  //dtOptions: DataTables.Settings = {};
  dtOptions: any = {};
  arriendos: any = [];
  dtTrigger: Subject<any> = new Subject();

listaArriendos: any = [];
  //loading
  loading = false;

  //variables
  nodIdLogueado;
  rolIdLogueado;
  usuarioEditando;
  tituloModal;
  usuDesactivarActivar;
  nombreUsuarioLogueado;
  rutBuscar = '';
  dvBuscar = '';
  clienteEncontrado = null;
  editando = false;
  forma: FormGroup;
  productoAgregando = null;
  listaCodigosProd;

  constructor(
    private httpClient: HttpClient,
    private fb: FormBuilder,
    private router: Router,
    //private global: GlobalService,
    private gajico: GajicoService,
    private toastr: ToastrManager,
    public completerService: CompleterService,
    public utiles: UtilesService,
    public dialog: MatDialog,
    private _vcr: ViewContainerRef
  ) {

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
    this.dtOptions = this.utiles.InicializeOptionsArriendo(this.dtOptions, 8, 'Listado de Arriendos Gajico ltda.');
    this.cargarArriendos('0-0', '0');
    this.obtenerCodigosProductos();
    this.cargarForma();
  }
  procesoGuardado(arriendo, modalCerrar, cierraModal){
    this.loading = true;
    this.gajico.putArriendo(arriendo).subscribe(
      (data: any) => {
        var datos = data;
        if (datos){
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
  guardar() {
    if (this.productoAgregando != null) {
      if (this.forma.valid) {
        //capturamos los elementos necesarios para guardarlos
        var factura = 0;
        if (this.forma.controls.nuevoNumeroFactura.value != undefined && this.forma.controls.nuevoNumeroFactura.value != null) {
          factura = parseInt(this.forma.controls.nuevoNumeroFactura.value);
        }
        var entidad = {
          Id: 0,
          BanArrien: '',
          CanArrien: this.forma.controls.nuevoCantidad.value,
          DigArrien: this.clienteEncontrado.DigClient,
          Eliminado: 0,
          EstArrien: 'A',
          FacArrien: factura.toString(),
          FecArrien: this.utiles.validaFechaEntera(this.forma.controls.nuevoFecha.value),
          GirArrien: this.clienteEncontrado.GirClient,
          Nombre: this.forma.controls.nuevoNombre.value,
          NumArrien: '',
          PagArrien: '0',
          ProArrien: this.forma.controls.nuevoCodigo.value,
          RutArrien: this.clienteEncontrado.RutClient,
          ValArrien: this.forma.controls.nuevoValor.value,
        }
        //ahora guardamos
        this.procesoGuardado(entidad, '#exampleModalCenterD', true);
        //console.log(entidad);

      }
      else {
        var sms = this.utiles.entregaErrorForma(this.forma);
        //this.showToast('error', sms, 'Campos requeridos');
        swal.fire({
          icon: 'error',
          title: 'Ups...',
          text: sms,
          footer: '<b>Revise los campos del formulario</b>'
        })
      }

    }
  }
  cargarForma() {

    this.forma = new FormGroup({
      'nuevoCodigo': new FormControl('', [Validators.required, Validators.minLength(3)]),
      'nuevoNombre': new FormControl('', Validators.required),
      'nuevoValor': new FormControl(0, [Validators.required, Validators.min(1)]),
      'nuevoCantidad': new FormControl(0, [Validators.required, Validators.min(1)]),
      'nuevoFecha': new FormControl(this.utiles.retornaFechaFormateada(moment()), Validators.required),
      'nuevoNumeroFactura': new FormControl('')
    });

    console.log(this.forma.valid + ' ' + this.forma.status);
  }
  crear() {
    this.limpiar();
  }
  limpiar() {
    this.editando = false;
    this.forma.reset({});
    this.tituloModal = 'Nuevo Arriendo';
    this.forma.controls.nuevoValor.setValue(0);
    this.forma.controls.nuevoCantidad.setValue(0);
    this.forma.controls.nuevoCodigo.setValue('');
    this.forma.controls.nuevoNombre.setValue('');
    this.forma.controls.nuevoFecha.setValue(this.utiles.retornaFechaFormateada(moment()));
    this.productoAgregando = null;

  }
  obtenerCodigosProductos() {
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
        console.log('get info codigos');
      }
    );

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
            if (this.productoAgregando && this.productoAgregando.Id > 0) {
              this.forma.controls.nuevoNombre.setValue(this.productoAgregando.NomProduc);
              console.log(this.productoAgregando);
            }
            else {
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
  quitarArriendo(arriendo) {

    swal.fire(
      {
        title: '¿Estás seguro de eliminar este arriendo?',
        text: 'Se eliminará el arriendo seleccionado',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'SI, QUIERO ELIMINAR!',
        cancelButtonText: 'NO, CANCELAR TODO!',
      }
    ).then((value) => {
      if (value.dismiss) {
        swal.fire('Cancelado');
      }
      else {
        console.log('eliminar arriendo ' + arriendo)
        this.loading = true;
        this.gajico.getArriendo(arriendo.Id).subscribe(
          (data:any)=>{
            var datos = data;
            if (data){
              this.buscar();
            }
            else {
              this.loading = false;
              this.showToast('error', 'Error al eliminar', 'Error');
            }
          }
        )
        //prestamo.Eliminado = 1
        //this.procesoGuardado(prestamo, '', false);
        //this.buscar();
      }
    });
  }
  cargarArriendos(rut, eliminado) {
    //indicador valor
    this.loading = true;
    this.arriendos = [];
    this.gajico.postArriendos(rut).subscribe(
      data => {
        if (data) {
          this.arriendos = data;
          this.dtTrigger.next();
          this.loading = false;
          console.log(this.arriendos);
          //this.showToast('success', 'Correcto', 'Recuperado');
        }
        else {
          this.arriendos = [];
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
  limpiarGrilla() {
    this.clienteEncontrado = null;
    this.rutBuscar = '';
    this.dvBuscar = '';
    this.arriendos = [];
    this.rerender();
  }
  rerender() {
    this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
      // Destroy the table first
      dtInstance.destroy();
      // Call the dtTrigger to rerender again
      this.dtOptions = this.utiles.InicializeOptionsArriendo(this.dtOptions, 8, 'Listado de arriendos Gajico ltda.');
      this.dtTrigger.next();
    });
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
            this.dtOptions = this.utiles.InicializeOptionsArriendo(this.dtOptions, 8, 'Listado de arriendos gajico ltda.');
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
                    this.gajico.postArriendos(cliente.RutClient).subscribe(
                        data => {
                            if (data) {
                                this.arriendos = data;
                                this.dtTrigger.next();
                                this.loading = false;

                            }
                            else{
                              this.arriendos = [];
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
                else {
                    this.showToast('warning', 'No hay resultados', 'No encontrado');
                    this.arriendos = [];
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
  salir(){
      /*
    sessionStorage.clear();
    this.router.navigateByUrl('/login')
    .then(data => console.log(data),
      error =>{
        console.log(error);
      }
    )
    */
  }
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