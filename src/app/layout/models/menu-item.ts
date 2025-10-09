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
    expanded?: boolean;
    badge?: string;
    info?: MenuInfo;
    highlighted?: boolean;
    type?: 'separator' | 'item';
}
