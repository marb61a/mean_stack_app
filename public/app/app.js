angular.module('MyStoryApp', ['appRoutes', 'mainCtrl','authService', 'userCtrl', 'userService', 'storyService', 'storyCtrl', 'reverseDirective'])

.config(function($httpProvider){
  $httpProvider.interceptors.push('AuthInterceptor');
})


