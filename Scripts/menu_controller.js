/*
    控制器相關物件
*/

function menu_controller() {

    /*初始化*/

    console.log("初始化menu_controller");
	var myTree2;
	var text_window, pic_window, exploded_window;
	var wait_time = 1000;
	var event_data_buf = "";
	
	//可用的文本檔
	var avilable_list = ['../Ch/ch4-1-gon-text.html', '../Ch/ch4-1-gon-pic.html','../Ch/ch4-1-tsai-pic.html','../Ch/ch4-1-tsai-text.html','../Ch/ch4-1-fa_on-text.html','../Ch/ch4-1-fa_on-pic.html','../Ch/ch4-1-jay_to-pic.html',
	'../Ch/ch4-1-jay_to-text.html','../Ch/ch4-1-dou-text.html','../Ch/ch4-1-dou-pic.html','../Ch/ch4-1-all_pu_zou_order-text.html','../Ch/ch4-1-all_pu_zou_order-pic.html','../Ch/ch4-1-pin_zou-text.html','../Ch/ch4-1-pin_zou-pic.html'
	,'../Ch/ch5-1-lion-text.html','../Ch/ch5-1-lion-pic.html','../Ch/ch5-1-lan_a-text.html','../Ch/ch5-1-lan_a-pic.html','../Ch/ch5-1-ju-text.html','../Ch/ch5-1-ju-pic.html','../Ch/ch5-1-ian_ma-text.html','../Ch/ch5-1-ian_ma-pic.html'
	,'../Ch/ch5-1-ju_lu_ju-text.html','../Ch/ch5-1-ju_lu_ju-pic.html','../Ch/ch5-1-don-text.html','../Ch/ch5-1-don-pic.html','../Ch/ch5-1-bo_fon_ban-text.html','../Ch/ch5-1-bo_fon_ban-pic.html','../Ch/ch5-1-fu-text.html','../Ch/ch5-1-fu-pic.html'
	,'../Ch/ch5-1-tryon-text.html','../Ch/ch5-1-tryon-pic.html','../Ch/ch5-1-yen-text.html','../Ch/ch5-1-yen-pic.html','../Ch/ch5-1-g_ze-text.html','../Ch/ch5-1-g_ze-pic.html'];
	//控制切換章節的資料，儲存哪些部件是哪些章節的
	var ch4_1_gon_list = ["HG","NDG","GJG","MG","LG"];
	var ch4_1_dou_list = ["RD","JHD","QXD","SD"];
	var ch4_1_fa_on_list = ["down_on"];
	var ch4_1_jay_to_list = ["LST"];
	var ch5_1_lion_list = ["RF","YCF","LEF","CFT","PCF","CTJG","JTF","PL","ZF"];
	var ch5_1_don_list = ["Juian"];
	var ch5_1_yen_list = ["yen"];
	var ch5_1_tryon_list = ["Tryon"];
	var ch5_1_ju_lu_ju_list = ["SJ"];
	var ch5_1_lan_a_list = ["di_fu","lan_a","you_a","wu_na_a"];
	var ch5_1_ju_list = ["ju"];
	doOnLoad();
	
	//初始目錄
	function doOnLoad()
	{
			
			myTree2 = new dhtmlXTreeObject("menu_tree","100%","100%",0);
			//myTree2.setImagePath("../Xml/Dougong_32.xml");
			myTree2.setImagePath("../Scripts/Tree/imgs/dhxtree_terrace/");
			myTree2.enableHighlighting(true);
			myTree2.enableThreeStateCheckboxes(true);
			myTree2.setOnClickHandler(tonclick);
			myTree2.load("../Xml/menu-list.xml");
	}
		
	function doLog(str)
	{
		console.log(str);
	}
		
	//點擊事件
	function tonclick(id)
	{
			doLog("Item "+myTree2.getItemText(id)+" was selected"+id+"..");
			myTree2.openItem(id);
			var url1 = '../Ch/'+id+'-text.html';
			var url2 = '../Ch/'+id+'-pic.html';
			call_window(url1,'W2',url2,'W3');
		
	};
	
	//開啟視窗
	function call_window(url, window_name, url2, window_name2) 
	{
		if(check_list(url)!=true || check_list(url2)!=true)//確認點選的是有資料的
			doLog('url not found1!'+url+'url not found2!'+url2);
		else
		{
			text_window = window.open(url, window_name);
			pic_window = window.open(url2, window_name2);
		}

	}
	
	//確認該路徑是否有資料
	function check_list(url)
	{
		for (var x = 0; x < avilable_list.length; x++) 
		{
			if(url == avilable_list[x])
				return true;
		}
		return false;
	}

	//開啟視窗
	 function openWindow() 
	 {
		if(exploded_window && !exploded_window.closed)
		{
			wait_time = 100;
		}
		else 
		{
			//console.log("exploded test:");
			wait_time = 1500;
			exploded_window = window.open("../Exploded_System.html");
		}
	}
		 
	//收到的訊息部件，是哪個章節的
	function check_open_list(symbol)
	{
		for(var x=0 ; x<ch4_1_gon_list.length ; x++)
		{
			if(symbol == ch4_1_gon_list[x])
				return 'ch4-1-gon';
		}
		for(var x=0 ; x<ch4_1_gon_list.length ; x++)
		{
			if(symbol == ch4_1_dou_list[x])
				return 'ch4-1-dou';
		}
		for(var x=0 ; x<ch4_1_fa_on_list.length ; x++)
		{
			if(symbol == ch4_1_fa_on_list[x])
				return 'ch4-1-fa_on';
		}
		for(var x=0 ; x<ch4_1_jay_to_list.length ; x++)
		{
			if(symbol == ch4_1_jay_to_list[x])
				return 'ch4-1-jay_to';
		}
		for(var x=0 ; x<ch5_1_lion_list.length ; x++)
		{
			if(symbol == ch5_1_lion_list[x])
				return 'ch5-1-lion';
		}
		for(var x=0 ; x<ch5_1_don_list.length ; x++)
		{
			if(symbol == ch5_1_don_list[x])
				return 'ch5-1-don';
		}
		for(var x=0 ; x<ch5_1_yen_list.length ; x++)
		{
			if(symbol == ch5_1_yen_list[x])
				return 'ch5-1-yen';
		}
		for(var x=0 ; x<ch5_1_ju_lu_ju_list.length ; x++)
		{
			if(symbol == ch5_1_ju_lu_ju_list[x])
				return 'ch5-1-ju_lu_ju';
		}
		for(var x=0 ; x<ch5_1_lan_a_list.length ; x++)
		{
			if(symbol == ch5_1_lan_a_list[x])
				return 'ch5-1-lan_a';
		}
		for(var x=0 ; x<ch5_1_ju_list.length ; x++)
		{
			if(symbol == ch5_1_ju_list[x])
				return 'ch5-1-ju';
		}
		for(var x=0 ; x<ch5_1_tryon_list.length ; x++)
		{
			if(symbol == ch5_1_tryon_list[x])
				return 'ch5-1-tryon';
		}
	}
		 
	//接收訊息
	this.detector = function()
	{
		addEventListener("message", function (event) 
		{
			console.log("detect msg :" + event.data);
			if(event.data != event_data_buf)//去掉重複訊息
            {
				//console.log("data test 1 :" + event.data[0] +" data test 2 :" + event_data_buf[0]);
				event_data_buf = event.data;
				var locationurl = location.protocol + "//" + location.host;
				var message = event.data;
				if (event.source.name == "W2")//如果收到的訊息來源是從文字層來的 
			   {
					pic_window.postMessage(message, locationurl);//對圖片層傳訊息
					openWindow();
					setTimeout(function(){ 
					exploded_window.postMessage(message, locationurl);//對模型視窗傳訊息
					//menu_window.postMessage(message, locationurl);
					
					},wait_time);	
					
			   }
				else if(event.source.name  == "W3")//圖片層來的訊息，對文字層和模型視窗傳訊息
				{
					
					text_window.postMessage(message, locationurl);
					openWindow();
					setTimeout(function(){ 
					exploded_window.postMessage(message, locationurl);
					//menu_window.postMessage(message, locationurl);
					
					},wait_time);
				}
				else//從模型視窗來的，對文字層和圖片層傳訊息
				{
					var now_open = check_open_list(message);
					//console.log("open test:"+message[0] + " re:"+ now_open);
					myTree2.selectItem(now_open,true,false);
					setTimeout(function(){ 
					pic_window.postMessage(message, locationurl);
					text_window.postMessage(message, locationurl);
					},4000);
					
					
				}
			}
				//console.log("receive test~~:" + event.source.name);
               
        }, false);
	}

    
}