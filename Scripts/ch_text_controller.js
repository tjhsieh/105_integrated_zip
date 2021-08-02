/*
    控制器相關物件
*/

function ch_text_controller() {

	var menu_window = window.opener;
	var wait_time = 0;
	var list_buf = [];
	var event_data_buf = null;

	//接收訊息
	this.detector = function()
	{
		addEventListener("message", function (event) {

			if(event.data != event_data_buf)
            {
				event_data_buf = event.data;
				set_click(event.data); 
			}
        }, false);
	}
	
	//發送訊息
	this.sendMsg = function(obj)
	{
		var entry = obj.split(',');
		set_click(entry);

		setTimeout(function(){ 
		var locationurl = location.protocol + "//" + location.host;
		var message = entry;
		
		menu_window.postMessage(message, locationurl);
		},wait_time);
		
	}
	 
	//設置text點選
	function set_click(id_list)
	{
		init_click();
		
		var classlist = document.getElementsByClassName(id_list);
		list_buf.push(id_list);
		for (var y = 0 ; y < classlist.length ; y++)
		{
			classlist[y].style.color="red";
		}

	}
	/*
	function on_click(id_list)
	{
		init_click();
		
		var classlist = document.getElementsByClassName(id_list);
		list_buf.push(id_list);
		for (var y = 0 ; y < classlist.length ; y++)
		{
			classlist[y].style.color="red";
		}

	}*/
	 //初始點擊的文字，將顏色改回藍色
	function init_click()
	{

		for(var x = 0 ; x<list_buf.length ; x++)
		{
			var classlist = document.getElementsByClassName(list_buf[x]);
			for (var y = 0 ; y < classlist.length ; y++)
			{
				classlist[y].style.color="#337ab7";
			}
		}
		while (list_buf.length > 0) {
		list_buf.pop();
		}
	}
    
}