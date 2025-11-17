import { mergeApplicationConfig, ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideServerRendering } from '@angular/platform-server';
import { appConfig } from './app.config';
import { NgxSpinnerModule } from 'ngx-spinner';

const serverConfig: ApplicationConfig = {
  providers: [
    provideServerRendering(),
    
  ],
};

export const config = mergeApplicationConfig(appConfig, serverConfig);
