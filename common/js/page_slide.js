function PageSlide(param)
{
  var info = {
    cssSelector: "body"
    , count: 3
    , fileName: "page"
    , path: "./"
  }
  
  this.info = $.extend(null, info, param);
  this.$container = $(this.info.cssSelector);
  this.curPage = 1;
  
  this.drawing();
}

PageSlide.prototype.drawing = function()
{
  this.$container.append('<div class="page-slide"><div class="top"></div><div class="bottom"></div></div>');
  
  var self = this;
  var $box_top = this.$container.find(".top");
  var $box_bottom = this.$container.find(".bottom");
  
  var img = new Array();
    
  for (var i = 1; i <= this.info.count; i++)
  {
    $box_top.append('<div class="page" id="page' + i + '"><canvas></canvas></div>');
    
    img[i] = new Image();
    
    $(img[i]).on("load", function() {
      var num = this.src.split(self.info.fileName + "-")[1].split(".")[0];
      var canvas = $box_top.find("#page" + num + ">canvas").get(0);
      var context = canvas.getContext("2d");
      
      canvas.width = this.width;
      canvas.height = this.height;
      context.drawImage(this, 0, 0);
    });
    
    $(img[i]).on("error", function() {
      console.log("image load error : " + this.src);
    })
    
    img[i].src = this.info.path + this.info.fileName + "-" + i + ".png";
  }

  $box_bottom.append('<div class="nav"><div class="button" id="prev"></div><div class="cur-page">' + $.intToString(this.curPage) + '</div><div class="diviser">/</div><div class="total-page">' + $.intToString(this.info.count) + '</div><div class="button" id="next"></div></div>')
  
  this.init();
}

PageSlide.prototype.init = function()
{
  var self = this;
  this.$container.find(".top>#page1").css("display", "block");
  
  if (this.info.count < 2) this.$container.find(".bottom>.nav").css("display", "none");
  
  this.$container.find(".bottom>.nav>#prev").off().on("click", function() {
    if (self.curPage > 1)
    {
      self.curPage--;
      self.$container.find(".top>.page").css("display", "none");
      self.$container.find(".top>#page" + self.curPage).css("display", "block");
      
      self.$container.find(".bottom>.nav>.cur-page").text($.intToString(self.curPage));
    }
    else
    {
      // alert("첫 페이지 입니다.");
    }
  });
  
  this.$container.find(".bottom>.nav>#next").off().on("click", function() {
    if (self.curPage < self.info.count)
    {
      self.curPage++;
      self.$container.find(".top>.page").css("display", "none");
      self.$container.find(".top>#page" + self.curPage).css("display", "block");
      
      self.$container.find(".bottom>.nav>.cur-page").html($.intToString(self.curPage));
    }
    else
    {
      // alert("마지막 페이지 입니다.");
    }
  });
}
