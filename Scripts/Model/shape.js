/*
    形相關物件
*/

/*形物件  宣告模型資料檔案*/

function shape(name, symbol, url, type, hide, color) // name, symbol, url, type, hide(1顯示), color(0上色)
{
	//相關參數
    this.name = name;
    this.symbol = symbol;
    this.url = url;
    this.type = type;
	this.hide = hide;
	this.color = color;
	
	var model = null;
	var boxhelper;

    //if (shape != null && draw) {
	/*var loader = new THREE.ColladaLoader();
	loader.options.convertUpAxis = true;
	loader.load(url, function (dae) 
	{
		var collada2 = dae.scene;
		var material = new THREE.MeshPhongMaterial({ ambient: 0xff5533, color: 0xff5533, specular: 0x111111, shininess: 200 });

		collada2.traverse(function (child) 
		{
			if (child instanceof THREE.Mesh) 
			{
				child.material = material;
				child.castShadow = true;
				child.receiveShadow = true;
				//console.log("child position:"+child.position);
			}
		});
		dae.scene.scale.x =0.05;
		dae.scene.scale.y =0.05;
		dae.scene.scale.z =0.05;
		//console.log("xyz:"+dae.scene.x);
		model = dae.scene;
		model.traverse(function (child) 
		{
			if (child instanceof THREE.Mesh) 
			{
				child.parent.name = symbol;

			}
		});
		boxhelper = new THREE.BoundingBoxHelper(model, 0x000000);
		boxhelper.update();
	//console.log("!!!!(what pos:"+model_pos.x);
	});
    //}
*/

	var loader = new THREE.ColladaLoader();
	loader.options.convertUpAxis = true;
	requsetZipModel(parseModel);
	function parseModel(xml) {
	loader.parse(xml, function ( dae ) {

				var collada2 = dae.scene;
		var material = new THREE.MeshPhongMaterial({ ambient: 0xff5533, color: 0xff5533, specular: 0x111111, shininess: 200 });

		collada2.traverse(function (child) 
		{
			if (child instanceof THREE.Mesh) 
			{
				child.material = material;
				child.castShadow = true;
				child.receiveShadow = true;
				//console.log("child position:"+child.position);
			}
		});
		dae.scene.scale.x =0.05;
		dae.scene.scale.y =0.05;
		dae.scene.scale.z =0.05;
		//console.log("xyz:"+dae.scene.x);
		model = dae.scene;
		model.traverse(function (child) 
		{
			if (child instanceof THREE.Mesh) 
			{
				child.parent.name = symbol;

			}
		});
		boxhelper = new THREE.BoundingBoxHelper(model, 0x000000);
		boxhelper.update();
	//console.log("!!!!(what pos:"+model_pos.x);/**/

			} ,'Models/');
}


	function requsetZipModel(parseModel) { 
	 zip.workerScriptsPath = 'Scripts/Tools/';

	var xhr = new XMLHttpRequest();
	xhr.open('GET', url, true);
	xhr.responseType = 'blob';
	xhr.onload = function() {

		let blobReader = new zip.BlobReader(this.response, 'application/zip');

		zip.createReader(blobReader, function(reader) {

		// get all entries from the zip
			reader.getEntries(function(entries) {
				if (entries.length) {

					// get first entry content as text
					entries[0].getData(new zip.TextWriter(), function(text) {
						// close the zip reader
						reader.close(function() {
						// onclose callback
						//console.log(text);
							parseModel(text);
						});

					}, function(current, total) {
					// onprogress callback
					});
				}
			});
		}, function(error) {
		// onerror callback
			console.error(error);
		});
	};

	xhr.send();
}
	
	
    /*function得到模型相關物件*/
	
    this.get_model = function () 
	{

        return model;
    }
	
	this.get_boxhelper = function () 
	{
        return boxhelper;
    }
	
	this.get_model_x = function () 
	{
        return boxhelper.position.x;
    }
	
	this.get_model_y = function () 
	{
        return boxhelper.position.y;
    }
	
	this.get_model_z = function () 
	{
        return boxhelper.position.z;
    }
	
	this.get_box_max_x = function()
	{
		return boxhelper.box.max.x;
	}
	
	this.get_box_max_y = function()
	{
		return boxhelper.box.max.y;
	}
	
	this.get_box_max_z = function()
	{
		return boxhelper.box.max.z;
	}
	
	this.get_box_min_x = function()
	{
		return boxhelper.box.min.x;
	}
	
	this.get_box_min_y = function()
	{
		return boxhelper.box.min.y;
	}
	
	this.get_box_min_z = function()
	{
		return boxhelper.box.min.z;
	}
	
}




/*形管理物件*/

//存放模型資料空物件
function shapeManager() 
{
    this.shapes = {};
}

//新增模型資料
shapeManager.prototype.add = function (name, symbol, url, type, hide, color) 
{

    var obj = new shape(name, symbol, url, type, hide, color);

    this.shapes[symbol] = obj;

    return obj;
}

//透過symbol找資料
shapeManager.prototype.find_by_symbol = function (symbol) 
{

    if (this.shapes[symbol] == undefined || this.shapes[symbol] == null) 
	{

        //console.error("未找到符號形為" + symbol + "的形");
        return null;
    }
	//while(this.shapes[symbol].get_model() == null ){}

    return this.shapes[symbol];

}

//得到輔助bounding box
shapeManager.prototype.get_model_box = function (model) 
{

    var boxhelper = new THREE.BoundingBoxHelper(model, 0xff0000);
	boxhelper.update();
	return boxhelper;

}

//清除資料
shapeManager.prototype.clear = function () 
{

    for (var i in this.shapes)
        delete this.shapes[i];
}

shapeManager.prototype.dir = function () 
{

    console.log("形狀列表");
    console.dir(this.shapes);
}