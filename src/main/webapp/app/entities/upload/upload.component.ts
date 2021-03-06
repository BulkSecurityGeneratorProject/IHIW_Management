import { Component, OnInit, OnDestroy } from '@angular/core';
import { HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { Subscription } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { JhiEventManager, JhiAlertService } from 'ng-jhipster';

import { IUpload } from 'app/shared/model/upload.model';
import { AccountService } from 'app/core';
import { UploadService } from './upload.service';

@Component({
  selector: 'jhi-upload',
  templateUrl: './upload.component.html'
})
export class UploadComponent implements OnInit, OnDestroy {
  uploads: IUpload[];
  currentAccount: any;
  eventSubscriber: Subscription;

  constructor(
    protected uploadService: UploadService,
    protected jhiAlertService: JhiAlertService,
    protected eventManager: JhiEventManager,
    protected accountService: AccountService
  ) {}

  loadAll() {
    this.uploadService
      .query()
      .pipe(
        filter((res: HttpResponse<IUpload[]>) => res.ok),
        map((res: HttpResponse<IUpload[]>) => res.body)
      )
      .subscribe(
        (res: IUpload[]) => {
          this.uploads = res;
        },
        (res: HttpErrorResponse) => this.onError(res.message)
      );
  }

  ngOnInit() {
    this.loadAll();
    this.accountService.identity().then(account => {
      this.currentAccount = account;
    });
    this.registerChangeInUploads();
  }

  ngOnDestroy() {
    this.eventManager.destroy(this.eventSubscriber);
  }

  trackId(index: number, item: IUpload) {
    return item.id;
  }

  registerChangeInUploads() {
    this.eventSubscriber = this.eventManager.subscribe('uploadListModification', response => this.loadAll());
  }

  protected onError(errorMessage: string) {
    this.jhiAlertService.error(errorMessage, null, null);
  }
}
