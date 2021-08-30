import { Component, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule, FormGroup, FormControl, Validators, FormArray, FormBuilder } from '@angular/forms';
import { Router } from "@angular/router";
import { ToastrManager } from 'ng6-toastr-notifications';
//environments
import { environment } from '../../environments/environment';
import { GajicoService } from '../servicios/gajico.service';

@Component({
  selector: 'ccontacto-gajico-app',
  templateUrl: './contacto-gajico.component.html',
  styleUrls: ['./contacto-gajico.component.css']
})
export class ContactoGajicoComponent implements OnInit {
  loading = false;
  institucion: any = null;
  forma: FormGroup;
  //ACA QUEDE, DEBO CONSTRUIR EL FORMULARIO DE CONTACTO
  //CREAR EL SERVICIO QUE CONSUME CONTACTOCONTROLLER
  constructor(
    private router: Router,
    private gajico: GajicoService,
    private fb: FormBuilder,
    private toastr: ToastrManager,
  ) {

   }

  ngOnInit() {
    this.cargarForma();
    if (sessionStorage.getItem('INSTITUCION')){
      this.institucion = JSON.parse(sessionStorage.getItem('INSTITUCION'));
    }
    else{
      this.loading = true;
      this.gajico.getInstitucion(3).subscribe((rs:any)=>{
        var data: any = rs;
        this.institucion = data;
        sessionStorage.setItem('INSTITUCION', JSON.stringify(this.institucion));
        this.loading = false;
        console.log(this.institucion);
      }, error=>{
        console.log(error);
        this.loading = false;
      })
    }
  }
  cargarForma() {
    this.loading = true;
    this.forma = new FormGroup({
      'nuevoTelefono': new FormControl('', [Validators.required, Validators.minLength(3)]),
      'nuevoNombre': new FormControl('', Validators.required),
      'nuevoCorreo': new FormControl('', [Validators.required, Validators.pattern("[^ @]*@[^ @]*")]),
      'nuevoMensaje': new FormControl('', [Validators.required, Validators.maxLength(250)]),
    });
    this.loading = false;
    //console.log(this.forma.valid + ' ' + this.forma.status);
  }

  guardarContacto() {
    if (this.forma.valid) {
      var nombres = '';
      if (this.forma.controls.nuevoNombre) {
        if (this.forma.controls.nuevoNombre.value != null) {
          nombres = String(this.forma.controls.nuevoNombre.value);
        }
      }
      var telefono = '';
      if (this.forma.controls.nuevoTelefono) {
        if (this.forma.controls.nuevoTelefono.value != null) {
          telefono = String(this.forma.controls.nuevoTelefono.value);
        }
      }
      var correo = '';
      if (this.forma.controls.nuevoCorreo) {
        if (this.forma.controls.nuevoCorreo.value != null) {
          correo = String(this.forma.controls.nuevoCorreo.value);
        }
      }
      var mensaje = '';
      if (this.forma.controls.nuevoMensaje) {
        if (this.forma.controls.nuevoMensaje.value != null) {
          mensaje = String(this.forma.controls.nuevoMensaje.value);
        }
      }
      var correoOrigen = this.institucion && this.institucion.CorreoElectronico ? 
        this.institucion.CorreoElectronico.toLowerCase() : 'contacto@gajico.cl';
      var instId = this.institucion && this.institucion.Id ? this.institucion.Id : 3;

      this.loading = true;
      this.gajico.postContacto(correo, mensaje, nombres, telefono, correoOrigen, instId)
        .subscribe((rs:any)=>{
          this.loading = false;
          var data : any = rs;
          if (data && data.Id > 0){
            //correcto limpiar
            this.forma.reset({});
            this.showToast('success', 'Tu solicitud ha sido enviada con éxito, pronto nos pondremos en contacto.', 'Contacto');
          }
          else{
            this.showToast('error', 'Error al guardar', 'Contacto');
          }
        }, error=>{
          console.log(error);
          this.loading = false;
          this.showToast('error', 'Error al guardar', 'Contacto');
        })
      

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
}