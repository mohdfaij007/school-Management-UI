import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { StorageService } from '../services/storage.service';

export const roleGuard: CanActivateFn = (route, state) => {
  const storageService = inject(StorageService);
  const router = inject(Router);

  if (!storageService.isLoggedIn()) {
    router.navigate(['/login']);
    return false;
  }

  const user = storageService.getUser();
  // Get the roles allowed for this route
  const expectedRoles: string[] = route.data?.['roles'] || [];

  // If no specific roles are required, let them pass
  if (expectedRoles.length === 0) {
    return true;
  }

  // Check if the user's role matches any of the allowed roles
  if (user && user.role && expectedRoles.includes(user.role)) {
    return true;
  }

  // If they are logged in but don't have permission (e.g., a Student trying to view fees)
  alert("You do not have permission to access this page.");
  router.navigate(['/dashboard']);
  return false;
};