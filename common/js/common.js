$(document).ready(function()
{
  let uri = location.href;
  let url = "https://edunics.mksys.kr";
  // url = "https://112.216.120.12:8443";

  let putData = {
    subcmd : "prog_exec",
    treeno : null,
    cuserNo : null,
    courseno : null,
    cseqno : null,
    CURRENT_PAGE : null,
    SES_CUSERNO : null,
    SES_CSEQNO : null,
    SES_COURSENO : null,
    movsec : null
  }

  let getData = new Object();

  let isPorted = false;
  let isWeb = (uri.indexOf("http") !== -1);
  let isFirst = true;
  let isInteractive = false;
  let isUpdate = true; // 컨텐츠 업데이트 여부
  let isEnded = true; // 컨텐츠 종료 여부
  let isLock = true; // 컨텐츠 잠금 여부
  let isCompleted = false; // 포팅시 페이지 완료 여부

  let page = 1;
  let maxPage = 1;

  let fileName = null;
  let interactive = null;  
  let timeoutSID = null; // 학습 정리 Timeout ID
  
  let bvplayer = null;
  let audioBubble = new Audio("../common/mp3/bubble.mp3");
  let audioClick = new Audio("../common/mp3/click.mp3");
  let audioCorrect = new Audio("../common/mp3/correct.mp3");
  let audioIncorrect = new Audio("../common/mp3/incorrect.mp3");
  
  /**
   * main 시작 함수
   */
  function main()
  {
    $("body").contextmenu(function() { return false; }).on("selectstart", function() { return false; });

    if (!isWeb){
      alert("로컬에서 지원하지 않는 기능이 있습니다. \n웹에서 확인해 주세요.");
    }

    if (isPorted) {
      getData = $.getParam(uri);

      putData.treeno = getData.treeno;
      putData.cuserNo = getData.cuserNo;
      putData.courseno = getData.courseno;
      putData.cseqno = getData.cseqno;
      putData.CURRENT_PAGE = getData.frameSeq;
      putData.SES_CUSERNO = getData.cuserNo;
      putData.SES_CSEQNO = getData.cseqno;
      putData.SES_COURSENO = getData.courseno;
      putData.movsec = ((getData.movsec === "1200") ? 0 : getData.movsec);

      page = getData.frameSeq;
      maxPage = getData.frameSeq;

      console.log("========== start ==========");
      console.log("maxPage : " + maxPage);
      console.log("ispass : " + getData.ispass);
      console.log("movsec : " + getData.movsec);

      $(window).on('beforeunload', function() {
        updateLMS();
      });
    }

    initPage();
  }
  
  /**
   * initPage 페이지 초기화
   */
  function initPage()
  {
    $(".content").html("");
    
    bvplayer = new BVPlayer({cssSelector: ".content"
      , callbackStart: startPage
      , callbackUpdate: updatePage
      , callbackEnded: function() { if (page != quizPage && page != preQuizPage && page != summaryPage) isEnded = true; endedPage() }});
    
    $(".bv-player").append('<div class="end-bubble"></div>');

    setPage();
  }
  
  /**
   * setPage 페이지 설정
   */
  function setPage()
  {
    clearTimeout(timeoutSID);

		/* 기능 제거를 하지 않기 위해 넣음*/
		let preQuizPage = 99;

    if (page == quizPage || page == preQuizPage)
    {
      isPre = (page == preQuizPage);

      isEnded = false;
      isInteractive = true;
      fileName = (isPre) ? "prequiz.mp3" : "quiz.mp3";

      list = (isPre) ? preQuizList : quizList;

      bvplayer.init("../common/mp3/" + fileName);
      $(".bv-interactive").attr("id",(isPre) ? "prequiz" : "quiz");
      
    
      interactive = new Quiz({
        cssSelector: ".bv-interactive"
        , isIntro: true
        , soundClick: audioClick
        , soundCorrect: audioCorrect
        , soundIncorrect: audioIncorrect
        , delayStart: (isPre) ? 6800 : 7000
        , callbackEnded: function() { isEnded = true; endedPage(); }
      });

      list.map(function(value) {
        
        if ((value.answer[0].toString().toLowerCase() === "o" || value.answer[0].toString().toLowerCase() === "x"))
        {
          interactive.createOXQuiz({
            questionSymbol: value.questionSymbol
            , questionText: value.questionText
            , feedbackAnswer: value.feedbackAnswer
            , feedbackExplanation: value.feedbackExplanation
            , answer: value.answer
          })
        }
        else
        {
          interactive.createMultipleChoice({
            questionSymbol: value.questionSymbol
            , questionText: value.questionText
            , exam: value.exam
            , feedbackAnswer: value.feedbackAnswer
            , feedbackExplanation: value.feedbackExplanation
            , isSingle: true
            , answer: value.answer
          })
        }
      });
    }
    else if (page == summaryPage)
    {
      isEnded = false;
      isInteractive = true;
      fileName = "summary.mp3";
      bvplayer.init("../common/mp3/" + fileName);
      $(".bv-interactive").attr("id","summary")

      $(".bv-interactive").append('<div class="intro"></div>\
        <div class="button" id="print"></div><div class="button" id="down-1"></div><div class="button" id="down-2"></div>');
      
      // page_slide.js의 info.fileName이 다음의 summary로 바뀐다.
      new PageSlide({cssSelector: ".bv-interactive", count: summaryCount, fileName: "summary", path: "./asset/summary/"});
      
      $(".bv-interactive>#print").off().on("click", function() {
        window.open("../common/html/print.html", "_blank");
      });
  
      $(".bv-interactive>#down-1").off().on("click", function() {
        window.open("./asset/down/summary.zip");
      });
      
      $(".bv-interactive>#down-2").off().on("click", function() {
        window.open("./asset/down/learning.zip");
      });

      timeoutSID = setTimeout(function() {
        $(".bv-interactive>.intro").slideUp(1000);
        clearTimeout(timeoutSID);
        timeoutSID = setTimeout(function() {
          isEnded = true;
          endedPage();
          clearTimeout(timeoutSID);
        }, 3000)
      }, 4000)
    }
    else
    {
      isInteractive = false;
      fileName = $.intToString(page) + ".mp4";
      bvplayer.init("./asset/" + fileName);
      bvplayer.initSubtitle(subtitle[page]);
    }
      
    $(".page>.page--diviser>.txt").html("/");
    $(".page>.page--total>.txt").text($.intToString(totalPage));
    $(".page>.page--current>.txt").text($.intToString(page));    
    $(".bv-player>.end-bubble").removeAttr("id").attr("id", (page === totalPage) ? "last" : "next");
  }
  
  /**
   * initMove 페이지 이동 이벤트 초기화
   */
  function initMove()
  {
    $(".bv-controls #prev").off().on("click", function() {
      if (page == 1)
      {
        alert("첫 페이지 입니다.");  
      }
      else
      {
  			if (maxPage <= page) $(".bv-controls #next").off();
				isCompleted = false;
        page--;
        showNextBubble(false);
				bvplayer.removeProgressBar();
        setPage();
      }
    });

    $(".bv-controls #next").off().on("click", function() {
      if (page == totalPage)
      {
        alert("마지막 페이지 입니다.");
      }
      else
      {
        if (isPorted && !isCompleted)
        {
          alert("학습이 완료되지 않았습니다.");
        }
        else
        {
					if (maxPage <= page) $(".bv-controls #next").off();
					isCompleted = false;
          page++;
          showNextBubble(false);
					bvplayer.removeProgressBar();
          setPage();
        }
      }
    });
  }
  
  /**
   * showNextBubble 다음 말풍선 보이기
   * @param bol true / false (보이기 / 숨기기)
   */
  function showNextBubble(bol)
  {
    var $bubble = $(".bv-player>.end-bubble");

    if (bol)
    {
      if ($bubble.css("display") === "none")
      {
        $bubble.css("display", "block");
        $bubble.animate({ opacity: "1", right: "10px" });
        audioBubble.play();
      }
    }
    else
    {
      $bubble.animate({ opacity: "0", right: "0px" });
      $bubble.css("display", "none");
    }    
  }
  
  function startPage(event)
  {
    if (isPorted)
    {
      updateLMS();

      if (maxPage < page)
      {
        maxPage = page;
        putData.movsec = 0;
      }

      isCompleted = (maxPage > page) ? true : ((maxPage == page) ? (putData.movsec == Math.floor(event.duration)) : false);

      bvplayer.lockProgressBar = !isCompleted;
      isLock = !isCompleted

      if (maxPage == page) bvplayer.limitProgressBar = putData.movsec / bvplayer.getMedia().duration * 100

      if (isFirst)
      {
        if (getData.ispass == "N" && !isInteractive) bvplayer.gotoAndPlay(Number(putData.movsec));
        isFirst = false;        
      }
    }
		else {
			bvplayer.lockProgressBar = false;
		}
    initMove();
  }

  /**
   * updatePage 페이지 정보 업데이트
   */
  function updatePage(event)
  {
    if (isUpdate && event.currentTime != event.duration)
    {
      isUpdate = false;
      showNextBubble(false);
    }
    
    if (isPorted)
    {
      if (maxPage == page && putData.movsec < event.currentTime)
        putData.movsec = Math.floor(event.currentTime);

      if (Math.floor(event.currentTime / event.duration * 100) > 80 && isLock)
      {
        isLock = false;
        isCompleted = true;
        bvplayer.lockProgressBar = false;
      }
    }
  }
  
  /**
   * endedPage 페이지 종료 시 실행
   */
  function endedPage()
  {
    if (isEnded)
    {
        if (isPorted)
        {
          updateLMS();
          isCompleted = true;
        }

        updateEvent = true;
        showNextBubble(true);
    }
  }

  /**
   * updateLMS LMS 정보 업데이트
   */
  function updateLMS()
  {
    putData.CURRENT_PAGE = page;

    $.ajax({
			url : url + "/classdesk/online/prog.do"
			, data : putData
			, dataType : 'jsonp'
			, type : 'GET'
			, jsonp : 'callback'
			, crossDomain: true
		});
  }
  
  main();
});