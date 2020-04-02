import { Component, OnInit, ViewContainerRef, ViewChild, OnDestroy, ElementRef } from '@angular/core';
import { FormsModule, ReactiveFormsModule, FormGroup, FormControl, Validators, FormArray, FormBuilder } from '@angular/forms';
import { Router } from "@angular/router";
import { Observable } from 'rxjs';
import { Subject } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../environments/environment';

import { ToastrManager } from 'ng6-toastr-notifications';

//servicios
import { GajicoService, Factura, Detalle, User } from '../servicios/gajico.service';
import { UtilesService } from '../servicios/utiles.service';
import { PdfService } from '../servicios/pdf.service';

//completer
import { CompleterService, CompleterData } from 'ng2-completer';
import { DataTableDirective } from 'angular-datatables';

//dialog
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material';


declare var $:any;
import * as moment from 'moment';



@Component({
  selector: 'app-facturas',
  templateUrl: './facturas.component.html',
  styleUrls: ['./facturas.component.css']
})
export class FacturasComponent implements OnInit, OnDestroy {
  @ViewChild(DataTableDirective, {static: false})
  
  dtElement: DataTableDirective;
  //dtOptions: DataTables.Settings = {};
  dtOptions: any = {};
  persons: Observable<Factura[]>;
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

  //para moment
  fechaInicio;
  fechaTermino;
  dateInicio;
  sort: { column: string, descending: boolean };
  maxDate;
  dt;
  table: any;

  facturaSeleccionada: Factura = {
    TipFactur: '',
    NumFactur: '',
    RutFactur: '',
    DigFactur: '',
    FeeFactur: '',
    ValFactur: '',
    EstFactur: '',
    ConFactur: '',
    GuiFactur: '',
    SalFactur: '',
    FesFactur: '',
    CheFactur: '',
    BanFactur: '',
    FveFactur: '',
    FevFactur: '',
    Id: 0,
    Neto:'0',
    Iva: '0',
    Total:'0',
    Eliminado: 0,
    Detalle: [],
    Cliente: null,
    Proveedor: null
  }
  detalleSeleccionado: any = [];
  clienteSeleccionado: any = {};
  detalleFlete: any = {};

  constructor(
    private httpClient: HttpClient,
    private fb: FormBuilder,
    private router: Router,
    private gajico: GajicoService,
    private toastr: ToastrManager,
    public completerService: CompleterService,
    public utiles: UtilesService,
    public dialog: MatDialog,
    private _vcr: ViewContainerRef,
    public pdf: PdfService,
  ) { 
    
  }
  crearPdf(action, documento, persona, detalle){
    this.pdf.generatePdf(action, documento, persona, detalle);
  }
  crearPdfPunto(action, documento, persona, detalle){
    this.pdf.generatePdfPunto(action, documento, persona, detalle);
  }
  sumarNetos(arrDetalle) {
    var retorno = 0
    if (arrDetalle && arrDetalle.length > 0) {
      arrDetalle.forEach(detalle => {
        retorno = retorno + parseInt(detalle.NetDetall);
      });
    }
    return retorno;
  }
  entregaToolTip(person){
    var retorno = 'Número:' + person.Factura.NumFactur +', Fecha: ' + person.Factura.FeeFactur +', Cliente: ' + person.Cliente.NomClient + ', Giro: ' + person.Cliente.GirClient + '\n';
    var infoDetalle = '';
    var infoPrestamos = '';
    //Número: {{person.Factura.Id}}, Fecha: {{person.Factura.FeeFactur}}, Cliente: {{person.Cliente.NomClient}}, Giro: {{person.Cliente.GirClient}}
    person.Detalle.forEach(detalle => {
      infoDetalle += detalle.NomProduc + '\n';
    });
    if (person.Prestamos.length > 0){
      infoPrestamos = 'Tiene ' + person.Prestamos.length.toString() + ' préstamos \n';
    }
    return retorno + infoDetalle + infoPrestamos;
  }
  calculaImpuesto(total, neto) {
    return parseInt(total) - parseInt(neto);
  }
  mostrarDetalle(event, detalle){
      console.log(detalle);
/*       var tr = $('#detail-btn');
      var row = this.dt.row(tr);
      if ( row.child.isShown() ) {
        // This row is already open - close it
        row.child.hide();
        tr.removeClass('shown');
      } else {
        // Open this row
        //row.child( this.format()).show();
        //tr.child( this.format());
        var node = document.createElement('table');
        var trNode = document.createElement('tr');
        var tdNode = document.createElement('td');
        var textTd = document.createTextNode('Prueba');
        tdNode.appendChild(textTd);
        trNode.appendChild(tdNode);
        node.appendChild(trNode);
        document.getElementById('detail-btn').appendChild(node);
        //tr.appendChild(this.format());
        tr.addClass('shown');
      } */
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
    this.table = $('#myTable');
    this.dt = this.table.DataTable({});

    var fechaIni = moment().subtract(1, 'months');
    var fechaTer = moment();
    var maxima = moment().add(1, 'days');
    this.fechaInicio = this.retornaFecha(fechaIni);
    this.fechaTermino = this.retornaFecha(fechaTer);
    this.maxDate = this.retornaFecha(maxima);
    this.dateInicio = new FormControl(fechaIni.toISOString());
    console.log(fechaIni);
    //filtro por defecto es mes y año


    this.dtOptions = this.utiles.InicializeOptionsDTFac(this.dtOptions, 8, 'Listado de ventas gajico ltda.');

    this.cargarClientes(this.nodIdLogueado);
    this.cargarForma(); 

  }
  addEventInicio(event){
      //console.log(event);
      var fechaIni = moment(event.value);
      var fechaFormat = this.retornaFecha(fechaIni);
      this.fechaInicio = fechaFormat;
  }
  addEventTermino(event){
    //console.log(event);
    var fechaTer = moment(event.value);
    var fechaFormatTer = this.retornaFecha(fechaTer);
    this.fechaTermino = fechaFormatTer;
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
      this.dtOptions = this.utiles.InicializeOptionsDTFac(this.dtOptions, 8, 'Listado de ventas gajico ltda.');
      this.dtTrigger.next();
    });
  }
  validarFechas(){
      var retorno = true;
     //empezamos validando fecha vacias y largo
     if (this.fechaInicio && this.fechaInicio.length != 10){
        this.showToast('error', 'Formato de fecha de inicio inválido', 'Fecha');
        return false;
     }
     if (this.fechaTermino && this.fechaTermino.length != 10){
        this.showToast('error', 'Formato de fecha de término inválido', 'Fecha');
        return false;
     }
     if (this.fechaInicio == null || this.fechaInicio == '' || this.fechaInicio == undefined || this.fechaInicio ==  "NaN-NaN-NaN"){
         this.showToast('error', 'La fecha de inicio no puede estar vacia', 'Fecha');
         return false;
     }
     if (this.fechaTermino == null || this.fechaTermino == '' || this.fechaTermino == undefined || this.fechaTermino ==  "NaN-NaN-NaN"){
        this.showToast('error', 'La fecha de término no puede estar vacia', 'Fecha');
        return false;
    }
    //ahora validamos que la difrencia de fechas no sea mayor a 1 año
    var fecha1 = moment(this.fechaInicio);
    var fecha2 = moment(this.fechaTermino);
    var dif = fecha2.diff(fecha1, 'days');
    //si es menor a 0 fecha de inicio es mayor que la de término
    if (dif < 0){
        this.showToast('error', 'La fecha de inicio no puede ser mayor a la de término', 'Fecha');
        return false;
    }
    //si la diferencia es mayor a 1 año no se puede
    if (dif > 365){
        this.showToast('error', 'No puede consultar más de un año', 'Fecha');
        return false;
    }
    //console.log(dif);

    return retorno;
  }
  buscarPorFechas() {
    if (this.validarFechas()) {
      this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
        // Destroy the table first
        dtInstance.destroy();
        // Call the dtTrigger to rerender again
        this.dtOptions = this.utiles.InicializeOptionsDTFac(this.dtOptions, 8, 'Listado de ventas gajico ltda.');
        this.loading = true;
        const headers = new Headers;
        const body = JSON.stringify(
          {
            FechaInicio: this.fechaInicio,
            FechaTermino: this.fechaTermino
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

        //this.httpClient.post(url, body, options).subscribe((res: Observable<Factura[]>) => {
        this.httpClient.post(url, body, options).subscribe((res: any) => {
          this.persons = res;
          this.dtTrigger.next();
          this.loading = false;
        });
        /*
        this.gajico.postFacturaArr(this.fechaInicio, this.fechaTermino).subscribe((data: Observable<Factura[]>) => {
            this.persons = data;
            this.dtTrigger.next();
            this.loading = false;
        });
        */
      });
    }

  }
  rerenderNod(nodId) {
    this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
      // Destroy the table first
      dtInstance.destroy();
      // Call the dtTrigger to rerender again
      this.dtOptions = this.utiles.InicializeOptionsDTFac(this.dtOptions, 8, 'Listado de ventas gajico ltda.');
      this.loading = true;
      const headers = new Headers;
      const body = JSON.stringify(
        {
          FechaInicio: this.fechaInicio,
          FechaTermino: this.fechaTermino
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
        this.persons = res;
        this.dtTrigger.next();
        this.loading = false;
      });

    });
  }
  cargarClientes(nodId){
    this.loading = true;
    const headers = new Headers;
    const body = JSON.stringify(
      {
        FechaInicio: this.fechaInicio,
        FechaTermino: this.fechaTermino
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
      this.persons = res;
      this.dtTrigger.next();
      this.loading = false;
    });
  }
  abrirVenta(){
    this.router.navigateByUrl('/factura-venta')
    .then(data => console.log(data),
      error =>{
        console.log(error);
      }
    )
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
  seleccionarFactura(factura, detalle, cliente, person){
    if (factura && detalle){
      //var copiaDetalle = detalle; 
      //nuevo elemento en caso que tenga flete
      
      //var entidadFlete = this.procesarDetalle(copiaDetalle);
      //console.log(entidadFlete);
      
      //if (entidadFlete.Id > 0){
        //detalle.push(entidadFlete);
        //console.log(entidadFlete);
        //detalle[detalle.length] = entidadFlete;
      //}
      //procesamos si tiene detalle flete

      
      this.facturaSeleccionada = factura;
      this.detalleSeleccionado = detalle;
      //this.procesaDetalleArr(detalle);
      //console.log(this.detalleFlete);
      this.clienteSeleccionado = cliente;
      //this.personSeleccionado = person;
      console.log(this.facturaSeleccionada);
      console.log(this.detalleSeleccionado);
      console.log(this.clienteSeleccionado);
      //console.log(person);
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
}


