/*
    控制器相關物件
*/

function controller() 
{

    /*初始化*/

    console.log("初始化controller");

    var shape_manager;
    var rule_manager;
    var ui_manager = new uiManager();
    var main_draw;
	var myTree;
	var material1 = new THREE.MeshPhongMaterial({ ambient: 0xff5533, color: 0xff5533, specular: 0x111111, shininess: 200 });//木質
	var material2 = new THREE.MeshPhongMaterial({ ambient: 0xff5533, color: 0xff0000, specular: 0x111111, shininess: 200 });//紅
	var material3 = new THREE.MeshPhongMaterial({ ambient: 0xff5533, color: 0xffff66, specular: 0x111111, shininess: 200 });//黃
	var boxhelper ;   //幫助顯示box邊界用
    var grammar_manager;
	var edit_mode = "Show/Hide";
	var temp_url;     //暫存url位置用
	var target;       //hover的目標
	var target_buf = null; //暫存hover目標用
	var symbol_list = [];  //存放xml所有symbol
	var move_dis = 1;      //分解視圖距離，預設為1
	var grade = 10;        //囊括範圍的立方體移動階距
	
	
	var alldata=300;       //所有檔案數量
	var parent_window=window.opener;  //父視窗 (文本)
	var hide_list = [];   //隱藏目標
	var color_list = [];  //上色的目標
	var rec_switch = 0;   //判斷是否有收到訊息，不要重複傳遞點擊訊息用
	var block_switch ;    //block視窗開關
	var ctrl_down = false;//判斷ctrl是否壓下，壓著拉動滑鼠不會觸發點擊模型事件
	var push_buf;		  //判斷壓了哪個按鍵用

    main_draw_init();
    event_init();

    load_example("./Xml/Dougong_32_ziptype.xml");
	
	//open_example('32-roof');

    /*function*/

    /*主繪圖區刷新*/
    function main_draw_init() 
	{

        main_draw = new sketchpad("canvas", "主繪圖區");
        main_draw.init(40, 0, 10, -10);
        main_draw.add_stats();
		main_draw.add_gui();
    }

    /*每次動作刷新*/
    function update() 
	{
		main_draw.render();
    }
	
	

    /*分析xml*/
    function read_XML(xml) 
	{

        console.log("開始分析xml");

        shape_manager = new shapeManager();
		array_init();
        read_XML_shape(xml);
        shape_manager.dir();
		
        update();
		
    }
	
	/*抓取XML檔中的資料，模型資料，樹資料*/
    function read_XML_shape(xml) 
	{

        console.log("取得shape相關資訊");
		
		
        $(xml).find("shape").each(function (i) {
			
            var name = $(this).children("name").text();
            var symbol = $(this).children("symbol").text();
            var url = $(this).children("url").text();
            var type = $(this).children("type").text();
			symbol_list.push(symbol);
            shape_manager.add(name, symbol, url, type, 0, 1); // name, symbol, url, type, hide(1顯示), color(0上色)
			
			
			setTimeout(function(){ set_porgress(i, alldata);shape_grammar_controller.open_example(symbol); block_switch = ui_manager.get_block_switch(); },30500);
			//給讀取時間，預防模型出錯

        });
		
		
    }
	
	/*讀取時屏蔽畫面，避免點擊出錯*/
	function block_window()
	{
		$.blockUI({ css: {
		border: 'none',
		padding: '15px',
		backgroundColor: '#000',
		'-webkit-border-radius': '10px',
		'-moz-border-radius': '10px',
		opacity: .5,
		color: '#fff'
		} });
		//setTimeout($.unblockUI, 8000);
	}


    /*載入範例*/
    this.load_example = load_example;
    function load_example(url) 
	{

        console.log("開啟範例檔案");
		block_window();

        $.ajax({
            url: url,
            type: 'GET',
            success: function (data) {
                console.dir(data);
                main_draw_init();
                doOnLoad(url);
				temp_url = url;
                read_XML(data);
                if (typeof data == 'string')
                    ui_manager.XMLviewer_update(data);
                else
                    ui_manager.XMLviewer_update((new XMLSerializer()).serializeToString(data));
            },
            error: function (data) {

                console.error("範例檔案讀取錯誤");
            }
        });
    }

	/*tree*/
	function doOnLoad(url)
	{
			myTree = new dhtmlXTreeObject("treemenu_load","100%","100%",0);
			myTree.setImagePath("Scripts/Tree/imgs/dhxtree_skyblue/");
			myTree.enableCheckBoxes(1, false);
			myTree.enableThreeStateCheckboxes(true);
			//myTree.enableDragAndDrop(1);
			myTree.enableMultiselection(true,false);
			myTree.enableHighlighting(true);
			//myTree.enableLoadingItem();
			myTree.attachEvent("onOpenEnd",function(nodeId, event){/*doLog("An id of open item is "+nodeId);*/});
			myTree.setOnClickHandler(tonclick);
			myTree.setOnCheckHandler(toncheck);
			myTree.setOnDblClickHandler(tondblclick);
			myTree.load(url);
			setTimeout(function(){Load_list();},6500);//預設所有checkbox打勾
			//myTree.showItemCheckbox(null,false);
			
	}
	
	//重整tree用	
	function ReLoad(checkbox, three_checkbox)
	{
		//saveOpenStates(tree_openstate);
		myTree.deleteChildItems(0);
		myTree.enableCheckBoxes(checkbox);
		myTree.enableThreeStateCheckboxes(three_checkbox);
		myTree.load(temp_url);
		setTimeout(function(){Load_list();},500);
		
		
	}
	
	//將tree checkbox打勾 
	function Load_list()
	{
		
		myTree.setCheck('obj32', true); 
		//console.log("hide list:"+ hide_list);
		for (var x = 0; x < hide_list.length; x++) 
		{
			if(hide_list[x]!='0')
			{
				myTree.setCheck(hide_list[x], false);
			}
			
		}

	}
	
	function doLog(str){
		/*var log = document.getElementById("logarea");
		log.innerHTML = log.innerHTML+str+"<br/>"
		log.scrollTop = log.scrollHeight;*/
	}
	
	//目錄單點擊處理
	function tonclick(id)
	{
		
		doLog("Item "+myTree.getItemText(id)+" was selected"+id+"..");
		if(block_switch == 1)//點選後屏蔽視窗
			block_window();/**/
		var list = myTree.getAllSubItems(id);//得到所有點擊的節點
		doLog("Item !!! was selected"+list+"..");
		var entry = list.split(',');
		for (var y = 0; y < entry.length; y++) {
			myTree.selectItem(entry[y],true,true);//選取物件
		}
		
		setTimeout(function(){shape_grammar_controller.colored();},300);//上色
		
		if (rec_switch == 0)//判斷這不是從文本視窗造成的點擊事件，避免重複點擊，造成訊息loop
		{
			setTimeout(function(){sendMsg();},200);//傳回文本視窗
		}

	}
	
	//雙擊節點
	function tondblclick(id)
	{
		var model_obj = shape_manager.find_by_symbol(id);
		doLog("Item "+myTree.getItemText(id)+" was doubleclicked");
		main_draw.remove_box(boxhelper);//初始所有box
		if(model_obj!=null)
		{
			boxhelper = shape_manager.get_model_box(model_obj.get_model());//將目標模型加上輔助box
			
			// If you want a visible bounding box
			main_draw.add_box(boxhelper);
			
			// If you just want the numbers
			/*console.log(boxhelper.box.min);
			console.log(boxhelper.box.max);
			console.log(boxhelper.position);*/
			//main_draw.re_pos();
			main_draw.focuse(boxhelper);
			//model_obj.get_model().position.x -=0.01;
			//update();
		}
	};
	
	function tonopen(id,mode)
	{
		return confirm("Do you want to "+(mode>0?"close":"open")+" node "+myTree.getItemText(id)+"?");
	};
	
	//控制checkbox
	function toncheck(id,state)
	{
		doLog("Item "+myTree.getItemText(id)+" was " +((state)?"checked":"unchecked"));
		if(edit_mode == "Show/Hide")
		{
			block_window();
			shape_grammar_controller.showhide();//使用模型隱藏功能
		}
	};
	
    /*事件相關*/
	function array_init()
	{
		while (hide_list.length > 0) {
            command_stack.pop();
        }
		while (color_list.length > 0) {
            color_list.pop();
        }
	}
	
	//初始化事件
    function event_init() 
	{

        console.log("初始化事件");

        set_hotkey();

		cvs = document.getElementById('canvas');

        window.addEventListener('resize', onWindowResize, false);
		window.addEventListener('mousedown', onDocumentMouseDown_switch, false);
		//window.addEventListener('mousemove', onDocumentMouseMove_text, false);
		cvs.addEventListener( 'mousemove', onDocumentMouseMove, false );
		cvs.addEventListener( 'mousedown', onDocumentMouseDown, false );
		window.addEventListener("keydown", onCtrlpush);
		window.addEventListener("keyup", onCtrlpush_off);

    }
	
	//快捷鍵
    function set_hotkey() 
	{

        $(document).bind('keydown', "shift+l", load_XML);
        $(document).bind('keydown', "shift+f4", close);
        $(document).bind('keydown', "shift+x", function () {
            set_aixs("aixs_x");
        });
        $(document).bind('keydown', "shift+y", function () {
            set_aixs("aixs_y");
        });
        $(document).bind('keydown', "shift+z", function () {
            set_aixs("aixs_z");
        });
        $(document).bind('keydown', "shift+g", set_ground);
        $(document).bind('keydown', "shift+r", set_ground_grid);
        $(document).bind('keydown', "shift+f1", set_help_line);
        $(document).bind('keydown', "shift+f2", set_help_plane);
		$(document).bind('keydown', "shift+,", plane_left);
		$(document).bind('keydown', "shift+.", plane_right);


    }
	
	//ctrl壓下，方便控制畫面，在ctrl壓下時不會觸發模型點擊
	function onCtrlpush(event)
	{
		if(event.keyCode == 17)
		{
			ctrl_down = true;
			
		}
		push_buf = event.keyCode;
	}
	
	//ctrl放開
	function onCtrlpush_off(event)
	{
	//console.log("push " + push_buf);
		if(push_buf == 17)
		{
			ctrl_down = false;
		}
	}

	//控制滑鼠hover功能
    function onDocumentMouseMove(event) 
	{

        target = main_draw.onDocumentMouseMove(event);//得到hover目標
		
		//shape_manager.find_by_symbol(target).name;
		if(target != ''  && target != null  && target != 'Tryon'  && target != 'yen' && target != '32-standbase' )//去掉不要hover的狀況
		{
			//物件的名字文字
			var tempY = event.clientY-50;
			$("#obj_text").html("<span STYLE='position:absolute; TOP:" + tempY + "px; LEFT:" + event.clientX + "px;' >"+shape_manager.find_by_symbol(target).name); 
			
			//console.log("target obj text: "+$("#obj_text").text);			

			if(target != target_buf )//如果不是之前那個目標，更新
			{
				if(target_buf != null)
				{
					//console.log("target!!: "+target);
					//console.log("target_buf!!: "+target_buf);
					var model_obj = shape_manager.find_by_symbol(target_buf);
					if(model_obj != null)
					{
						if(model_obj.color ==1 ) //如果為未上色的  (還原)上色木質材質
						main_draw.encolor(model_obj, material1);
						else if(model_obj.color ==0 )
						main_draw.encolor(model_obj, material2);
					}
				}
				
				target_buf = target;
			}
			main_draw.encolor(shape_manager.find_by_symbol(target), material3);//hover的上色紅色
		}
		else if (target == '' || target == null)//沒hover到目標，去掉hover文字，還原上個hover的材質
		{
			//main_draw.set_text_data('null', true);
			$("#obj_text").html("<span STYLE='position:absolute; TOP:" + tempY + "px; LEFT:" + event.screenX + "px;' >"); 
			if(target != target_buf )
			{
				if(target_buf != null)
				{
					//console.log("target!!: "+target);
					//console.log("target_buf!!: "+target_buf);
					var model_obj = shape_manager.find_by_symbol(target_buf);
					if(model_obj != null)
					{
						if(model_obj.color ==1 )
						main_draw.encolor(model_obj, material1);
						else if(model_obj.color ==0 )
						main_draw.encolor(model_obj, material2);
					}
				}
				
				target_buf = target;
				
			}
		}
    }
	
	//滑鼠點擊事件處理，連動到目錄
	function onDocumentMouseDown(event) 
	{
		
		if(event.button == 0  && ctrl_down != true) // 左鍵時
		{
			target = main_draw.onDocumentMouseDown(event);
			var checkState = myTree.isItemChecked(target);
			if(checkState == true)
				myTree.selectItem(target,true,false);
			//doLog("target!!: "+target);
		}

    }
	
	//判斷點擊是否為模型視窗的點擊
	function onDocumentMouseDown_switch(event) {

		rec_switch = 0;
        
    }
	
	//window視窗調整
	function onWindowResize() 
	{
        main_draw.onWindowResize();
        //ui_manager.shape_sketchpad_refresh();
    }
	
	//判斷id是否存在list中
	function check_list(id, list)
	{
		for (var x = 0; x < list.length; x++)
		{
			if(id == list[x])
			 return true;
		}
		return false;
	}
	
	//設定進度條
	function set_porgress(now, max)
	{
		ui_manager.do_progressline(now, max);
	}
	
	//傳遞訊息給父視窗(文本)
	function sendMsg()
	{
		var Str = myTree.getSelectedItemId();
		var entry = Str.split(',');
		
		var locationurl = location.protocol + "//" + location.host;
		var message = entry[0].split('-');
		if(message.length == 1)
		{
			parent_window.postMessage(message[0], locationurl); //單節 ex. RD,HG
		}
		else
		{
			parent_window.postMessage(message[1], locationurl); //2,3節 ex. 32-roof,32-HG-1
		}
		console.log("message:" + message);
		
	}
	
	//處理分解視圖
	function exploded_view(exploded_target)
	{
		var dis = parseInt(document.getElementById('input_area').value)*0.25;//得到使用者輸入的囊括距離
		
		var tar_model_obj = shape_manager.find_by_symbol(exploded_target);//得到目標模型，和座標資訊
		var ax = tar_model_obj.get_model_x();
		var ay = tar_model_obj.get_model_y();
		var az = tar_model_obj.get_model_z();

		
		var exploded_model_buf = []; //存放處理完的分解模型資訊
		
		/*判斷在模型list中的所有模型，以目標模型搭配囊括範圍所形成的bounding box，bounding box從目標物件的最左下
		沿著對角線到右上移動，判斷list中的模型是否有在這個立方體所經過的範圍*/
		for(var x = 0 ; x < symbol_list.length ; x++)//檢查所有list中的模型
		{
			var find_model_obj = shape_manager.find_by_symbol(symbol_list[x]);
			
			var grade_x = (tar_model_obj.get_box_max_x() - tar_model_obj.get_box_min_x())/grade;//每一個迴圈box所移動的距離
			var grade_y = (tar_model_obj.get_box_max_y() - tar_model_obj.get_box_min_y())/grade;
			var grade_z = (tar_model_obj.get_box_max_z() - tar_model_obj.get_box_min_z())/grade;
			var line_x = tar_model_obj.get_box_min_x(), line_y = tar_model_obj.get_box_min_y(), line_z = tar_model_obj.get_box_min_z();//最左下的點

			//從左下到右上移動搜尋
			while(line_x <= tar_model_obj.get_box_max_x() && line_y <= tar_model_obj.get_box_max_y() && line_z <= tar_model_obj.get_box_max_z())
			{
				var find_grade_x = (find_model_obj.get_box_max_x() - find_model_obj.get_box_min_x())/grade;
				var find_grade_y = (find_model_obj.get_box_max_y() - find_model_obj.get_box_min_y())/grade;
				var find_grade_z = (find_model_obj.get_box_max_z() - find_model_obj.get_box_min_z())/grade;
				var find_line_x = find_model_obj.get_box_min_x(), find_line_y = find_model_obj.get_box_min_y(), find_line_z = find_model_obj.get_box_min_z();
				var check_find = false;
				while(find_line_x <= find_model_obj.get_box_max_x() && find_line_y <= find_model_obj.get_box_max_y() && find_line_z <= find_model_obj.get_box_max_z())
				{
					if(find_line_x <= line_x+dis && find_line_x >= line_x-dis && find_line_y <= line_y+dis && find_line_y >= line_y-dis && find_line_z <= line_z+dis && find_line_z >= line_z-dis)
					{
						//console.log("!!!!test find:"+find_model_obj.symbol);
						
						//將找到的模型去和目標模型比較空間關係(上下關係)和處理分解視圖所需要的參數
						compute_dis(exploded_target, find_model_obj, exploded_model_buf, symbol_list[x], find_model_obj.get_box_min_x(), find_model_obj.get_box_min_y(), find_model_obj.get_box_min_z(), find_model_obj.get_box_max_x(),find_model_obj.get_box_max_y(), find_model_obj.get_box_max_z(),ax, ay, az);
						check_find = true;//找到就跳出迴圈
						break;
					}
					find_line_x += find_grade_x;
					find_line_y += find_grade_y;
					find_line_z += find_grade_z;
				}
				
					
				if(check_find == true)
				{
					break;
				}
				
				line_x += grade_x;
				line_y += grade_y;
				line_z += grade_z;
			}

			
		}
		
		return exploded_model_buf;
		
	}
	
	//處理空間關係和分解效果相關參數
	function compute_dis(exploded_target, find_model_obj, exploded_model_buf, symbol_list, minx, miny, minz, find_x, find_y, find_z, ax, ay, az)
	{
		var model_shape = {};
		move_dis = parseInt(document.getElementById('input_exploded_dis').value)*0.6;//得到分解視圖距離
		var top_flag;
		if(exploded_target != symbol_list)
		{
			var fix_x = 1, fix_y = 1, fix_z = 1;
			
			//判斷何者在上方，依此決定要向上或向下分解
			top_flag = main_draw.check_top(minx, miny, minz, find_x, find_y, find_z, az, ay, az, exploded_target, find_model_obj.symbol);
			if(top_flag == exploded_target)
				{fix_y = -1}
			model_shape.dis_x = 0;//fix_x*move_dis*(dis_x/(dis_x+dis_y+dis_z));
			model_shape.dis_y = fix_y*move_dis;//*(dis_y/(dis_x+dis_y+dis_z));
			model_shape.dis_z = 0;//fix_z*move_dis*(dis_z/(dis_x+dis_y+dis_z));
			model_shape.color = 0xff5533;
			
			
		}
		else//如果為目標本體就跳過，儲存原本的資訊
		{
			model_shape.dis_x = 0;
			model_shape.dis_y = 0;
			model_shape.dis_z = 0;
			model_shape.color = 0xff0000;
		}
		//儲存所需要的參數
		model_shape.symbol = find_model_obj.symbol;
		model_shape.name = find_model_obj.name;
		model_shape.url = find_model_obj.url;
		model_shape.hide = find_model_obj.hide;
		model_shape.center_x = ax;
		model_shape.center_y = ay;
		model_shape.center_z = az;
		exploded_model_buf.push(model_shape);
	}
	
	
	
    /*..............................外部呼叫事件............................*/
	
	
	//收到從文本視窗傳來訊息
	this.detector = function(msg)
	{
		//console.log("detector:"+msg);
		rec_switch = 1; //收到訊息，設為1，避免目錄重複傳遞點擊事件
		
		myTree.selectItem(msg,true,false);
	}
	
	//初始目錄的點擊
	this.init_click = function()
	{
		myTree.clearSelection();
		
	}
	
	//checkbox的控制模型隱藏功能
	this.showhide = function()
	{
		var Str = myTree.getAllUnchecked();//得到checkbox中被unchecked的節點
		var entry = Str.split(',');
		for (var y = 0; y < hide_list.length; y++) 
		{
			if(check_list(hide_list[y], entry) == false)
			{
				shape_grammar_controller.open_example(hide_list[y]);
				hide_list[y] = "000";	//標記用
				//console.log("!!!!(what:"+y+entry.length+"  "+hide_list.length);		
			}
		}
		for (var x = 0; x < entry.length; x++) 
		{
			if(check_list(entry[x], hide_list) == false)
			{
				hide_list.push(entry[x]);
				shape_grammar_controller.open_example(entry[x]);
			}
            
        }
		setTimeout($.unblockUI, 10);
	}
	
	//上色功能
	this.colored = function()
	{
		var material;
		var Str = myTree.getSelectedItemId();
		var entry = Str.split(',');
		//先將之前的上色模型回復
		for (var y = 0; y < color_list.length; y++) 
		{
			if(check_list(color_list[y], entry) == false)
			{
				var model_obj = shape_manager.find_by_symbol(color_list[y]);
				if(model_obj != null)
				{		
					material = material1;
					model_obj.color = 1;
					
					model_obj.get_model().traverse(function (child) 
					{
						if (child instanceof THREE.Mesh) 
						{
							
							child.material = material;
							update();
						}
					});
				}
				color_list[y] = "000";			
			}
		}
		//再將新的點選欲上色模型上色
		for (var x = 0; x < entry.length; x++) 
		{
			if(check_list(entry[x], color_list) == false)
			{
				color_list.push(entry[x]);
				model_obj = shape_manager.find_by_symbol(entry[x]);
				if(model_obj != null)
				{
					material = material2;
					model_obj.color = 0;
					model_obj.get_model().traverse(function (child) 
					{
						if (child instanceof THREE.Mesh) 
						{
							
							child.material = material;
							update();
						}
					});
				}

			}
            
        }
		if(block_switch == 1)//結束屏蔽視窗
			setTimeout($.unblockUI, 10);
		
	}

	//依據參數控制模型的顯示
	this.open_example = function(symbol)
	{
		//count++;
		console.log("open example dae "+symbol);
		var model_obj = shape_manager.find_by_symbol(symbol);
		if(model_obj!=null)
		{
			if(model_obj.hide == 0)//如果原本是隱藏的
			{
				main_draw.add_model(model_obj.get_model());//顯示model
				model_obj.hide = 1;
			}
			else
			{
			//console.log("!!!"+shape_manager.find_by_symbol(symbol).hide);
				main_draw.remove_model(model_obj.get_model());//隱藏model
				model_obj.hide = 0;
			}
		}

       
            //main_draw.add_model_by_url(url, 0xff5533);
            
	}
	
	this.remove_example = function(url)
	{
		//main_draw.remove_model_by_url(url, 0xff5533);
	}

	//XML的讀取事件按鈕
    this.load_XML = load_XML;
    function load_XML() 
	{
        $("#XML_file").click();
    }

	//讀取XML檔
    this.get_XML = function (event) 
	{

        var file = event.target.files[0];

        var reader = new FileReader();
        reader.onload = function () 
		{
            console.log("開啟xml: " + file.name);
            var data = new DOMParser().parseFromString(this.result, "text/xml");
            main_draw_init();
            read_XML(data);
            ui_manager.XMLviewer_update(this.result);
        }
        reader.readAsText(file);
    }

	/*畫布物件新增、控制、快捷鍵功能*/
	
	//剖面圖剖面
	this.addcutting_box = function()
	{
		main_draw.addClippingPlane();
	}
	
	//剖面左移
	this.plane_left = plane_left;
	function plane_left()
	{
	
		main_draw.set_plane_left();
	}
	
	//剖面右移
	this.plane_right = plane_right;
	function plane_right()
	{
	
		main_draw.set_plane_right();
	}

	//關閉
    this.close = close;
    function close() 
	{

        window.close();
    }

	//設定三軸
    this.set_aixs = set_aixs;
    function set_aixs(type) 
	{

        main_draw.set_aixs(type);
    }

	//增加地板
    this.set_ground = set_ground;
    function set_ground() 
	{

        main_draw.set_ground();
    }

	//增加網格
    this.set_ground_grid = set_ground_grid;
    function set_ground_grid() 
	{

        main_draw.set_ground_grid();
    }

	//增加輔助平面
    this.set_help_line = set_help_line;
    function set_help_line() 
	{

        main_draw.set_help_line();
    }

	//設定輔助平面
    this.set_help_plane = set_help_plane;
    function set_help_plane() 
	{

        main_draw.set_help_plane();
    }

	//分解視圖按鈕視窗處理
    this.view_shape = function () 
	{
		
		var Str = myTree.getSelectedItemId();
		var entry = Str.split(',');
		//for (var x = 0; x < entry.length; x++)
		if(document.getElementById('input_area').value == '' || document.getElementById('input_exploded_dis').value == '')
		{
			alert("請輸入正確數據!");
		}
		
		else if(entry.length > 1)
		{
			alert("只適用單一葉節點，請勿選擇複數!");
		}
		
		else if(entry == '')
		{
			alert("請選擇要觀看的目標單一葉節點，請勿選擇複數!");
		}
		
		else 
		{
		
			var exploded_model_buf = exploded_view(Str);
			var shap_window = window.open('View_Shape.html', '_blank');
			setTimeout(function(){var locationurl = location.protocol + "//" + location.host;
			shap_window.postMessage(exploded_model_buf, locationurl);},2000);
		}
	
		
    }
}