import { Component, Input, OnInit } from '@angular/core';
import { Router } from "@angular/router";
//environments
import { environment } from '../../environments/environment';
import { GajicoService } from '../servicios/gajico.service';
import { ArticulosService } from '../servicios/articulos.service';

@Component({
  selector: 'card-gajico-app',
  templateUrl: './card-gajico.component.html',
  styleUrls: ['./card-gajico.component.css']
})
export class CardGajicoComponent implements OnInit {
  @Input() a: any;
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