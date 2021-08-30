import { Component, OnInit } from '@angular/core';
import { Router } from "@angular/router";
//environments
import { environment } from '../../environments/environment';
import { GajicoService } from '../servicios/gajico.service';
import { ArticulosService } from '../servicios/articulos.service';

@Component({
  selector: 'home-gajico-app',
  templateUrl: './home-gajico.component.html',
  styleUrls: ['./home-gajico.component.css']
})
export class HomeGajicoComponent implements OnInit {
  loading = false;
  institucion: any = null;
  articulosCompleto: any = [];
  constructor(
    private router: Router,
    private gajico: GajicoService,
    private art: ArticulosService
  ) {

   }

  ngOnInit() {

  }

}