import { Component, OnInit, ViewContainerRef, ViewChild, ElementRef, Input } from '@angular/core';
import { FormsModule, ReactiveFormsModule, FormGroup, FormControl, Validators, FormArray, FormBuilder } from '@angular/forms';
import { Router, ActivatedRoute } from "@angular/router";
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
//archivos
import { AngularFileUploaderComponent } from "angular-file-uploader";

declare var $: any;
import swal from 'sweetalert2';
import * as moment from 'moment';

@Component({
    selector: 'app-articulo',
    templateUrl: './articulo.component.html',
    styleUrls: ['./articulo.component.css']
})
export class ArticuloComponent implements OnInit {
    categorias: any = [];
    estaEditando = false;
    articulo: any;
    idArticulo = 0;
    loading = false;
    logued: any;
    producto: any;
    forma:FormGroup;
    archivoImagen = environment.URL_FOTOS + 'NO_disponible.jpeg';
    nombreArchivo = 'NO_disponible.jpeg';
    //configuracion de archivos
    afuConfig = {
        uploadAPI: {
            url: "https://example-file-upload-api"
        },
        multiple: false,
        formatsAllowed: ".jpg,.png,.jpeg",
        maxSize: "3",
        hideProgressBar: false,
        hideResetBtn: true,
        hideSelectBtn: false,
        fileNameIndex: true,
        replaceTexts: {
            selectFileBtn: 'Seleccione imagen',
            resetBtn: 'Borrar',
            uploadBtn: 'Subir',
            dragNDropBox: 'Arastre aquí',
            attachPinBtn: 'Adjunte archivos...',
            afterUploadMsg_success: 'Cargado con exito !',
            afterUploadMsg_error: 'Error en la carga !',
            sizeLimit: 'Tamaño máximo'
        }
    };
    @ViewChild('fileUpload1', {static: true})
    private fileUpload1:  AngularFileUploaderComponent;
    public imagePath;
    imgURL: any;
    public message: string;
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
        private _vcr: ViewContainerRef,
        private activatedRoute: ActivatedRoute
    ) {

    }


    ngOnInit() {
        moment.locale('es');
        this.loading = true;
        this.gajico.getCategorias(0).subscribe((rs:any)=>{
            this.loading = false;
            var data: any = rs;
            this.categorias = data;
            console.log(this.categorias);
        },
        error=>{
            console.log(error.message);
            this.loading = false;
        }
        );
        if (sessionStorage.getItem('USER_LOGUED_IN')){
            this.logued = JSON.parse(sessionStorage.getItem('USER_LOGUED_IN'));
        }
        this.activatedRoute.queryParams.subscribe((params) => {
            console.log(params.producto);
            this.producto = JSON.parse(params.producto);
            //buscamos el articulo
            this.loading = true;
            this.gajico.getArticulo(this.logued.Institucion.Id, this.producto.Id).subscribe(
                (rs:any)=>{
                    this.loading = false;
                    var data: any = rs;
                    this.articulo = data;
                    if (this.articulo.Id > 0){
                        this.idArticulo = this.articulo.Id;
                        this.archivoImagen = environment.URL_FOTOS + this.articulo.UrlImagen;
                        this.nombreArchivo = this.articulo.UrlImagen;
                        this.estaEditando = true;
                        
                    }
                    this.cargarForma();
                }
            )
        },
        error=>{
            this.loading = false;
            console.log(error);
        }
        );
        this.cargarForma();

    }
    verificaCategoria(nombreVerificar){
        var retorno = false
        var cat = this.categorias.filter(p=>p.Nombre.toUpperCase() == nombreVerificar.toUpperCase());
        retorno = cat && cat.length == 1 ? true : false;
        return retorno; 
    }
    
      //cargamos la forma
    cargarForma() {

        this.forma = new FormGroup({
            'nuevoTitulo': new FormControl('', Validators.required),
            'nuevoContenido': new FormControl(''),
            'nuevoPrecioAnterior': new FormControl('', Validators.required),
            'nuevoPrecioActual': new FormControl('', Validators.required),
            'nuevoIdCategoria': new FormControl(1, Validators.required),
        });
        if (this.estaEditando){
            if (this.articulo){
                //this.forma.controls.nuevoPrecioAnterior.setValue(this.articulo.PrecioAnterior);
                //this.forma.controls.nuevoPrecioActual.setValue(this.articulo.PrecioActual);
                //this.forma.controls.nuevoTitulo.setValue(this.articulo.Titulo);
                //this.forma.controls.nuevoContenido.setValue(this.articulo.Contenido);
                //this.forma.controls.nuevoIdCategoria.setValue(this.articulo.IdCategoria);
                this.forma.setValue({
                    nuevoPrecioAnterior: this.articulo.PrecioAnterior,
                    nuevoPrecioActual: this.articulo.PrecioActual,
                    nuevoContenido: this.articulo.Contenido,
                    nuevoTitulo: this.articulo.Titulo,
                    nuevoIdCategoria: this.articulo.IdCategoria
                })
            }
        }
        else {
            if (this.producto) {
               /*  this.forma.controls.nuevoPrecioAnterior.setValue(this.producto.ValProduc);
                this.forma.controls.nuevoPrecioActual.setValue(this.producto.ValProduc);
                this.forma.controls.nuevoTitulo.setValue(this.producto.NomProduc); */
                this.forma.setValue({
                    nuevoPrecioAnterior: this.producto.ValProduc,
                    nuevoPrecioActual: this.producto.ValProduc,
                    nuevoContenido: '',
                    nuevoTitulo: this.producto.NomProduc,
                    nuevoIdCategoria: 1
                })
            }
        }

        console.log(this.forma.valid + ' ' + this.forma.status);
    }
    volver() {
        this.router.navigateByUrl('/productos')
            .then(data => console.log(data),
                error => {
                    console.log(error);
                }
            )
    }
    crearEntidad(){
        //aca hay que hacer validaciones de archivo

        var entidad = {
            Id: this.idArticulo,
            Visible: '1',
            UsaImagen: '1',
            UsaTitulo: '1',
            Titulo: this.forma.controls.nuevoTitulo == null ? '' : this.forma.controls.nuevoTitulo.value,
            Contenido: this.forma.controls.nuevoContenido == null ? '' : this.forma.controls.nuevoContenido.value,
            Eliminado: '0',
            InstId: this.logued.Institucion == null ? 0 : this.logued.Institucion.Id,
            ProdId: this.producto.Id,
            EsOferta: '0',
            PrecioAnterior: this.forma.controls.nuevoPrecioAnterior == null ? '' : this.forma.controls.nuevoPrecioAnterior.value,
            PrecioActual: this.forma.controls.nuevoPrecioActual == null ? '' : this.forma.controls.nuevoPrecioActual.value,
            IdCategoria: this.forma.controls.nuevoIdCategoria == null ? 1 : this.forma.controls.nuevoIdCategoria.value,
            UploadedImage: this.fileUpload1.allowedFiles[0]
        }
        return entidad;
    }
    eliminar(){
        var id = this.idArticulo;
        if (id && id > 0){
            this.loading = true;
            this.gajico.deleteArticulo(id).subscribe((rs:any)=>{
                this.loading = false;
                var datos: any = rs;
                if (datos > 0){
                    this.showToast('success', 'Eliminado con éxito', 'Artículo');
                }
                else{
                    this.showToast('error', 'Error al eliminar', 'Artículo');
                }
                this.volver();
            },
            error=>{
                this.loading = false;
                //mensaje al usuario
                console.log(error);
                this.showToast('error', error, 'Artículo');
                this.volver();
            })
        }
        else{
            this.showToast('error', 'No hay artículo que eliminar', 'Artículo');
        }
    }
    onSubmit(){
        if (this.forma.invalid) {
            return;
        }
        var entidadGuardar = this.crearEntidad();
        console.log(entidadGuardar);
        this.loading = true;

        this.gajico.postArticulo(entidadGuardar.UploadedImage, entidadGuardar.Id,
            entidadGuardar.Visible, entidadGuardar.UsaImagen, entidadGuardar.UsaTitulo,
            entidadGuardar.Titulo, entidadGuardar.Contenido, entidadGuardar.Eliminado,
            entidadGuardar.InstId, entidadGuardar.ProdId, entidadGuardar.EsOferta,
            entidadGuardar.PrecioAnterior, entidadGuardar.PrecioActual, entidadGuardar.IdCategoria).subscribe((rs: any)=>{
                this.loading = false;
                var datos: any = rs;
                if (datos.Mensaje.Texto == 'Guardado con éxito.'){
                    //todo ok, volver al lista de productos
                    this.showToast('success', 'Guardado con éxito', 'Artículo');
                }
                else{
                    //mensaje al usuario
                    this.showToast('error', datos.Mensaje.Texto, 'Artículo');
                }
                this.volver();
            },
            error=>{
                this.loading = false;
                //mensaje al usuario
                console.log(error);
                this.showToast('error', error, 'Artículo');
                this.volver();
            })

    }
    loadFile(event){
        console.log(event);
        //console.log(this.fileUpload1);
        this.preview(this.fileUpload1.allowedFiles);
    }
    preview(files) {
        if (files.length === 0)
            return;

        var mimeType = files[0].type;
        if (mimeType.match(/image\/*/) == null) {
            this.message = "Only images are supported.";
            return;
        }

        var reader = new FileReader();
        this.imagePath = files;
        reader.readAsDataURL(files[0]);
        reader.onload = (_event) => {
            this.imgURL = reader.result;
        }
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
    agregarCategoria() {

        swal.fire(
            {
                title: 'Ingresa el nombre de la nueva categoria.',
                input: 'text',
                inputAttributes: {
                    autocapitalize: 'off'
                },
                showCancelButton: true,
                confirmButtonText: 'SI, QUIERO AGREGAR!',
                cancelButtonText: 'CANCELAR',
                showLoaderOnConfirm: true,
                preConfirm: (nombre) => {
                    //debemos validar si ya está en las categorias o no
                    if (this.verificaCategoria(nombre) == false) {
                        return this.gajico.insertarCategoria(nombre).subscribe((rs: any) => {
                            if (!rs) {
                                throw new Error('Error al insertar')
                            }
                            //volver a cargar las categorias
                            this.categorias.push(rs);
                            return rs;
                        }, error => {
                            console.log(error);
                            swal.showValidationMessage(
                                `Request failed: ${error}`
                            )
                        })
                    }
                    else{
                        return swal.fire(
                            {
                                title: 'Categoria',
                                titleText: 'Esta categoria ya existe intente con otra'
                            }
                        )
                    }

                },
                allowOutsideClick: () => !swal.isLoading()
            }
        ).then((value) => {
            if (!value.dismiss) {
                console.log('volver a cargar categoria')
            }
        });
    }
    //esto hay que implementarlo, por ahora no
    quitarCategoria(id){
        swal.fire(
            {
              title: '¿Estás seguro de eliminar esta categoria?',
              text: 'Se eliminará siempre y cuando no existan artículos ya asociados',
              icon: 'warning',
              showCancelButton: true,
              confirmButtonText: 'SI, QUIERO ELIMINAR!',
              cancelButtonText: 'NO, CANCELAR TODO!',
            }
          ).then((value) => {
            if (!value.dismiss) {
                this.loading = true;
                this.gajico.eliminarCategoria(id).subscribe(
                  (data:any)=>{
                    if (data) {
                        this.loading = false;
                        if (data.Id != 100000) {
                            this.categorias = this.categorias.filter(p => p.Nombre !== data.Nombre);
                            //this.buscar();
                        }
                        else{
                            swal.fire({
                                title:'No se puede eliminar la categoría por que esta siendo usada por otro artículo, contacte al administrador.'
                            })
                        }
                    }
                    else {
                        this.loading = false;
                        swal.fire({
                            title:'Error al eliminar'
                        })
                    }
                  }, error =>{
                    this.loading = false;
                    swal.fire({
                        title:'Error al eliminar'
                    })
                  }
                )
            }

          });
    }
}