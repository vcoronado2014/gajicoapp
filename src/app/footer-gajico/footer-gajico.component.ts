import { Component, OnInit } from '@angular/core';
import { Router } from "@angular/router";
//environments
import { environment } from '../../environments/environment';
import { GajicoService } from '../servicios/gajico.service';

@Component({
  selector: 'footer-gajico-app',
  templateUrl: './footer-gajico.component.html',
  styleUrls: ['./footer-gajico.component.css']
})
export class FooterGajicoComponent implements OnInit {
  loading = false;
  institucion: any = null;
  constructor(
    private router: Router,
    private gajico: GajicoService,
  ) {

   }

  ngOnInit() {
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

}