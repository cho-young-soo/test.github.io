$(document).ready(function() {
  floorResize();
  
  var $target;
  var type = "table"; // table thumbnail sample
  var company = "아동권리보장원"; // 발주처
  
  $('#company').html(company + "&nbsp;&nbsp;");
  
  var index = new Array();  
  index[0] = null; //과정명이 없으면 비워둔다
  index[1] = "지역아동센터 진입평가 사업안내";
  index[2] = "02차시";
  index[3] = "03차시";
  
  var indexOn = new Array();  
  indexOn[1] = true;
  indexOn[2] = false;
  indexOn[3] = false;

  
  var indexColor=new Array();
  indexColor[1] = true;
  indexColor[2] = false;
  indexColor[3] = false;

  switch(type) {
    case "table" :
      drowTable("목차", "차시명");
      $target = drowTableList(index, indexOn, indexColor);
      break;
    case "thumbnail" :
      $target = drowThumbnailList(index);
      break;
    case "sample" :
      drowTable("과정명", "제안 유사 콘텐츠");
      $target = drowSampleList(index);
      break;
    default :
      alert("type이 잘못 입력되었습니다.");
      break;
  }
  
  $target.each(function() {
    $(this).on('click', function() {      
      var chapter = itostr($(this).data("chapter"));

      var openURL = "./"+chapter + "/index.html";
      var openFileWidth = 1000;
      var openFileHeight = 604;
      
      window.open(openURL, "_blank", "width=" + openFileWidth + ", height=" + openFileHeight);
    });
  });
  
});

$(window).on('resize', function() {
  floorResize();
});

function itostr(_num) {
  return (_num < 10) ? "0" + _num : _num;
}
// 폴리곤 위치
function floorResize() {
  var $bottom = $('#bottom');
  var points = ($bottom.width() * 0.4) + ",0 0," + $bottom.height() + " " + $bottom.width() + "," + $bottom.height();
  
  $('#bottom polygon').attr('points', points);
}

function drowTable(_column1, _column2) {
  var $table = ("<table class='table'><thead><tr><td>" + _column1 + "</td><td>" + _column2 + "</td></tr></thead><tbody></tbody></table>");
  $('#contents').append($table);
}

function drowTableList(_index, _indexOn, _indexColor) {
  var index = _index;
  var indexOn = _indexOn;
  var indexColor=_indexColor;
  var $tr;
  var $tbody = $('.table tbody');
  
  $('#tag .carriculum').html(_index[0]);
  
  for (var i = 1; i < index.length; i++) {
    //$tr = $("<tr><td class='column'>" + itostr(i) + "</td><td><span data-chapter=" + i + ">" + index[i] + "</span></td></tr>");
    if(indexOn[i]) {
      console.log(indexOn[i]);
      $tr = $("<tr><td class='column'>" + itostr(i) + "</td><td><span data-chapter=" + i + ">" + index[i] + "</span></td></tr>");    
    } 
    else
      $tr = $("<tr><td class='column'>" + itostr(i) + "</td><td>" + index[i] + "</td></tr>");
    
    if(indexColor[i]) {
      $tr.css("color","black");
    } else {
      $tr.css("color","lightgrey");
    } 
     
    $tbody.append($tr);
  }

  return $tbody.find('span');
}


function drowThumbnailList(_index) {
  var index = _index;
  var $contents = $("#contents");
  
  var $flag = ("<div class='row'><div class='col-md-12'><div class='flag-1'></div>\
               <span class='carriculum'>" + _index[0] + "</span></div></div>");  
  var $thumbnail = "<div class='row'></div>";
  
  $contents.append($flag);
  $contents.append($thumbnail);  
  
  for (var i = 1; i < _index.length; i++) {
    if (i % 3 == 1) $contents.append($thumbnail);
    
    $contents.find(".row:last-child").append("<div class='col-md-4 list'>\
        <figure class='figure' data-chapter=" + i + ">\
          <img src='./asset/img/thumbnail/thumbnail-" + i + ".png' class='figure-img img-fluid rounded' alt=''>\
          <figcaption class='figure-caption'>" + _index[i] + "</figcaption>\
        </figure>\
      </div>");
  }
  
  $('.figure').on('mouseover', function(){
    $(this).find('.figure-caption').css('color', 'deepskyblue');
  });
  
  $('.figure').on('mouseout', function(){
    $(this).find('.figure-caption').css('color', '#6c757d');
  });
  
  return $contents.find('figure');
}

function drowSampleList(_index) {
  var index = _index;
  var $tbody = $('.table tbody');
  var group = "";
  var count = 0;
  var chapter = 1;
  
  for (var i = 1; i < _index.length; i++) {
    if (_index[i].indexOf("##") != -1) {
      if (count != 0) {
        group = "<tr><td class='column'>" + _index[i].split("##")[1] + "</td>";
        $tbody.find(".column:last").attr("rowspan", count);
        count = 0;
      } else {
        group = "<tr><td class='column'>" + _index[i].split("##")[1] + "</td>";
      }
    } else {
      if (count == 0) {
        group += "<td><span data-chapter=" + chapter + ">" + _index[i] + "</span></td></tr>";
        chapter++;
      } else {
        group += "<tr><td><span data-chapter=" + chapter + ">" + _index[i] + "</span></td></tr>";
        chapter++;
      }
      
      $tbody.append($(group));
      group = "";
      count++;
    }
    
    if (i == (_index.length - 1)) $tbody.find(".column:last").attr("rowspan", count);
  }
  
  return $tbody.find('span');
}