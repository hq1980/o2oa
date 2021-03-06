MWF.xApplication.ExeManager = MWF.xApplication.ExeManager || {};
MWF.require("MWF.widget.Identity", null,false);
MWF.xDesktop.requireApp("ExeManager", "Actions.RestActions", null, false);
MWF.xDesktop.requireApp("Template", "Explorer", null, false);
MWF.xApplication.ExeManager.options = { 
	multitask: false,
	executable: true
}
MWF.xApplication.ExeManager.Main = new Class({
	Extends: MWF.xApplication.Common.Main, 
	Implements: [Options, Events],

	options: {
		"style": "default",
		"name": "ExeManager",
		"icon": "icon1.png",
		"width": "1270",
		"height": "700",
		"isResize": false,
		"isMax": true,
		"title": MWF.xApplication.ExeManager.LP.main.topBartitle
	},
	onQueryLoad: function(){
		this.lp = MWF.xApplication.ExeManager.LP;
	},
	loadApplication: function(callback){
		this.restActions = new MWF.xApplication.ExeManager.Actions.RestActions();

		this.createContainer();
		this.createTopBar();
		//this.createMiddleContent();
	},
	createContainer : function(){
		if( !this.container ){
			this.content.setStyle("overflow", "hidden");
			this.container = new Element("div", {
				"styles": this.css.container
			}).inject(this.content);
		}
	},
	createTopBar: function(){
		this.currentTopBarTab = "todo";
		if( this.topBar ){
			this.topBar.empty();
		}else{
			this.topBar = new Element("div.topBar", {
				"styles": this.css.topBar
			}).inject(this.container);
		}

		this.topBarContent = new Element("div", {"styles": this.css.topBarContent}).inject(this.topBar);
		this.topBarTitleLi = new Element("li", {"styles": this.css.topBarTitleLi}).inject(this.topBarContent);
		this.topBarLog = new Element("img",{"styles": this.css.topBarLog,"src": this.path+"default/icon/okr.png"}).inject(this.topBarTitleLi);
		this.topBarTitleSpan = new Element("span",{	"styles": this.css.topBarTitleSpan,"text":this.lp.main.topBartitle}).inject(this.topBarTitleLi);

		var topList = this.lp.main.topBarList;
		for(var l in topList){
			var topBarLi = new Element("li.topBarLi",{"styles": this.css.topBarLi,"id":l}).inject(this.topBarContent);
			var _self = this
			topBarLi.addEvents({
				"mouseover":function(){ //alert(_self.currentTopBarTab)
					if(_self.currentTopBarTab!=this.get("id")){
						this.setStyles({"background-color":"#124c93"})
					}
				},
				"mouseout":function(){
					if(_self.currentTopBarTab!=this.get("id")){
						this.setStyles({"background-color":"#5c97e1"})
					}
				},
				"click" : function(){
					_self.openContent( this );
				}
			})
			//this.topBarTodoImg = new Element("img",{"styles": this.css.topBarTodoImg,"src": this.path+"default/icon/Outline-104.png"}).inject(this.topBarTodoLi);
			var topBarSpan = new Element("span",{"styles": this.css.topBarSpan,"text":topList[l]}).inject(topBarLi);
		}

		this.topBarContent.getElementById("topTodo").click()

	},
	openContent: function(obj){
		this.currentTopBarTab = obj.get("id")
		this.topBarContent.getElements("li").each(function(d){
			if(d.className=="topBarLi"){
				d.setStyles({"background-color":"#5c97e1"})
			}
		})
		obj.setStyles({"background-color":"#124c93"})

		if( !this.middleContent ){
			this.middleContent = new Element("div.middleContent",{
				"styles": this.css.middleContent
			}).inject(this.container)
		}

		if(this.currentTopBarTab=="topTodo"){
			if(this.middleContent){
				this.middleContent.empty()
			}
			MWF.xDesktop.requireApp("ExeManager", "TodoList", function(){
				var explorer = new MWF.xApplication.ExeManager.TodoList(this.middleContent, this, this.restActions, {});
				explorer.load();
			}.bind(this), true);
		}else if(this.currentTopBarTab=="topCenterWork"){
			if(this.middleContent)this.middleContent.empty();
			MWF.xDesktop.requireApp("ExeManager", "CenterWorkList", function(){
				var explorer = new MWF.xApplication.ExeManager.CenterWorkList(this.middleContent, this, this.restActions, {});
				explorer.load();
			}.bind(this) ,true);
		}else if(this.currentTopBarTab=="topBaseWork"){
			if(this.middleContent)this.middleContent.empty();
			MWF.xDesktop.requireApp("ExeManager", "BaseWorkList", function(){
				var explorer = new MWF.xApplication.ExeManager.BaseWorkList(this.middleContent, this, this.restActions, {});
				explorer.load();
			}.bind(this) ,true);
		}
	},
	createMiddleContent: function(){
		if( !this.middleContent ){
			this.middleContent = new Element("div.middleContent",{
				"styles": this.css.middleContent
			}).inject(this.container)
		}
	}
});
