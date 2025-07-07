import { Component, Injector, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AppBaseComponent } from '../../core/base/app-base.component';
import { ProfileServices } from '../../core/services/profile.services';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    CommonModule
  ],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent extends AppBaseComponent implements OnInit {
  profile: any = {};

  constructor(private injector: Injector, private dataProdServices: ProfileServices) {
    super(injector);
  }

  ngOnInit() {
    this.dataProdServices.getProfile().subscribe(res => {
      this.profile = res.data;
      console.log(this.profile);
    })
  }

  terminateSession(sessionId: string) {
    console.log('Terminate session:', sessionId);
    // Add your session termination logic here
  }

  formatRemainingTime(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else if (minutes > 0) {
      return `${minutes}m`;
    } else {
      return `${Math.floor(seconds)}s`;
    }
  }

  getDeviceInfo(deviceString: string): string {
    if (deviceString.includes('Chrome')) {
      return 'Chrome Browser';
    } else if (deviceString.includes('Firefox')) {
      return 'Firefox Browser';
    } else if (deviceString.includes('Safari')) {
      return 'Safari Browser';
    }
    return 'Unknown Device';
  }
}