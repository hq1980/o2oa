MWF.xApplication.cms.FormDesigner.Module = MWF.xApplication.cms.FormDesigner.Module || {};
MWF.xDesktop.requireApp("cms.FormDesigner", "Module.$Element", null, false);
MWF.xApplication.cms.FormDesigner.Module.Label = MWF.CMSFCLabel = new Class({
	Extends: MWF.CMSFC$Element,
	Implements: [Options, Events],
	options: {
		"style": "default",
		"propertyPath": "/x_component_cms_FormDesigner/Module/Label/label.html"
	},
	
	initialize: function(form, options){
		this.setOptions(options);
		
		this.path = "/x_component_cms_FormDesigner/Module/Label/";
		this.cssPath = "/x_component_cms_FormDesigner/Module/Label/"+this.options.style+"/css.wcss";

		this._loadCss();
		this.moduleType = "element";
		this.moduleName = "label";

		this.form = form;
		this.container = null;
		this.containerNode = null;
	},
	
	_createMoveNode: function(){
		this.moveNode = new Element("div", {
			"MWFType": "label",
			"id": this.json.id,
			"styles": this.css.moduleNodeMove,
			"text": "(T)Text",
			"events": {
				"selectstart": function(){
					return false;
				}
			}
		}).inject(this.form.container);
	},
	
	_setEditStyle_custom: function(name){
		if (name=="valueType" || name=="text"){
			if (this.json.valueType=="text"){
				if (this.json.text){
					this.node.set("text", this.json.text);
				}else{
					this.node.set("text", "(T)Text");
				} 
			}else{
				this.node.set("text", "(C)Text");
			}
		}
	}
});
