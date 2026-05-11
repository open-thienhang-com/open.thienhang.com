export interface MenuInfo {
    title: string;
    description: string;
    features: string[];
    usage: string;
    tips?: string[];
}

export interface MenuItem {
    label: string;
    icon?: string;
    url?: string;
    children?: MenuItem[];
    items?: MenuItem[];
    expanded?: boolean;
    badge?: string;
    info?: MenuInfo;
    highlighted?: boolean;
    type?: 'separator' | 'item';
    casbinPath?: string;
    hidden?: boolean;
}

export interface FlatMenuItem {
    label: string;
    icon: string;
    url: string;
    casbinPath?: string;
}

export interface VisibleGroup {
    label?: string;
    icon?: string;
    expanded: boolean;
    items: MenuItem[];
    _flattened: FlatMenuItem[];
    _noHeader?: boolean;
    _isStandalone?: boolean;
    casbinPath?: string;
}
