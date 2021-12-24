/**
 * bvPlayer ver 2.0.1
 * javascript to need: jquery, jquery.fullscreen, utility
 * file extension to able use: mp3, mp4
 * customize for edunics
*/

function BVPlayer(param)
{ 
  let info = {
    cssSelector: "body" // 플레이어가 삽입 될 DOM
    , type: null // 미디어 타입
    , controls: true // 컨트롤 유무
    , filePath: null // 재생할 파일의 위치
    , fileName: null // 재생할 파일명
    , fileExtension: null // 재생할 파일 확장자
    , saveVolume: 0.5 // 마지막으로 변환 볼륨 값
	  , isMobile: true // 모바일 유무
    , isEnded: false // 영상 종료 여부
    , isSyncSubtitle: true // 싱크 자막 여부
    , callbackStart: function() {} // 영상 시작 후 반환 할 함수
    , callbackUpdate: function() {} // 영상 진행 중 반환 할 함수
    , callbackEnded: function() {} // 영상 종료 후 반환 할 함수    
    , userActive: false // 사용자 활동 유무
    , inactivityTimeout: null // 비활동 시 작동할 Interval ID
    , activityCheck: null // 사용자 활동 시 작동할 Interval ID
    , lockProgressBar: false // 진행바 이동 잠금
    , limitProgressBar: 0 // 진행바 최대 이동 범위(0~100)
    , isSupport: true // 미디어 지원 가능 여부
  }
  
  this.info = $.extend(null, info, param);  
  this.createPlayer();
}

/**
 * setter/getter controls
 */
Object.defineProperty(BVPlayer.prototype, "controls",{
  get: function() {
    return this.info.controls; 
  },
  set: function(bol) {
    this.info.controls = bol;
    let name = "bv-controls";

    if ($("." + name).length == 0)
    {
      this.$player.append($('<div/>', { class: name }));
      this.$controls = this.$player.find("." + name);
      this.createControls();
    }
  }
});

/**
 * setter/getter lockProgressBar
 */
Object.defineProperty(BVPlayer.prototype, "lockProgressBar",{
  get: function() {
    return this.info.lockProgressBar;
  },
  set: function(bol) {
    this.info.lockProgressBar = bol;
  }
});

/**
 * setter/getter limitProgressBar
 */
Object.defineProperty(BVPlayer.prototype, "limitProgressBar",{
  get: function() {
    return this.info.limitProgressBar;
  },
  set: function(num) {
    this.info.limitProgressBar = num;
  }
});

/**
 * createPlayer 플레이어 개체 생성
 */
BVPlayer.prototype.createPlayer = function()
{
  if ($.find(this.info.cssSelector).length == 0)
  {
    let selc = {};

    if (this.info.cssSelector.slice(0,1) == ".")
      selc = { class: this.info.cssSelector.slice(1) };
    else if (this.info.cssSelector.slice(0,1) == "#")
      selc = { id: this.info.cssSelector.slice(1) };
    else
      selc = {};
    
    $("body").append($('<div/>', selc));
  }
  
  let $target = $(this.info.cssSelector);
  
  let name1 = "bv-player";
  let name2 = "bv-media";
  let name3 = "bv-subtitle";
  let name4 = "bv-play";
  let name5 = "bv-loading";
  let name6 = "bv-activity";
  
  $target.append($('<div/>', { class: name1 }));  
  this.$player = $target.find("." + name1 + ":last");
  
  let $player = this.$player;

  $player.append($('<div/>', { class: name2 }));
  this.$media = $player.find("." + name2);
  
  $player.append($('<div/>', { class: name3 }));
  this.$subtitle = $player.find("." + name3).hide();
  this.$subtitle.append($('<span/>', {class: "subtitle"}));
  this.$subtitle.append($('<div/>', {class: "subtitle_up"}));
  this.$subtitle.append($('<div/>', {class: "subtitle_down"}));
  
  $player.append($('<div/>', { class: name4 }));
  this.$play = $player.find("." + name4).hide();
  this.$play.append($('<div />', { class: "icon"}));
  
  $player.append($('<div/>', { class: name5 }));
  this.$loading = $player.find("." + name5);
  
  $player.append($('<div/>', { class: name6 }));
  this.$activity = $player.find("." + name6);

  this.info.isMobile = $.isMobile();
  this.controls = this.info.controls;  
}

/**
 * init 플레이어 초기화
 * @param src 폴더 경로 및 이름
 */
BVPlayer.prototype.init = function(src)
{
  this.info.userActivity = true;
  
  this.info.filePath = src.replace(/[^\/]*\.mp\d/,'');
  this.info.fileName = src.replace(/^.*\//, '').split(".")[0];
  this.info.fileExtension = src.replace(/^.*\//, '').split(".")[1];

  $(this.getMedia()).off();
  this.$activity.off();
  $(document).off();
  $(window).off("resize");

	this.lockProgressBar = true;
  
  this.$controls.find(".progress-range").css({width: "0%"});

  switch (this.info.fileExtension)
  {
    case "mp3" :
      this.createAudio(src);
      break;
    case "mp4" :
      this.createVideo(src);
      break;
    default :
      alert("mp3, mp4 파일만 플레이 가능합니다.");
  }

  this.$loading.show();
  this.initEvent();
  this.initControls();
  this.switchControls();
  this.stateFullscreen();

  this.$subtitle.find("span").html("");
}

/**
 * createVideo 비디오 개체 생성
 * @param src 폴더 경로 및 이름
 */
BVPlayer.prototype.createVideo = function(src)
{
  this.info.type = "video";
  
  let $media = this.$media;
  
  $media.find(".bv-audio").remove();
  $media.find(".bv-video").remove();
  this.$media.find(".bv-interactive").remove();
  
  $media.append($('<video/>', { class: "bv-video", preload: "metadata", playsinline: "playsinline", muted: "muted" }));
  // $media.append($('<video/>', { class: "bv-video", preload: "metadata", playsinline: "playsinline"}));
  $media.find("video").append($('<source/>', { src: src, type: "video/mp4" }));
    
  if (this.info.isSyncSubtitle)
  {
    $media.find("video").append($('<track/>', { src: this.info.filePath + this.info.fileName + ".vtt", kind: "subtitles", srclang: "kr", label:"korean" }));
  }
  
  this.$video = this.$media.find(".bv-video");
  this.$play.show();
}

/**
 * createAudio 오디오 개체 생성
 * @param src 폴더 경로 및 이름
 */
BVPlayer.prototype.createAudio = function(src)
{
  this.info.type = "audio";
  
  let $media = this.$media;

  $media.find(".bv-video").remove();
  $media.find(".bv-audio").remove();
  this.$media.find(".bv-interactive").remove();
  
  $media.append($('<div/>', { class: "bv-interactive" }));
  this.$interactive = this.$media.find(".bv-interactive");

  $media.append($('<audio/>', { class: "bv-audio", preload: "metadata", playsinline: "playsinline", muted: "muted" }));
  $media.find("audio").append($('<source/>', { src: src, type: "audio/mp3" }));
  
  this.$audio = this.$media.find(".bv-audio");  
  this.containInteractive();
}

/**
 * createControls 컨트롤 기능 추가
 */
BVPlayer.prototype.createControls = function()
{
  let $controls = this.$controls;
  
  $controls.append($('<div/>', { class: "progress-bar", title: "진행바" }));
  $controls.find(".progress-bar").append($('<div/>', { class: "progress-range" }));
  $controls.find(".progress-bar>.progress-range").append($('<div/>', { class: "progress-handle" }));

  $controls.append($('<div/>', { class: "button", id: "play", title: "재생" }));
  $controls.append($('<div/>', { class: "button", id: "pause", title: "일시정지" }));
  $controls.append($('<div/>', { class: "button", id: "replay", title: "다시보기" }));
  $controls.append($('<div/>', { class: "button", id: "subtitle", title: "자막 열기/닫기" }));

  $controls.append($('<div/>', { class: "time" }));
  $controls.find(".time").append($('<span/>', { class: "time--current", text: "00:00", title: "현재시간" }));
  $controls.find(".time").append($('<span/>', { class: "time--diviser", text: "/" }));
  $controls.find(".time").append($('<span/>', { class: "time--duration", text: "00:00", title: "전체시간" }));
  
  $controls.append($('<div/>', { class: "button", id: "mute", title: "음소거" }));
  $controls.append($('<div/>', { class: "button", id: "unmute", title: "음복구" }));



    $controls.append($('<div/>', { class: "sound-bar", title: "소리조절바" }));
    $controls.find(".sound-bar").append($('<div/>', { class: "sound-range" }));
    $controls.find(".sound-bar>.sound-range").append($('<div/>', { class: "sound-handle" }));

  
  $controls.append($('<div/>', { class: "button", id: "fullscreen", title: "전체화면" }));
  $controls.append($('<div/>', { class: "button", id: "exitfullscreen", title: "전체화면 해제" }));

  $controls.find("#exitfullscreen").hide();
    
  $controls.append($('<div/>', { class: "button", id: "prev", title: "이전페이지" }));
    
  $controls.append($('<div/>', { class: "page" }));
  $controls.find(".page").append($('<div/>', { class: "page--current", title:"현재 페이지" }));
  $controls.find(".page").append($('<div/>', { class: "page--diviser" }));
  $controls.find(".page").append($('<div/>', { class: "page--total", title:"전체 페이지" }));
  $controls.find(".page>div").append($('<div/>', { class: "txt" }));

  $controls.append($('<div/>', { class: "button", id: "next", title: "다음페이지" }));
}

/**
 * initControls 컨트롤 초기화
 */
BVPlayer.prototype.initControls = function()
{
  let self = this;
  let media = this.getMedia();
  var $subtitle = this.$subtitle;
  let $player = this.$player;
  let $controls = this.$controls;
  
  this.$play.off().on("click", function() {
    self.play();
  });
  
  $controls.find("#play").off().on("click", function() {
    self.play();
  });
  
  $controls.find("#pause").off().on("click", function() {
    self.stop();
  });
  
  $controls.find("#replay").off().on("click", function() {
    self.gotoAndPlay(0);
  });
  
  $controls.find("#subtitle").off().on("click", function() {
    self.$subtitle.toggle();
  });
  
  $controls.find("#mute").off().on("click", function() {
    self.info.saveVolume = (media.volume) ? media.volume : 0.5;    
    self.updateVolume(0);
  });
  
  $controls.find("#unmute").off().on("click", function() {
    if (self.info.saveVolume == 0) self.info.saveVolume = 0.5;
    self.updateVolume(self.info.saveVolume * 100);
  });
  
  $controls.find("#fullscreen").off().on("click", function() {
    $player.fullScreen(true);
  });
  
  $controls.find("#exitfullscreen").off().on("click", function() {
    $player.fullScreen(false);  
  });

    var scrollAmount = 36;

  $subtitle.find(".subtitle_up").on("click", function() {
    // console.log("클릭");
    var subt = $subtitle.find(".subtitle")
    var pos = subt.scrollTop() - (subt.scrollTop() % scrollAmount) + ( ((subt.scrollTop() % scrollAmount) > 0) ? + scrollAmount : 0)
    subt.stop().animate({
      scrollTop: pos - scrollAmount
    });
  });

  $subtitle.find(".subtitle_down").on("click", function() {
    var subt = $subtitle.find(".subtitle");
    var pos = subt.scrollTop() - (subt.scrollTop() % scrollAmount)
    subt.stop().animate({
      scrollTop: pos + scrollAmount
    });
  });
}

/**
 * initEvent 플레이어 이벤트 초기화
 */
BVPlayer.prototype.initEvent = function()
{
  let self = this;
  let $media = $(this.getMedia());
  let $loading = this.$loading; 
  let $controls = this.$controls;
  let $activity = this.$activity;
  
  $media.on("loadedmetadata", function() {
    $controls.find('.time--duration').text($.digitalClock(this.duration));
    self.initProgressBar();
    self.initSoundBar();
    self.updateVolume(50);
    $(this).removeAttr("muted");
    
    if (self.info.isMobile || $.getBrowserType() == "Safari")
    {
      this.muted = false;
      self.info.isEnded = false;
      self.play();
      $loading.hide();
      self.info.callbackStart(this);
    }
  });
  
  $media.on("canplaythrough", function() {
    if  (!self.info.isMobile && $.getBrowserType() != "Safari")
    {
      self.info.isEnded = false;
      self.play();
      $loading.hide();
      self.info.callbackStart(this);
    }    
  });
    
  $media.on("timeupdate", function() {
    let curTime = this.currentTime;
    let totalTime = this.duration;
    let range = curTime / totalTime * 100;
    
    if (self.info.limitProgressBar < range) self.info.limitProgressBar = range;
    
    $controls.find(".progress-range").css({ width: range + "%" });
    $controls.find(".time--current").text($.digitalClock(this.currentTime));    
    
    if (self.info.type === "video" && self.info.isSyncSubtitle)
    {
      this.textTracks[0].mode = "hidden";
      let track = this.textTracks[0];
      let activeCue;

      try {
        activeCue = track.activeCues[0];
        // self.$subtitle.find("span").html(activeCue.text.replace(/\n/g, "<br/>"));
        self.$subtitle.find("span").html(activeCue.text);
      }
      catch (e)
      {
        self.$subtitle.find("span").text("");
      }
    }
    
    self.info.callbackUpdate(this);    
  });

  $media.on("play", function() {
    if (self.info.type === "video")
    {
      $controls.find("#play").hide();
      $controls.find("#pause").show();
    }
  });
  
  $media.on("pause", function() {
    if (self.info.type === "video")
    {
      $controls.find("#play").show();
      $controls.find("#pause").hide();
    }
  });
  
  $media.on('volumechange', function(event) {    
    if (this.volume == 0 )
    {
      $controls.find("#mute").hide();
      $controls.find("#unmute").show();
    }
    else
    {
      $controls.find("#mute").show();
      $controls.find("#unmute").hide();
    }
  });
  
  $media.on("ended", function() {
    if (self.info.type === "video")
    {
      $controls.find("#play").show();
      $controls.find("#pause").hide();
    }
    
    self.info.isEnded = true;    
    self.info.callbackEnded(this);
  });

  $media.on("error", function(e) {
    //if (self.info.type == "audio" && e.currentTarget.error.code == 4)
    if(e.currentTarget.error.code == 4)
    {
      console.log("오디오 출력 장치가 설치되어 있지 않습니다.");
      // lachlan : 20211027 오디오 장치 에러시 시작 함수 실행 안되는 문제 수정
      //self.info.isSupport = false;
      $loading.hide();
      // $controls.find("#mute").hide();
      // $controls.find("#unmute").hide();
      // $controls.find(".sound-bar").hide();
      self.info.callbackStart(this);
    }
  });
  
  $media.on("click", function() {
    if (!self.getMedia().paused) self.stop();
  })
  
  $(document).on("fullscreenchange", function() {
    self.stateFullscreen();
  });

  if ($.getBrowserType().indexOf("IE") !== -1)
  {
    document.addEventListener('MSFullscreenChange', function(e) {
      self.stateFullscreen();
    });
  }
  

  $(window).on("resize", function() {
    self.containInteractive();
  })
  
  $activity.on("mouseover", function() {
    self.info.userActivity = true;
  });
  
  $activity.on("mouseout", function() {
    self.info.userActivity = true;
  });
  
  $activity.on("mousemove", function() {
    self.info.userActivity = true;
  });
  
  $media.on("touchstart", function() {
    self.info.userActivity = true;
  });
}

/**
 * stateFullscreen 풀스크린 상태에 따른 작동
 */
BVPlayer.prototype.stateFullscreen = function()
{
  if (document.fullscreenElement || /* Standard syntax */
    document.webkitFullscreenElement || /* Chrome, Safari and Opera syntax */
    document.mozFullScreenElement ||/* Firefox syntax */
    document.msFullscreenElement /* IE/Edge syntax */)
  {
    this.$player.addClass("fullscreen");
    this.$controls.find("#fullscreen").hide();
    this.$controls.find("#exitfullscreen").show();
    if (this.info.type === "video") this.autoHideControls(true);
    else this.autoHideControls(false);
  }
  else
  {
    this.$player.removeClass("fullscreen");
    this.$controls.find("#fullscreen").show();
    this.$controls.find("#exitfullscreen").hide();
    if (this.info.type === "video") this.autoHideControls(false);
  }
}

/**
 * autoHideControls controls 자동 숨김
 * @param bol 자동 숨김 여부
 */
BVPlayer.prototype.autoHideControls = function(bol)
{
  let self = this;  
  if (bol)
  {
    this.$activity.show();
    this.info.activityCheck = setInterval(function() {
      if (self.info.userActivity)
      {
        self.info.userActivity = false;
        if (self.userActive() === false) self.userActive(true);
        clearTimeout(self.info.inactivityTimeout);

        self.info.inactivityTimeout = setTimeout(function() {
          if (!self.info.userActivity) self.userActive(false);
        }, 5000);
      }
    }, 250);
  }
  else
  {
    this.$activity.hide();
    this.$controls.removeClass("bv-fade-out");
    clearInterval(this.info.activityCheck);
    clearTimeout(this.info.inactivityTimeout);
  }  
}

/**
 * userActive 사용자의 움직임에 따른 반응
 * @param bol 움직임 여부
 */
BVPlayer.prototype.userActive = function(bol)
{ 
  let $controls = this.$controls;
  
  switch (bol) {
    case true :
      // console.log("이벤트 발생 active");
      $controls.removeClass("bv-fade-out");
      break;
    case false :
      // console.log("이벤트 발생 inactive");
      $controls.addClass("bv-fade-out");
      break;
    default:
      return this.info.userActivity;
  }
}

/**
 * initProgressBar 진행바 초기화
 */
BVPlayer.prototype.initProgressBar = function()
{
  let self = this;
  let media = this.getMedia();
  let $controls = this.$controls;
  let dragging = false;
  
  $controls.find(".progress-bar").off().on("mousedown", function(e) {
    dragging = true;
    media.pause();
    self.updateProgressBar(e.pageX);
  });
  
  $(document).on("mouseup", function(e) {
    if (dragging)
    {
      dragging = false;
      self.updateProgressBar(e.pageX);
      self.$play.hide();
      self.play();
    }
  });
  
  $(document).on("mousemove", function(e) {
    if (dragging) self.updateProgressBar(e.pageX); 
  });
}

/**
 * removeProgressBar 진행바 기능 제거
 */
BVPlayer.prototype.removeProgressBar = function()
{
  this.lockProgressBar = true;
  this.info.limitProgressBar = 0;
  this.updateProgressBar(0);
  $(document).off();
  this.$controls.find(".progress-bar").off();
}

/**
 * updateProgressBar 진행바 업데이트
 * @param point 진행바 핸들러 좌표
 */
BVPlayer.prototype.updateProgressBar = function(point)
{
  let media = this.getMedia();
  let $controls = this.$controls;
  let $progressBar = $controls.find(".progress-bar");
  let totalTime = media.duration;
  let position = point - $progressBar.offset().left;
  let percentage = 100 * position / $progressBar.width();
  
  if (percentage < 0) percentage = 0;
  if (percentage > 100) percentage = 100;
  
  if (this.info.lockProgressBar)
  {    
    if (percentage > this.info.limitProgressBar) percentage = this.info.limitProgressBar;
  }
		
  $controls.find(".progress-range").css({width: percentage + "%"});

  // lachlan : 20211027 사운드 설정 안된 PC 대응
  try {
    media.currentTime = totalTime * percentage / 100;
  } catch(e) {
  };
}

/**
 * initSoundBar 사운드바 초기화
 */
BVPlayer.prototype.initSoundBar = function()
{
  let self = this;
  let dragging = false;
  
  this.$controls.find(".sound-bar").off().on("mousedown", function(e) {
    dragging = true;
    self.updateSoundBar(e.pageX);
  });
  
  $(document).on("mouseup", function(e) {
    if (dragging)
    {
      dragging = false;
      self.updateSoundBar(e.pageX);
		}
  });
  
  $(document).on("mousemove", function(e) {
    if (dragging) self.updateSoundBar(e.pageX); 
  });

  if($(window).width()<1024){
	  $(".bv-player .bv-controls .sound-bar").hide();
  }	
}

/**
 * updateSoundBar 사운드바 업데이트
 * @param point 사운드바 핸들러 좌표
 */
BVPlayer.prototype.updateSoundBar = function(point)
{
  let media = this.getMedia();
  let $controls = this.$controls;
  let $soundBar = $controls.find(".sound-bar");
  
  let position = point - $soundBar.offset().left;
  let percentage = 100 * position / $soundBar.width();
  
  if (percentage < 0) percentage = 0;
  if (percentage > 100) percentage = 100;
		
  $controls.find(".sound-range").css({width: percentage + "%"});
  media.volume = percentage / 100;
  this.info.saveVolume = media.volume;
}

/**
 * updateVolume 플레이어 볼륨 변경
 * @param volume 볼륨값(0~100)
 */
BVPlayer.prototype.updateVolume = function(volume)
{
  this.$controls.find(".sound-range").css({width: volume + "%"});
  this.getMedia().volume = (volume == 0) ? volume : volume / 100;
}

/**
 * getMedia 미디어 객체 반환
 * return audio or video Object
 */
BVPlayer.prototype.getMedia = function()
{
  switch (this.info.type)
  {
    case "audio" :
      return this.$audio.get(0);
      break;
    case "video" :
      return this.$video.get(0);
      break;
  }
}

/**
 * containInteractive 인터렉티브 DOM 사이즈 변경
 */
BVPlayer.prototype.containInteractive = function()
{
  let $window = $(window);
  let $media = this.$media;
  let $interactive = this.$interactive;
  
  let mediaHeight = $media.innerHeight();
  let mediaWidth = $media.innerWidth();
  
  let interactiveHeight = ($interactive != undefined) ? $interactive.innerHeight() : 0;
  let interactiveWidth = ($interactive != undefined) ? $interactive.innerWidth() : 0;

  let ratio = interactiveHeight / interactiveWidth;
  let frameRatio = $media.innerHeight() / $media.innerWidth();
  let scale = (ratio <= frameRatio) ? mediaWidth / interactiveWidth : mediaHeight / interactiveHeight;

  if ($interactive != undefined) $interactive.css("transform", "scale(" + scale + ")");
  
  if ($.getBrowserType().indexOf("IE") !== -1)
  {
    $interactive.css({top: ((mediaHeight - interactiveHeight) / 2) + "px", left: ((mediaWidth - interactiveWidth) / 2) + "px"});
  }
}

/**
 * switchControls 비디오 or 오디오의 상태에 따른 컨트롤러 변경
 */
BVPlayer.prototype.switchControls = function()
{
  let $controls = this.$controls;

  if (this.info.type === "video")
  {    
    $controls.find(".progress-bar").show();
    $controls.find("#play").show();
    $controls.find("#pause").show();
    $controls.find("#replay").show();    
    $controls.find("#subtitle").show();
    if ($controls.width() >= 500) $controls.find(".time").show();
  }
  else
  {
    $controls.find(".progress-bar").hide();
    $controls.find("#play").hide();
    $controls.find("#pause").hide();
    $controls.find("#replay").hide();    
    $controls.find("#subtitle").hide();    
    $controls.find(".time").hide();
    this.$subtitle.hide();
  }
}

/**
 * play 재생
 */
BVPlayer.prototype.play = function()
{
  if (this.info.isSupport)
  {
    let self = this;
    let media = this.getMedia();
    
    if (!media.paused)
    {
      this.$controls.find("#play").hide();
      this.$controls.find("#pause").show();
    }
    
    let playPromise = media.play();

    if (this.info.type == "video") this.$play.hide();

    if (playPromise !== undefined) {
      playPromise.then(function(_) {

    })
      .catch(function(error) {
      self.stop();
    });
    }
  }
}

/**
 * stop 정지
 */
BVPlayer.prototype.stop = function()
{
  if (this.info.isSupport)
  {
    let media = this.getMedia();

    media.pause();
    if (this.info.type == "video"){
      this.$play.show();
      this.$controls.find("#pause").hide();
    }
  }
}

/**
 * gotoAndPlay 시간 이동 후 재생
 * @param sec 이동할 시간(초)
 */
BVPlayer.prototype.gotoAndPlay = function(sec)
{
  if (this.info.isSupport)
  {
    let media = this.getMedia();
    
    media.pause();
    media.currentTime = sec;
    this.play();
  }
}

/**
 * gotoAndStop 시간 이동 후 정지
 * @param sec 이동할 시간(초)
 */
BVPlayer.prototype.gotoAndStop = function(sec)
{
  if (this.info.isSupport)
  {
    let media = this.getMedia();
    
    this.stop();
    media.currentTime = sec;
  }
}

/**
 * initSubtitle 통자막일 경우 자막 내용 설정
 * @param str 자막
 */
BVPlayer.prototype.initSubtitle = function(str)
{
  if (!this.info.isSyncSubtitle) this.$subtitle.find("span").html(str);
}
