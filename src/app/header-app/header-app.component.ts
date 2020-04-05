import { Component, OnInit } from '@angular/core';
import { Router } from "@angular/router";
//environments
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-header-app',
  templateUrl: './header-app.component.html',
  styleUrls: ['./header-app.component.css']
})
export class HeaderAppComponent implements OnInit {
  usuario;
  logueado = false;
  titulo: string = '';
  subtitulo: string = '';
  ambiente = '';
  constructor(
    private router: Router
  ) {

   }

  ngOnInit() {
    if (environment.production == false && environment.pre_production == false){
      this.ambiente = 'Desarrollo';
    }
    if (environment.production == true && environment.pre_production == true){
      this.ambiente = 'Pre-Producción';
    }
    if (environment.production == true && environment.pre_production == false){
      this.ambiente = 'Producción';
    }
    if (sessionStorage.getItem("USER_LOGUED_IN")){
      this.usuario = JSON.parse(sessionStorage.getItem("USER_LOGUED_IN"));
      if (this.usuario.AutentificacionUsuario){
        this.logueado = true;

      }
      if (this.usuario.Institucion){
        this.titulo = this.usuario.Institucion.Titulo;
        this.subtitulo = this.usuario.Institucion.Subtitulo;
      }
    }
  }
  salir(){
    sessionStorage.clear();
    this.router.navigateByUrl('/login')
    .then(data => console.log(data),
      error =>{
        console.log(error);
      }
    )
  }

}
