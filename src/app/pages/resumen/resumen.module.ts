import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ResumenPageRoutingModule } from './resumen-routing.module';

import { ResumenPage } from './resumen.page';
import { PipesModule } from "../../pipes/pipes.module";

@NgModule({
    declarations: [ResumenPage],
    imports: [
        CommonModule,
        FormsModule,
        IonicModule,
        ResumenPageRoutingModule,
        PipesModule
    ]
})
export class ResumenPageModule {}
