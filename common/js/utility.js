(function($){
  var NumberFormatException = new UserException("숫자가 아닙니다.", "NumberFormatException");

  /**
   * UserException  사용자 예외 생성
   * @param message  예외시 메시지
   * @param name  예외 명칭
   */
  function UserException(message, name)
  {
    this.message = message;
    this.name = (name) ? name : "UserException";
  }

  /**
   * getURL  URL 에서 필요한 정보 가져오기
   * @param lastIndex  뒤에서 부터 인덱스 순서(0부터 시작)
   */
  $.getURL = function(lastIndex)
  {
    var url = document.location.href.split("/");
    return url[url.length - lastIndex - 1].split(".")[0];
  }

	/**
	 * isMobile 모바일 접속 여부 확인
	 */
	$.isMobile = function()
	{
		var filter = "win16|win32|win64|mac|macintel";

		if (navigator.platform)
			return (filter.indexOf(navigator.platform.toLowerCase()) < 0)                
	}

  /**
   * getOSType  사용 중인 OS 종류를 반환
   */
  $.getOSType = function()
  {
    var ua = navigator.userAgent;
    
    if (ua.indexOf("Windows NT 5.1") != -1) return "windows_xp";
    if (ua.indexOf("Windows NT 6.1") != -1) return "windows_7";
    if (ua.indexOf("Windows NT 6.2") != -1) return "windows_8";
    if (ua.indexOf("Windows NT 6.3") != -1) return "windows_8.1";
    if (ua.indexOf("Windows NT 10.0") != -1) return "windows_10";
    if (ua.indexOf("Windows") != -1) return "windows";

    if (ua.indexOf("Android") != -1) return "android";
    if (ua.indexOf("iPhone") != -1) return "iPhone";
    if (ua.indexOf("iPad") != -1) return "iPad";
  }

  /**
   * getBrowserType 사용 중인 브라우저의 종류를 반환
   */  
  $.getBrowserType = function()
  {
    var _ua = navigator.userAgent;

    /* IE7,8,9,10,11 */
    if (navigator.appName == 'Microsoft Internet Explorer' || _ua.indexOf("rv:11.0") != -1)
    {
      var rv = -1;
      var trident = _ua.match(/Trident\/(\d.\d)/i);

      //ie11에서는 MSIE토큰이 제거되고 rv:11 토큰으로 수정됨 (Trident표기는 유지)
      if (trident != null && trident[1]  == "7.0") return rv = "IE" + 11;
      if (trident != null && trident[1]  == "6.0") return rv = "IE" + 10;
      if (trident != null && trident[1]  == "5.0") return rv = "IE" + 9;
      if (trident != null && trident[1]  == "4.0") return rv = "IE" + 8;
      if (trident == null) return rv = "IE" + 7;

      var re = new RegExp("MSIE ([0-9]{1,}[\.0-9]{0,})");
      if (re.exec(_ua) != null) rv = parseFloat(RegExp.$1);
      
      return rv;
    }

    /* etc */
    var agt = _ua.toLowerCase();
    
    if (agt.indexOf("edge") != -1) return 'Edge';
    if (agt.indexOf("chrome") != -1) return 'Chrome';
    if (agt.indexOf("opera") != -1) return 'Opera'; 
    if (agt.indexOf("staroffice") != -1) return 'Star Office'; 
    if (agt.indexOf("webtv") != -1) return 'WebTV'; 
    if (agt.indexOf("beonex") != -1) return 'Beonex'; 
    if (agt.indexOf("chimera") != -1) return 'Chimera'; 
    if (agt.indexOf("netpositive") != -1) return 'NetPositive'; 
    if (agt.indexOf("phoenix") != -1) return 'Phoenix'; 
    if (agt.indexOf("firefox") != -1) return 'Firefox'; 
    if (agt.indexOf("safari") != -1) return 'Safari'; 
    if (agt.indexOf("skipstone") != -1) return 'SkipStone'; 
    if (agt.indexOf("netscape") != -1) return 'Netscape'; 
    if (agt.indexOf("mozilla/5.0") != -1) return 'Mozilla'; 
  }
    
  /**
   * intToString 숫자를 문자로 변환
   * @param  num 숫자
   * @param  pow 승수(default: 2)
   */
  $.intToString = function(num, pow)
  {
    var str = new Array();

    try
    {   
      if (isNaN(num)) throw NumberFormatException;

      str = num.toString().split("");
      var repeat = ((pow == undefined) ? 2 : pow) - str.length;
      for (i = 0; i < Math.abs(repeat); i++) (repeat > 0) ? str.unshift("0") : str.shift();
    }
    catch (exception)
    {
      console.log(exception.name + " : " + exception.message);
      str.push("Error");
    }

    return str.join("");
  }
    
  /**
   * digitalClock  초를 디지털 시간으로 변경
   * @param num  시간(단위:초)
   */
  $.digitalClock = function(num)
  {
    try
    {
      if (isNaN(num)) throw NumberFormatException;

      var hour = Math.floor(num / 60 / 60);
      var min = Math.floor(num / 60 % 60);
      var sec = Math.floor(num % 60);
      var time = (hour > 0) ? this.intToString(hour, 2) + ":" : "" + this.intToString(min, 2) + ":" + this.intToString(sec, 2);
    }
    catch (exception)
    {
      console.log(exception.name + " : " + exception.message);
      time = "00:00";
    }

    return time;
  }

  /**
   * getParam uri에서 파라미터 추출
   * @param uri uri
   */
  $.getParam = function(uri)
  {
    if (uri.indexOf("?") !== -1)
    {
      let obj = new Object;
      let param = uri.split("?")[1].split("&");
      
      param.map(function(value) {
        obj[value.split("=")[0]] = value.split("=")[1];
      })

      return obj;
    }
  }
})(jQuery);