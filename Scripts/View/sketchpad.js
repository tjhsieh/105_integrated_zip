/*
    繪圖相關物件
*/

function sketchpad(id, description) 
{

    var container = document.getElementById(id);
    var camera;
    var scene;
    var controls;
    var renderer;
    var stats = null;
	var gui =null;
	var parameters;
	
	var raycaster;
	var toIntersect = [];
	var cube;
	var INTERSECTED;
	var check_target = 0;
	var mouse = new THREE.Vector2();
	var target;
	var cutplane ;
	
    /*控制選項*/
	var constant = 20;//cut plane 位置 中央
	
	var cutplane_switch = false;

	var example = false;
    var aixs_x;
    var aixs_y;
    var aixs_z;
    var ground;
    var ground_grid;
    var help_line;
    var help_plane;

    var aixs_x_draw = false;
    var aixs_y_draw = false;
    var aixs_z_draw = false;
    var ground_draw = true;
    var ground_grid_draw = false;
    var help_line_draw = false;
    var help_plane_draw = false;

    /*基本function*/
	
	//控制camera視線位置
	this.focuse = function(model)
	{
		camera.lookAt( model.position );
		controls.center.x =  model.position.x;
        controls.center.y =  model.position.y;
        controls.center.z =  model.position.z;
		//camera.updateProjectionMatrix();
		render();
	}
	
	//重整camera
	this.re_pos = function()
	{
		camera.position.set(60, 30, 60);
	}
	
	//調整camera 到適合看分解視圖的位置
	this.re_pos_withdata = function(x,y,z)
	{
		camera.position.set(x*1.2+1, y*1.2+1, 2);
		camera.lookAt(x,y,z);
		controls.center.x =  x;
		controls.center.y =  y;
        controls.center.z =  0;
	}

	//初始化
    this.init = function (camera_fov, control_x, control_y, control_z) {

        console.log("初始化繪圖區: " + description);

        $("#" + id).empty();

		//fog
		scene = new THREE.Scene();
		scene.fog = new THREE.Fog(0x72645b, 2, 600);
		
		//ragcaster
		raycaster = new THREE.Raycaster();

		//camera
		camera = new THREE.PerspectiveCamera( camera_fov, $("#" + id).width() / $("#" + id).height(), 1, 600 );
		camera.position.set(60, 30, 60);
		camera.up.set(0, 1, 0);
		camera.updateMatrixWorld();
		
		//add object function
		add_aixs();        
		add_ground();
		add_ground_grid();
		add_help_line();
		add_help_plane();
		
		//light
		scene.add(new THREE.AmbientLight(0x444444));
		addShadowedLight(40, 40, 10, 0xeeeeee, 1.35);
		addShadowedLight(20, 40, 0, 0xffaa00, 1);
				
		
		camera.lookAt( scene.position );
		
		//renderer
		renderer = new THREE.WebGLRenderer();
		renderer.setClearColor( scene.fog.color, 1 );
		renderer.setPixelRatio( window.devicePixelRatio );
		renderer.setSize($("#" + id).width(), $("#" + id).height());
		renderer.sortObjects = false;
		renderer.gammaInput = true;
		renderer.gammaOutput = true;
		//renderer.shadowMapEnabled = true;
		//renderer.shadowMapCullFace = THREE.CullFaceBack;
		container.appendChild(renderer.domElement);

		//controls
		controls = new THREE.OrbitControls(camera, renderer.domElement);
		controls.damping = 0.2;
		controls.center.x = control_x;
		controls.center.y = control_y;
		controls.center.z = control_z;
		
		animate();

    }
	
	//window resize
    this.onWindowResize =function () 
	{
        camera.aspect = $("#" + id).width() / $("#" + id).height();
        camera.updateProjectionMatrix();

        renderer.setSize($("#" + id).width(), $("#" + id).height());
    }

    this.render = render;
    function render() 
	{
		renderer.render( scene, camera );
    }
	
	//上色物件
	this.encolor = function(model_obj, material)
	{
		// model_obj = shape_manager.find_by_symbol(color_list[y]);
		if(model_obj != null)
		{		
			model_obj.get_model().traverse(function (child) 
			{
				if (child instanceof THREE.Mesh) 
				{
					child.material = material;
					render();
				}
			});
		}
	}
	
	//ray caster功能 依照射線原點與向量，回傳通過的mesh，在這用來傳hover的物件
	function ray_cast()
	{
		// find intersections

		raycaster.setFromCamera( mouse, camera );//控制從camera到滑鼠這射線上通過的mesh
		scene.traverse(function (child) 
		{
			if (child instanceof THREE.Mesh) 
			{
				toIntersect.push(child);//將所有scene中的物件放入待掃描的array
			}
		});

		var intersects = raycaster.intersectObjects( toIntersect );//將array放入掃描function,回傳結果
		if ( intersects.length > 0 ) //如果有掃描到mesh
		{
			if ( INTERSECTED != intersects[ 0 ].object ) //且不是之前掃到的mesh
			{
				INTERSECTED = intersects[ 0 ].object;//將掃到的第一個mesh存入buf,且即為目標物件
				target = INTERSECTED.parent.name;

			}
		} 
		else 
		{
			INTERSECTED = null;
			target = null;
		}
		return target;
	}

	//animate
    function animate() 
	{
        requestAnimationFrame(animate);
        if (stats != null)
            stats.update();
        controls.update();/**/
		render();

    }

	//用來判斷在射線上的所有mesh,在這用來處理分解視圖的上下關係
	function find_onray_obj(intersects, find_x, find_y, find_z)
	{
		var find_obj = new THREE.Vector3(find_x,0,find_z);//將射線原點放在比較目標的正下方 y=0
		var find_vector = new THREE.Vector3(0, 1, 0);//判斷上下關係，所以向量給往正上
		
		var check_up_Intersect = [];
		var check_up_INTERSECTED;
		var check_up_ray1 = new THREE.Raycaster(find_obj,find_vector.normalize());//向量正規化
		
		scene.traverse(function (child) 
		{
			if (child instanceof THREE.Mesh) 
			{
				check_up_Intersect.push(child);
			}
		});

		intersects = check_up_ray1.intersectObjects( check_up_Intersect );
		if ( intersects.length > 0 ) //偵測到mesh
		{
			if ( check_up_INTERSECTED != intersects[ 0 ].object ) //回傳第一個
			{
				check_up_INTERSECTED = intersects[ 0 ].object;
			}

		} 
		else 
		{
			check_up_INTERSECTED = null;
		}
		return intersects;
		//return target;
	}
	
	//hover功能
	this.onDocumentMouseMove = function( event ) 
	{
		event.preventDefault();
		//得到mouse位置,扣除工具列邊界
		mouse.x = ( (event.clientX) / $("#" + id).width() ) * 2 - 1;
		mouse.y = - ( (event.clientY-(window.innerHeight-$("#" + id).height())) / $("#" + id).height() ) * 2 + 1;
		return ray_cast();
		//render();
	}
	
	//得到點擊的目標
	this.onDocumentMouseDown = function( event ) 
	{
		return target;
	}
	
	//分解視圖判斷上下關係
	this.check_top = function(minx, miny, minz, find_x, find_y, find_z, tar_x, tar_y, tar_z, tar, find)
	{
		var tar_flag = null, find_flag = null;
		var intersects;
		var line_x = minx, line_y = miny, line_z = minz;
		var grade = 30;//控制射線原點移動的迴圈++階量
		var grade_x = (find_x - minx)/grade;
		var grade_y = (find_y - miny)/grade;
		var grade_z = (find_z - minz)/grade;
		while(line_x <= find_x && line_y <= find_y && line_z <= find_z)//射線原點從目標物件的最左下的x,z的正下方(y=0)移到最右上的x,z(y=0)的位置來偵測
		{
			intersects = find_onray_obj(intersects, line_x, line_y, line_z);
			tar_flag = null, find_flag = null;
			for(var test = 0 ; test<intersects.length ; test++)
			{
				if(intersects[ test ].object.parent.name == tar)//為目標物件,儲存目標物件在此射線上的順序
				{
					tar_flag = test;
				}
				else if(intersects[ test ].object.parent.name == find)//為比較目標,表示有在該射線上,儲存比較物件在此射線上的順序
				{
					find_flag = test;
				}
			}
			if(tar_flag == null || find_flag == null)//如果其中一個沒找到,就表示不在同一射線上,繼續找,迴圈++
			{
				line_x += grade_x;
				line_y += grade_y;
				line_z += grade_z;
			}
			else
			{
				break;
			}
		}
		if(tar_flag == null || find_flag == null)//同一射線上,比較射線上順序判別上下關係
		{
			if(tar_y >=find_y)
				return tar;
			else
				return find;
		}
		else//如果不再同一射線上,表示兩個物件不處於上下疊層,直接用質心位置比較
		{
			if(tar_flag >= find_flag)
				{return tar;}
			else
				{return find;}
		}
		
	}
	
    /*相關設定*/
    function addShadowedLight(x, y, z, color, intensity) 
	{

        var directionalLight = new THREE.DirectionalLight(color, intensity);
        directionalLight.position.set(x, y, z)
        scene.add(directionalLight);

        directionalLight.castShadow = true;
        // directionalLight.shadowCameraVisible = true;

        var d = 40;
        directionalLight.shadowCameraLeft = -d;
        directionalLight.shadowCameraRight = d;
        directionalLight.shadowCameraTop = d;
        directionalLight.shadowCameraBottom = -d;
        
        directionalLight.shadowCameraNear = 1;
        directionalLight.shadowCameraFar = 160;

        directionalLight.shadowMapWidth = 1024;
        directionalLight.shadowMapHeight = 1024;

        directionalLight.shadowBias = -0.005;
        directionalLight.shadowDarkness = 0.15;
    }

	//增加三軸
    function add_aixs() 
	{

        var red = new THREE.LineBasicMaterial({
            color: 0xff0000
        });
        var green = new THREE.LineBasicMaterial({
            color: 0x00ff00
        });
        var blue = new THREE.LineBasicMaterial({
            color: 0x0000ff
        });

        var line_x = new THREE.Geometry();
        line_x.vertices.push(new THREE.Vector3(0, 0, 0));
        line_x.vertices.push(new THREE.Vector3(1000, 0, 0));
        var line_y = new THREE.Geometry();
        line_y.vertices.push(new THREE.Vector3(0, 0, 0));
        line_y.vertices.push(new THREE.Vector3(0, 1000, 0));
        var line_z = new THREE.Geometry();
        line_z.vertices.push(new THREE.Vector3(0, 0, 0));
        line_z.vertices.push(new THREE.Vector3(0, 0, 1000));

        aixs_x = new THREE.Line(line_x, red);
        aixs_y = new THREE.Line(line_y, green);
        aixs_z = new THREE.Line(line_z, blue);
    }

	//增加地板
    function add_ground() 
	{

        ground = new THREE.Mesh(new THREE.PlaneGeometry(1600, 1600), new THREE.MeshPhongMaterial({ ambient: 0x999999, color: 0x999999, specular: 0x101010 }));
        ground.rotation.x += 270 * Math.PI / 180;
		//ground.name = "ground";
        scene.add(ground);
        ground.receiveShadow = true;
    }

	//增加地板網格
    function add_ground_grid() 
	{

        var black = new THREE.LineBasicMaterial({
            color: 0x000000
        });

        ground_grid = new THREE.Object3D();

        var line, line_geometry;

        for (var x = -400; x < 400; x = x + 10) {
            line_geometry = new THREE.Geometry();
            line_geometry.vertices.push(new THREE.Vector3(x, 0, -400));
            line_geometry.vertices.push(new THREE.Vector3(x, 0, 400));
            line = new THREE.Line(line_geometry, black);
            ground_grid.add(line);
        }

        for (var z = -400; z < 400; z = z + 10) {
            line_geometry = new THREE.Geometry();
            line_geometry.vertices.push(new THREE.Vector3(-400, 0, z));
            line_geometry.vertices.push(new THREE.Vector3(400, 0, z));
            line = new THREE.Line(line_geometry, black);
            ground_grid.add(line);
        }
    }


	//增加輔助線
    function add_help_line() 
	{
        var chi = new THREE.LineBasicMaterial({
            color: 0xff0000,
            opacity: 0.9,
            blending: THREE.AdditiveBlending,
            transparent: true
        });

        var che = new THREE.LineBasicMaterial({
            color: 0x00ff00,
            opacity: 0.9,
            blending: THREE.AdditiveBlending,
            transparent: true
        });

        var line, line_geometry;
        var height = 12;

        help_line = new THREE.Object3D();

        for (var i = 0; i < 8; i++) {

            line_geometry = new THREE.Geometry();
            line_geometry.vertices.push(new THREE.Vector3(-400, height / scale, 0));
            line_geometry.vertices.push(new THREE.Vector3(400, height / scale, 0));
            line = new THREE.Line(line_geometry, chi);
            help_line.add(line);

            height += 15;

            line_geometry = new THREE.Geometry();
            line_geometry.vertices.push(new THREE.Vector3(-400, height / scale, 0));
            line_geometry.vertices.push(new THREE.Vector3(400, height / scale, 0));
            line = new THREE.Line(line_geometry, che);
            help_line.add(line);

            height += 6;
        }
    }

	//增加輔助平面
    function add_help_plane() 
	{

        var chi = new THREE.MeshPhongMaterial({
            ambient: 0x999999,
            color: 0x999999,
            specular: 0x101010,
            opacity: 0.5,
            transparent: true,
            side : THREE.DoubleSide
        })

        var che = new THREE.MeshPhongMaterial({
            ambient: 0x999999,
            color: 0x999999,
            specular: 0x101010,
            opacity: 0.5,
            transparent: true,
            side: THREE.DoubleSide
        });

        var plane;
        var plane_geometry = new THREE.PlaneGeometry(50, 50);
        var height = 12;

        help_plane = new THREE.Object3D();

        for (var i = 0; i < 8; i++) {

            plane = new THREE.Mesh(plane_geometry, chi);
            plane.rotation.x += 270 * Math.PI / 180;
            plane.position.y = height / scale;
            help_plane.add(plane);

            height += 15;

            plane = new THREE.Mesh(plane_geometry, che);
            plane.rotation.x += 270 * Math.PI / 180;
            plane.position.y = height / scale;
            help_plane.add(plane);

            height += 6;
        }
    }

    /*附加設定*/

	//增加狀態列(fps)
    this.add_stats = function () 
	{

        stats = new Stats();
        stats.domElement.style.position = 'absolute';
        stats.domElement.style.top = '0px';
        container.appendChild(stats.domElement);
    }

	//資訊
    this.add_info = function (html) 
	{
        
        var info = document.createElement('div');
        info.style.position = 'absolute';
        info.style.top = '10px';
        info.style.width = '100%';
        info.style.textAlign = 'center';
        info.innerHTML = html;
        container.appendChild(info);
    }

    /*外部呼叫用*/
	
	//透過url增加model
    this.add_model_by_url = function (url, color, dis_x, dis_y, dis_z) 
	{
		console.log("open example"+ url);
		var loader = new THREE.ColladaLoader();
		loader.options.convertUpAxis = true;
		loader.load(url, function (dae) 
		{
			collada = dae.scene;
			var material = new THREE.MeshPhongMaterial({ ambient: 0xff5533, color: color, specular: 0x111111, shininess: 200 });

			collada.traverse(function (child) 
			{
				if (child instanceof THREE.Mesh) 
				{
					child.material = material;
					child.castShadow = true;
					child.receiveShadow = true;
				}
			});
		/*	
			dae.scene.position.x += dis_x;
			dae.scene.position.y += dis_y;
			dae.scene.position.z += dis_z;
*/
			dae.scene.scale.x = 0.25;
			dae.scene.scale.y = 0.25;
			dae.scene.scale.z = 0.25;

			scene.add(dae.scene);

			render();
			//return dae.scene;
		});
			
			//camera.lookAt( dae.scene.position );
    }
	
	//移動model,dis距離 目前只動y軸
	this.move_model = function(model, dis)
	{
		//dae.scene.position.x += dis_x;
		model.position.y += dis;
		scene.add(model);
		//dae.scene.position.z += dis_z;
		render();
	}
	
	//移除model
	this.remove_model_by_url = function (url,color) 
	{
		console.log("remove example"+ url);
	/*var dae2;
	
        var loader2 = new THREE.ColladaLoader();
		loader2.options.convertUpAxis = true;
        loader2.load(url, function (dae2) {

            var collada2 = dae2.scene;
            var material = new THREE.MeshPhongMaterial({ ambient: 0xff5533, color: color, specular: 0x111111, shininess: 200 });

            collada2.traverse(function (child) {
                if (child instanceof THREE.Mesh) {

                    child.material = material;
                    child.castShadow = true;
                    child.receiveShadow = true;
                }
            });

            dae2.scene.scale.x = 1;
            dae2.scene.scale.y = 1;
            dae2.scene.scale.z = 1;
*/
            scene.remove(collada);

            render();
        //});
    }
	
	//增加剖面圖平面
	this.addClippingPlane = function() 
	{
		if(cutplane_switch == true)//如果要關閉剖面圖功能
		{
			 renderer.clippingPlanes = [];
			cutplane_switch = false;
		}
		else//開啟剖面圖功能
		{
			var normal = new THREE.Vector3( -1, 0, 0 );
			cutplane = new THREE.Plane( normal, constant );
			renderer.clippingPlanes = [cutplane]; 
			cutplane_switch = true;
		}
		
	}
	
	//增加輔助bounding box
	this.add_box = function(box)
	{
		scene.add(box);
		render();
	}
	
	//移除輔助bounding box
	this.remove_box = function(box)
	{
		scene.remove(box);
		render();
	}

	//增加模型
    this.add_model = function (model) 
	{

        scene.add(model);
		render();
    }

	//移除模型
    this.remove_model = function (model) 
	{

        scene.remove(model);
		render();
    }


    /*控制選項*/

    this.set_aixs = function (type) 
	{
        var line,line_draw;

        switch (type) 
		{
            case "aixs_x":
                line = aixs_x;
                line_draw = aixs_x_draw;
                aixs_x_draw = !aixs_x_draw;
                break;
            case "aixs_y":
                line = aixs_y;
                line_draw = aixs_y_draw;
                aixs_y_draw = !aixs_y_draw;
                break;
            case "aixs_z":
                line = aixs_z;
                line_draw = aixs_z_draw;
                aixs_z_draw = !aixs_z_draw;
                break;
        }

        if (line_draw)
            scene.remove(line);
        else
            scene.add(line);

        render();
    }

    this.set_ground = function () 
	{
        if (ground_draw)
            scene.remove(ground);
        else
            scene.add(ground);

        ground_draw = !ground_draw;

        render();
    }

    this.set_ground_grid = function () 
	{

        if (ground_grid_draw)
            scene.remove(ground_grid);
        else
            scene.add(ground_grid);

        ground_grid_draw = !ground_grid_draw;

        render();
    }

    this.set_help_line = function () 
	{
        if (help_line_draw)
            scene.remove(help_line);
        else
            scene.add(help_line);

        help_line_draw = !help_line_draw;

        render();
    }

    this.set_help_plane = function () 
	{
        if (help_plane_draw)
            scene.remove(help_plane);
        else
            scene.add(help_plane);

        help_plane_draw = !help_plane_draw;

        render();
    }
	
	//移動剖面往左
	this.set_plane_left = function()
	{
	//console.log("gui test left");
		if(cutplane_switch)
		{
		//console.log("gui test left yes");
			constant -=0.2;
			update_gui();
			refresh_cutplane();

		}
		
	}
	
	//移動剖面往右
	this.set_plane_right = function()
	{
	//console.log("gui test right");
		if(cutplane_switch)
		{
			constant +=0.2;
			update_gui();
			refresh_cutplane();
		}
		
		
	}
	
	//重整剖面
	function refresh_cutplane()
	{
		var normal = new THREE.Vector3( -1, 0, 0 );
		//constant+=0.1;
		cutplane = new THREE.Plane( normal, constant );
		renderer.clippingPlanes = [cutplane];			
		render();
	}
	
	//增加gui介面
	this.add_gui = function()
	{
		//console.log("gui test");
		gui = new dat.GUI();
		gui.domElement.style.position = 'absolute';
        gui.domElement.style.top = '0px';
		gui.domElement.style.right = '0px';
        container.appendChild(gui.domElement);/**/
		
		parameters = //初始gui參數
		{
			constant: 20,
			cut_plane: false
			//reset: function() { resetCube() }
		};
		
		
		var folder1 = gui.addFolder('Cutting Plane Position');
		var constantline = folder1.add( parameters, 'constant' ).min(0).max(40).step(0.2).listen();//剖面位置拉條
		constantline.onChange(function(value) 
		{   
			constant = value;
			if(cutplane_switch)
			{
				refresh_cutplane();
			}
		});
			
		var cut_plane_valiable = folder1.add( parameters, 'cut_plane' ).name('on').listen();//剖面開關
		cut_plane_valiable.onChange(function(value) 
		{   
			cutplane_switch = value;
			if(cutplane_switch == true)
			{
				refresh_cutplane();
				 
			}
			else
			{
				renderer.clippingPlanes = [];
			}

		});	
			
		
		folder1.open();
		gui.open();
	}
	
	//更新gui
	function update_gui()
	{
		parameters.constant = constant;
		parameters.cut_plane = cutplane_switch;
	}

}
