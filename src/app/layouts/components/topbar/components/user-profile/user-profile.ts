import { ChangeDetectorRef, Component, inject, OnInit, AfterViewInit } from '@angular/core'
import { AuthService } from '../../../../../core/services/auth.service'
import { GemClientesIdentityService } from '../../../../../core/services/gem-clientes-identity.service'
import {
  NgbDropdown,
  NgbDropdownMenu,
  NgbDropdownToggle,
} from '@ng-bootstrap/ng-bootstrap'
import { userDropdownItems, UserDropdownItemType } from '../../../data'
import { Router, RouterLink } from '@angular/router'
import { NgIcon } from '@ng-icons/core'
// import { AuthService } from '@core/services/auth'
// import { UserStorageService } from '@core/services/user-storage'
// import { Adicional, UsuarioCompleto } from '@core/interfaces/usuario'
// import { UsuarioService } from '@core/services/usuario'
// import { UsuarioAdicionalClave } from '@/app/constants/adicionales_usuario'
// import { AVATAR_POR_DEFECTO, getAvatarPath } from '@/app/constants/avatares-disponibles';
// import { AvatarSyncService } from '@core/services/avatar-sync.service';

@Component({
  selector: 'app-user-profile-topbar',
  imports: [
    NgbDropdown,
    NgbDropdownMenu,
    NgbDropdownToggle,
    RouterLink,
    NgIcon,
  ],
  templateUrl: './user-profile.html',
})
export class UserProfile implements OnInit, AfterViewInit {
  private router = inject(Router)
  private authService = inject(AuthService)
  protected identity = inject(GemClientesIdentityService)
  // private usuarioService = inject(UsuarioService);
  // private userStorageService = inject(UserStorageService);
  private cdr = inject(ChangeDetectorRef);
  // private avatarSyncService = inject(AvatarSyncService);

  menuItems: UserDropdownItemType[] = []
  // imagenPerfil: Adicional | null = null;
  // fotoPerfil: string = getAvatarPath(AVATAR_POR_DEFECTO);
  private usuarioId: string | null = null;

  ngOnInit() {
    // const usuario = this.userStorageService.getUsuario();
    
    // if (usuario) {
    //   this.usuarioId = usuario.id;
    //   this.menuItems = [
    //     {
    //       label: `${toTitleCase(usuario.nombre)} ${toTitleCase(usuario.apellido)}`,
    //       isHeader: true,
    //     },
    //     ...userDropdownItems.map(item =>
    //       item.label === 'Perfil'
    //         ? { ...item, url: `/usuario/perfil/${usuario.id}` }
    //         : item
    //     )
    //   ];

    //   // Escuchar cambios de avatar
    //   this.avatarSyncService.avatarCambiado$.subscribe(nombreImagen => {
    //     if (nombreImagen) {
    //       this.fotoPerfil = getAvatarPath(nombreImagen);
    //       this.cdr.detectChanges();
    //     }
    //   });
    // }

    this.menuItems = [
      ...userDropdownItems.map(item =>
        item.label === 'Perfil'
          ? { ...item, url: `/usuario/perfil/{usuario.id}` } //{ ...item, url: `/usuario/perfil/${usuario.id}` }
          : item
      )
    ];
  }

  ngAfterViewInit() {
    if (this.usuarioId) {

    }
  }

  handleEvent(event: string | undefined) {
    if (!event) return;

    switch (event) {
      case 'logout':
        this.logout();
        break;
      default:
        console.warn('Evento no manejado:', event);
    }
  }

  logout() {
    this.authService.logout().subscribe({
      next: () => undefined,
      error: () => this.router.navigateByUrl('/login'),
      complete: () => this.router.navigateByUrl('/login'),
    });
  }
}
