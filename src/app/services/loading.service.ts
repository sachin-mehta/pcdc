import { Injectable } from '@angular/core';
import { LoadingController } from '@ionic/angular';
@Injectable({
  providedIn: 'root'
})
export class LoadingService {
  isLoading = false;
  loadingObj:any;
  loadingElement:any;
  constructor( public loadingController: LoadingController ) { }

  /**
   * Open loading
   * @returns loader
   */
  async present(msg?: string, duration?: number, cssClass?: string, spinner?) {
  if (this.loadingElement) {
    return;
  }

  this.isLoading = true;
  this.loadingObj = {};

  if(spinner) {
    this.loadingObj.spinner = spinner;
  }

  if(msg){
    this.loadingObj.message = msg;
  }

  if(duration){
    this.loadingObj.duration = duration;
  }

  if(cssClass){
    this.loadingObj.cssClass = cssClass;
  }

  this.loadingElement = await this.loadingController.create(this.loadingObj);

  this.loadingElement.present().then(() => {
    if (!this.isLoading) {
      this.loadingElement.dismiss().then(() => console.log('abort presenting'));
      this.loadingElement = null;
    }
  });
}


/*    return await this.loadingController.create(this.loadingObj).then(a => {
      a.present().then(() => {
        if (!this.isLoading) {
          a.dismiss().then(() => console.log('abort presenting'));
        }
      });
    });
  }
    */

  /**
   * Close the loader
   * @returns
   */
/*  async dismiss() {
    this.isLoading = false;
    return await this.loadingController.dismiss().then(() => console.log('dismissed'));
  }
*/
async dismiss() {
    this.isLoading = false;

    if (!this.loadingElement) {
      return;
    }

    return this.loadingElement.dismiss()
      .then(() => {
        console.log('dismissed');
        this.loadingElement = null;
      })
      .catch(() => {
        this.loadingElement = null;
      });
  }


  /**
   * Check the current loading status
   * @returns boolean
   */
  isStillLoading(){
  return !!this.loadingElement;
}
}
