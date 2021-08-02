/*
    html互動相關物件
*/

function uiManager() 
{

    /*初始化*/

    var sketchpad_list = [];
	var block_switch = 0;
    init();

    /*function*/

    /*介面的設定與初始化*/
    function init() 
	{

        console.log("初始化ui介面");
		block_switch = 0;

        $(":file").filestyle({ iconName: "glyphicon-inbox" });
    }
	
	//進度讀取條
	this.do_progressline = function(now, all)
	{
		if(now == all-1)
		{
			setTimeout($.unblockUI, 0);
			
			block_switch = 1;

		}
		else
		{
			//block_switch = 0;
			//console.log("no end" +block_switch);
		}
	}
	
	//得到屏蔽視窗開關狀態
	this.get_block_switch = function()
	{
		return block_switch;
	}
	
	/*XMLviewer*/
    this.XMLviewer_update = function (str) 
	{
        XMLviewer_clear();
        $("#XML_viewer").append("<pre class='prettyprint lang-xml'></pre>");
        str = str.replace(/</g, "&lt;");
        str = str.replace(/>/g, "&gt;");
        str = str.replace(/	/g, "&nbsp;&nbsp;&nbsp;");
        XMLviewer_append(str);
        prettyPrint();
    }

    function XMLviewer_append (str) 
	{

        $("#XML_viewer pre").append(str);
        $("#XML_viewer pre").append("<br>");
    }

    function XMLviewer_clear () 
	{

        $("#XML_viewer").empty();
    }

	
}