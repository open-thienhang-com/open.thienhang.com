# Spec: Loyalty Module

## Target Directory Structure

```
src/app/features/loyalty/
├── models/
│   └── loyalty.models.ts           ← Tạo mới (stub models)
├── services/
│   └── loyalty.service.ts          ← Tạo mới (injectable stub)
├── pages/
│   ├── overview/                   ← Tạo mới (loyalty dashboard)
│   │   └── loyalty-overview.component.ts
│   ├── members/                    ← Move + rename từ retail/retail-services/loyalty/loyalty.component.ts
│   │   ├── members.component.ts
│   │   ├── members.component.html
│   │   └── members.component.scss
│   ├── rewards/                    ← Move config từ app.routes.ts data, tạo component thật
│   │   └── rewards.component.ts
│   ├── campaigns/                  ← Move config từ app.routes.ts data, tạo component thật
│   │   └── campaigns.component.ts
│   └── channels/                   ← Move từ retail/retail-services/omni-channel/
│       ├── channels.component.ts
│       ├── channels.component.html
│       └── channels.component.scss
└── loyalty.routes.ts               ← Tạo mới
```

---

## loyalty.routes.ts

```typescript
import { Routes } from '@angular/router';

export const loyaltyRoutes: Routes = [
  {
    path: '',
    redirectTo: 'overview',
    pathMatch: 'full'
  },
  {
    path: 'overview',
    loadComponent: () => import('./pages/overview/loyalty-overview.component').then(m => m.LoyaltyOverviewComponent),
  },
  {
    path: 'members',
    loadComponent: () => import('./pages/members/members.component').then(m => m.MembersComponent),
  },
  {
    path: 'rewards',
    loadComponent: () => import('./pages/rewards/rewards.component').then(m => m.RewardsComponent),
  },
  {
    path: 'campaigns',
    loadComponent: () => import('./pages/campaigns/campaigns.component').then(m => m.CampaignsComponent),
  },
  {
    path: 'channels',
    loadComponent: () => import('./pages/channels/channels.component').then(m => m.ChannelsComponent),
  },
];
```

---

## loyalty.models.ts

Tạo mới — stub types cho loyalty domain (chưa có backend API riêng):

```typescript
// src/app/features/loyalty/models/loyalty.models.ts

export interface LoyaltyMember {
  id: string;
  name: string;
  email: string;
  tier: MemberTier;
  points: number;
  joinedAt: string;
}

export interface LoyaltyReward {
  id: string;
  title: string;
  pointCost: number;
  category: string;
  active: boolean;
}

export interface LoyaltyCampaign {
  id: string;
  title: string;
  status: CampaignStatus;
  startDate: string;
  endDate: string;
  targetTier: MemberTier;
}

export interface LoyaltyStats {
  totalMembers: number;
  pointsIssued: number;
  redemptionRate: number;
  activeCampaigns: number;
}

export enum MemberTier {
  Bronze = 'bronze',
  Silver = 'silver',
  Gold = 'gold',
  Platinum = 'platinum',
}

export enum CampaignStatus {
  Draft = 'draft',
  Active = 'active',
  Paused = 'paused',
  Ended = 'ended',
}
```

---

## loyalty.service.ts

Service stub — injectable, empty methods (backend API không có sẵn):

```typescript
// src/app/features/loyalty/services/loyalty.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { LoyaltyMember, LoyaltyReward, LoyaltyCampaign, LoyaltyStats } from '../models/loyalty.models';

@Injectable({ providedIn: 'root' })
export class LoyaltyService {
  private http = inject(HttpClient);

  getStats(): Observable<LoyaltyStats> {
    // TODO: wire to real API when loyalty endpoints are available
    return of({
      totalMembers: 82450,
      pointsIssued: 9300000,
      redemptionRate: 27.1,
      activeCampaigns: 32,
    });
  }

  getMembers(): Observable<LoyaltyMember[]> {
    return of([]);
  }

  getRewards(): Observable<LoyaltyReward[]> {
    return of([]);
  }

  getCampaigns(): Observable<LoyaltyCampaign[]> {
    return of([]);
  }
}
```

---

## LoyaltyOverviewComponent (tạo mới)

Dashboard tổng quan loyalty — pattern tương tự `InventoryOverviewComponent`:

```typescript
// src/app/features/loyalty/pages/overview/loyalty-overview.component.ts
@Component({
  selector: 'app-loyalty-overview',
  standalone: true,
  template: `
    <!-- Stats cards: Active Members, Points Issued, Redemption Rate, Active Campaigns -->
    <!-- Quick actions: View Members, Create Campaign, Manage Rewards -->
    <!-- Tier breakdown chart (Bronze / Silver / Gold / Platinum) -->
    <!-- Recent campaigns table (last 5) -->
  `
})
export class LoyaltyOverviewComponent {
  loyaltyService = inject(LoyaltyService);

  stats = signal<LoyaltyStats | null>(null);
  campaigns = signal<LoyaltyCampaign[]>([]);
  loading = signal(false);

  ngOnInit() {
    this.loadDashboard();
  }

  loadDashboard() {
    this.loading.set(true);
    this.loyaltyService.getStats().subscribe(s => {
      this.stats.set(s);
      this.loading.set(false);
    });
    this.loyaltyService.getCampaigns().subscribe(c => this.campaigns.set(c.slice(0, 5)));
  }
}
```

---

## MembersComponent (move + rename)

```
Source: retail/retail-services/loyalty/loyalty.component.ts  (hiện là empty shell)
Target: loyalty/pages/members/members.component.ts

Action: MOVE file, đổi selector thành 'app-members', đổi class name thành MembersComponent.
Giữ nguyên template loyalty.component.html và loyalty.component.scss.
```

---

## RewardsComponent (tạo mới từ feature-page config)

Hiện tại `/retail/rewards` dùng `RetailFeaturePageComponent` với `data.featureConfig`. Loyalty module cần component thật:

```typescript
// src/app/features/loyalty/pages/rewards/rewards.component.ts
// Tạo mới — standalone component
// Template: hiển thị rewards list (stub data từ LoyaltyService.getRewards())
// Giữ UI phù hợp với PrimeNG table/card pattern của toàn app
```

**Lưu ý**: `RetailFeaturePageComponent` data config cho `/retail/rewards` có các stats:
- Active Rewards: 146
- Redeem Cost: $2.31
- Redemption Volume: 78,212
- Partner Offers: 29

Component mới có thể hardcode stats này như placeholder cho đến khi có API thật.

---

## CampaignsComponent (tạo mới từ feature-page config)

```typescript
// src/app/features/loyalty/pages/campaigns/campaigns.component.ts
// Tạo mới — standalone component
// Template: campaigns list với status filter (Active / Paused / Draft)
// Stub data từ LoyaltyService.getCampaigns()
```

**Lưu ý**: Stats từ route config hiện tại:
- Campaigns Live: 32
- Open Rate: 42.3%
- Conversion: 9.8%
- ROI: 3.7x

---

## ChannelsComponent (move từ omni-channel)

```
Source: retail/retail-services/omni-channel/omni-channel.component.ts
Target: loyalty/pages/channels/channels.component.ts

Action: MOVE file, đổi selector thành 'app-channels', đổi class name thành ChannelsComponent.
Giữ nguyên omni-channel.component.html và omni-channel.component.scss.

Lưu ý: Route /retail/omni-channel hiện load FacebookWorkspaceComponent (từ features/chat).
Channels component là wrapper/landing page cho omni-channel, có thể embed FacebookWorkspaceComponent
hoặc link sang /chat/facebook-workspace.
```

---

## Requirements

### Requirement: Loyalty module tồn tại độc lập

#### Scenario: Navigate tới /loyalty/overview
- WHEN user navigate tới `/loyalty/overview`
- THEN `LoyaltyOverviewComponent` render với 4 stats cards và campaigns table
- AND không có lỗi import hoặc route not found

#### Scenario: Navigate tới /loyalty/members
- WHEN user navigate tới `/loyalty/members`
- THEN `MembersComponent` render
- AND component dùng `LoyaltyService` (không import từ retail module)

#### Scenario: Navigate tới /loyalty/rewards
- WHEN user navigate tới `/loyalty/rewards`
- THEN `RewardsComponent` render (standalone, không phải RetailFeaturePageComponent)

#### Scenario: Navigate tới /loyalty/campaigns
- WHEN user navigate tới `/loyalty/campaigns`
- THEN `CampaignsComponent` render (standalone, không phải RetailFeaturePageComponent)

#### Scenario: Navigate tới /loyalty/channels
- WHEN user navigate tới `/loyalty/channels`
- THEN `ChannelsComponent` render (moved từ omni-channel)

#### Scenario: Old URL redirect — loyalty
- WHEN user navigate tới `/retail/loyalty`
- THEN browser redirect sang `/loyalty/overview`

#### Scenario: Old URL redirect — rewards
- WHEN user navigate tới `/retail/rewards`
- THEN browser redirect sang `/loyalty/rewards`

#### Scenario: Old URL redirect — campaigns
- WHEN user navigate tới `/retail/campaigns`
- THEN browser redirect sang `/loyalty/campaigns`

#### Scenario: Old URL redirect — omni-channel
- WHEN user navigate tới `/retail/omni-channel`
- THEN browser redirect sang `/loyalty/channels`

#### Scenario: Loyalty sidebar entry
- WHEN sidebar render
- THEN "Loyalty" group hiển thị với 5 sub-items: Overview, Members, Rewards, Campaigns, Channels
- AND group icon là `pi pi-star`
- AND group có thể expand/collapse

---

## File Migration Mapping

| Old path | New path | Action |
|----------|----------|--------|
| `retail/retail-services/loyalty/loyalty.component.ts` | `loyalty/pages/members/members.component.ts` | MOVE + RENAME |
| `retail/retail-services/loyalty/loyalty.component.html` | `loyalty/pages/members/members.component.html` | MOVE + RENAME |
| `retail/retail-services/loyalty/loyalty.component.scss` | `loyalty/pages/members/members.component.scss` | MOVE + RENAME |
| `retail/retail-services/omni-channel/omni-channel.component.ts` | `loyalty/pages/channels/channels.component.ts` | MOVE + RENAME |
| `retail/retail-services/omni-channel/omni-channel.component.html` | `loyalty/pages/channels/channels.component.html` | MOVE + RENAME |
| `retail/retail-services/omni-channel/omni-channel.component.scss` | `loyalty/pages/channels/channels.component.scss` | MOVE + RENAME |
| — | `loyalty/pages/overview/loyalty-overview.component.ts` | CREATE NEW |
| — | `loyalty/pages/rewards/rewards.component.ts` | CREATE NEW |
| — | `loyalty/pages/campaigns/campaigns.component.ts` | CREATE NEW |
| — | `loyalty/models/loyalty.models.ts` | CREATE NEW |
| — | `loyalty/services/loyalty.service.ts` | CREATE NEW |
| — | `loyalty/loyalty.routes.ts` | CREATE NEW |
