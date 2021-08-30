import { Component, OnInit } from '@angular/core';
import { Router } from "@angular/router";
//environments
import { environment } from '../../environments/environment';
import { GajicoService } from '../servicios/gajico.service';

@Component({
  selector: 'nosotros-gajico-app',
  templateUrl: './nosotros-gajico.component.html',
  styleUrls: ['./nosotros-gajico.component.css']
})
export class NosotrosGajicoComponent implements OnInit {
  loading = false;
  institucion: any = null;
  constructor(
    private router: Router,
    private gajico: GajicoService,
  ) {

   }

  ngOnInit() {

  }

}