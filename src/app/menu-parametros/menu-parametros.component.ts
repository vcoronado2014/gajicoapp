import { Component, OnInit, ViewContainerRef, ViewChild, OnDestroy, ElementRef } from '@angular/core';
import { FormsModule, ReactiveFormsModule, FormGroup, FormControl, Validators, FormArray, FormBuilder } from '@angular/forms';
import { Router } from "@angular/router";
import { Observable } from 'rxjs';
import { Subject } from 'rxjs';

import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../environments/environment';

import { ToastrManager } from 'ng6-toastr-notifications';

//servicios

import { GajicoService, Proveedor } from '../servicios/gajico.service';
import { UtilesService } from '../servicios/utiles.service';

//completer
import { CompleterService, CompleterData } from 'ng2-completer';
import { DataTableDirective } from 'angular-datatables';
//dialog
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';

declare var $: any;


@Component({
    selector: 'app-menu-parametros',
    templateUrl: './menu-parametros.component.html',
    styleUrls: ['./menu-parametros.component.css']
})
export class MenuParametrosComponent implements OnInit {
    nodIdLogueado;
    rolIdLogueado;
    usuarioEditando;
    nombreUsuarioLogueado;
    objetoLogueado;

    forma: FormGroup;
    formaParam: FormGroup;
    //loading
    loading = false;
    //variables
    listaRegiones;
    listaGiros;
    listaGirosStr;
    listaComunas;
    //institucion
    institucion;
    dataInstitucion: any;
    dataParametros: any;
    dataParametrosGuardar: any;
    listaIvas;
    parametrosActuales;

    constructor(
        private httpClient: HttpClient,
        private fb: FormBuilder,
        private router: Router,
        private gajico: GajicoService,
        private toastr: ToastrManager,
        public completerService: CompleterService,
        public utiles: UtilesService,
        public dialog: MatDialog,
        private _vcr: ViewContainerRef
    ) {
        
    }

    ngOnInit() {
        if (sessionStorage.getItem("USER_LOGUED_IN")) {
            var usuarioLogueado = JSON.parse(sessionStorage.getItem("USER_LOGUED_IN"));
            if (usuarioLogueado.AutentificacionUsuario) {
                this.nodIdLogueado = usuarioLogueado.AutentificacionUsuario.InstId;
                this.rolIdLogueado = usuarioLogueado.Rol.Id;
                this.nombreUsuarioLogueado = usuarioLogueado.AutentificacionUsuario.NombreUsuario;
                this.institucion = usuarioLogueado.Institucion;
                this.objetoLogueado = usuarioLogueado;
            }
        }
        this.obtenerRegiones(this.nodIdLogueado);
        this.obtenerGiros(this.nodIdLogueado);
        this.obtenerParametros(this.nodIdLogueado);
        //this.cargarClientes(this.nodIdLogueado);
        this.cargarForma();
        this.cargarFormaParam();
    }
    cargarDatosInstitucion() {
        console.log(this.institucion);
        //comuna del usuario
        this.obtenerComunas(this.institucion.Ciudad, null);
        //setear los campos
        //this.forma.controls.nuevoNombreUsuario
        this.forma.setValue({
            nuevoRut: this.institucion.Rut,
            nuevoDig: this.institucion.Dv,
            nuevoNombre: this.institucion.Nombre,
            nuevoRegion: this.institucion.Ciudad,
            nuevoGiro: this.institucion.Giro,
            nuevoComuna: this.institucion.Comuna,
            nuevoDireccion: this.institucion.Direccion,
            nuevoTelefonos: this.institucion.Telefono,
            nuevoCorreo: this.institucion.CorreoElectronico,
            nuevoFax: this.institucion.Fax,
            nuevoTitulo: this.institucion.Titulo,
            nuevoSubtitulo: this.institucion.Subtitulo,
        });
    }
    guardarInstitucion() {
        if (this.forma.valid) {
            var rut = '';
            if (this.forma.controls.nuevoRut){
              if (this.forma.controls.nuevoRut.value != null){
                rut = String(this.forma.controls.nuevoRut.value);
              }
            }
            var dv = '';
            if (this.forma.controls.nuevoDig){
              if (this.forma.controls.nuevoDig.value != null){
                dv = String(this.forma.controls.nuevoDig.value);
              }
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
            var titulo = '';
            if (this.forma.controls.nuevoTitulo) {
                if (this.forma.controls.nuevoTitulo.value != null) {
                    titulo = String(this.forma.controls.nuevoTitulo.value);
                }
            }
            var subtitulo = '';
            if (this.forma.controls.nuevoSubtitulo) {
                if (this.forma.controls.nuevoSubtitulo.value != null) {
                    subtitulo = String(this.forma.controls.nuevoSubtitulo.value);
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
                Rut: rut,
                Dv: dv,
                Id: this.institucion.Id,
                Nombre: nombres,
                Region: ciudad.toUpperCase(),
                Ciudad: ciudad.toUpperCase(),
                Giro: giro.toUpperCase(),
                Comuna: comuna.toUpperCase(),
                Direccion: direccion,
                Telefono: telefonos,
                CorreoElectronico: correo,
                Fax: fax,
                Eliminado: 0,
                Titulo: titulo,
                Subtitulo: subtitulo
            }
            this.loading = true;
            this.gajico.putInstitucion(entidad).subscribe(
                data  => {
                    this.dataInstitucion = data;
                    //var datos = data;
                    if (this.dataInstitucion.TipoMensaje != 1){
                        this.showToast('error', this.dataInstitucion.Mensaje.TextoMensaje,'Error');
                    }
                    else{
                        var institucionModificada = this.dataInstitucion.Institucion;
                        this.institucion = institucionModificada;
                        this.objetoLogueado.Institucion = institucionModificada;
                        var datos = JSON.stringify(this.objetoLogueado);
                        sessionStorage.setItem("USER_LOGUED_IN", datos);
                    }

                },
                err => {
                    console.error(err);
                    this.showToast('error', err, 'Error');
                    this.loading = false;

                },
                () => {
                    console.log('save completed');
                    this.showToast('success', 'Guardado con éxito', 'Institucion');
                    //cierre del modal
                    this.utiles.CerrarModal($('#modalEdicion'));
                    this.loading = false;

                }
            );
        }
        else {
            this.showToast('error', 'Revise campos', 'Requeridos');
        }
    }
    guardarParametros(){
        if (this.formaParam.valid){
            var numeroDoc = '';
            if (this.formaParam.controls.nuevoNumeroDocumento){
              if (this.formaParam.controls.nuevoNumeroDocumento.value != null){
                numeroDoc = String(this.formaParam.controls.nuevoNumeroDocumento.value);
              }
            }
            var iva = '0';
            if (this.formaParam.controls.nuevoIVA){
              if (this.formaParam.controls.nuevoIVA.value != null){
                iva = String(this.formaParam.controls.nuevoIVA.value);
              }
            }
            var stockMinimo = '0';
            if (this.formaParam.controls.nuevoStockMinimoCantidad){
              if (this.formaParam.controls.nuevoStockMinimoCantidad.value != null){
                stockMinimo = String(this.formaParam.controls.nuevoStockMinimoCantidad.value);
              }
            }
            var stockMinimoM = '0';
            if (this.formaParam.controls.nuevoStockMinimoMetros){
              if (this.formaParam.controls.nuevoStockMinimoMetros.value != null){
                stockMinimoM = String(this.formaParam.controls.nuevoStockMinimoMetros.value);
              }
            }
            //ahora armamos la entidad
            this.loading = true;
            this.gajico.putParametros(
                this.parametrosActuales.Id,
                this.parametrosActuales.InstId,
                numeroDoc,
                iva,
                stockMinimo,
                stockMinimoM
            ).subscribe(
                data  => {
                    this.dataParametrosGuardar = data;
                    //var datos = data;
                    if (this.dataParametrosGuardar.Mensaje.TipoMensaje != 1){
                        this.showToast('error', this.dataParametrosGuardar.Mensaje.TextoMensaje,'Error');
                    }
                    else{
                        var parametrosModificado = this.dataParametrosGuardar.Parametros;
                        this.parametrosActuales = parametrosModificado;
                        this.objetoLogueado.Parametro = parametrosModificado;
                        var datos = JSON.stringify(this.objetoLogueado);
                        sessionStorage.setItem("USER_LOGUED_IN", datos);
                        this.showToast('success', this.dataParametrosGuardar.Mensaje.TextoMensaje,'Correcto');
                    }
                },
                err => {
                    console.error(err);
                    this.showToast('error', err, 'Error');
                    this.loading = false;

                },
                () => {
                    console.log('save completed');
                    this.showToast('success', 'Guardado con éxito', 'Institucion');
                    //cierre del modal
                    this.utiles.CerrarModal($('#modalEdicionParam'));
                    this.loading = false;

                }
            );

        }
        else{
            this.showToast('error', 'Revise campos', 'Requeridos');
        }
    }
    obtenerParametros(instId) {
        //indicador valor
        this.listaGirosStr = [];
        this.loading = true;
        this.gajico.getIVA(instId).subscribe(
            data => {
                this.dataParametros = data;
                if (this.dataParametros && this.dataParametros.Parametros) {
                    var ivas = this.dataParametros.HistorialIva;
                    this.listaIvas = [];
                    //procesamos historial
                    if (ivas.length > 0){
                        ivas.forEach(iva => {
                            iva.Desde = this.utiles.entregaMes(iva.MesInicio) + ' ' + iva.AnioInicio.toString();
                            iva.Hasta = this.utiles.entregaMes(iva.MesTermino) + ' ' + iva.AnioTermino.toString();
                            this.listaIvas.push(iva);
                        });
                    }
                    this.listaIvas.reverse();
                    //this.listaIvas = this.dataParametros.HistorialIva;
                    this.parametrosActuales = this.dataParametros.Parametros;
                    this.formaParam.setValue({
                        nuevoIVA: this.parametrosActuales.Iva,
                        nuevoNumeroDocumento: this.parametrosActuales.NumDocumento,
                        nuevoStockMinimoCantidad: this.parametrosActuales.StockMinimoCantidad,
                        nuevoStockMinimoMetros: this.parametrosActuales.StockMinimoMetros
                    });
                    console.log(this.listaIvas);
                    //this.showToast('success', 'Correcto', 'Recuperado');
                }
                else {
                    this.showToast('error', 'Error de obtención de datos', 'Error');    
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
                    //this.forma.controls.nuevoUsuarioComuna.setValue('0');
                    console.log(this.listaComunas);
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
                console.log('get info comunas');
            }
        );

    }

    //cargamos la forma
    cargarFormaParam() {

        this.formaParam = new FormGroup({
            'nuevoIVA': new FormControl('', [Validators.required]),
            'nuevoNumeroDocumento': new FormControl('', [Validators.required]),
            'nuevoStockMinimoCantidad': new FormControl(''),
            'nuevoStockMinimoMetros': new FormControl(''),
        });

        console.log(this.forma.valid + ' ' + this.forma.status);
    }
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
            'nuevoFax': new FormControl(''),
            'nuevoTitulo': new FormControl(''),
            'nuevoSubtitulo': new FormControl(''),
        });

        console.log(this.forma.valid + ' ' + this.forma.status);
    }

    //on change
    onChangeRegion(event) {
        console.log(event.target.value);
        this.obtenerComunas(event.target.value, null);
        this.forma.controls.nuevoComuna.setValue('Seleccione');
    }
    abrirUsuarios() {
        this.router.navigateByUrl('/usuarios')
            .then(data => console.log(data),
                error => {
                    console.log(error);
                }
            )
    }
    abrirClientes() {
        this.router.navigateByUrl('/clientes')
            .then(data => console.log(data),
                error => {
                    console.log(error);
                }
            )
    }
    abrirProveedores() {
        this.router.navigateByUrl('/proveedores')
            .then(data => console.log(data),
                error => {
                    console.log(error);
                }
            )
    }

    showToast(tipo, mensaje, titulo){
        if (tipo == 'success'){
          this.toastr.successToastr(mensaje, titulo);
        }
        if (tipo == 'error'){
          this.toastr.errorToastr(mensaje, titulo);
        }
        if (tipo == 'info'){
          this.toastr.infoToastr(mensaje, titulo);
        }
        if (tipo == 'warning'){
          this.toastr.warningToastr(mensaje, titulo);
        }
    
      }

}
