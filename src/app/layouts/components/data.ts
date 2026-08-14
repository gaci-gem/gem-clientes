import { MenuItemType } from '../../types/layout';

export type UserDropdownItemType = {
  label?: string
  icon?: string
  url?: string
  newTab?: boolean
  isDivider?: boolean
  isHeader?: boolean
  class?: string
  event?: string
}

export const userDropdownItems: UserDropdownItemType[] = [
  // {
  //   label: 'Bienvenido!',
  //   isHeader: true,
  // },
  {
    label: 'Cambiar contraseña',
    icon: 'tablerUserCircle',
    url: '/cuenta',
  },
  {
    isDivider: true,
  },
  // {
  //   label: 'Sol. de licencia',
  //   icon: 'lucideBrush',
  //   url: 'https://docs.google.com/a/gaci.com.ar/forms/d/e/1FAIpQLSdbSw6Cs9pj3WF1g5ly8xwnM01Ag3_PaWrpMqFUwCMyHh0wMQ/viewform',
  //   newTab: true,
  // },
  // {
  //   label: 'Sugerencias',
  //   icon: 'lucideTicket',
  //   url: 'https://discord.com/channels/1366451551064821782/1429920790274637984',
  //   newTab: true,
  // },
  // {
  //   isDivider: true,
  // },
  {
    label: 'Cerrar sesión',
    icon: 'tablerLogout2',
    event: 'logout',
    class: 'fw-semibold',
  },
]

export const menuItems: MenuItemType[] = [
  { label: 'Tickets', icon: 'lucideCircleGauge', url: '/tickets' },
];
