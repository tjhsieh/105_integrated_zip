/*
    控制器相關物件
*/

function ch_pic_controller() 
{

	var menu_window = window.opener;
	var wait_time = 0;
	var list_buf = [];
	var event_data_buf = null;

	//接收訊息
	this.detector = function()
	{
		addEventListener("message", function (event) 
		{           
			if(event.data != event_data_buf)
            {
				event_data_buf = event.data;
				set_click(event.data); 
			} 
		}, false);
	}
	
	//初始框格顏色
	this.init_color = function(click_buf)
	{
		//console.log("init color test~~:" + click_buf);
		var data = {};
		data.strokeColor = '0000ff';
		$('area[alt='+click_buf+'_area]').data('maphilight', data).trigger('alwaysOn.maphilight');

	}
	
		
	 //發送訊息給menu controller
	 this.sendMsg = function(obj)
	 {

		list_buf.push(obj);
		var entry = obj.split(',');
		setTimeout(function(){ 
		var locationurl = location.protocol + "//" + location.host;
		var message = entry;
		
		menu_window.postMessage(message, locationurl);
		},wait_time);
		
	 }
	 
	 //點擊事件
	 function set_click(id_list)
	 {
		ch_pic_controller.init_color();
		var data = {};
		//console.log("pic text click test:" + id_list);
		after_click_color(id_list);
		//event_data_buf = id_list;
		data.strokeColor = 'ff0000';
		$('area[alt='+id_list+'_area]').data('maphilight', data).trigger('alwaysOn.maphilight');
	 }
		 
    
}