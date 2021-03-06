MWF.xApplication.cms.FormDesigner = MWF.xApplication.cms.FormDesigner || {};
MWF.CMSFD = MWF.xApplication.cms.FormDesigner;
MWF.CMSFD.options = {
	"multitask": true,
	"executable": false
};
MWF.xDesktop.requireApp("cms.ColumnManager", "Actions.RestActions", null, false);
MWF.xDesktop.requireApp("cms.FormDesigner", "Module.Package", null, false);
MWF.xApplication.cms.FormDesigner.Main = new Class({
	Extends: MWF.xApplication.Common.Main,
	Implements: [Options, Events],
	options: {
		"style": "default",
        "template": "template.json",
		"name": "cms.FormDesigner",
		"icon": "icon.png",
		"title": MWF.CMSFD.LP.title,
		"appTitle": MWF.CMSFD.LP.title,
		"id": "",
		"actions": null,
		"category": null,
		"processData": null
	},
	onQueryLoad: function(){
        this.shortcut = true;
		if (this.status){
			this.options.id = this.status.id;
		}
		if (!this.options.id){
			this.options.desktopReload = false;
			this.options.title = this.options.title + "-"+MWF.CMSFD.LP.newForm;
		}
		this.actions = new MWF.xApplication.cms.ColumnManager.Actions.RestActions();
		//alert(this.options.id)
		this.lp = MWF.xApplication.cms.FormDesigner.LP;
//		this.processData = this.options.processData;
	},
	
	loadApplication: function(callback){
		this.createNode();
		if (!this.options.isRefresh){
			this.maxSize(function(){
				this.openForm();
			}.bind(this));
		}else{
			this.openForm();
		}

        this.addKeyboardEvents();
		if (callback) callback();
	},
    addKeyboardEvents: function(){
        this.addEvent("copy", function(){
            this.copyModule();
        }.bind(this));
        this.addEvent("paste", function(){
            this.pasteModule();
        }.bind(this));
        this.addEvent("cut", function(){
            this.cutModule();
        }.bind(this));
        this.addEvent("keySave", function(e){
            this.keySave(e);
        }.bind(this));
        this.addEvent("keyDelete", function(e){
            this.keyDelete(e);
        }.bind(this));
    },
    keySave: function(e){
        if (this.shortcut) {
            if (this.form) this.saveForm();
            e.preventDefault();
        }
    },
    keyDelete: function(e){
        if (this.form){
            if (this.shortcut){
                if (this.form.currentSelectedModule){
                    var module = this.form.currentSelectedModule;
                    if (module.moduleType!="form" && module.moduleName.indexOf("$")==-1){
                        module["delete"](module.node);
                    }
                }
            }
        }
    },
    copyModule: function(){
        if (this.shortcut) {
            if (this.form) {
                //           if (this.form.isFocus){
                if (this.form.currentSelectedModule) {
                    var module = this.form.currentSelectedModule;
                    if (module.moduleType != "form" && module.moduleName.indexOf("$") == -1) {
                        var html = module.getHtml();
                        var json = module.getJson();

                        MWF.clipboard.data = {
                            "type": "form",
                            "data": {
                                "html": html,
                                "json": json
                            }
                        };
                    } else {
                        MWF.clipboard.data = null;
                    }
                }
                //          }
            }
        }
    },
    cutModule: function(){
        if (this.shortcut) {
            if (this.form) {
                //          if (this.form.isFocus){
                if (this.form.currentSelectedModule) {
                    var module = this.form.currentSelectedModule;
                    if (module.moduleType != "form" && module.moduleName.indexOf("$") == -1) {
                        this.copyModule();
                        module.destroy();
                        module.form.selected();
                    }
                }
                //           }
            }
        }
    },
    pasteModule: function(){
        if (this.shortcut) {
            if (this.form) {
                //    if (this.form.isFocus){
                if (MWF.clipboard.data) {
                    if (MWF.clipboard.data.type == "form") {
                        var html = MWF.clipboard.data.data.html;
                        var json = Object.clone(MWF.clipboard.data.data.json);
                        var tmpNode = Element("div", {
                            "styles": {"display": "none"},
                            "html": html
                        }).inject(this.content);

                        Object.each(json, function (moduleJson) {
                            var oid = moduleJson.id;
                            var id = moduleJson.id;
                            var idx = 1;
                            while (this.form.json.moduleList[id]) {
                                id = oid + "_" + idx;
                                idx++;
                            }

                            if (oid != id) {
                                moduleJson.id = id;
                                var moduleNode = tmpNode.getElementById("#" + oid);
                                //var moduleNode = tmpNode.getElement("#" + oid);
                                if (moduleNode) moduleNode.set("id", id);
                            }
                            this.form.json.moduleList[moduleJson.id] = moduleJson;
                        }.bind(this));
                        delete json;

                        var injectNode = this.form.node;
                        var where = "bottom";
                        var parent = this.form;
                        if (this.form.currentSelectedModule) {
                            var toModule = this.form.currentSelectedModule;
                            injectNode = toModule.node;
                            parent = toModule;

                            if (toModule.moduleType != "container" && toModule.moduleType != "form") {
                                where = "after";
                                parent = toModule.parentContainer;
                            }
                        }
                        var copyModuleNode = tmpNode.getFirst();
                        while (copyModuleNode) {
                            copyModuleNode.inject(injectNode, where);
                            var copyModuleJson = this.form.getDomjson(copyModuleNode);
                            module = this.form.loadModule(copyModuleJson, copyModuleNode, parent);
                            module._setEditStyle_custom("id");
                            module.selected();
                            //loadModule: function(json, dom, parent)

                            copyModuleNode = tmpNode.getFirst();
                        }
                        tmpNode.destroy();
                        delete tmpNode;
                    }
                }
                //      }
            }
        }
    },
	createNode: function(){
		this.content.setStyle("overflow", "hidden");
		this.node = new Element("div", {
			"styles": {"width": "100%", "height": "100%", "overflow": "hidden"}
		}).inject(this.content);
	},
	openForm: function(){
		this.initOptions();
		this.loadNodes();
		this.loadToolbar();
		this.loadFormNode();
		this.loadProperty();
		this.loadTools();
		this.resizeNode();
		this.addEvent("resize", this.resizeNode.bind(this));
		this.loadForm();
		
		if (this.toolbarContentNode){
			this.setScrollBar(this.toolbarContentNode, null, {
				"V": {"x": 0, "y": 0},
				"H": {"x": 0, "y": 0}
			});
			//this.setScrollBar(this.propertyDomScrollArea, "form_property", {
			//	"V": {"x": 0, "y": 0},
			//	"H": {"x": 0, "y": 0}
			//});
            MWF.require("MWF.widget.ScrollBar", function(){
                new MWF.widget.ScrollBar(this.propertyDomScrollArea, {
                    "style":"default", "where": "before", "distance": 30, "friction": 4, "indent": false, "axis": {"x": false, "y": true}
                });
            }.bind(this));
		}
	},
	initOptions: function(){
		this.toolsData = null;
		this.toolbarMode = "all";
		this.tools = [];
		this.toolbarDecrease = 0;
		
		this.designNode = null;
		this.form = null;
	},
	loadNodes: function(){
		this.toolbarNode = new Element("div", {
			"styles": this.css.toolbarNode,
			"events": {"selectstart": function(e){e.preventDefault();}}
		}).inject(this.node);
		this.propertyNode = new Element("div", {
			"styles": this.css.propertyNode
		}).inject(this.node)
		this.formNode = new Element("div", {
			"styles": this.css.formNode
		}).inject(this.node);

        if (this.options.style=="bottom") this.propertyNode.inject(this.formNode, "after");
	},
	
	//loadToolbar----------------------
	loadToolbar: function(){
		this.toolbarTitleNode = new Element("div", {
			"styles": this.css.toolbarTitleNode,
			"text": MWF.CMSFD.LP.tools
		}).inject(this.toolbarNode);
		
		this.toolbarTitleActionNode = new Element("div", {
			"styles": this.css.toolbarTitleActionNode,
			"events": {
				"click": function(e){
					this.switchToolbarMode();
				}.bind(this)
			}
		}).inject(this.toolbarNode);
		
		this.toolbarContentNode = new Element("div", {
			"styles": this.css.toolbarContentNode,
			"events": {
				"selectstart": function(e){
                    e.preventDefault();
                    e.stopPropagation();
				}
			}
		}).inject(this.toolbarNode);
	},
	switchToolbarMode: function(){
		if (this.toolbarMode=="all"){
			var size = this.toolbarNode.getSize();
			this.toolbarDecrease = (size.x.toFloat())-60;
			
			this.tools.each(function(node){
				node.getLast().setStyle("display", "none");
			});
			this.toolbarTitleNode.set("text", "");
			
			this.toolbarNode.setStyle("width", "60px");
			
			var formMargin = this.formNode.getStyle("margin-left").toFloat();
			formMargin = formMargin - this.toolbarDecrease;
			
			this.formNode.setStyle("margin-left", ""+formMargin+"px");
			
			this.toolbarTitleActionNode.setStyles(this.css.toolbarTitleActionNodeRight);
			
			this.toolbarMode="simple";
		}else{
			sizeX = 60 + this.toolbarDecrease;
			var formMargin = this.formNode.getStyle("margin-left").toFloat();
			formMargin = formMargin + this.toolbarDecrease;
			
			this.toolbarNode.setStyle("width", ""+sizeX+"px");
			this.formNode.setStyle("margin-left", ""+formMargin+"px");
			
			this.tools.each(function(node){
				node.getLast().setStyle("display", "block");
			});
			
			this.toolbarTitleNode.set("text", MWF.CMSFD.LP.tools);
			
			this.toolbarTitleActionNode.setStyles(this.css.toolbarTitleActionNode);
			this.toolbarMode="all";
		}
		
	},
	
	//loadFormNode------------------------------
	loadFormNode: function(){
		this.formToolbarNode = new Element("div", {
			"styles": this.css.formToolbarNode
		}).inject(this.formNode);
		this.loadFormToolbar();
		
		this.formContentNode = new Element("div", {
			"styles": this.css.formContentNode
		}).inject(this.formNode);
		this.loadFormContent(function(){
			if (this.designDcoument) this.designDcoument.body.setStyles(this.css.designBody);
			if (this.designNode) this.designNode.setStyles(this.css.designNode);
		}.bind(this));
	},
    loaddesignerActionNode: function(){
        this.pcDesignerActionNode = this.formToolbarNode.getElement("#MWFFormPCDesignerAction");
        this.mobileDesignerActionNode = this.formToolbarNode.getElement("#MWFFormMobileDesignerAction");
        this.currentDesignerMode = "PC";

        this.pcDesignerActionNode.setStyles(this.css.designerActionNode_current);
        this.mobileDesignerActionNode.setStyles(this.css.designerActionNode);

        var iconNode = new Element("div", {"styles": this.css.designerActionPcIconNode}).inject(this.pcDesignerActionNode);
        iconNode = new Element("div", {"styles": this.css.designerActionMobileIconNode}).inject(this.mobileDesignerActionNode);

        var textNode = new Element("div", {"styles": this.css.designerActiontextNode, "text": "PC"}).inject(this.pcDesignerActionNode);
        textNode = new Element("div", {"styles": this.css.designerActiontextNode, "text": "Mobile"}).inject(this.mobileDesignerActionNode);

        this.pcDesignerActionNode.addEvent("click", function(){
            if (this.currentDesignerMode!="PC"){
                this.changeDesignerModeToPC();
            }
        }.bind(this));
        this.mobileDesignerActionNode.addEvent("click", function(){
            if (this.currentDesignerMode=="PC"){
                this.changeDesignerModeToMobile();
            }
        }.bind(this));
    },
    changeDesignerModeToPC: function(){
        this.pcDesignerActionNode.setStyles(this.css.designerActionNode_current);
        this.mobileDesignerActionNode.setStyles(this.css.designerActionNode);

        this.designMobileNode.setStyle("display", "none");
        this.designNode.setStyle("display", "block");

        if (this.form.currentSelectedModule){
            if (this.form.currentSelectedModule==this){
                return true;
            }else{
                this.form.currentSelectedModule.unSelected();
            }
        }
        if (this.form.propertyMultiTd){
            this.form.propertyMultiTd.hide();
            this.form.propertyMultiTd = null;
        }
        this.form.unSelectedMulti();

        this.form = this.pcForm;

        this.currentDesignerMode = "PC";
    },

    changeDesignerModeToMobile: function(){
        this.pcDesignerActionNode.setStyles(this.css.designerActionNode);
        this.mobileDesignerActionNode.setStyles(this.css.designerActionNode_current);

        this.designMobileNode.setStyle("display", "block");
        this.designNode.setStyle("display", "none");

        if (this.form.currentSelectedModule){
            if (this.form.currentSelectedModule==this){
                return true;
            }else{
                this.form.currentSelectedModule.unSelected();
            }
        }
        if (this.form.propertyMultiTd){
            this.form.propertyMultiTd.hide();
            this.form.propertyMultiTd = null;
        }
        this.form.unSelectedMulti();

        if (!this.mobileForm){
            this.mobileForm = new MWF.CMSFCForm(this, this.designMobileNode, {"mode": "Mobile"});
            this.mobileForm.load(this.formMobileData);
        }

        this.form = this.mobileForm;

        this.currentDesignerMode = "Mobile";
    },


	loadFormToolbar: function(callback){
		this.getFormToolbarHTML(function(toolbarNode){
			var spans = toolbarNode.getElements("span");
			spans.each(function(item, idx){
				var img = item.get("MWFButtonImage");
				if (img){
					item.set("MWFButtonImage", this.path+""+this.options.style+"/formtoolbar/"+img);
				}
			}.bind(this));

			$(toolbarNode).inject(this.formToolbarNode);
			MWF.require("MWF.widget.Toolbar", function(){
				this.formToolbar = new MWF.widget.Toolbar(toolbarNode, {"style": "ProcessCategory"}, this);
				this.formToolbar.load();

                this.loaddesignerActionNode();

				if (callback) callback();
			}.bind(this));
		}.bind(this));
	},
	getFormToolbarHTML: function(callback){
		var toolbarUrl = this.path+this.options.style+"/formToolbars.html";
		var r = new Request.HTML({
			url: toolbarUrl,
			method: "get",
			onSuccess: function(responseTree, responseElements, responseHTML, responseJavaScript){
				var toolbarNode = responseTree[0];
				if (callback) callback(toolbarNode);
			}.bind(this),
			onFailure: function(xhr){
				this.notice("request cmsToolbars error: "+xhr.responseText, "error");
			}.bind(this)
		});
		r.send();
	},
	loadFormContent: function(callback){
        //var iframe = new Element("iframe#iframeaa", {
        //    "styles": {
        //        "width": "100%",
        //        "height": "100%"
        //    },
        //    //"src": "/x_component_cms_FormDesigner/$Main/blank.html",
        //    "border": "0"
        //}).inject(this.formContentNode);

   //     window.setTimeout(function(){
   //         iframe.contentDocument.designMode = "on";
   //
   //
   //         var x = document.id("iframeaa");
   //         this.designNode = document.id(iframe.contentDocument.body, false, iframe.contentDocument);
   //         this.designNode.setStyle("margin", "0px");
   //         this.designNode.setStyles(this.css.designNode);

        this.designNode = new Element("div", {
            "styles": this.css.designNode
        }).inject(this.formContentNode);

        MWF.require("MWF.widget.ScrollBar", function(){
            new MWF.widget.ScrollBar(this.designNode, {"distance": 100});
        }.bind(this));


        this.designMobileNode = new Element("div", {
            "styles": this.css.designMobileNode
        }).inject(this.formContentNode);

        MWF.require("MWF.widget.ScrollBar", function(){
            new MWF.widget.ScrollBar(this.designMobileNode, {"distance": 50, "style": "xApp_mobileForm"});
        }.bind(this));
    //    }.bind(this), 2000);


	},
    reloadPropertyStyles: function(){
        //MWF.release(this.css);
        this.css = null;
        this.cssPath = "/x_component_"+this.options.name.replace(/\./g, "_")+"/$Main/"+this.options.style+"/css.wcss";
        this._loadCss();

        if (this.options.style=="bottom"){
            this.propertyNode.inject(this.formNode, "after");
            this.propertyTitleNode.setStyle("cursor", "row-resize");
            this.loadPropertyResizeBottom();

        }else{
            this.propertyNode.inject(this.formNode, "before");
            this.propertyTitleNode.setStyle("cursor", "default");
            if (this.propertyResizeBottom) this.propertyResizeBottom.detach();
        }

        this.formNode.clearStyles(false);
        this.formNode.setStyles(this.css.formNode);

        this.propertyNode.clearStyles(false);
        this.propertyNode.setStyles(this.css.propertyNode);

        this.propertyTitleNode.clearStyles(false);
        this.propertyTitleNode.setStyles(this.css.propertyTitleNode);

        this.propertyResizeBar.clearStyles(false);
        this.propertyResizeBar.setStyles(this.css.propertyResizeBar);

        this.propertyContentNode.clearStyles(false);
        this.propertyContentNode.setStyles(this.css.propertyContentNode);

        this.propertyDomContentArea.clearStyles(false);
        this.propertyDomContentArea.setStyles(this.css.propertyDomContentArea);

        this.propertyDomScrollArea.clearStyles(false);
        this.propertyDomScrollArea.setStyles(this.css.propertyDomScrollArea);

        this.propertyDomArea.clearStyles(false);
        this.propertyDomArea.setStyles(this.css.propertyDomArea);

        this.propertyContentArea.clearStyles(false);
        this.propertyContentArea.setStyles(this.css.propertyContentArea);

        this.propertyContentResizeNode.clearStyles(false);
        this.propertyContentResizeNode.setStyles(this.css.propertyContentResizeNode);

        this.propertyTitleActionNode.clearStyles(false);
        this.propertyTitleActionNode.setStyles(this.css.propertyTitleActionNode);

        this.resizeNode();
    },
	//loadProperty------------------------
	loadProperty: function(){
        this.propertyTitleActionNode = new Element("div", {
            "styles": this.css.propertyTitleActionNode
        }).inject(this.propertyNode);
        this.propertyTitleActionNode.addEvent("click", function(){
            this.options.style = (this.options.style=="default") ? "bottom" : "default";
            MWF.UD.putData("formDesignerStyle", {"style": this.options.style});
            this.reloadPropertyStyles();
        }.bind(this));

		this.propertyTitleNode = new Element("div", {
			"styles": this.css.propertyTitleNode,
			"text": MWF.CMSFD.LP.property
		}).inject(this.propertyNode);
        if (this.options.style=="bottom"){
            this.propertyTitleNode.setStyle("cursor", "row-resize");
            this.loadPropertyResizeBottom();
        }
		
		this.propertyResizeBar = new Element("div", {
			"styles": this.css.propertyResizeBar
		}).inject(this.propertyNode);
		this.loadPropertyResize();
		
		this.propertyContentNode = new Element("div", {
			"styles": this.css.propertyContentNode
		}).inject(this.propertyNode);

        this.propertyDomContentArea = new Element("div", {
            "styles": this.css.propertyDomContentArea
        }).inject(this.propertyContentNode);

        this.propertyDomScrollArea = new Element("div", {
            "styles": this.css.propertyDomScrollArea
        }).inject(this.propertyDomContentArea);

		this.propertyDomArea = new Element("div", {
			"styles": this.css.propertyDomArea
		}).inject(this.propertyDomScrollArea);
		
		this.propertyDomPercent = 0.3;
		this.propertyContentResizeNode = new Element("div", {
			"styles": this.css.propertyContentResizeNode
		}).inject(this.propertyContentNode);
		
		this.propertyContentArea = new Element("div", {
			"styles": this.css.propertyContentArea
		}).inject(this.propertyContentNode);


		this.loadPropertyContentResize();
	},
    loadPropertyResizeBottom: function(){
        if (!this.propertyResizeBottom){
            this.propertyResizeBottom = new Drag(this.propertyTitleNode,{
                "snap": 1,
                "onStart": function(el, e){
                    var x = (Browser.name=="firefox") ? e.event.clientX : e.event.x;
                    var y = (Browser.name=="firefox") ? e.event.clientY : e.event.y;
                    el.store("position", {"x": x, "y": y});

                    var size = this.propertyNode.getSize();
                    el.store("initialWidth", size.x);
                    el.store("initialHeight", size.y);
                }.bind(this),
                "onDrag": function(el, e){
                    //   var x = e.event.x;
                    var y = (Browser.name=="firefox") ? e.event.clientY : e.event.y;
                    var bodySize = this.content.getSize();
                    var position = el.retrieve("position");
                    var initialHeight = el.retrieve("initialHeight").toFloat();
                    var dy = position.y.toFloat()-y.toFloat();

                    var height = initialHeight+dy;
                    if (height> bodySize.y/1.5) height =  bodySize.y/1.5;
                    if (height<40) height = 40;

                    var percent = 1-(height/bodySize.y);
                    this.resizeNode(percent);

                    //var formNodeHeight = bodySize.y-height;
                    //this.formNode.setStyle("height", ""+formNodeHeight+"px");
                    //this.propertyNode.setStyle("height", ""+height+"px");
                }.bind(this)
            });
        }else{
            this.propertyResizeBottom.attach();
        }
    },
	loadPropertyResize: function(){
//		var size = this.propertyNode.getSize();
//		var position = this.propertyResizeBar.getPosition();
		this.propertyResize = new Drag(this.propertyResizeBar,{
			"snap": 1,
			"onStart": function(el, e){
				var x = (Browser.name=="firefox") ? e.event.clientX : e.event.x;
				var y = (Browser.name=="firefox") ? e.event.clientY : e.event.y;
				el.store("position", {"x": x, "y": y});
				
				var size = this.propertyNode.getSize();
				el.store("initialWidth", size.x);
			}.bind(this),
			"onDrag": function(el, e){
				var x = (Browser.name=="firefox") ? e.event.clientX : e.event.x;
//				var y = e.event.y;
				var bodySize = this.content.getSize();
				var position = el.retrieve("position");
				var initialWidth = el.retrieve("initialWidth").toFloat();
				var dx = position.x.toFloat()-x.toFloat();
				
				var width = initialWidth+dx;
				if (width> bodySize.x/2) width =  bodySize.x/2;
				if (width<40) width = 40;
				this.formNode.setStyle("margin-right", width+1);
				this.propertyNode.setStyle("width", width);
			}.bind(this)
		});
	},
    propertyResizeDragTopBottom: function(el, e){
        var size = this.propertyContentNode.getSize();

        //			var x = e.event.x;
        var y = e.event.y;
        var position = el.retrieve("position");
        var dy = y.toFloat()-position.y.toFloat();

        var initialHeight = el.retrieve("initialHeight").toFloat();
        var height = initialHeight+dy;
        if (height<40) height = 40;
        if (height> size.y-40) height = size.y-40;

        this.propertyDomPercent = height/size.y;

        this.setPropertyContentResize();
    },
    propertyResizeDragLeftRight: function(el, e){
        var size = this.propertyContentNode.getSize();
        var x = (Browser.name=="firefox") ? e.event.clientX : e.event.x;
        //var y = e.event.y;
        var position = el.retrieve("position");
        var dx = x.toFloat()-position.x.toFloat();

        var initialWidth = el.retrieve("initialWidth").toFloat();
        var width = initialWidth+dx;
        if (width<40) width = 40;
        if (width> size.x-40) width = size.x-40;

        this.propertyDomPercent = width/size.x;

        this.setPropertyContentResizeBottom();
    },
	loadPropertyContentResize: function(){
		this.propertyContentResize = new Drag(this.propertyContentResizeNode, {
			"snap": 1,
			"onStart": function(el, e){
				var x = (Browser.name=="firefox") ? e.event.clientX : e.event.x;
				var y = (Browser.name=="firefox") ? e.event.clientY : e.event.y;
				el.store("position", {"x": x, "y": y});
				
				var size = this.propertyDomContentArea.getSize();
				el.store("initialHeight", size.y);
                el.store("initialWidth", size.x);
			}.bind(this),
			"onDrag": function(el, e){
                if (this.options.style=="bottom"){
                    this.propertyResizeDragLeftRight(el, e);
                }else{
                    this.propertyResizeDragTopBottom(el, e);
                }
			}.bind(this)
		});
	},
    setPropertyContentResizeBottom: function(){
        var size = this.propertyContentNode.getSize();
        var resizeNodeSize = this.propertyContentResizeNode.getSize();
        var width = size.x-resizeNodeSize.x-6;

        var domWidth = this.propertyDomPercent*width;
        var contentMargin = domWidth+resizeNodeSize.x+6;

        this.propertyDomContentArea.setStyle("width", ""+domWidth+"px");
        this.propertyContentArea.setStyle("margin-left", ""+contentMargin+"px");
    },
	setPropertyContentResize: function(){
		var size = this.propertyContentNode.getSize();
		var resizeNodeSize = this.propertyContentResizeNode.getSize();
		var height = size.y-resizeNodeSize.y;
		
		var domHeight = this.propertyDomPercent*height;
		var contentHeight = height-domHeight;
		
		this.propertyDomContentArea.setStyle("height", ""+domHeight+"px");
        this.propertyDomScrollArea.setStyle("height", ""+domHeight+"px");
		this.propertyContentArea.setStyle("height", ""+contentHeight+"px");
		
		if (this.form){
			if (this.form.currentSelectedModule){
				if (this.form.currentSelectedModule.property){
					var tab = this.form.currentSelectedModule.property.propertyTab;
					if (tab){
						var tabTitleSize = tab.tabNodeContainer.getSize();
						
						tab.pages.each(function(page){
							var topMargin = page.contentNodeArea.getStyle("margin-top").toFloat();
							var bottomMargin = page.contentNodeArea.getStyle("margin-bottom").toFloat();
							
							var tabContentNodeAreaHeight = contentHeight - topMargin - bottomMargin - tabTitleSize.y.toFloat()-15;
							page.contentNodeArea.setStyle("height", tabContentNodeAreaHeight);
						}.bind(this));
						
					}
				}
			}
		}
	},
	
	//loadTools------------------------------
	loadTools: function(){
		var designer = this;
		this.getTools(function(){
			Object.each(this.toolsData, function(value, key){
				var toolNode = new Element("div", {
					"styles": this.css.toolbarToolNode,
					"title": value.text,
					"events": {
						"mouseover": function(e){
							try {
								this.setStyles(designer.css.toolbarToolNodeOver);
							}catch(e){
								this.setStyles(designer.css.toolbarToolNodeOverCSS2);
							};
						},
						"mouseout": function(e){
							try {
								this.setStyles(designer.css.toolbarToolNode);
							}catch(e){};
						},
						"mousedown": function(e){
							try {
								this.setStyles(designer.css.toolbarToolNodeDown);
							}catch(e){
								this.setStyles(designer.css.toolbarToolNodeDownCSS2);
							};
						},
						"mouseup": function(e){
							try {
								this.setStyles(designer.css.toolbarToolNodeUp);
							}catch(e){
								this.setStyles(designer.css.toolbarToolNodeUpCSS2);
							};
						}
					}
				}).inject(this.toolbarContentNode);
				toolNode.store("toolClass", value.className);
				
				var iconNode = new Element("div", {
					"styles": this.css.toolbarToolIconNode
				}).inject(toolNode);
				iconNode.setStyle("background-image", "url("+this.path+this.options.style+"/icon/"+value.icon+")");
				
				var textNode = new Element("div", {
					"styles": this.css.toolbarToolTextNode,
					"text": value.text
				});
				textNode.inject(toolNode);
				
//				var designer = this;
				toolNode.addEvent("mousedown", function(e){

					var className = this.retrieve("toolClass");
					designer.form.createModule(className, e);
				});
				
				this.tools.push(toolNode);
			}.bind(this));
		}.bind(this));
	},
	getTools: function(callback){

		if (this.toolsData){
			if (callback) callback();
		}else{
			var toolsDataUrl = this.path+this.options.style+"/tools.json";
			var r = new Request.JSON({
				url: toolsDataUrl,
				secure: false,
				async: false,
				method: "get",
				noCache: true,
				onSuccess: function(responseJSON, responseText){
					this.toolsData = responseJSON;
					if (callback) callback();
				}.bind(this),
				onError: function(text, error){
					this.notice("request tools data error: "+error, "error");
				}.bind(this)
			});
			r.send();
		}
	},
	
	//resizeNode------------------------------------------------
    resizeNodeLeftRight: function(){
        var nodeSize = this.node.getSize();
        this.toolbarNode.setStyle("height", ""+nodeSize.y+"px");
        this.formNode.setStyle("height", ""+nodeSize.y+"px");
        this.propertyNode.setStyle("height", ""+nodeSize.y+"px");
        //nodeSize = {"x": nodeSize.x, "y": nodeSize.y*0.6};

        var formToolbarMarginTop = this.formToolbarNode.getStyle("margin-top").toFloat();
        var formToolbarMarginBottom = this.formToolbarNode.getStyle("margin-bottom").toFloat();
        var allFormToolberSize = this.formToolbarNode.getComputedSize();
        var y = nodeSize.y - allFormToolberSize.totalHeight - formToolbarMarginTop - formToolbarMarginBottom;
        this.formContentNode.setStyle("height", ""+y+"px");

        if (this.designNode){
            var designMarginTop = this.designNode.getStyle("margin-top").toFloat();
            var designMarginBottom = this.designNode.getStyle("margin-bottom").toFloat();
            y = nodeSize.y - allFormToolberSize.totalHeight - formToolbarMarginTop - formToolbarMarginBottom - designMarginTop - designMarginBottom;
            this.designNode.setStyle("height", ""+y+"px");
        }


        var titleSize = this.toolbarTitleNode.getSize();
        var titleMarginTop = this.toolbarTitleNode.getStyle("margin-top").toFloat();
        var titleMarginBottom = this.toolbarTitleNode.getStyle("margin-bottom").toFloat();
        var titlePaddingTop = this.toolbarTitleNode.getStyle("padding-top").toFloat();
        var titlePaddingBottom = this.toolbarTitleNode.getStyle("padding-bottom").toFloat();

        y = titleSize.y+titleMarginTop+titleMarginBottom+titlePaddingTop+titlePaddingBottom;
        y = nodeSize.y-y;
        this.toolbarContentNode.setStyle("height", ""+y+"px");


        titleSize = this.propertyTitleNode.getSize();
        titleMarginTop = this.propertyTitleNode.getStyle("margin-top").toFloat();
        titleMarginBottom = this.propertyTitleNode.getStyle("margin-bottom").toFloat();
        titlePaddingTop = this.propertyTitleNode.getStyle("padding-top").toFloat();
        titlePaddingBottom = this.propertyTitleNode.getStyle("padding-bottom").toFloat();

        y = titleSize.y+titleMarginTop+titleMarginBottom+titlePaddingTop+titlePaddingBottom;
        y = nodeSize.y-y;
        this.propertyContentNode.setStyle("height", ""+y+"px");
        this.propertyResizeBar.setStyle("height", ""+y+"px");
    },
    resizeNodeTopBottom: function(percent){
        var nodeSize = this.node.getSize();
        this.toolbarNode.setStyle("height", ""+nodeSize.y+"px");

        var percentNumber = percent || 0.6
        var designerHeight = nodeSize.y*percentNumber;
        var propertyHeight = nodeSize.y - designerHeight;

        this.formNode.setStyle("height", ""+designerHeight+"px");
        this.propertyNode.setStyle("height", ""+propertyHeight+"px");

        var formToolbarMarginTop = this.formToolbarNode.getStyle("margin-top").toFloat();
        var formToolbarMarginBottom = this.formToolbarNode.getStyle("margin-bottom").toFloat();
        var allFormToolberSize = this.formToolbarNode.getComputedSize();
        var y = designerHeight - allFormToolberSize.totalHeight - formToolbarMarginTop - formToolbarMarginBottom;
    //    this.formContentNode.setStyle("height", ""+designerHeight+"px");

        if (this.designNode){
            var designMarginTop = this.designNode.getStyle("margin-top").toFloat();
            var designMarginBottom = this.designNode.getStyle("margin-bottom").toFloat();
            y = designerHeight - allFormToolberSize.totalHeight - formToolbarMarginTop - formToolbarMarginBottom - designMarginTop - designMarginBottom;
            this.designNode.setStyle("height", ""+y+"px");
        }

        var titleSize = this.toolbarTitleNode.getSize();
        var titleMarginTop = this.toolbarTitleNode.getStyle("margin-top").toFloat();
        var titleMarginBottom = this.toolbarTitleNode.getStyle("margin-bottom").toFloat();
        var titlePaddingTop = this.toolbarTitleNode.getStyle("padding-top").toFloat();
        var titlePaddingBottom = this.toolbarTitleNode.getStyle("padding-bottom").toFloat();

        y = titleSize.y+titleMarginTop+titleMarginBottom+titlePaddingTop+titlePaddingBottom;
        y = nodeSize.y-y;
        this.toolbarContentNode.setStyle("height", ""+y+"px");



        titleSize = this.propertyTitleNode.getSize();
        titleMarginTop = this.propertyTitleNode.getStyle("margin-top").toFloat();
        titleMarginBottom = this.propertyTitleNode.getStyle("margin-bottom").toFloat();
        titlePaddingTop = this.propertyTitleNode.getStyle("padding-top").toFloat();
        titlePaddingBottom = this.propertyTitleNode.getStyle("padding-bottom").toFloat();

        y = titleSize.y+titleMarginTop+titleMarginBottom+titlePaddingTop+titlePaddingBottom;
        y = propertyHeight-y;
        this.propertyContentNode.setStyle("height", ""+y+"px");
        this.propertyResizeBar.setStyle("height", ""+y+"px");

        this.propertyDomContentArea.setStyle("height", ""+y+"px");
        this.propertyDomScrollArea.setStyle("height", ""+y+"px");

        this.propertyContentResizeNode.setStyle("height", ""+y+"px");
        this.propertyContentArea.setStyle("height", ""+y+"px");

        if (this.form){
            if (this.form.currentSelectedModule){
                if (this.form.currentSelectedModule.property){
                    var tab = this.form.currentSelectedModule.property.propertyTab;
                    if (tab){
                        var tabTitleSize = tab.tabNodeContainer.getSize();

                        tab.pages.each(function(page){
                            var topMargin = page.contentNodeArea.getStyle("margin-top").toFloat();
                            var bottomMargin = page.contentNodeArea.getStyle("margin-bottom").toFloat();

                            var tabContentNodeAreaHeight = y - topMargin - bottomMargin - tabTitleSize.y.toFloat()-15;
                            page.contentNodeArea.setStyle("height", tabContentNodeAreaHeight);
                        }.bind(this));

                    }
                }
            }
        }

    },

	resizeNode: function(percent){
		if (this.options.style=="bottom"){
            this.resizeNodeTopBottom(percent);
            this.setPropertyContentResizeBottom();
        }else{
            this.resizeNodeLeftRight(percent);
            this.setPropertyContentResize();
        }
	},
	
	//loadForm------------------------------------------
	loadForm: function(){

//		try{
		this.getFormData(function(){
			this.pcForm = new MWF.CMSFCForm(this, this.designNode);
			this.pcForm.load(this.formData);

            this.form = this.pcForm;
		}.bind(this));
			
//		}catch(e){
//			layout.notice("error", {x: "right", y:"top"}, e.message, this.designNode);
//		}
		
		
//		MWF.getJSON(COMMON.contentPath+"/res/js/testform.json", {
//			"onSuccess": function(obj){
//				this.form = new MWF.CMSFCForm(this);
//				this.form.load(obj);
//			}.bind(this),
//			"onerror": function(text){
//				layout.notice("error", {x: "right", y:"top"}, text, this.designNode);
//			}.bind(this),
//			"onRequestFailure": function(xhr){
//				layout.notice("error", {x: "right", y:"top"}, xhr.responseText, this.designNode);
//			}
//		});
	},
	getFormData: function(callback){
		if (!this.options.id){
			this.loadNewFormData(callback);
		}else{
			this.loadFormData(callback);
		}
	},
	loadNewFormData: function(callback){
        var url = "/x_component_cms_FormDesigner/Module/Form/template/"+this.options.template;
		//MWF.getJSON("/x_component_process_FormDesigner/Module/Form/template.json", {
        MWF.getJSON(url, {
			"onSuccess": function(obj){
				this.formData = obj.pcData;
                this.formData.id="";
                this.formData.isNewForm = true;

                this.formMobileData = obj.mobileData;
                this.formMobileData.id="";
                this.formMobileData.isNewForm = true;
				if (callback) callback();
			}.bind(this),
			"onerror": function(text){
				this.notice(text, "error");
			}.bind(this),
			"onRequestFailure": function(xhr){
				this.notice(xhr.responseText, "error");
			}.bind(this)
		});
	},
	loadFormData: function(callback){
		this.actions.getForm(this.options.id, function(form){
			if (form){

				this.formData = JSON.decode(MWF.decodeJsonString(form.data.data));
				this.formData.isNewForm = false;
				this.formData.json.id = form.data.id;

                if (form.data.mobileData){
                    this.formMobileData = JSON.decode(MWF.decodeJsonString(form.data.mobileData));
                    this.formMobileData.isNewForm = false;
                    this.formMobileData.json.id = form.data.id;
                }else{
                    this.formMobileData = Object.clone(this.formData);
                }


				this.setTitle(this.options.appTitle + "-"+this.formData.json.name);
				this.taskitem.setText(this.options.appTitle + "-"+this.formData.json.name);
				this.options.appTitle = this.options.appTitle + "-"+this.formData.json.name;

               // alert( this.column )
                //alert( this.application )
                //alert( JSON.stringify(form.data.application ))

                if (!this.application){
                    this.actions.getColumn(form.data.application || { id : form.data.appId } , function(json){
                        this.application = {"name": json.data.name, "id": json.data.id};
                        if (callback) callback();
                    }.bind(this));
                }else{
                    if (callback) callback();
                }

				//this.actions.getFormCategory(this.formData.json.formCategory, function(category){
				//	this.category = {"data": {"name": category.data.name, "id": category.data.id}};
				//	if (callback) callback();
				//}.bind(this));
			}
		}.bind(this));
	},
	
	saveForm: function(){
        var pcData, mobileData;
        if (this.pcForm){
            this.pcForm._getFormData();
            pcData = this.pcForm.data;
        }
        if (this.mobileForm){
            this.mobileForm._getFormData();
            mobileData = this.mobileForm.data;
        }

        this.actions.saveForm(pcData, mobileData, function(responseJSON){
        	this.notice(MWF.CMSFD.LP.notice["save_success"], "ok", null, {x: "left", y:"bottom"});
        	if (!this.pcForm.json.name) this.pcForm.treeNode.setText("<"+this.json.type+"> "+this.json.id);
        	this.pcForm.treeNode.setTitle(this.pcForm.json.id);
        	this.pcForm.node.set("id", this.pcForm.json.id);

            if (this.mobileForm){
                if (!this.mobileForm.json.name) this.mobileForm.treeNode.setText("<"+this.json.type+"> "+this.json.id);
                this.mobileForm.treeNode.setTitle(this.mobileForm.json.id);
                this.mobileForm.node.set("id", this.json.id+"_"+this.options.mode);
            }

            var name = this.pcForm.json.name;
            if (this.pcForm.data.isNewForm) this.setTitle(this.options.appTitle + "-"+name);
            this.pcForm.data.isNewForm = false;
            if (this.mobileForm) this.mobileForm.data.isNewForm = false;

            this.options.desktopReload = true;
            this.options.id = this.pcForm.json.id;

            this.fireAppEvent("postSave")

        }.bind(this));



		//this.form.save(function(){
        //
		//	var name = this.form.json.name;
		//	if (this.form.data.isNewForm) this.setTitle(this.options.appTitle + "-"+name);
		//	this.form.data.isNewForm = false;
		//	this.options.desktopReload = true;
		//	this.options.id = this.form.json.id;
		//}.bind(this));
	},
	previewForm: function(){
		this.form.preview();
	},
    formExplode: function(){
        this.form.explode();
    },
	recordStatus: function(){
		return {"id": this.options.id};
	},
    onPostClose: function(){
        if (this.pcForm){
            MWF.release(this.pcForm.moduleList);
            MWF.release(this.pcForm.moduleNodeList);
            MWF.release(this.pcForm.moduleContainerNodeList);
            MWF.release(this.pcForm.moduleElementNodeList);
            MWF.release(this.pcForm.moduleComponentNodeList);
            MWF.release(this.pcForm);
        }
        if (this.mobileForm){
            MWF.release(this.mobileForm.moduleList);
            MWF.release(this.mobileForm.moduleNodeList);
            MWF.release(this.mobileForm.moduleContainerNodeList);
            MWF.release(this.mobileForm.moduleElementNodeList);
            MWF.release(this.mobileForm.moduleComponentNodeList);
            MWF.release(this.mobileForm);
        }
    }
});
