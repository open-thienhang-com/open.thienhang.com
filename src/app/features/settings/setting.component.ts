import { Component, Injector, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AppBaseComponent } from '../../core/base/app-base.component';
import { FormsModule } from '@angular/forms';
import { TabViewModule } from 'primeng/tabview';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { InputSwitchModule } from 'primeng/inputswitch';
import { ProfileServices } from '../../core/services/profile.services';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TabViewModule,
    InputTextModule,
    ButtonModule,
    InputSwitchModule
  ],
  templateUrl: './setting.component.html',
  styleUrls: ['./setting.component.scss']
})
export class SettingsComponent extends AppBaseComponent implements OnInit {
  profile: any = {};
  darkMode: boolean = false;
  notifications: boolean = true;

  constructor(private injector: Injector, private profileService: ProfileServices) {
    super(injector);
  }

  ngOnInit(): void {
    // this.profileService.getProfile().subscribe(res => {
    //   this.profile = res.data;
    // });
  }

  saveProfile() {
    console.log('Save profile', this.profile);
  }

  changePassword() {
    console.log('Change password');
  }
}
