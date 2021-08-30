import { Component, OnInit, ViewContainerRef, ViewChild, OnDestroy, ElementRef } from '@angular/core';
import { FormsModule, ReactiveFormsModule, FormGroup, FormControl, Validators, FormArray, FormBuilder } from '@angular/forms';
import { NavigationExtras, Router } from "@angular/router";
import { Observable } from 'rxjs';
import { Subject } from 'rxjs';

import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../environments/environment';

import { ToastrManager } from 'ng6-toastr-notifications';


//servicios
import { GajicoService, Productos } from '../servicios/gajico.service';
import { UtilesService } from '../servicios/utiles.service';
//completer
import { CompleterService, CompleterData } from 'ng2-completer';
import { DataTableDirective } from 'angular-datatables';
//dialog
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material';

declare var $:any;

@Component({
  selector: 'app-productos',
  templateUrl: './productos.component.html',
  styleUrls: ['./productos.component.css']
})
export class ProductosComponent implements OnInit, OnDestroy {
  @ViewChild(DataTableDirective, {static: false})
  
  dtElement: DataTableDirective;
  //dtOptions: DataTables.Settings = {};
  dtOptions: any = {};
  persons: Observable<Productos[]>;
    // We use this trigger because fetching the list of persons can be quite long,
  // thus we ensure the data is fetched before rendering
  dtTrigger: Subject<any> = new Subject();

  verGiro=false;
  editando=false;
  ausIdEditando=0;
  forma:FormGroup;
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
    if (sessionStorage.getItem("USER_LOGUED_IN")){
      var usuarioLogueado = JSON.parse(sessionStorage.getItem("USER_LOGUED_IN"));
      if (usuarioLogueado.AutentificacionUsuario){
        this.nodIdLogueado = usuarioLogueado.AutentificacionUsuario.InstId;
        this.rolIdLogueado = usuarioLogueado.Rol.Id;
        this.nombreUsuarioLogueado = usuarioLogueado.AutentificacionUsuario.NombreUsuario;
      }
    }
    this.dtOptions = this.utiles.InicializeOptionsDT(this.dtOptions, 8, 'Listado de productos gajico ltda.');

    this.cargarClientes(this.nodIdLogueado);
    this.cargarForma(); 

  }
  checkValue(event: any) {
    //console.log(event);
    this.isChecked = event;
    this.rerenderNod(this.nodIdLogueado);
  }

  limpiar(){
    this.editando = false;
    this.forma.reset({});
    this.usuarioEditando = null;
    this.ausIdEditando = 0;
    this.forma.controls.nuevoCodigo.enable();
    this.tituloModal = 'Creando producto';
  }

  rerender() {
    this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
      // Destroy the table first
      dtInstance.destroy();
      // Call the dtTrigger to rerender again
      this.dtOptions = this.utiles.InicializeOptionsDT(this.dtOptions, 8, 'Listado de productos gajico ltda.');
      this.dtTrigger.next();
    });
  }

  rerenderNod(nodId) {
    this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
      // Destroy the table first
      dtInstance.destroy();
      // Call the dtTrigger to rerender again
      this.dtOptions = this.utiles.InicializeOptionsDT(this.dtOptions, 8, 'Listado de productos gajico ltda.');
      this.loading = true;
      const headers = new Headers;
      const body = JSON.stringify(
          {
            InstId: nodId,
            CodigoBuscar: null,
            Eliminado: this.isChecked
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
          this.persons = res;
          this.dtTrigger.next();
          this.loading = false;
      });
/*
      this.gajico.postProductosArr(nodId, null).subscribe((data: Productos[]) => {
        this.persons = data;
        this.dtTrigger.next();
        this.loading = false;
      });
      */


    });
  }
  cargarClientes(nodId){
    this.loading = true;
    const headers = new Headers;
    const body = JSON.stringify(
        {
          InstId: nodId,
          CodigoBuscar: null,
          Eliminado: this.isChecked
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
        this.persons = res;
        this.dtTrigger.next();
        this.loading = false;
    });
    /*
    this.gajico.postProductosArr(nodId, null).subscribe((data: Productos[]) => {
      this.persons = data;
      this.dtTrigger.next();
      this.loading = false;
    });
    */

  }

  keyDowEnter(event){
    console.log(event);
    var codigo = this.forma.controls.nuevoCodigo.value;

    //ambos elementos deben existir para realizar la llamada
    if (codigo && codigo.length > 0){
      //ahora realizamos la busqueda
      var cliente;
      this.loading = true;
      const headers = new Headers;
      const body = JSON.stringify(
          {
            InstId: this.nodIdLogueado,
            CodigoBuscar: codigo
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
        if (res){
          cliente = res[0];
          this.usuarioEditando = cliente;
          this.editar(cliente);
          this.loading = false;
        }
        else {
          this.loading = false;
        }
      });
      /*
      this.gajico.postProductosArr(this.nodIdLogueado, codigo).subscribe((data: Productos[]) => {
        //revisamos si la data viene correcta
        if (data && data.length == 1){
          cliente = data[0];
          this.usuarioEditando = cliente;
          this.editar(cliente);
          this.loading = false;
        }
        else {
          //el usuario no existe, deberiamos mandar el foco al nombre
  
          this.loading = false;
        }
        
        
      });
      */
    }

  }


  ngOnDestroy(): void {
    // Do not forget to unsubscribe the event
    this.dtTrigger.unsubscribe();
  }
  mostrarGiro(mostrar){
    if (mostrar){
      this.verGiro = true;
    }
    else{
      this.verGiro = false;
    }
  }
  upperCaseF(a) {
    setTimeout(function () {
      a.target.value = a.target.value.toUpperCase();
    }, 1);
  }

  //cargamos la forma
  cargarForma(){

    this.forma = new FormGroup({
      'nuevoCodigo': new FormControl('', [Validators.required, Validators.minLength(3)]),
      'nuevoNombre': new FormControl('', Validators.required),
      'nuevoStockInicial': new FormControl('', Validators.required),
      'nuevoStockActual': new FormControl('', Validators.required),
      'nuevoValor': new FormControl('', Validators.required)
    });

    console.log(this.forma.valid + ' ' + this.forma.status);
  }
  //edicion
  editar(usu){
    
    if (usu){
      console.log(usu);
      this.editando = true;
      this.ausIdEditando = usu.Id;
      //this.cargarForma();
      this.tituloModal = 'Editando producto ' + usu.NomProduc;
      this.usuarioEditando = usu;
      this.forma.setValue({
        nuevoCodigo: this.usuarioEditando.CodProduc,
        nuevoNombre: this.usuarioEditando.NomProduc,
        nuevoStockInicial: this.usuarioEditando.VolProduc,
        nuevoStockActual: this.usuarioEditando.StoProduc,
        nuevoValor: this.usuarioEditando.ValProduc
      });
      //deshabilitamos
      this.forma.controls.nuevoCodigo.disable();
      //this.forma.controls.nuevoStockInicial.disable();
    }
  }
  seleccionar(usu){
    
    var entidad = {
      AusId: usu.Id,
      Id: usu.Id,
      Codigo: usu.CodProduc.toUpperCase(),
      Nombre: usu.NomProduc.toUpperCase(),
      Volumen: usu.VolProduc,
      Stock: usu.StoProduc,
      Valor: usu.ValProduc
    }
    this.usuDesactivarActivar = entidad;
    console.log(this.usuarioEditando);
    
  }
  activar(){
    if (this.usuDesactivarActivar && this.usuDesactivarActivar.Id > 0) {
      this.usuDesactivarActivar.Eliminado = 0;
      this.loading = true;
      this.gajico.putProductos(this.usuDesactivarActivar).subscribe(
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
          this.showToast('success', 'Activado con éxito', 'Producto');
          //cierre del modal
          this.utiles.CerrarModal($('#exampleModalCenter1'));
          //$("#exampleModalCenter").modal("toggle");
          this.loading = false;

        }
      );
    }
  }
  desactivar(){

    //antes verificamos que se encuentre seleccionado el usuario a desactivar
    if (this.usuDesactivarActivar && this.usuDesactivarActivar.Id > 0) {
      this.usuDesactivarActivar.Eliminado = 1;
      this.loading = true;
      this.gajico.putProductos(this.usuDesactivarActivar).subscribe(
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
          this.showToast('success', 'Eliminado con éxito', 'Producto');
          //cierre del modal
          this.utiles.CerrarModal($('#exampleModalCenter'));
          //$("#exampleModalCenter").modal("toggle");
          this.loading = false;

        }
      );
    }
  }

  guardar(){
    if (this.forma.valid){
      //correcto
      //ahora los demas elementos
      //nombre usuario
      var codigo = '';
      if (this.forma.controls.nuevoCodigo){
        if (this.forma.controls.nuevoCodigo.value != null){
          codigo = String(this.forma.controls.nuevoCodigo.value);
        }
      }

      var nombre = '';
      if (this.forma.controls.nuevoNombre){
        if (this.forma.controls.nuevoNombre.value != null){
          nombre = String(this.forma.controls.nuevoNombre.value);
        }
      }
      var valor = '0';
      if (this.forma.controls.nuevoValor){
        if (this.forma.controls.nuevoValor.value != null){
          valor = String(this.forma.controls.nuevoValor.value);
        }
      }
      var stock = '0';
      if (this.forma.controls.nuevoStockActual){
        if (this.forma.controls.nuevoStockActual.value != null){
          stock = String(this.forma.controls.nuevoStockActual.value);
        }
      }
      var volumen = '0';
      if (this.forma.controls.nuevoStockInicial){
        if (this.forma.controls.nuevoStockInicial.value != null){
          volumen = String(this.forma.controls.nuevoStockInicial.value);
        }
      }
      var volumenFloat = parseFloat(volumen);
      //console.log(volumenFloat);
      if (volumenFloat < parseFloat(stock)){
        return this.showToast('error', 'Stock inicial no puede ser menor al actual', 'Stock');
      }

      //ahora creamos la entidad a enviar
      var entidad = {
        Editando: this.editando,
        AusId: this.ausIdEditando,
        Codigo: codigo.toUpperCase(),
        Nombre: nombre.toUpperCase(),
        Valor: valor,
        Stock: stock,
        Volumen: volumen,
        Eliminado: 0
      }
      this.loading = true;
      this.gajico.putProductos(entidad).subscribe(
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
          this.showToast('success', 'Guardado con éxito', 'Producto');
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
  crear(){
    this.editando = false;
    this.forma.reset({});
    this.tituloModal = 'Creando producto';
    //nodo del usuario
    //this.obtenerNodos(false, this.nodIdLogueado);
    this.forma.controls.nuevoCodigo.enable();
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
  irArticulo(producto) {
    let navigationExtras: NavigationExtras = {
      queryParams:{ producto: JSON.stringify(producto) }
    };
    this.router.navigate(['/articulo'], navigationExtras)
      .then(data => console.log(data),
        error => {
          console.log(error);
        }
      )
  }
}


