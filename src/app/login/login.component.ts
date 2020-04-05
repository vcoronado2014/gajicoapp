import { Component, OnInit, ViewContainerRef } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router } from "@angular/router";
import { Observable } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { ToastrManager } from 'ng6-toastr-notifications';

//Servicios
import { ServicioLoginService } from '../servicios/servicio-login-service';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  loading = false;
  loginUsuario:string;
  loginContrasena:string;
  isLogged: boolean = false; 
  rol;
  ambiente = '';

  constructor(
    private auth: ServicioLoginService,
    private router: Router,
    private toastr: ToastrManager,
    private _vcr: ViewContainerRef
  ) {
    //this.toastr.setRootViewContainerRef(_vcr);
    if (environment.production == false && environment.pre_production == false){
      this.ambiente = 'Desarrollo';
    }
    if (environment.production == true && environment.pre_production == true){
      this.ambiente = 'Pre-Producción';
    }
    if (environment.production == true && environment.pre_production == false){
      this.ambiente = 'Producción';
    }
   }

  ngOnInit() {
  }
  IniciarSesionDos(){
    if (!this.loginUsuario ){
      //return console.log('Nombre de usuario requerido');
      return this.showToast('error','Nombre de usuario requerido','Error');
    }
    if(!this.loginContrasena){
      //return console.log('clave vacia'); 
      return this.showToast('error','Contraseña requerida','Error');
    }
    this.loading = true;
    this.auth.loginData(this.loginUsuario,this.loginContrasena).subscribe(
      rs=> {
        this.loading = false;
        var datos = JSON.stringify(rs);
        sessionStorage.setItem("USER_LOGUED_IN", datos);
        this.isLogged = true;
      },
      er => {
        this.loading = false;
        //console.log('incorrecto' + er);
        this.showToast('error',er,'Error'); 
      },
      () => {
        if(this.isLogged){
          //correcto
          console.log('Correcto administrador web');
          //comentado por mientras
          
          this.router.navigateByUrl('/inicio')
          .then(data => console.log(data),
            error =>{
              console.log(error);
            }
          )
          
          
        }
        else{
          //incorrecto
          console.log('Incorrecto');
          this.showToast('error','Usuario o contraseña incorrecto','Error');
        }
      }
    );
  }
  IniciarSesion(){

    if (!this.loginUsuario ){
      //return console.log('Nombre de usuario requerido');
      return this.showToast('error','Nombre de usuario requerido','Error');
    }
    if(!this.loginContrasena){
      //return console.log('clave vacia'); 
      return this.showToast('error','Contraseña requerida','Error');
    }
    this.loading = true;
    /*
    this.auth.login(this.loginUsuario,this.loginContrasena).subscribe(
      rs=> {
        this.loading = false;
        this.isLogged = rs;
      },
      er => {
        this.loading = false;
        //console.log('incorrecto' + er);
        this.showToast('error',er,'Error'); 
      },
      () => {
        if(this.isLogged){
          //correcto
          console.log('Correcto administrador web');
          //comentado por mientras
          
          this.router.navigateByUrl('/inicio')
          .then(data => console.log(data),
            error =>{
              console.log(error);
            }
          )
          
        }
        else{
          //incorrecto
          console.log('Incorrecto');
          this.showToast('error','Usuario o contraseña incorrecto','Error');
        }
      }
    );
    */
   let retorno = this.auth.login(this.loginUsuario,this.loginContrasena);
   this.loading = false;
   console.log(retorno);
     
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
