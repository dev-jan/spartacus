import { Component } from '@angular/core';
import { ICON_TYPE } from '@spartacus/storefront';
import { Observable } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { ConfiguratorCommonsService } from '../../core/facade/configurator-commons.service';
import { ConfiguratorGroupsService } from '../../core/facade/configurator-groups.service';
import { Configurator } from './../../core/model/configurator.model';
import { ConfiguratorRouterExtractorService } from './../service/configurator-router-extractor.service';

@Component({
  selector: 'cx-config-group-title',
  templateUrl: './configurator-group-title.component.html',
})
export class ConfiguratorGroupTitleComponent {
  configuration$: Observable<
    Configurator.Configuration
  > = this.configRouterExtractorService
    .extractRouterData()
    .pipe(
      switchMap((routerData) =>
        this.configuratorCommonsService.getConfiguration(routerData.owner)
      )
    );

  displayedGroup$: Observable<
    Configurator.Group
  > = this.configRouterExtractorService
    .extractRouterData()
    .pipe(
      switchMap((routerData) =>
        this.configuratorGroupsService.getCurrentGroup(routerData.owner)
      )
    );

  iconTypes = ICON_TYPE;

  constructor(
    protected configuratorCommonsService: ConfiguratorCommonsService,
    protected configuratorGroupsService: ConfiguratorGroupsService,
    protected configRouterExtractorService: ConfiguratorRouterExtractorService
  ) {}
}
