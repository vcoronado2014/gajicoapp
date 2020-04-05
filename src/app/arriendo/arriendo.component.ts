import { Component, OnInit, ViewContainerRef, ViewChild, ElementRef, Input } from '@angular/core';
import { FormsModule, ReactiveFormsModule, FormGroup, FormControl, Validators, FormArray, FormBuilder } from '@angular/forms';
import { Router } from "@angular/router";
import { Subject } from 'rxjs';
import { Observable } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../environments/environment';

import { ToastrManager } from 'ng6-toastr-notifications';

//servicios
import { UtilesService } from '../servicios/utiles.service';
import { GajicoService, User } from '../servicios/gajico.service';
//completer
import { CompleterService, CompleterData } from 'ng2-completer';
//dialog
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';

declare var $: any;

@Component({
  selector: 'app-arriendo',
  templateUrl: './arriendo.component.html',
  styleUrls: ['./arriendo.component.css']
})
export class ArriendoComponent implements OnInit {

listaArriendos: any = [];
  //loading
  loading = false;

  constructor(
    private httpClient: HttpClient,
    private fb: FormBuilder,
    private router: Router,
    //private global: GlobalService,
    private gajico: GajicoService,
    private toastr: ToastrManager,
    public completerService: CompleterService,
    public utiles: UtilesService,
    public dialog: MatDialog,
    private _vcr: ViewContainerRef
  ) {

   }

  ngOnInit() {

  }
  salir(){
      /*
    sessionStorage.clear();
    this.router.navigateByUrl('/login')
    .then(data => console.log(data),
      error =>{
        console.log(error);
      }
    )
    */
  }

}