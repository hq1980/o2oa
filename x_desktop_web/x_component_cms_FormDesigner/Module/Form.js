MWF.xApplication.cms.FormDesigner.Module = MWF.xApplication.cms.FormDesigner.Module || {};
MWF.require("MWF.widget.Common", null, false);
MWF.xApplication.cms.FormDesigner.Module.Form = MWF.CMSFCForm = new Class({
	Extends: MWF.widget.Common,
	Implements: [Options, Events],
	options: {
		"style": "default",
		"propertyPath": "/x_component_cms_FormDesigner/Module/Form/form.html",
        "mode": "PC"
	},
	
	initialize: function(designer, container, options){
		this.setOptions(options);
		
		this.path = "/x_component_cms_FormDesigner/Module/Form/";
		this.cssPath = "/x_component_cms_FormDesigner/Module/Form/"+this.options.style+"/css.wcss";

		this._loadCss();
		
		this.container = null;
		this.form = this;
        this.moduleType = "form";
		
		this.moduleList = [];
		this.moduleNodeList = [];
		
		this.moduleContainerNodeList = [];
		this.moduleElementNodeList = [];
		this.moduleComponentNodeList = [];

	//	this.moduleContainerList = [];
		this.dataTemplate = {};
		
		this.designer = designer;
		this.container = container;
		
		this.selectedModules = [];
	},
	load : function(data){
		this.data = data;
		this.json = data.json;
		this.html = data.html;
        this.json.mode = this.options.mode;

		this.isNewForm = (this.json.id) ? false : true;
		if (this.isNewForm) this.checkUUID();
		if(this.designer.column) this.data.json.applicationName = this.designer.column.name;
		if(this.designer.column) this.data.json.application = this.designer.column.id;
		
		this.container.set("html", this.html);
		this.loadDomModules();
//		this.node = new Element("div", {
//			"MWFType": "form",
//			"styles": this.css.formNode
//		}).inject(this.container);
//		this.node.store("module", this);
		this.setNodeEvents();
		
		this.selected();

        this.autoSave();

        this.designer.addEvent("queryClose", function(){
            if (this.autoSaveTimerID) window.clearInterval(this.autoSaveTimerID);
        }.bind(this));
        //this.node.addEvents({
        //    "blur": function(){this.isFocus = false;}.bind(this),
        //    "focus": function(){this.isFocus = true;}.bind(this)
        //});
	},
    autoSave: function(){
        this.autoSaveCheckNode = this.designer.formToolbarNode.getElement("#MWFFormAutoSaveCheck");
        if (this.autoSaveCheckNode){
            this.autoSaveTimerID = window.setInterval(function(){
                if (this.autoSaveCheckNode.get("checked")){
                    this.save();
                }
            }.bind(this), 60000);
        }
    },
	checkUUID: function(){
		this.designer.actions.getUUID(function(id){
            this.json.id = id;
        }.bind(this));
	},
	loadDomModules: function(){
		this.node = this.container.getFirst();
		this.node.set("id", this.json.id);
		this.node.setStyles(this.css.formNode);
		this.node.store("module", this);
		var y = this.container.getSize().y-2;
		this.node.setStyle("min-height", ""+y+"px");
		this.designer.addEvent("resize", function(){
			var y = this.container.getSize().y-2;
			this.node.setStyle("min-height", ""+y+"px");
		}.bind(this));

		this.loadDomTree();
	},
	
	loadDomTree: function(){
		MWF.require("MWF.widget.Tree", function(){
			this.domTree = new MWF.widget.Tree(this.designer.propertyDomArea, {"style": "domtree"});
			this.domTree.load();
			
			this.createFormTreeNode();
			this.parseModules(this, this.node);
		}.bind(this));
	},
	createFormTreeNode: function(){
		var o = {
			"expand": true,
			"title": this.json.id,
			"text": "<"+this.json.type+"> "+this.json.name+" ["+this.options.mode+"] ",
			"icon": (this.options.mode=="Mobile") ? "mobile.png": "pc.png"
		};
		o.action = function(){
			if (this.module) this.module.selected();
		};
		this.treeNode = this.domTree.appendChild(o);
		this.treeNode.module = this;
	},

	parseModules: function(parent, dom){

		var subDom = dom.getFirst();
		while (subDom){
			if (subDom.get("MWFtype")){
//				var module = subDom.retrieve("module");
//				alert(subDom.get("id")+": "+module);
//				if (!module){
					var json = this.getDomjson(subDom);
					module = this.loadModule(json, subDom, parent);
//				}
//                if (module.moduleType=="container") this.parseModules(module, subDom);
//			}else{
//				this.parseModules(parent, subDom);
			}
//			else if (subDom.getFirst()){
//				subDom = subDom.getFirst();
//				this.parseModules(parent, subDom);
//			}else{
//				subDom = subDom.getNext();
//			}
			subDom = subDom.getNext();
		}
	},
	
	getDomjson: function(dom){
		var mwfType = dom.get("MWFtype");
		switch (mwfType) {
			case "form": 
				return this.json;
			case "":
				return null;
			default:
				var id = dom.get("id");
				if (id){
					return this.json.moduleList[id];
				}else{
					return null;
				}
		}
	},
	
	loadModule: function(json, dom, parent){

		var module = new MWF["CMSFC"+json.type](this);
		module.load(json, dom, parent);
		return module;
	},
	
	setNodeEvents: function(){
		this.node.addEvent("click", function(e){
			this.selected();
		}.bind(this));

	},
	
	createModule: function(className, e){
		this.getTemplateData(className, function(data){
			var moduleData = Object.clone(data);
			var newTool = new MWF["CMSFC"+className](this);
			newTool.create(moduleData, e);
		}.bind(this));
	},
	getTemplateData: function(className, callback){
		if (this.dataTemplate[className]){
			if (callback) callback(this.dataTemplate[className]);
		}else{
			var templateUrl = "/x_component_cms_FormDesigner/Module/"+className+"/template.json";
			MWF.getJSON(templateUrl, function(responseJSON, responseText){
				this.dataTemplate[className] = responseJSON;
				if (callback) callback(responseJSON);
			}.bind(this));
		}
	},
	selected: function(){
		if (this.currentSelectedModule){
			if (this.currentSelectedModule==this){
				return true;
			}else{
				this.currentSelectedModule.unSelected();
			}
		}
        if (this.propertyMultiTd){
            this.propertyMultiTd.hide();
            this.propertyMultiTd = null;
        }
		this.unSelectedMulti();

		this.currentSelectedModule = this;
		
		if (this.treeNode){
			this.treeNode.selectNode();
		}
		
		this.showProperty();
    //    this.isFocus = true;
	},
	unSelectedMulti: function(){
		while (this.selectedModules.length){
			this.selectedModules[0].unSelectedMulti();
		}
		if (this.multimoduleActionsArea) this.multimoduleActionsArea.setStyle("display", "none");
	},
	unSelectAll: function(){
		
	},
	_beginSelectMulti: function(){
		if (this.currentSelectedModule) this.currentSelectedModule.unSelected();
		this.unSelectedMulti();
		this.noSelected = true;
	},
	_completeSelectMulti: function(){
		if (this.selectedModules.length<2){
			this.selectedModules[0].selected();
		}else{
			this._showMultiActions();
		}
	},
	createMultimoduleActionsArea: function(){
		this.multimoduleActionsArea = new Element("div", {
			styles: {
				"display": "none",
		//		"width": 18*this.options.actions.length,
				"position": "absolute",
				"background-color": "#F1F1F1",
				"padding": "1px",
				"padding-right": "0px",
				"border": "1px solid #AAA",
				"box-shadow": "0px 2px 5px #999", 
				"z-index": 10001
			}
		}).inject(this.form.container, "after");
	},
	_showMultiActions: function(){
		if (!this.multimoduleActionsArea) this.createMultimoduleActionsArea();
		var firstModule = this._getFirstMultiSelectedModule();
		if (firstModule){
		//	var module = firstModule.module;
			var y = firstModule.position.y-25;
			var x = firstModule.position.x;
			this.multimoduleActionsArea.setPosition({"x": x, "y": y});
			this.multimoduleActionsArea.setStyle("display", "block");
		}
	},
	
	_getFirstMultiSelectedModule: function(){
		var firstModule = null;
		this.selectedModules.each(function(module){
			var position = module.node.getPosition(module.form.node.getOffsetParent());
			if (!firstModule){
				firstModule = {"module": module, "position": position};
			}else{
				if (position.y<firstModule.position.y){
					firstModule = {"module": module, "position": position};
				}else if (position.y==firstModule.position.y){
					if (position.x<firstModule.position.x){
						firstModule = {"module": module, "position": position};
					}
				}
			}
		});
		return firstModule;
	},
	
	
	showProperty: function(){
		if (!this.property){
			this.property = new MWF.xApplication.cms.FormDesigner.Property(this, this.designer.propertyContentArea, this.designer, {
				"path": this.options.propertyPath,
				"onPostLoad": function(){
					this.property.show();
				}.bind(this)
			});
			this.property.load();	
		}else{
			this.property.show();
		}
	},
    hideProperty: function(){
        if (this.property) this.property.hide();
    },
	
	unSelected: function(){
		this.currentSelectedModule = null;
        this.hideProperty();
	},
	
	_dragIn: function(module){
		if (!this.Component) module.inContainer = this;
		module.parentContainer = this;
		this.node.setStyles({"border": "1px solid #ffa200"});
		var copyNode = module._getCopyNode();
		copyNode.inject(this.node);
	},
	_dragOut: function(module){
		module.inContainer = null;
		module.parentContainer = null;
		this.node.setStyles(this.css.formNode);
		this.node.setStyles(this.json.styles);
		var copyNode = module._getCopyNode();
		copyNode.setStyle("display", "none");
	},
	_dragDrop: function(module){
		this.node.setStyles(this.css.formNode);
		this.node.setStyles(this.json.styles);
	},
    _clearNoId: function(node){
        var subNode = node.getFirst();
        while (subNode){
            var nextNode = subNode.getNext();
            if (subNode.get("MWFType")){
                if (!subNode.get("id")){
                    subNode.destroy();
                }else{
                    if (subNode) this._clearNoId(subNode);
                }
            }else{
                if (subNode) this._clearNoId(subNode);
            }
            subNode = nextNode;
        }
    },
	_getFormData: function(){
		var copy = this.node.clone(true, true);
		copy.clearStyles(true);
        this._clearNoId(copy);
		var html = copy.outerHTML;
		copy.destroy();

        this.data.json.mode = this.options.mode;
		this.data.html = html;
		return this.data;
	},
	preview: function(){

        MWF.xDesktop.requireApp("cms.FormDesigner", "Preview", function(){

            if (this.options.mode=="Mobile"){
                this.previewBox = new MWF.xApplication.cms.FormDesigner.Preview(this, {"size": {"x": "340", "y": 580}});
            }else{
                this.previewBox = new MWF.xApplication.cms.FormDesigner.Preview(this);
            }
            this.previewBox.load();

		}.bind(this));
	},
	save: function(callback){
        this.designer.saveForm();
		//this._getFormData();
		//this.designer.actions.saveForm(this.data, function(responseJSON){
		//	this.form.designer.notice(MWF.CMSFD.LP.notice["save_success"], "ok", null, {x: "left", y:"bottom"});
        //
		//	//this.json.id = responseJSON.data;
		//	if (!this.json.name) this.treeNode.setText("<"+this.json.type+"> "+this.json.id);
		//	this.treeNode.setTitle(this.json.id);
		//	this.node.set("id", this.json.id);
		//
		//	if (callback) callback();
		//	//this.reload(responseJSON.data);
		//}.bind(this));
	},
    explode: function(){
        this._getFormData();
        MWF.require("MWF.widget.Base64", null, false);
        var data = MWF.widget.Base64.encode(JSON.encode(this.data));

        MWF.require("MWF.widget.Panel", function(){
            var node = new Element("div");
            var size = this.designer.formNode.getSize();
            var position = this.designer.formNode.getPosition(this.designer.formNode.getOffsetParent());

            var textarea = new Element("textarea", {
                "styles": {
                    "border": "1px solid #999",
                    "width": "770px",
                    "margin-left": "14px",
                    "margin-top": "14px",
                    "height": "580px"
                },
                "text": JSON.encode(this.data)
            }).inject(node);


            this.explodePanel = new MWF.widget.Panel(node, {
                "style": "form",
                "isResize": false,
                "isMax": false,
                "title": "",
                "width": 800,
                "height": 660,
                "top": position.y,
                "left": position.x+3,
                "isExpand": false,
                "target": this.designer.node
            });

            this.explodePanel.load();
        }.bind(this));

    },
	setPropertiesOrStyles: function(name){
		if (name=="styles"){
			this.setCustomStyles();
		}
		if (name=="properties"){
			this.node.setProperties(this.json.properties);
		}
	},
	setCustomStyles: function(){
		var border = this.node.getStyle("border");
		this.node.clearStyles();
		this.node.setStyles(this.css.formNode);
		var y = this.container.getSize().y-2;
		this.node.setStyle("min-height", ""+y+"px");
		
		if (this.initialStyles) this.node.setStyles(this.initialStyles);
		this.node.setStyle("border", border);

		Object.each(this.json.styles, function(value, key){
			var reg = /^border\w*/ig;
			if (!key.test(reg)){
				this.node.setStyle(key, value);
			}
		}.bind(this));
	},
	_setEditStyle: function(name, obj, oldValue){
		if (name=="name"){
			var title = this.json.name || this.json.id;
			this.treeNode.setText("<"+this.json.type+"> "+title);
		}
		if (name=="id"){
			if (!this.json.name) this.treeNode.setText("<"+this.json.type+"> "+this.json.id);
			this.treeNode.setTitle(this.json.id);
			this.node.set("id", this.json.id);
		}
		
		this._setEditStyle_custom(name, obj, oldValue);
	},
	_setEditStyle_custom: function(){}
	
});
