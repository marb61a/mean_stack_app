angular.module('MyStoryApp', ['appRoutes', 'mainCtrl','authService', 'userCtrl', 'userService'])

.config(function($httpProvider){
  $httpProvider.interceptors.push('AuthInterceptor');
})