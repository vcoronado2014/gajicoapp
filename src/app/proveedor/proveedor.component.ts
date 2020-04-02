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
import { GajicoService, Proveedor } from '../servicios/gajico.service';
import { UtilesService } from '../servicios/utiles.service';

//completer
import { CompleterService, CompleterData } from 'ng2-completer';
import { DataTableDirective } from 'angular-datatables';

//dialog
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material';

declare var $:any;

@Component({
  selector: 'app-proveedor',
  templateUrl: './proveedor.component.html',
  styleUrls: ['./proveedor.component.css']
})
export class ProveedorComponent implements OnInit, OnDestroy {
    @ViewChild(DataTableDirective, { static: false })

    dtElement: DataTableDirective;
    //dtOptions: DataTables.Settings = {};
    dtOptions: any = {};

    persons: Observable<Proveedor[]>;
    // We use this trigger because fetching the list of persons can be quite long,
    // thus we ensure the data is fetched before rendering
    dtTrigger: Subject<any> = new Subject();

    verGiro = false;
    editando = false;
    ausIdEditando = 0;
    forma: FormGroup;
    //loading
    loading = false;
    //variables
    listaRegiones;
    listaGiros;
    listaGirosStr;

    listaComunas;
    listaNodos;
    listaRoles;
    nodIdLogueado;
    rolIdLogueado;
    usuarioEditando;
    tituloModal;
    usuDesactivarActivar;
    nombreUsuarioLogueado;
    isChecked = 0;


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
        private _vcr: ViewContainerRef
    ) {
        //this.toastr.setRootViewContainerRef(_vcr);
    }

    ngOnInit() {
        if (sessionStorage.getItem("USER_LOGUED_IN")) {
            var usuarioLogueado = JSON.parse(sessionStorage.getItem("USER_LOGUED_IN"));
            if (usuarioLogueado.AutentificacionUsuario) {
                this.nodIdLogueado = usuarioLogueado.AutentificacionUsuario.InstId;
                this.rolIdLogueado = usuarioLogueado.Rol.Id;
                this.nombreUsuarioLogueado = usuarioLogueado.AutentificacionUsuario.NombreUsuario;
            }
        }
        this.dtOptions = this.utiles.InicializeOptionsCLI(this.dtOptions, 8, 'Listado de proveedores Gajico ltda.');

        this.obtenerRegiones(this.nodIdLogueado);
        this.obtenerGiros(this.nodIdLogueado);
        this.cargarClientes(this.nodIdLogueado);
        this.cargarForma();

    }
    checkValue(event: any) {
        //console.log(event);
        this.isChecked = event;
        this.rerenderNod(this.nodIdLogueado);
      }
    /*
    buscarRut(rut, dv){
      var cliente = null;
      if (this.persons && this.persons.length >= 0){
        this.persons.forEach(clienteArr => {
          if (clienteArr.RutProved.toUpperCase() == rut.toUpperCase() && clienteArr.DigProved.toUpperCase() == dv.toUpperCase()){
            cliente = clienteArr;
          }
        });
      }
      return cliente;    
    }
    */
    limpiar() {
        this.editando = false;
        this.forma.reset({});
        //nodo del usuario
        //this.obtenerNodos(false, this.nodIdLogueado);
        this.forma.controls.nuevoRegion.setValue("Seleccione");
        this.obtenerComunas("Seleccione", null);
        this.usuarioEditando = null;
        this.ausIdEditando = 0;
        this.forma.controls.nuevoRut.enable();
        this.forma.controls.nuevoDig.enable();
        this.tituloModal = 'Creando proveedor';
    }

    rerender() {
        this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
            // Destroy the table first
            dtInstance.destroy();
            // Call the dtTrigger to rerender again
            this.dtOptions = this.utiles.InicializeOptionsCLI(this.dtOptions, 8, 'Listado de proveedores Gajico ltda.');
            this.dtTrigger.next();
        });
    }

    rerenderNod(nodId) {
        this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
            // Destroy the table first
            dtInstance.destroy();
            // Call the dtTrigger to rerender again
            this.dtOptions = this.utiles.InicializeOptionsCLI(this.dtOptions, 8, 'Listado de proveedores Gajico ltda.');
            this.loading = true;

            const headers = new Headers;
            const body = JSON.stringify(
                {
                    InstId: nodId,
                    Rut: null,
                    Dv: null,
                    Eliminado: this.isChecked
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
                this.persons = res;
                this.dtTrigger.next();
                this.loading = false;
            });

        });
    }
    cargarClientes(nodId) {
        this.loading = true;

        const headers = new Headers;
        const body = JSON.stringify(
            {
                InstId: nodId,
                Rut: null,
                Dv: null,
                Eliminado: this.isChecked
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
            this.persons = res;
            this.dtTrigger.next();
            this.loading = false;
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
                    this.editar(cliente);
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
    mostrarGiro(mostrar) {
        if (mostrar) {
            this.verGiro = true;
        }
        else {
            this.verGiro = false;
        }
    }
    upperCaseF(a) {
        setTimeout(function () {
            a.target.value = a.target.value.toUpperCase();
        }, 1);
    }

    insertarGiro() {
        //antes debemos validar si existe o no en la lista de giros
        var nombre = $('#nuevoGiroGuardar').val();
        if (this.utiles.VerificaObjetoArray(nombre, this.listaGiros)) {
            this.showToast('error', 'El giro ya se encuentra agregado en la lista', 'Ya existe');
            return;
        }
        //indicador valor
        this.loading = true;
        this.gajico.putGiro(nombre).subscribe(
            (data: any) => {
                if (data) {
                    var nuevoGiro = data;
                    //ahora que tenemos el nuevo giro lo insertamos a la lista
                    this.listaGiros.push(nuevoGiro);
                    this.listaGirosStr.push(nuevoGiro.Nombre);
                    //y lo dejamos seleccionado en el control
                    this.forma.controls.nuevoGiro.setValue(nuevoGiro.Nombre);
                    //ahora cerramos el control
                    this.verGiro = false;
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
    obtenerGiros(instId) {
        //indicador valor
        this.listaGirosStr = [];
        this.loading = true;
        this.gajico.postGiros(instId).subscribe(
            data => {
                if (data) {
                    this.listaGiros = data;
                    this.listaGiros.forEach(element => {
                        this.listaGirosStr.push(element.Nombre);
                    });
                    console.log(this.listaGiros);
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
    //cargamos la forma
    cargarForma() {

        this.forma = new FormGroup({
            'nuevoRut': new FormControl('', [Validators.required, Validators.minLength(3)]),
            'nuevoDig': new FormControl('', [Validators.required, Validators.maxLength(1)]),
            'nuevoNombre': new FormControl('', Validators.required),
            'nuevoRegion': new FormControl('', Validators.required),
            'nuevoGiro': new FormControl('', Validators.required),
            'nuevoComuna': new FormControl('', Validators.required),
            'nuevoDireccion': new FormControl('', Validators.required),
            'nuevoTelefonos': new FormControl(''),
            'nuevoCorreo': new FormControl('', [Validators.pattern("[^ @]*@[^ @]*")]),
            'nuevoFax': new FormControl('')
        });

        console.log(this.forma.valid + ' ' + this.forma.status);
    }
    //edicion
    editar(usu) {
        //this.cargarForma();
        if (usu) {
            console.log(usu);
            this.editando = true;
            this.ausIdEditando = usu.Id;
            //this.cargarForma();
            this.tituloModal = 'Editando a ' + usu.NomProved;
            this.usuarioEditando = usu;
            //cargamos los combos
            //comuna del usuario
            this.obtenerComunas(this.usuarioEditando.CiuProved, null);
            //setear los campos
            //this.forma.controls.nuevoNombreUsuario
            this.forma.setValue({
                nuevoRut: this.usuarioEditando.RutProved,
                nuevoDig: this.usuarioEditando.DigProved,
                nuevoNombre: this.usuarioEditando.NomProved,
                nuevoRegion: this.usuarioEditando.CiuProved,
                nuevoGiro: this.usuarioEditando.GirProved,
                nuevoComuna: this.usuarioEditando.ComProved,
                nuevoDireccion: this.usuarioEditando.DirProved,
                nuevoTelefonos: this.usuarioEditando.TelProved,
                nuevoCorreo: this.usuarioEditando.CorreoProved,
                nuevoFax: this.usuarioEditando.FaxProved,
            });
            //deshabilitamos
            this.forma.controls.nuevoRut.disable();
            this.forma.controls.nuevoDig.disable();
        }
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
    //metodos de obtención
    obtenerRegiones(instId) {
        //indicador valor
        this.loading = true;
        this.gajico.postRegiones(instId).subscribe(
            data => {
                if (data) {
                    this.listaRegiones = data;
                    console.log(this.listaRegiones);
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
    obtenerComunas(regId, id) {
        //indicador valor
        this.listaComunas = [];
        this.loading = true;
        this.gajico.postComunas(regId, id).subscribe(
            data => {
                if (data) {
                    this.listaComunas = data;
                    console.log(this.listaComunas);
                }
            },
            err => {
                console.error(err);
                this.loading = false;
                this.showToast('error', err, 'Error');
            },
            () => {
                this.loading = false;
                console.log('get info comunas');
            }
        );

    }
    //on change
    onChangeRegion(event) {
        console.log(event.target.value);
        this.obtenerComunas(event.target.value, null);
        this.forma.controls.nuevoComuna.setValue('Seleccione');
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


