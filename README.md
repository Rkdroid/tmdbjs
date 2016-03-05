# tmdbjs
light weight tmdb application with Grid Navigation which runs on any set top box with Remote Control navigation

The primary aim of this app is to demonstrate the Grid Navigation by handling RC events, to render dynamic data we have chosen tmdb api. 

To handle the core part of the app such as RC and mouse events as well as handling the focus part we have core framework in which RC, mouse and focus are different modules.

Core also consists of Scenes and Snippets:
Both should be considered as views that control UI and handle user interaction. Both have very similar implementation and logic. Snippet is designed to be stand-alone object or to be part of a scene, therefore scene may contain unlimited amount of snippets.

HTML IDs and class names:
If an element belongs to a scene, it should have an ID in this format "scene-home". Same rule applies for snippets, class names or IDs should contain word "snippet" and snippet's name ("snippet-navigation").

Routing:
Navigating through the application is handled by the Router and its method Router.go. When a go event is triggered, Router hides current scene and shows the new one.


