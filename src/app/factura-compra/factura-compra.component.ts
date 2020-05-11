import { Component, OnInit, ViewContainerRef, ViewChild, OnDestroy, ElementRef } from '@angular/core';
import { FormsModule, ReactiveFormsModule, FormGroup, FormControl, Validators, FormArray, FormBuilder } from '@angular/forms';
import { Router } from "@angular/router";
import { Observable } from 'rxjs';
import { Subject } from 'rxjs';

import { HttpClient, HttpHeaders, HttpHandler } from '@angular/common/http';
import { environment } from '../../environments/environment';

import { ToastrManager } from 'ng6-toastr-notifications';


//servicios
//import { GlobalService } from '../servicios/global.service';
import { GajicoService, Factura, Detalle, User } from '../servicios/gajico.service';
import { UtilesService } from '../servicios/utiles.service';
import { PdfService } from '../servicios/pdf.service';

//completer
import { CompleterService, CompleterData } from 'ng2-completer';
import { DataTableDirective } from 'angular-datatables';

//dialog
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA, throwToolbarMixedModesError } from '@angular/material';


declare var $: any;
import * as moment from 'moment';
//sweet alert
//import swal from 'sweetalert';
//import * as _swal from 'sweetalert';
import swal from 'sweetalert2';
//import { SweetAlert } from 'sweetalert/typings/core';
import { Title } from '@angular/platform-browser';
//const swal: SweetAlert = _swal as any;


@Component({
  selector: 'app-factura-compra',
  templateUrl: './factura-compra.component.html',
  styleUrls: ['./factura-compra.component.css']
})

export class FacturaCompraComponent implements OnInit {
  //loading
  loading = false;
  //forma
  forma: FormGroup;
  formaFactura: FormGroup;
  formaDetalle: FormGroup;
  formaPrestamo: FormGroup;
  formaDevolver: FormGroup;
  //variables de usuario
  nodIdLogueado;
  rolIdLogueado;
  nombreUsuarioLogueado;
  //usuario buscado
  usuarioBuscado = null;
  //listados
  listaRegiones;
  listaComunas;
  listaGirosStr;
  listaGiros;
  listaBancos;
  listaBancosStr;
  listaProductos = [];
  listaNombresProd;
  listaCodigosProd;
  parametros;
  numeroFacturaAnterior = 0;
  numeroFacturaActual = 0;
  
  //productoCreando;
  //variables de modificacion cliente
  modificaCliente: boolean = false;
  botonLimpiarCliente: boolean = true;
  //variables modificacion numero factura
  modificaNumeroFactura: boolean = false;
  //variables modificacion stock
  modificaStock: boolean = false;
  fechaActual;
  //iva
  iva: number = 0;
  //datepiker
  maxDate;
  fechaInicio;
  minDate;
  //para controlar los arriendos
  diasArriendo = 30;
  cantidadArriendos = 0;
  totalArriendos = 0;
  //si el cliente tiene descuento
  
  mostrarDetalle = false;
  detalleTieneArriendo = false;
  productosPrestamos: any = [];
  prestamosAgregados = [];
  
  prestamoSeleccionado = null;
  prestamoDevolver = null;

  constructor(
    private httpClient: HttpClient,
    private fb: FormBuilder,
    private router: Router,
    //private global: GlobalService,
    public gajico: GajicoService,
    private toastr: ToastrManager,
    public completerService: CompleterService,
    public utiles: UtilesService,
    public dialog: MatDialog,
    private _vcr: ViewContainerRef,
    public pdf: PdfService,
    
  ) {
    //QUEDE ACA, DEBO AGREGAR PRODUCTOS Y GUARDAR LA COMPRA
    
  }

  ngOnInit() {
    moment.locale('es');
    this.fechaActual = moment().format("DD/MM/YYYY");
    if (sessionStorage.getItem("USER_LOGUED_IN")) {
      var usuarioLogueado = JSON.parse(sessionStorage.getItem("USER_LOGUED_IN"));
      if (usuarioLogueado.AutentificacionUsuario) {
        this.nodIdLogueado = usuarioLogueado.AutentificacionUsuario.InstId;
        this.rolIdLogueado = usuarioLogueado.Rol.Id;
        this.nombreUsuarioLogueado = usuarioLogueado.AutentificacionUsuario.NombreUsuario;
        //iva 
        this.iva = usuarioLogueado.Parametro.Iva;
      }
    }
    //fechas
    var fechaIni = moment();
    var maxima = moment().add(90, 'days');
    var minima = moment().subtract(7, 'days');
    this.fechaInicio = this.retornaFecha(fechaIni);
    this.maxDate = this.retornaFecha(maxima);
    this.minDate = this.retornaFecha(minima);

    this.obtenerCodigosProductos();
    this.obtenerNombresProductos();
    this.obtenerRegiones(this.nodIdLogueado);
    this.obtenerGiros(this.nodIdLogueado);
    this.obtenerBancos(this.nodIdLogueado);
    this.obtenerParametros(this.nodIdLogueado);
    this.obtenerProdPrestamos(this.nodIdLogueado);
    this.cargarForma();
    this.cargarFormaFactura();
    this.cargarFormaDetalle();
    //this.cargarFormaPrestamo();
    //this.cargarFormaDevolver();
    //swal("hola");

  }
  limpiarPrestamo(){
    this.prestamoSeleccionado = null;
    this.formaPrestamo.reset({});
  }

  cargarFormaDetalle() {
    this.loading = true;
    this.formaDetalle = new FormGroup({
      'nuevoId': new FormControl(0),
      'nuevoDiasArriendoDetalle': new FormControl('0'),
      'nuevoCodigo': new FormControl('', Validators.required),
      'nuevoNombreDetalle': new FormControl('', Validators.required),
      'nuevoStock': new FormControl('0', [Validators.required, Validators.min(1)]),
      'nuevoCantidad': new FormControl(0, [Validators.required, Validators.min(1)]),
      'nuevoVolumen': new FormControl(0, Validators.required),
      'nuevoMedida': new FormControl('UN', Validators.required),
      'nuevoValor': new FormControl(0, Validators.required),
      'nuevoSubtotal': new FormControl(0, Validators.required),
    });
    this.formaDetalle.controls.nuevoVolumen.disable();
    this.formaDetalle.controls.nuevoStock.disable();
    this.loading = false;
  }
  cargarFormaFactura() {
    this.loading = true;
    this.formaFactura = new FormGroup({
      'nuevoNumeroFactura': new FormControl(this.numeroFacturaActual, Validators.required),
      'nuevoNumeroGuia': new FormControl('0'),
      'nuevoCV': new FormControl('', Validators.required),
      'nuevoBanco': new FormControl(''),
      //'nuevoVencimiento': new FormControl(this.retornaFecha(moment())),
      'nuevoVencimiento': new FormControl(''),
      'nuevoNumeroCheque': new FormControl(''),
    });
    this.loading = false;
    //this.formaFactura.controls.nuevoVencimiento.setValue('');
  }
  cargarForma() {
    this.loading = true;
    this.forma = new FormGroup({
      'nuevoIdCliente': new FormControl(0),
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
    });
    this.loading = false;
    //console.log(this.forma.valid + ' ' + this.forma.status);
  }
  limpiarTodo() {
    this.listaProductos = [];
    this.usuarioBuscado = null;
    this.limpiarCliente();
    this.obtenerParametros(this.nodIdLogueado);
    this.mostrarDetalle = false;
  }
  print(numeroFactura, gajicoSer, pdf){
    //this.utiles.OpenModal($('#exampleModalCenterImprimir'));
    //clase swal2-confirm swal2-styled
    var buttonsPlus = $('<div>')
    .append(this.createMessage('Pinche en el botón PDF si desea ver la venta en pdf, pinche en Imprimir si desea mandarlo a la impresora sin formato.'))
    .append('<div class="swal2-actions">')
    .append(this.createButton('PDF','sw_butt1', 'swal2-confirm swal2-styled'))
    .append(this.createButton('Cancelar','sw_butt3', 'swal2-cancel swal2-styled'))
    .append('</div>');
    
    //e.preventDefault();
    swal.fire({
      title: 'Quieres Imprimir?',
      html: buttonsPlus,
      icon: 'question',
      showCancelButton: false,
      showConfirmButton: false,
      onOpen: function (dObj) {
          $('#sw_butt1').on('click',function () {
             swal.close();
             gajicoSer.getFacturaNumero(numeroFactura, '1').subscribe(
              dataP => {
                if (dataP){
                  var facturaImprimir = dataP;
                  console.log(facturaImprimir);
                  pdf.generatePdfCompra('open', facturaImprimir.Factura, facturaImprimir.Proveedor, facturaImprimir.Detalle);
                }
              }
            )
          });
          $('#sw_butt3').on('click',function () {
              swal.close();
              console.log('boton3')
              //callbackThree();
          });
      }
  });


  }
  obtenerFacturaNumero(numeroFactura: any){
    this.loading = true;
    this.gajico.getFacturaNumero(numeroFactura, '1').subscribe(
      dataP => {
        if (dataP) {
          var facturaImprimir = dataP;
          console.log(facturaImprimir);
          this.loading = false;
        }
      }
    )
  }
  createButton(text, id, clase) {
    return $('<button class="' + clase + '" id="' + id + '">' + text + '</button>');
  }
  createMessage(text) {
    return $('<div class="swal2-content" style="display: block;">' + text + '</div>');
  }

  //validar todo
  validaAntesGuardar() {
    var retorno = {
      Cliente: null,
      Factura: null,
      Errores: [],
      Productos: [],
      Totales: null, 
      Prestamos: [],
    }
    var errores = [];
    var id = 0;
    if (this.forma.controls.nuevoIdCliente) {
      if (this.forma.controls.nuevoIdCliente.value != null) {
        id = this.forma.controls.nuevoIdCliente.value;
      }
    }
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
      var error = {
        Mensaje: 'Comuna Requerido'
      }
      errores.push(error);
    }
    if (String(this.forma.controls.nuevoGiro.value) == '') {
      var error = {
        Mensaje: 'Giro Requerido'
      }
      errores.push(error);
    }
    if (String(this.forma.controls.nuevoRegion.value) == '' || String(this.forma.controls.nuevoRegion.value) == 'Seleccione') {
      var error = {
        Mensaje: 'Región Requerido'
      }
      errores.push(error);
    }
    if (rut.length <= 3) {
      var error = {
        Mensaje: 'Rut con menos de 3 caracteres'
      }
      errores.push(error);
    }
    if (nombres == '') {
      var error = {
        Mensaje: 'Nombres requerido'
      }
      errores.push(error);
    }
    if (direccion == '') {
      var error = {
        Mensaje: 'Dirección requerido'
      }
      errores.push(error);
    }
    var numeroFactura = this.formaFactura.controls.nuevoNumeroFactura.value;
    if (numeroFactura <= 0) {
      var error = {
        Mensaje: 'Número de factura invalido'
      }
      errores.push(error);
    }
    var numeroGuia = this.formaFactura.controls.nuevoNumeroGuia.value;
    var condicionVenta = this.formaFactura.controls.nuevoCV.value;
    var banco = this.formaFactura.controls.nuevoBanco.value;
    var vencimiento = this.formaFactura.controls.nuevoVencimiento.value;
    var numeroCheque = this.formaFactura.controls.nuevoNumeroCheque.value;
    if (this.listaProductos.length == 0) {
      var error = {
        Mensaje: 'No hay Productos en la venta'
      }
      errores.push(error);
    }
    var guia = this.formaFactura.controls.nuevoNumeroGuia.value;

    var entidadFactura = {
      NumFactur: numeroFactura,
      GuiFactur: numeroGuia,
      RutFactur: rut,
      DigFactur: dv.toUpperCase(),
      ValFactur: this.sumaTotal().toString(),
      EstFactur: '',
      ConFactur: condicionVenta,
      SalFactur: this.sumaTotal().toString(),
      CheFactur: numeroCheque,
      BanFactur: banco,
      FveFactur: '',
      FevFactur: vencimiento
    }

    var entidadCliente = {
      Id: id,
      RutProved: rut,
      DigProved: dv.toUpperCase(),
      NomProved: nombres.toUpperCase(),
      CiuProved: ciudad.toUpperCase(),
      GirProved: giro.toUpperCase(),
      ComProved: comuna.toUpperCase(),
      DirProved: direccion.toUpperCase(),
      TelProved: telefonos,
      CorreoProved: correo.toUpperCase(),
      FaxProved: fax,
      Eliminado: 0,
    };
    var entidadTotales = {
      Descuento: this.sumarDescuentos(),
      Neto: this.sumarNetosN(),
      Iva: this.ivaDetalle(),
      Total: this.sumaTotal()
    }
    retorno.Cliente = entidadCliente;
    retorno.Errores = errores;
    retorno.Productos = this.procesarListaProductos(this.listaProductos, numeroFactura);
    retorno.Factura = entidadFactura;
    retorno.Totales = entidadTotales;

    return retorno;

  }
  procesarListaProductos(lista, numeroFactura){
    if (lista && lista.length > 0){
     lista.forEach(det => {
       det.TipDetall = '1';
       det.NumDetall = numeroFactura;
       det.CanDetall = det.Cantidad;
       det.VolDetall = det.VolProduc;
       det.ProDetall = det.CodProduc;
       det.RecDetall = '0';
       det.PreDetall = det.ValProduc;
       det.NetDetall = det.Subtotal;
       det.IvaDetall = '';
       det.CilDetall = '';
       det.DiaDetall = '';
       det.ArrDetall = '';
       det.CafDetall = '';
       det.MofDetall = '';
     });
    }
    return lista;
  }
  procesoGuardado(retorno){
    this.loading = true;
    this.gajico.postFacturaCompra(retorno.Factura, retorno.Cliente, retorno.Productos).subscribe(
      (data: any) => {
        var datos = data;
        if (datos.TipoMensaje != 1){
          this.showToast('error', datos.TextoMensaje, 'Error');
        }
        else {
          this.print(retorno.Factura.NumFactur, this.gajico, this.pdf);
          this.showToast('success', datos.TextoMensaje, 'Correcto');
          this.limpiarTodo();
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
    this.limpiarTodo();
  }
  guardarTodo() {
    console.log(this.validaAntesGuardar());
    var retorno = this.validaAntesGuardar();
    if (retorno.Errores.length > 0) {
      var mensaje = '';
      retorno.Errores.forEach(error => {
        mensaje += error.Mensaje + '\r\n'
      });
      swal.fire(
        {
          title: 'Errores en el formulario',
          text: mensaje
        }
      )
    }
    else {
      swal.fire(
        {
          title: '¿Quieres guardar la factura?',
          text: 'Se guardará completamente la compra.',
          icon: 'warning',
          showCancelButton: true,
          confirmButtonText: 'SI, QUIERO GUARDAR!',
          cancelButtonText: 'NO, CANCELAR TODO!',
        }
      ).then((value) => {
        if (value.dismiss) {
          swal.fire('Cancelado');
        }
        else{
          console.log(retorno);
          //lo comentamos para pruebas
          this.procesoGuardado(retorno);
        }
      });
    }
  }
  retornaFecha(fechaMoment) {
    var retorno = '';
    var year = fechaMoment.year();
    var mes = fechaMoment.month() + 1;
    var dia = fechaMoment.date();
    var mesStr = '';
    var diaStr = '';
    if (mes < 10) {
      mesStr = '0' + mes.toString();
    }
    else {
      mesStr = mes.toString();
    }

    if (dia < 10) {
      diaStr = '0' + dia.toString();
    }
    else {
      diaStr = dia.toString();
    }

    retorno = year + '-' + mesStr + '-' + diaStr;

    return retorno;
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

      this.httpClient.post(url, body, options).subscribe((res: Observable<User[]>) => {
        if (res) {
          cliente = res[0];
          this.usuarioBuscado = cliente;
          this.mostrarDatos(cliente);
          if (cliente != undefined){
            this.loading = false;
          }
          else {
            this.loading = false;
          }
          this.mostrarDetalle = true;

        }
        else {
          this.loading = false;
        }
      });
    }

  }
  keyDowEnterNombreProd(event){
    var texto = event.target.value.toUpperCase();
    if (texto.includes("ARRIENDO")) {
      swal.fire(
        {
          title: '¿Es un arriendo?',
          text: 'Se mostrará la cantidad de días para que lo ingreses',
          icon: 'warning',
          showCancelButton: true,
          confirmButtonText: 'SI, ES UN ARRIENDO!',
          cancelButtonText: 'NO, CONTINUAR!',
        }
      ).then((value) => {
        if (value) {
          if (value.dismiss) {
            //continuamos
            this.detalleTieneArriendo = false;
            document.getElementById('inputValor').focus();
          }
          else {
            this.detalleTieneArriendo = true;
            //document.getElementById('selectDiasArriendoDetalle').focus();
          }

        }

      });
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
            this.mostrarDatosDetalle(producto[0]);
            console.log(producto);
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
  quitarProductoPrestamo(id){
    var nuevaLista = [];
    this.prestamosAgregados.forEach(pres => {
      if (id != pres.Id) {
        nuevaLista.push(pres);
      }
    });
    this.prestamosAgregados = nuevaLista;
  }
  agregarProdPrestamo(producto){
    //this.prestamosAgregados = [];
    //verificamos si es un candidato para agregar o no
    var existeParaAgregar = false;
    this.productosPrestamos.forEach(pr => {
      if (producto.CodProduc === pr.CodProduc){
        existeParaAgregar = true;
      }
    });
    //solo si existe para agregar se sigue el proceso
    if (existeParaAgregar){
      //verificamos si ya esta o no en la lista
      var estaEnLista = false;
      if (this.prestamosAgregados && this.prestamosAgregados.length > 0){
        this.prestamosAgregados.forEach(pres => {
          if (pres.CodProduc == producto.CodProduc){
            estaEnLista = true;
          }
        });
      }
      //si no esta en la lista se agrega
      if (estaEnLista == false){
        var entidadPrestamo = producto;
        this.prestamosAgregados.push(entidadPrestamo);
      }
      
    }
  }
  agregarProductoDetalle() {
    //console.log(this.formaDetalle.controls);
    //aca se debe validar antes
    var productoLista = null;
    var descuento = 0;

    //por mientras
    var entidad = {
      Id: this.formaDetalle.controls.nuevoId.value,
      Eliminado: 0,
      CodProduc: this.formaDetalle.controls.nuevoCodigo.value.toUpperCase(),
      NomProduc: this.formaDetalle.controls.nuevoNombreDetalle.value.toUpperCase(),
      //VolProduc: this.formaDetalle.controls.nuevoVolumen.value,
      //lo dejamos en 0
      VolProduc: this.formaDetalle.controls.nuevoVolumen.value,
      //Cantidad: this.formaDetalle.controls.nuevoCantidad.value,
      Cantidad: this.formaDetalle.controls.nuevoCantidad.value,
      ValProduc: this.formaDetalle.controls.nuevoValor.value,
      //sumamos el stock
      StoProduc: parseInt(this.formaDetalle.controls.nuevoStock.value) + parseInt(this.formaDetalle.controls.nuevoCantidad.value),
      Subtotal: this.formaDetalle.controls.nuevoSubtotal.value - descuento,
      Unidad: this.formaDetalle.controls.nuevoMedida.value,
      Descuento: descuento,
      EsArriendoCompleto: false,
      EsArriendoUnitario: this.detalleTieneArriendo,
      Stock: this.formaDetalle.controls.nuevoStock.value
    };
    var existe = false;
    if (this.listaProductos.length == 0) {
      if (this.detalleTieneArriendo){
        entidad.NomProduc = 'ARRIENDO ' + this.utiles.entregaFechaDetalle(moment());
      }
      this.listaProductos.push(entidad);
      this.agregarProdPrestamo(entidad);
    }
    else {
      for (var i = 0; i < this.listaProductos.length; i++) {
        var producto = this.listaProductos[i];
        if (producto.CodProduc.toUpperCase() == entidad.CodProduc.toUpperCase() && producto.ValProduc == entidad.ValProduc && this.detalleTieneArriendo == false) {
          //existe
          productoLista = producto;
          this.listaProductos[i].Cantidad = this.listaProductos[i].Cantidad + entidad.Cantidad;
          this.listaProductos[i].VolProduc = this.listaProductos[i].VolProduc + entidad.VolProduc;
          this.listaProductos[i].Subtotal = this.listaProductos[i].Subtotal + entidad.Subtotal - entidad.Descuento;

            this.listaProductos[i].Descuento = 0;
          
          
          existe = true;
          break;
        }
      }
      //ahora realizamos las compraciones
      if (!existe) {
        if (this.detalleTieneArriendo){
          entidad.NomProduc = 'ARRIENDO ' + this.utiles.entregaFechaDetalle(moment());
        }
        this.listaProductos.push(entidad);
        this.agregarProdPrestamo(entidad);
      }
    }
    this.limpiarDetalle();
  }
  quitarProductoLista(id) {
    var nuevaLista = [];
    this.listaProductos.forEach(producto => {
      if (producto.Id != id) {
        nuevaLista.push(producto);
      }
    });
    this.listaProductos = nuevaLista;
    this.quitarProductoPrestamo(id);
  }
  modificarNumeroFactura() {
    this.modificaNumeroFactura = true;
    this.formaFactura.controls.nuevoNumeroFactura.enable();

  }
  calculaSubtotal(event) {
    var medida = event.target.value;
    var factor = 1;
    var cantidad = this.formaDetalle.controls.nuevoCantidad.value;
    var retorno = 0;
    if (this.detalleTieneArriendo){
      //medida = 'UN'
      this.formaDetalle.controls.nuevoMedida.setValue('UN');
      if (this.formaDetalle.controls.nuevoValor) {
        if (cantidad > 0) {
          var valor = this.formaDetalle.controls.nuevoValor.value;
          retorno = valor * cantidad * factor * parseInt(this.formaDetalle.controls.nuevoDiasArriendoDetalle.value);
        }
      }
    }
    else{
      if (medida == 'M3') {
        factor = 10;
      }
      if (this.formaDetalle.controls.nuevoValor) {
        if (cantidad > 0) {
          var valor = this.formaDetalle.controls.nuevoValor.value;
          retorno = valor * cantidad * factor;
        }
      }
    }

    this.formaDetalle.controls.nuevoVolumen.setValue(cantidad * factor);
    this.formaDetalle.controls.nuevoSubtotal.setValue(retorno);
    return retorno;
  }
  onChangeCV(event) {
    if (event.target.value) {
      //solo si es contado se limpian los datos del cheque
      if (event.target.value == 'C') {
        //limpiamos los datos del cheque
        this.formaFactura.controls.nuevoBanco.setValue('');
        this.formaFactura.controls.nuevoVencimiento.setValue('');
        this.formaFactura.controls.nuevoNumeroCheque.setValue('');
      }
    }
  }

  mostrarDatosParametros() {
    if (this.parametros) {
      this.formaFactura.setValue({
        nuevoVencimiento: '',
        nuevoBanco: '',
        nuevoNumeroFactura: '0',
        nuevoNumeroGuia: '0',
        nuevoCV: 'O',
        nuevoNumeroCheque: ''
      });
      //deshabilitamos
      //this.formaFactura.controls.nuevoNumeroFactura.disable();
    }
  }
  mostrarDatosDetalle(detalle) {
    if (detalle) {
      if (detalle.Id > 0) {
        //aca deberiamos levantar una alerta si el producto no tiene stock
        //o dejar que el mismo usuario modifique dicho stock
        if (detalle.StoProduc == '' || detalle.StoProduc == '0') {
          //swal('No hay');
          swal.fire(
            {
              title: 'No tienes stock suficiente',
              text: 'Se habilitará la casilla para que ingreses el nuevo stock y poder continuar con la operación',
              showCancelButton: true,
              confirmButtonText: 'SI, HABILITAR CASILLA',
              cancelButtonText: 'NO, CANCELAR TODO!',
            }
          ).then((value) => {
            if (value) {
              this.formaDetalle.controls.nuevoStock.enable();
              this.modificaStock = true;
              if (this.detalleTieneArriendo == false){
                document.getElementById('inlineFormInputGroupStock').focus();
              }
              this.formaDetalle.setValue({
                nuevoId: detalle.Id,
                nuevoCodigo: detalle.CodProduc,
                nuevoNombreDetalle: detalle.NomProduc,
                nuevoStock: 0,
                nuevoCantidad: 0,
                nuevoVolumen: parseFloat(detalle.VolProduc),
                nuevoMedida: 'UN',
                nuevoValor: parseInt(detalle.ValProduc),
                nuevoSubtotal: 0,
                nuevoDiasArriendoDetalle: '0'
              });
              //aca debriamos guardar toda la factura
              //swal(`The returned value is: ${value}`);
            }

          });
        }
        else {
          this.formaDetalle.setValue({
            nuevoId: detalle.Id,
            nuevoCodigo: detalle.CodProduc,
            nuevoNombreDetalle: detalle.NomProduc,
            nuevoStock: detalle.StoProduc,
            nuevoCantidad: 0,
            nuevoVolumen: 0,
            nuevoMedida: 'UN',
            nuevoValor: parseInt(detalle.ValProduc),
            nuevoSubtotal: 0,
            nuevoDiasArriendoDetalle: '0'
          });
          //deshabilitamos
          this.formaDetalle.controls.nuevoStock.disable();
        }

      }
      else {
        //producto no está
        var nuevoCodigo = this.formaDetalle.controls.nuevoCodigo.value.toUpperCase();
        this.formaDetalle.setValue({
          nuevoCodigo: nuevoCodigo,
          nuevoId: 0,
          nuevoNombreDetalle: '',
          nuevoStock: 0,
          nuevoCantidad: 0,
          nuevoVolumen: 0,
          nuevoMedida: 'UN',
          nuevoValor: 0,
          nuevoSubtotal: 0,
          nuevoDiasArriendoDetalle: '0'
        });
        //deshabilitamos
        this.formaDetalle.controls.nuevoStock.enable();
      }

    }
    else {
      //producto no está
      var nuevoCodigo = this.formaDetalle.controls.nuevoCodigo.value.toUpperCase();
      this.formaDetalle.setValue({
        nuevoCodigo: nuevoCodigo,
        nuevoId: 0,
        nuevoNombreDetalle: '',
        nuevoStock: 0,
        nuevoCantidad: 0,
        nuevoVolumen: 0,
        nuevoMedida: 'UN',
        nuevoValor: 0,
        nuevoSubtotal: 0,
        nuevoDiasArriendoDetalle: '0'
      });
      //deshabilitamos
      this.formaDetalle.controls.nuevoStock.enable();
    }


  }
  limpiarDetalle() {
    //this.formaDetalle.reset({});
    this.formaDetalle.setValue({
      nuevoCodigo: '',
      nuevoId: 0,
      nuevoNombreDetalle: '',
      nuevoStock: 0,
      nuevoCantidad: 0,
      nuevoVolumen: 0,
      nuevoMedida: 'UN',
      nuevoValor: 0,
      nuevoSubtotal: 0,
      nuevoDiasArriendoDetalle: '0'
    });
    //deshabilitamos
    this.formaDetalle.controls.nuevoStock.enable();
    this.detalleTieneArriendo = false;
    //this.formaDetalle.controls.nuevoCodigo
    document.getElementById('inputCodigo').focus();

  }
  mostrarDatos(usu) {
    if (usu) {
      this.obtenerComunas(this.usuarioBuscado.CiuProved, null);
      //setear los campos
      //this.forma.controls.nuevoNombreUsuario
      this.forma.setValue({
        nuevoIdCliente: this.usuarioBuscado.Id,
        nuevoRut: this.usuarioBuscado.RutProved,
        nuevoDig: this.usuarioBuscado.DigProved,
        nuevoNombre: this.usuarioBuscado.NomProved,
        nuevoRegion: this.usuarioBuscado.CiuProved,
        nuevoGiro: this.usuarioBuscado.GirProved,
        nuevoComuna: this.usuarioBuscado.ComProved,
        nuevoDireccion: this.usuarioBuscado.DirProved,
        nuevoTelefonos: this.usuarioBuscado.TelProved,
        nuevoCorreo: this.usuarioBuscado.CorreoProved,
        nuevoFax: this.usuarioBuscado.FaxProved,

      });
      //deshabilitamos
      this.desactivarControles();
    }

  }
  desactivarControles() {
    this.forma.controls.nuevoRut.disable();
    this.forma.controls.nuevoDig.disable();
    this.forma.controls.nuevoNombre.disable();
    this.forma.controls.nuevoRegion.disable();
    this.forma.controls.nuevoGiro.disable();
    this.forma.controls.nuevoComuna.disable();
    this.forma.controls.nuevoDireccion.disable();
    this.forma.controls.nuevoTelefonos.disable();
    this.forma.controls.nuevoCorreo.disable();
    this.forma.controls.nuevoFax.disable();
  }
  activarControles() {
    this.forma.controls.nuevoRut.disable();
    this.forma.controls.nuevoDig.disable();
    this.forma.controls.nuevoNombre.enable();
    this.forma.controls.nuevoRegion.enable();
    this.forma.controls.nuevoGiro.enable();
    this.forma.controls.nuevoComuna.enable();
    this.forma.controls.nuevoDireccion.enable();
    this.forma.controls.nuevoTelefonos.enable();
    this.forma.controls.nuevoCorreo.enable();
    this.forma.controls.nuevoFax.enable();
  }
  modificarCliente(modifica) {
    if (modifica) {
      this.modificaCliente = true;
      //this.botonLimpiarCliente = true;
      this.activarControles();
    }
  }
  cancelarModificacion() {
    this.desactivarControles();
    this.modificaCliente = false;
    this.botonLimpiarCliente = false;
  }

  limpiarCliente() {
    //dejamos al cliente editando nulo
    this.modificaCliente = false;
    this.usuarioBuscado = null;
    this.forma.reset({});
    this.forma.controls.nuevoRegion.setValue("Seleccione");
    this.obtenerComunas("Seleccione", null);
    //es un cliente completamente nuevo
    this.forma.controls.nuevoRut.enable();
    this.forma.controls.nuevoDig.enable();
    this.forma.controls.nuevoNombre.enable();
    this.forma.controls.nuevoRegion.enable();
    this.forma.controls.nuevoGiro.enable();
    this.forma.controls.nuevoComuna.enable();
    this.forma.controls.nuevoDireccion.enable();
    this.forma.controls.nuevoTelefonos.enable();
    this.forma.controls.nuevoCorreo.enable();
    this.forma.controls.nuevoFax.enable();
    this.mostrarDetalle = false;
  }
  guardarCliente() {
    if (this.forma.valid) {
      //correcto
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
        Editando: this.modificaCliente,
        AusId: this.usuarioBuscado.Id,
        Rut: rut,
        Dv: dv.toUpperCase(),
        Nombres: nombres.toUpperCase(),
        Region: ciudad.toUpperCase(),
        Giro: giro.toUpperCase(),
        Comuna: comuna.toUpperCase(),
        Direccion: direccion.toUpperCase(),
        Telefonos: telefonos,
        Correo: correo.toUpperCase(),
        Fax: fax,
        Eliminado: 0,
      }
      this.loading = true;
      this.gajico.putCliente(entidad).subscribe(
        (data: any) => {
          var cliente = data;
          //this.usuarioBuscado.Id = cliente.Id;
          this.modificaCliente = false;
          this.usuarioBuscado = cliente;
          this.mostrarDatos(cliente);
          if (cliente != undefined){
            //this.descuentoCliente = cliente.DesClient;
          }
          //this.rerenderNod(this.nodIdLogueado);
        },
        err => {
          console.error(err);
          this.showToast('error', err, 'Error');
          this.loading = false;
        },
        () => {
          console.log('save completed');
          this.showToast('success', 'Guardado con éxito', 'Cliente');
          this.loading = false;

        }
      );
    }
    else {
      this.showToast('error', 'Revise campos', 'Requeridos');
    }
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
  obtenerProdPrestamos(instId) {
    //indicador valor
    this.productosPrestamos = [];
    this.loading = true;
    this.gajico.getProdPrestamos(instId).subscribe(
      data => {
        if (data) {
          this.productosPrestamos = data;
        }
      },
      err => {
        console.error(err);
        this.loading = false;
        this.showToast('error', err, 'Error');
      },
      () => {
        this.loading = false;
        console.log('get info prod prestamos');
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
  obtenerBancos(instId) {
    //indicador valor
    this.listaBancosStr = [];
    this.loading = true;
    this.gajico.postBancos(instId).subscribe(
      data => {
        if (data) {
          this.listaBancos = data;
          this.listaBancos.forEach(element => {
            this.listaBancosStr.push(element.Nombre);
          });
          //console.log(this.listaGiros);
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
  obtenerParametros(instId) {
    //indicador valor
    this.loading = true;
    this.gajico.postParametros(instId).subscribe(
      data => {
        if (data) {
          this.parametros = data;
          this.mostrarDatosParametros();
          console.log(this.parametros);
          this.loading = false;
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
        console.log('get info PARAMETROS');
      }
    );

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
  sumarDescuentos() {
    var retorno = 0
    return retorno;
  }
  sumarNetosN() {
    var retorno = 0
    if (this.listaProductos && this.listaProductos.length > 0) {
      this.listaProductos.forEach(detalle => {
        retorno = retorno + parseInt(detalle.Subtotal);
      });
    }
    //return retorno - this.sumarDescuentos();
    return retorno;
  }
  netoArriendo(arriendo){
    var valor = parseInt(arriendo.CanArrien) * parseInt(arriendo.ValArrien) * parseInt(this.diasArriendo.toString());
    return valor;
  }
  ivaDetalle() {
    var total = this.sumarNetosN();
    var retorno = 0;
    if (total > 0) {
      retorno = Math.floor((total * this.iva) / 100);
    }
    return retorno;
  }
  sumaTotal() {
    var netos = this.sumarNetosN();
    var iva = this.ivaDetalle();
    var retorno = 0;
    if (netos > 0) {
      retorno = netos + iva;
    }
    return retorno;
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