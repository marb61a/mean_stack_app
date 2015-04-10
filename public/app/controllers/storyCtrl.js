angular.module('storyCtrl', ['storyService'])

.controller('StoryController', function(Story, socketio){
  
  var vm = this ;
  
  Story.allStory()
    .success(function(data){
      vm.stories = data;
    });
  
  vm.createStory = function(){
    
    vm.message = '';
    
    Story.create(vm.storyData)
    .success(function(data){
      vm.storyData = '';
      vm.message = data.message;
      
    });
  }
   socketio.on('story', function(){
     vm.stories.push(data);
   });
})

.controller('AllStories', function(stories, socketio){
  var vm = this;
  vm.stories = stories.data;
  socketio.on('story', function(){
     vm.stories.push(data);
   });
})