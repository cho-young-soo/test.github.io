function Quiz(param)
{
  var info = {
    cssSelector: ".interactive"
    , isIntro: false
    , countQuiz: 0
    , quiz: null
    , chance: 2
    , soundAgain: null
    , soundClick: null
    , soundCorrect: null
    , soundIncorrect: null
    , callbackEnded: function() {}
  }
    
  this.info = $.extend(null, info, param);
  this.$container = $(this.info.cssSelector);
  this.marking = new Array();

  this.initQuiz();
}

Quiz.prototype.initQuiz = function()
{
  let $container = this.$container;
  let self = this;

  if (this.info.isIntro)
  {
    $container.append('<div class="quiz" id="quiz0"><div id="top"></div><div id="bottom"><div id="start">START</div></div></div>');

    $("#quiz0").css("display", "block").delay(400).animate({opacity : "1"}, function() {
      $("#quiz0>#top").animate({ top: "0px", opacity: 1 }, "slow");
      $("#quiz0>#bottom").animate({ top: "52%", opacity: 1 }, "slow");
    });

    $("#quiz0 #start").hide().delay(8000).show(0).on("click", function(){      
      $("#quiz0").hide();
      $("#quiz1").show();
    });
  }

  $container.append('<div class="quiz" id="quiz99">\
    <div class="report">\
      <div class="report__wrap">\
        <div class="top">\
          <div class="top__title">결과보기</div>\
          <div class="top__txt">총 <span class="yellow" id="total"></span>문제중 <span class="yellow" id="count"></span>문제를 맞히셨습니다.</div>\
        </div>\
        <div class="middle"></div>\
        <div class="bottom"><div class="bottom__btn--retry">문제 다시 풀기</div>\
  </div></div></div></div>');

  $("#quiz99").hide();

  $("#quiz99>.report .bottom>.bottom__btn--retry").off().on("click", function(){
    self.resetQuiz();
  });

  this.drawingAlert();
}

Quiz.prototype.resetQuiz = function()
{
  let $quiz = this.$container.find(".quiz");

  $quiz.removeClass("disabled").hide();
  $quiz.find(".feedback").hide();
  $quiz.find(".marking__ico").hide();
  $quiz.find(".active").removeClass("active");
  this.$container.find("#quiz1").show();
  this.$container.find("#quiz99 .middle").html("");
}

/**
 * createOXQuiz OX 퀴즈 생성
 * @param param Object 객체
 *  questionSymbol 문제 심볼
 *  questionText 문제
 *  feedbackAnswer 정답
 *  feedbackExplanation 해설
 *  answer 정답 배열
 */
Quiz.prototype.createOXQuiz = function(param)
{
  this.info.countQuiz++;
  this.$container.append('<div class="quiz ox" id="quiz' + this.info.countQuiz + '"></div>');

  let $quiz = this.$container.find("#quiz" + this.info.countQuiz).hide();  
  
  this.drawingQuestion(param.questionSymbol, param.questionText);

  $quiz.append('<div class="example"><ul class="example__list"></ul></div>');
  let $list = $quiz.find(".example>.example__list");

  $list.append('<li class="list"><div class="btn-list" id="btn-list0"></div></li>');
  $list.append('<li class="list"><div class="btn-list" id="btn-list1"></div></li>');

  this.drwingChecking();
  this.drawingFeedback(param.feedbackAnswer, param.feedbackExplanation);
  this.initMultipleChoice(true, (param.answer[0].toLowerCase() === "o" ? [1] : [2]));
}

/**
 * createMultipleChoice 다지선다 퀴즈 생성
 * @param param Object 객체
 *  questionSymbol 문제 심볼
 *  questionText 문제
 *  exam 보기 배열
 *  feedbackAnswer 정답
 *  feedbackExplanation 해설
 *  isSingle 다중선택
 *  answer 정답 배열
 */
Quiz.prototype.createMultipleChoice = function(param)
{
  this.info.countQuiz++;
  this.$container.append('<div class="quiz multiple" id="quiz' + this.info.countQuiz + '"></div>');

  let $quiz = this.$container.find("#quiz" + this.info.countQuiz).hide();  
  
  this.drawingQuestion(param.questionSymbol, param.questionText);

  $quiz.append('<div class="example"><ul class="example__list"></ul></div>');
  let $list = $quiz.find(".example>.example__list");

  param.exam.map(function(value, key) {
    $list.append('<li class="list"><span class="btn-list" id="btn-list' + key + '"><div class="symbol"><div class="symbol__txt">' + (key + 1) + '</div></div><span class="txt">' + value +'</span></span></li>');
  })

  this.drwingChecking();
  this.drawingFeedback(param.feedbackAnswer, param.feedbackExplanation);
  this.initMultipleChoice(param.isSingle, param.answer);
}

Quiz.prototype.initMultipleChoice = function(isSingle, answer)
{
  let self = this;
  let attempt = 1;
  let curQuiz = this.info.countQuiz;
  let selectAnswer = new Array();
  let soundClick = this.info.soundClick;
  let $quiz = this.$container.find("#quiz" + this.info.countQuiz);
  let $exam = $quiz.find(".example .list>.btn-list");
  let $feedback = $quiz.find(".feedback")
  
  // 보기 버튼
  $exam.off().on("click", function() {
    if ($("#quiz" + curQuiz).attr("class").indexOf("disabled") === -1)
    {
      let $select = $(this);
  
      if (isSingle)
        $select.addClass("active");
      else
        ($select.attr("class").indexOf("active") === -1) ? $select.addClass("active") : $select.removeClass("active");
  
      selectAnswer = new Array();

      $exam.each(function() {
        if (isSingle && $select.attr("id") != $(this).attr("id")) $(this).removeClass("active");
        if ($(this).attr("class").indexOf("active") !== -1)
          selectAnswer.push(Number($(this).attr("id").split("btn-list")[1]) + 1);
      });
      
      if(soundClick != null) soundClick.play();
    }
  }).removeClass("active");

  // 정답 확인 버튼
  $quiz.find(".checking>#btn-checking").off().on("click", function() {
    if ($("#quiz" + curQuiz).attr("class").indexOf("disabled") === -1)
    {
      if (selectAnswer == null || selectAnswer == undefined || selectAnswer.length == 0)
      {
        alert("문제를 풀어보세요.");
      }
      else
      {
        self.marking[curQuiz - 1] = (selectAnswer.sort().toString() === answer.sort().toString());

        if (self.marking[curQuiz - 1] || self.info.chance == attempt)
        {
          attempt = 1;
          $("#quiz" + curQuiz).addClass("disabled");
          $feedback.show();

          if (self.marking[curQuiz - 1]) $quiz.find(".marking>#marking__ico--correct").show();
          else $quiz.find(".marking>#marking__ico--incorrect").show();

          self.showAlert((self.marking[curQuiz - 1]) ? 1 : 2);
          self.addReport(curQuiz);
        }
        else
        {        
          attempt++;
          self.showAlert(3);
        }
      }
    }
  }).show();

  // 다음 문제 버튼
  $quiz.find(".feedback>.feedback__nav>#btn-next").off().on("click", function() {
    self.$container.find("#quiz" + curQuiz).hide();
    self.$container.find("#quiz" + (curQuiz + 1)).show();
  });
  
  // 결과 보기 버튼
  $quiz.find(".feedback>.feedback__nav>#btn-report").off().on("click", function() {
    self.$container.find("#quiz99").show();
    self.info.callbackEnded();
  });
}

/**
 * drawingQuestion 문제 그룹 그리기
 * @param String symbol 문제의 심볼
 * @param String txt 문제
 */
Quiz.prototype.drawingQuestion = function(symbol, txt)
{
  let $quiz = this.$container.find("#quiz" + this.info.countQuiz);

  $quiz.append('<div class="question">\
    <div class="question__wrap">\
      <div class="marking"><div class="marking__ico" id="marking__ico--correct"><span class="txt">O</span></div><div class="marking__ico" id="marking__ico--incorrect"><span class="txt">X</span></div></div>\
      <div class="symbol"><span class="symbol__txt">' + symbol + '</span></div></div>\
    <div class="question__txt"><span class="txt">' + txt + '</span></div></div>');

    $quiz.find(".marking__ico").hide();
}

/**
 * drwingChecking 정답확인 그룹 그리기
 */
Quiz.prototype.drwingChecking = function()
{
  this.$container.find("#quiz" + this.info.countQuiz).append('<div class="checking"><div class="button" id="btn-checking">정답확인</div></div>');
}

/**
 * drawingFeedback 피드백 그룹 그리기
 * @param String answer 정답
 * @param String explanation 해설
 */
Quiz.prototype.drawingFeedback = function(answer, explanation)
{
  let $quiz = this.$container.find("#quiz" + this.info.countQuiz);
  let $beforeQuiz = this.$container.find("#quiz" + (this.info.countQuiz - 1));

  $quiz.append('<div class="feedback">\
    <div class="feedback__answer"><div class="symbol"><span class="symbol__txt">정답 : </span></div><span class="txt">' + answer + '</span></div>\
    <div class="feedback__explanation"><div class="symbol"><span class="symbol__txt">해설 : </span></div><span class="txt">' + explanation + '</span></div>\
    <div class="feedback__nav"></div></div>');

  $quiz.find(".feedback>.feedback__nav").append('<div class="button" id="btn-next">다음문제</div>');
  $quiz.find(".feedback>.feedback__nav").append('<div class="button" id="btn-report">결과보기</div>');
  $quiz.find(".feedback>.feedback__nav>#btn-next").hide();
  $beforeQuiz.find(".feedback>.feedback__nav>#btn-next").show();
  $beforeQuiz.find(".feedback>.feedback__nav>#btn-report").remove();

  $quiz.find(".feedback").off().hide();
}

Quiz.prototype.drawingAlert = function()
{
  this.$container.append('<div class="alert">\
    <div class="alert__wrap" id="alert__wrap--correct"><div class="img"></div><div class="txt">정답입니다.</div></div>\
    <div class="alert__wrap" id="alert__wrap--incorrect"><div class="img"></div><div class="txt">오답입니다.</div></div>\
    <div class="alert__wrap" id="alert__wrap--again"><div class="img"></div><div class="txt">다시 한번<br/>풀어보세요.</div></div>\
  </div>');
}

Quiz.prototype.addReport = function(num)
{
  let $middle = this.$container.find("#quiz99>.report .middle");
  
  $middle.append('<div class="middle__wrap" id="middle__wrap' + num + '">\
    <div class="flag" id="flag--correct"></div>\
    <div class="flag" id="flag--incorrect"></div>\
  <div class="txt">Q' + num + '</div></div>');

  $middle.find("#middle__wrap" + num +  " .flag").hide();
  $middle.find("#middle__wrap" + num + " #flag--" + ((this.marking[num -1]) ? "correct" : "incorrect")).show();

  this.$container.find("#quiz99>.report .top #total").text(this.marking.length);
  this.$container.find("#quiz99>.report .top #count").text(this.marking.filter(function(value) { return (value===true) }).length);
  
}

Quiz.prototype.showAlert = function(num)
{
  var $alert = this.$container.find(".alert");
  
  switch (num)
  {
    case 1 :
      $alert.children("#alert__wrap--correct").fadeIn(500).fadeOut(700);
      if (this.info.soundCorrect !== null) this.info.soundCorrect.play();
      break;
    case 2 :
      $alert.children("#alert__wrap--incorrect").fadeIn(500).fadeOut(700);
      if (this.info.soundIncorrect !== null) this.info.soundIncorrect.play();
      break;
    case 3 :
      $alert.children("#alert__wrap--again").fadeIn(500).fadeOut(700);
      if (this.info.soundAgain !== null) this.info.soundAgain.play();
      break;
  }
}