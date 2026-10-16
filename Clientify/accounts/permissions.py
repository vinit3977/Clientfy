from rest_framework.permissions import BasePermission


class IsAdmin(BasePermission):
    """Only Admin users"""
    message = 'You do not have permission to perform this action. Admin access required.'

    def has_permission(self, request, view):
        return bool(
            request.user and
            request.user.is_authenticated and
            request.user.role == 'admin' and
            request.user.status == 'active'
        )


class IsAdminOrManager(BasePermission):
    """Admin or Manager users"""
    message = 'You do not have permission. Admin or Manager access required.'

    def has_permission(self, request, view):
        return bool(
            request.user and
            request.user.is_authenticated and
            request.user.role in ['admin', 'manager'] and
            request.user.status == 'active'
        )


class IsAccountant(BasePermission):
    """Accountant users"""
    message = 'You do not have permission. Accountant access required.'

    def has_permission(self, request, view):
        return bool(
            request.user and
            request.user.is_authenticated and
            request.user.role == 'accountant' and
            request.user.status == 'active'
        )


class IsAdminOrAccountant(BasePermission):
    """Admin or Accountant users"""
    message = 'You do not have permission. Admin or Accountant access required.'

    def has_permission(self, request, view):
        return bool(
            request.user and
            request.user.is_authenticated and
            request.user.role in ['admin', 'accountant'] and
            request.user.status == 'active'
        )


class IsAdminOrManagerOrAccountant(BasePermission):
    """Admin, Manager, or Accountant"""
    message = 'You do not have permission to perform this action.'

    def has_permission(self, request, view):
        return bool(
            request.user and
            request.user.is_authenticated and
            request.user.role in ['admin', 'manager', 'accountant'] and
            request.user.status == 'active'
        )


class IsActiveUser(BasePermission):
    """Any active authenticated user"""
    message = 'Your account is inactive or suspended.'

    def has_permission(self, request, view):
        return bool(
            request.user and
            request.user.is_authenticated and
            request.user.status == 'active'
        )
