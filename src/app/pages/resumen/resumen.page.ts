import { MiCuentaPage } from './../mi-cuenta/mi-cuenta.page';
import { Component, OnInit, inject } from '@angular/core';
import { ResumenService } from 'src/app/services/resumen.service';
import { ActivatedRoute } from '@angular/router';
import { Funciones } from 'src/app/modelo/funciones';
import {
  LoadingController,
  MenuController,
  NavController,
} from '@ionic/angular';
import {
  ActionPerformed,
  PushNotificationSchema,
  PushNotifications,
  Token,
} from '@capacitor/push-notifications';
import { UiService } from 'src/app/services/ui.service';
import { NotificacionesService } from 'src/app/services/notificaciones.service';
import { Configuraciones } from 'src/configuraciones/configuraciones';
import { MercadosService } from 'src/app/services/mercados-service';
@Component({
  selector: 'app-resumen',
  templateUrl: './resumen.page.html',
  styleUrls: ['./resumen.page.scss'],
})
export class ResumenPage implements OnInit {
  //---------------------------------------------//
  // DECLARACION DE LAS PROPIEDADES QUE NECESITO //
  //---------------------------------------------//
  public mostrarDetalleCuentas = false;
  public mostrarDetalleFichaRemitos = false;
  public mostrarDetalleFichaCombustibles = false; // Usado para ocultar el detalle de las cuentas
  public mostrarDetalleCereales = false; // Usado para ocultar el detalle de los cereales
  public seccion!: string;
  public contieneRemitos: boolean | any;
  public contieneCombustibles: boolean | any;
  public contieneMercadoCereales: boolean | any;
  public saldoDeudorAcreedor: any | undefined;
  public importeEstadoSaldos: any | undefined;
  public fechaCierre : string | undefined;

  data: any;
  resumen: any;
  empresa: any;
  logo: any;
  funciones: Funciones = new Funciones(['']);
  private activatedRoute = inject(ActivatedRoute);
  istodoCargado : any
  isMercadoDisponible: any;
  isMercadoFuturo:any;
  isPizarra: any;
  public notificaciones: any;
  public ver: boolean = false;
  public numeroMensajes: any;
  public mercadoDisponible : any;
  public mercadoFuturo: any;

  constructor(
    public resumenService: ResumenService,
    private uiService: UiService,
    private navController: NavController,
    private loadingController: LoadingController,
    private menuController: MenuController,
    public notificacionesService: NotificacionesService,
    public mercadoDisponibleService: MercadosService,
    public mercadoFuturosService: MercadosService,

    private menuCtrl : MenuController
  ) {}

  async ngOnInit() {


    // refresco la pagina por el cache
    this.menuCtrl.enable(true);
    this.istodoCargado = false
    this.isMercadoDisponible = false;
    this.isMercadoFuturo = false;
    this.isPizarra = false;
    //this.navController.navigateRoot('/resumen', { animated: true });
    await this.uiService.presentLoading("Aguarde...");
    this.seccion = this.activatedRoute.snapshot.paramMap.get('id') as string;
    this.resumenService.load().then(async (resp) => {
      this.data = resp;
      this.resumen = this.data.resumen;
      this.empresa = this.data.resumen.empresa;
      this.istodoCargado = true
      this.funciones = new Funciones(this.data.funciones.listaFunciones);
      this.cargarDatos();
      await this.loadingController.dismiss();

    });
    this.notificacionesService.ponerEnFalso();
    this.notificacionesService.checkPorVer().then(async (resp) => {
      this.data = resp;
      if (this.data > 0) {
        this.ver = true;
      } else {
        this.ver = false;
      }
      this.numeroMensajes = this.data;
    });

    // NOTIFICACIONES CAPACITOR
    /*PushNotifications.requestPermissions().then(result => {
      if (result.receive === 'granted') {
        // Register with Apple / Google to receive push via APNS/FCM
        PushNotifications.register();
      } else {
        // Show some error
      }
    });




    // Request permission to use push notifications
    // iOS will prompt user and return if they granted permission or not
    // Android will just grant without prompting
    PushNotifications.requestPermissions().then(result => {
      if (result.receive === 'granted') {
        // Register with Apple / Google to receive push via APNS/FCM
        PushNotifications.register();
      } else {
        // Show some error
      }
    });

    PushNotifications.addListener('registration', (token: Token) => {
      alert('Push registration success, token: ' + token.value);
    });

    PushNotifications.addListener('registrationError', (error: any) => {
      alert('Error on registration: ' + JSON.stringify(error));
    });

    PushNotifications.addListener(
      'pushNotificationReceived',
      (notification: PushNotificationSchema) => {
        alert('Push received: ' + JSON.stringify(notification));
      },
    );

    PushNotifications.addListener(
      'pushNotificationActionPerformed',
      (notification: ActionPerformed) => {
        alert('Push action performed: ' + JSON.stringify(notification));
      },
    );
*/


  }
  // End ngOnInit()

  public getLogoEmpresa() {
    if (this.resumen.empresa.id != '') {
      this.logo = Configuraciones.rutaLogos + this.resumen.empresa.id + '.png';
      return this.logo;
    } else {
      return Configuraciones.rutaLogos + '00.png';
    }
  }
  /**
   * Esta funcion se usa para cargar los datos restantes
   */
  public  cargarDatos() {

    // traigo las notificaciones
    this.notificacionesService.load().then((notificaciones) => {
      this.notificaciones = notificaciones;
    });
    // traigo el mercado de cereales
   // await this.uiService.presentLoading("Cargando mercados...");
    this.mercadoDisponibleService
      .load(this.resumen.empresa.id, 'json', 'mercado-cereales', '1', this.resumen.empresa.coopeHash)
      .then( (data: any) => {

        this.mercadoDisponible = data.mercadoCer
        this.fechaCierre = this.mercadoDisponible[0].cierre

        if (this.mercadoDisponible.length > 0){
          this.isMercadoDisponible = true;
        }else{
          this.isMercadoDisponible = false;
        }

      });
   this.mercadoFuturosService
      .load(this.resumen.empresa.id, 'json', 'mercado-cereales', '2')
      .then(async (data: any) => {

        this.mercadoFuturo = data.mercadoCer
        if (this.mercadoFuturo.length > 0 ){
          this.isMercadoFuturo = true;
        }else{
          this.isMercadoFuturo = false;
        }
      });

    this.tieneCombustibles();
    this.tieneRemitos();
    this.tieneMercadoCereales();

  }

  ngAfterViewInit() {
    //return 'ngAfterViewInit()';
    //let headerImporteCtacteResaltadoPositivo = '';
  }
  /**
   * Este metodo se ejecuta cuando se selecciona una cuenta
   */
  public ctacteTapped(event: any, item: any) {
    if (this.tieneFuncion('detalleCtaCte')) {
      this.navController.navigateRoot('/detalle-ctacte', {
        animated: true,
        queryParams: { cuenta: item, socio: this.resumen.cuenta },
      });
    }
  }
  public ofertasProductosTapped(event: any, item: any) {
    if (this.tieneFuncion('catalogoDeProductos')) {
      this.navController.navigateRoot('/ofertas', {
        animated: true,
        queryParams: { cuenta: item, socio: this.resumen.cuenta },
      });
    }
  }
  // solo para caur
  public ofertasCaurTapped() {
    if (this.tieneFuncion('ofertasCaur')) {
      return true;
    } else {
      return false;
    }
  }

  /**
   * Este metodo se ejecuta cuando se selecciona un cereal
   */
  public cerealTapped(event: any, item: any) {
    if (this.tieneFuncion('detalleCereal')) {
      this.navController.navigateRoot('/detalle-cereal', {
        animated: true,
        queryParams: { cereal: item },
      });
    }
  }

  /**
   * Este metodo se utiliza para mostrar/ocultar el detalle de cereales
   */
  public toggleDetalleCereales() {
    this.mostrarDetalleCereales = !this.mostrarDetalleCereales;
  }

  /**
   * Este metodo se utiliza para mostrar/ocultar el detalle de las cta. cte.
   */
  public toggleDetalleCuentas() {
    this.mostrarDetalleCuentas = !this.mostrarDetalleCuentas;
  }

  /**
   * Este metodo devuelve el path al logo de la empresa
   */

  public getFechaActualizacion(): string {
    return this.resumen.fechaActualizacion;
  }

  public tieneFuncion(funcion: string): boolean {
    if (!this.funciones) return false;

    return this.funciones.tieneFuncion(funcion);
  }
  public tieneRemitos() {
    let element = this.resumen.fichaRemito;
    for (var i = 0, len = element.length; i < len; i++)
      if (
        element[i].idRubroCtacte.idRubroCtacte == 1 ||
        element[i].idRubroCtacte.idRubroCtacte == 2
      ) {
        this.contieneRemitos = true;
        break;
      } else {
        this.contieneRemitos = false;
      }
  }

  public tieneCombustibles() {
    let element = this.resumen.fichaRemito;
    for (var i = 0, len = element.length; i < len; i++)
      if (element[i].idRubroCtacte.idRubroCtacte == 3) {
        this.contieneCombustibles = true;
        break;
      } else {
        this.contieneCombustibles = false;
      }
  }

  public tieneMercadoCereales() {
    /*let element = this.resumen.fichaRemito;
    for (var i = 0, len = element.length; i < len; i++)
      if (element[i].idRubroCtacte.idRubroCtacte == 3) {
        this.contieneMercadoCereales = true;
        break;
      } else {
        this.contieneMercadoCereales = false;
      }*/
  }

  public ctacteActualTapped(event: any, item: any) {
    if (this.tieneFuncion('detalleCtaCte')) {
      //this.navCtrl.push(DetalleCtaCtePage, { item: item });
    }
  }

  public linkMiCuenta() {
    this.navController.navigateRoot('/mi-cuenta');
  }
  public getSaldoCtaCteActual(saldo: any) {

    if (saldo < 0) {
      // acreedor
      setTimeout(() => {
        this.saldoDeudorAcreedor = 'ACREEDOR';
        this.importeEstadoSaldos = 'headerImporteCtacteResaltadoNegativo';
      }, 1000);

    } else {
      setTimeout(() => {
      // deudor
      this.saldoDeudorAcreedor = 'DEUDOR';
      this.importeEstadoSaldos = 'headerImporteCtacteResaltadoPositivo';
    }, 1000);
    }
    return saldo;
  }

 public isMercadoCerealesCargado() : boolean {
    // Pregunto si ya se obtuvo una respuesta del serivicio
    if(typeof this.mercadoDisponible !== 'undefined'){
      return true;
    }else{
      return false;
    }
  }

/*
notififaciones push


*/

}
